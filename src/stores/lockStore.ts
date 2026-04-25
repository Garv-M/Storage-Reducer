import { create } from 'zustand';

interface LockStoreState {
  isLocked: boolean;
  isLockEnabled: boolean;
  lastUnlockAt: number | null;
  backgroundAt: number | null;
  biometricEnabled: boolean;
  setLocked: (locked: boolean) => void;
  setBackgroundAt: (timestamp: number | null) => void;
  setLockEnabled: (enabled: boolean) => void;
  setLastUnlockAt: (timestamp: number | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
}

export const useLockStore = create<LockStoreState>((set) => ({
  isLocked: false,
  isLockEnabled: false,
  lastUnlockAt: null,
  backgroundAt: null,
  biometricEnabled: false,
  setLocked: (isLocked) => set({ isLocked }),
  setBackgroundAt: (backgroundAt) => set({ backgroundAt }),
  setLockEnabled: (isLockEnabled) =>
    set((state) => ({
      isLockEnabled,
      isLocked: isLockEnabled ? true : false,
      backgroundAt: isLockEnabled ? state.backgroundAt : null,
      lastUnlockAt: isLockEnabled ? state.lastUnlockAt : null,
    })),
  setLastUnlockAt: (lastUnlockAt) => set({ lastUnlockAt }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
}));
