import * as SecureStore from 'expo-secure-store';

import { authenticateWithBiometric, isBiometricAvailable } from '@/services/auth/biometric';
import { hasPin, loadPin, savePin, verifyPin } from '@/services/auth/pinHash';
import { useLockStore } from '@/stores/lockStore';

const LOCK_ENABLED_KEY = 'lock.enabled';
const BIOMETRIC_ENABLED_KEY = 'lock.biometric.enabled';
const AUTO_LOCK_AFTER_MS = 30_000;

export const AppLockService = {
  async initialize() {
    const [lockEnabledValue, biometricValue, pinSet] = await Promise.all([
      SecureStore.getItemAsync(LOCK_ENABLED_KEY),
      SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY),
      hasPin(),
    ]);

    const isLockEnabled = lockEnabledValue === 'true' && pinSet;
    const biometricEnabled = biometricValue === 'true';

    const lockStore = useLockStore.getState();
    lockStore.setLockEnabled(isLockEnabled);
    lockStore.setBiometricEnabled(biometricEnabled);
    lockStore.setLocked(isLockEnabled);
  },

  async setupLock(pin: string, enableBiometric: boolean) {
    await savePin(pin);
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY, 'true');
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enableBiometric ? 'true' : 'false');

    const lockStore = useLockStore.getState();
    lockStore.setLockEnabled(true);
    lockStore.setBiometricEnabled(enableBiometric);
    lockStore.setLocked(false);
    lockStore.setLastUnlockAt(Date.now());
  },

  async setLockEnabled(enabled: boolean) {
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY, enabled ? 'true' : 'false');

    const lockStore = useLockStore.getState();
    lockStore.setLockEnabled(enabled);
    lockStore.setLocked(enabled);
    if (!enabled) {
      lockStore.setBackgroundAt(null);
      lockStore.setLastUnlockAt(null);
    }
  },

  async setBiometricEnabled(enabled: boolean) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    useLockStore.getState().setBiometricEnabled(enabled);
  },

  async unlock(method: 'pin' | 'biometric', pin?: string) {
    const lockStore = useLockStore.getState();

    if (method === 'biometric') {
      if (!lockStore.biometricEnabled) return false;

      const available = await isBiometricAvailable();
      if (!available) return false;

      const result = await authenticateWithBiometric('Unlock Storage Reducer');
      if (!result.success) return false;

      lockStore.setLocked(false);
      lockStore.setBackgroundAt(null);
      lockStore.setLastUnlockAt(Date.now());
      return true;
    }

    if (!pin) return false;

    const stored = await loadPin();
    if (!stored) return false;

    const valid = await verifyPin(pin, stored.salt, stored.hash);
    if (!valid) return false;

    lockStore.setLocked(false);
    lockStore.setBackgroundAt(null);
    lockStore.setLastUnlockAt(Date.now());
    return true;
  },

  shouldLock() {
    const { backgroundAt } = useLockStore.getState();
    if (!backgroundAt) return false;
    return Date.now() - backgroundAt > AUTO_LOCK_AFTER_MS;
  },
};
