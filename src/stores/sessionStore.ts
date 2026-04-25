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
  createSession: (input?: { filterId?: string; queueIds?: AssetId[]; incognito?: boolean }) => Session;
  setActiveSession: (sessionId: string) => void;
  completeSession: (sessionId?: string) => void;
  recordDecision: (assetId: AssetId, decision: Decision, bytesFreed?: number) => void;
  undo: () => DecisionRecord | null;
  findResumable: () => Session | null;
  appendQueueIds: (sessionId: string, ids: AssetId[], cursor?: string | null) => void;
  setCursor: (sessionId: string, cursor: string | null) => void;
}

const makeSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      activeSessionId: null,
      sessions: {},
      createSession: (input) => {
        const session: Session = {
          id: makeSessionId(),
          createdAt: Date.now(),
          filterId: input?.filterId,
          cursor: null,
          queueIds: input?.queueIds ?? [],
          decisions: [],
          undoStack: [],
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

          const nextUndo = [...current.undoStack, record].slice(-UNDO_STACK_CAP);
          const freedDelta = decision === 'DELETE_STAGED' ? bytesFreed : 0;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                decisions: [...current.decisions, record],
                undoStack: nextUndo,
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

        const latest = Object.values(sessions)
          .filter((session) => !session.completedAt)
          .sort((a, b) => b.createdAt - a.createdAt)[0];

        return latest ?? null;
      },
      appendQueueIds: (sessionId, ids, cursor) => {
        set((state) => {
          const target = state.sessions[sessionId];
          if (!target || ids.length === 0) return state;

          const uniqueIds = ids.filter((id) => !target.queueIds.includes(id));
          if (uniqueIds.length === 0 && cursor === undefined) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...target,
                queueIds: [...target.queueIds, ...uniqueIds],
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
      storage: createJSONStorage(() => createMmkvStorage(250)),
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        sessions: state.sessions,
      }),
    }
  )
);
