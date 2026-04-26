// Immutable bounded stack utilities for swipe undo history.
// The cap prevents unbounded memory growth during long sessions.

import { UNDO_STACK_CAP } from '@/constants/thresholds';
import type { DecisionRecord } from '@/types/decision';

/**
 * In-memory undo stack state for reversible swipe decisions.
 */
export interface UndoStack {
  cap: number;
  items: DecisionRecord[];
}

/**
 * Creates a new undo stack with the configured maximum history size.
 */
export const createUndoStack = (cap = UNDO_STACK_CAP): UndoStack => ({
  cap,
  items: [],
});

/**
 * Appends a decision record and trims oldest entries when capacity is exceeded.
 */
export const push = (stack: UndoStack, record: DecisionRecord): UndoStack => ({
  ...stack,
  // Keep the most recent N records because undo is LIFO and recent actions matter most.
  items: [...stack.items, record].slice(-stack.cap),
});

/**
 * Removes and returns the latest decision record.
 */
export const pop = (stack: UndoStack): { next: UndoStack; item: DecisionRecord | null } => {
  if (stack.items.length === 0) {
    return { next: stack, item: null };
  }

  const item = stack.items[stack.items.length - 1];
  return {
    item,
    next: {
      ...stack,
      items: stack.items.slice(0, -1),
    },
  };
};

/**
 * Returns the latest undoable record without mutating stack state.
 */
export const peek = (stack: UndoStack): DecisionRecord | null =>
  stack.items.length ? stack.items[stack.items.length - 1] : null;

/**
 * Indicates whether the stack currently holds the configured maximum number of items.
 */
export const isFull = (stack: UndoStack): boolean => stack.items.length >= stack.cap;

/**
 * Indicates whether there are no decisions available to undo.
 */
export const isEmpty = (stack: UndoStack): boolean => stack.items.length === 0;