// Session state for swipe/review flows: lifecycle, decisions, undo, and resumable recovery.
// Persists only session data needed to continue after app restart.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { UNDO_STACK_CAP } from '@/constants/thresholds';
import { createMmkvStorage } from '@/services/persistence/zustandStorage';
import type { AssetId } from '@/types/asset';
import type { Decision, DecisionRecord } from '@/types/decision';
import type { Session } from '@/types/session';

interface SessionStoreState {
  activeSessionId: string | null;
  sessions: Record<string, Session>;

  /**
   * Creates a new session and marks it as active immediately.
   * Keeping a single active pointer prevents ambiguous writes for swipe actions.
   */
  createSession: (input?: { filterId?: string; queueIds?: AssetId[]; incognito?: boolean }) => Session;

  /**
   * Sets the active session only when the session exists.
   * This guards against stale deep links or invalid IDs.
   */
  setActiveSession: (sessionId: string) => void;

  /**
   * Marks a session complete (defaults to current active session).
   * If the completed session is active, clears the active pointer.
   */
  completeSession: (sessionId?: string) => void;

  /**
   * Appends one decision record to audit history and undo stack.
   * `bytesFreed` only contributes for staged deletes because keep decisions do not reclaim space.
   */
  recordDecision: (assetId: AssetId, decision: Decision, bytesFreed?: number) => void;

  /**
   * Reverts the latest undoable decision in the active session.
   * Returns the removed decision so callers can roll back related side effects outside this store.
   */
  undo: () => DecisionRecord | null;

  /**
   * Finds the best session to resume:
   * prefer active incomplete session, otherwise most recently created incomplete session.
   */
  findResumable: () => Session | null;

  /**
   * Appends newly paged queue IDs while deduplicating existing IDs.
   * Optional cursor update allows queue growth and pagination progress in one atomic mutation.
   */
  appendQueueIds: (sessionId: string, ids: AssetId[], cursor?: string | null) => void;

  /**
   * Updates pagination cursor for a session to support resume from last scanned position.
   */
  setCursor: (sessionId: string, cursor: string | null) => void;
}

// Mix timestamp + random suffix to reduce collision risk across quick restarts/sessions.
const makeSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Persisted session store for swipe sessions and decision history.
 */
export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────────
      activeSessionId: null,
      sessions: {},

      // ── Actions: Session lifecycle ──────────────────────────────────────────────
      createSession: (input) => {
        const session:Session = {
          id: makeSessionId(),
          createdAt: Date.now(),
          filterId: input?.filterId,
          cursor: null,
          queueIds: input?.queueIds ?? [],
          decisions: [],
          undoStack: [],
          // Estimated progress metric shown during swipe flow before physical deletion happens.
          freedBytesEstimated: 0,
          incognito: input?.incognito ?? false,
        };

        set((state) => ({
          activeSessionId: session.id,
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
        }));

        return session;
      },
      setActiveSession: (sessionId) => {
        set((state) => {
          if (!state.sessions[sessionId]) return state;
          return { activeSessionId: sessionId };
        });
      },
      completeSession: (sessionId) => {
        set((state) => {
          const targetId = sessionId ?? state.activeSessionId;
          if (!targetId || !state.sessions[targetId]) return state;

          const target = state.sessions[targetId];

          return {
            activeSessionId: state.activeSessionId === targetId ? null : state.activeSessionId,
            sessions: {
              ...state.sessions,
              [targetId]: {
                ...target,
                completedAt: Date.now(),
              },
            },
          };
        });
      },

      // ── Actions: Decisions + undo ───────────────────────────────────────────────
      recordDecision: (assetId, decision, bytesFreed = 0) => {
        set((state) => {
          const sessionId = state.activeSessionId;
          if (!sessionId) return state;

          const current = state.sessions[sessionId];
          if (!current) return state;

          const record: DecisionRecord = {
            assetId,
            decision,
            at: Date.now(),
            sessionId,
          };

          // Cap undo memory/complexity so extremely long sessions remain predictable.
          const nextUndo = [...current.undoStack, record].slice(-UNDO_STACK_CAP);
          const freedDelta = decision === 'DELETE_STAGED' ? bytesFreed : 0;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                decisions: [...current.decisions, record],
                undoStack: nextUndo,
                // Never show negative estimated bytes in UI, even if upstream passes a negative delta.
                freedBytesEstimated: Math.max(0, current.freedBytesEstimated + freedDelta),
              },
            },
          };
        });
      },
      undo: () => {
        let undone: DecisionRecord | null = null;

        set((state) => {
          const sessionId = state.activeSessionId;
          if (!sessionId) return state;

          const current = state.sessions[sessionId];
          if (!current || current.undoStack.length === 0) return state;

          undone = current.undoStack[current.undoStack.length - 1];

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                // Remove the exact object instance popped from undo stack.
                decisions: current.decisions.filter((record) => record !== undone),
                undoStack: current.undoStack.slice(0, -1),
              },
            },
          };
        });

        return undone;
      },
      findResumable: () => {
        const { activeSessionId, sessions } = get();

        if (activeSessionId) {
          const active = sessions[activeSessionId];
          if (active && !active.completedAt) return active;
        }

        // Deterministic fallback: resume newest incomplete session when no active one is valid.
        const latest = Object.values(sessions)
          .filter((session) => !session.completedAt)
          .sort((a, b) => b.createdAt - a.createdAt)[0];

        return latest ?? null;
      },

      // ── Actions: Queue pagination metadata ──────────────────────────────────────
      appendQueueIds: (sessionId, ids, cursor) => {
        set((state) => {
          const target = state.sessions[sessionId];
          if (!target || ids.length === 0) return state;

          // Avoid duplicate cards if pager returns overlapping pages.
          const uniqueIds = ids.filter((id) => !target.queueIds.includes(id));
          if (uniqueIds.length === 0 && cursor === undefined) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...target,
                queueIds: [...target.queueIds, ...uniqueIds],
                // `undefined` means "leave cursor unchanged"; explicit null clears it.
                cursor: cursor === undefined ? target.cursor : cursor,
              },
            },
          };
        });
      },
      setCursor: (sessionId, cursor) => {
        set((state) => {
          const target = state.sessions[sessionId];
          if (!target) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...target,
                cursor,
              },
            },
          };
        });
      },
    }),
    {
      name: 'session-store-v1',
      // Larger debounce window than other stores because this store updates rapidly during swipes.
      storage: createJSONStorage(() => createMmkvStorage(250)),
      partialize: (state) => ({
        // Persist only data needed for resume/recovery; methods and derived data are excluded.
        activeSessionId: state.activeSessionId,
        sessions: state.sessions,
      }),
    }
  )
);
