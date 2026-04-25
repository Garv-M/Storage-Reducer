import { UNDO_STACK_CAP } from '@/constants/thresholds';
import type { DecisionRecord } from '@/types/decision';

export interface UndoStack {
  cap: number;
  items: DecisionRecord[];
}

export const createUndoStack = (cap = UNDO_STACK_CAP): UndoStack => ({
  cap,
  items: [],
});

export const push = (stack: UndoStack, record: DecisionRecord): UndoStack => ({
  ...stack,
  items: [...stack.items, record].slice(-stack.cap),
});

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

export const peek = (stack: UndoStack): DecisionRecord | null =>
  stack.items.length ? stack.items[stack.items.length - 1] : null;

export const isFull = (stack: UndoStack): boolean => stack.items.length >= stack.cap;

export const isEmpty = (stack: UndoStack): boolean => stack.items.length === 0;
