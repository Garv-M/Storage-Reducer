// MMKV persistence adapter centralizes encrypted key-value access helpers.
// It offers string and JSON convenience wrappers used by stores/services.

import { createMMKV } from 'react-native-mmkv';

// ── Storage Instance ───────────────────────────────────────────────────────────

/**
 * Shared MMKV instance for app persistence.
 */
export const mmkv = createMMKV({
  id: 'storage-reducer-mmkv',
  // Static app key for this phase; rotate/migrate in future security hardening.
  encryptionKey: 'storage-reducer-phase-1-key',
});

// ── Primitive Accessors ────────────────────────────────────────────────────────

/**
 * Reads a string value by key.
 */
export const mmkvGetString = (key: string): string | undefined => mmkv.getString(key);

/**
 * Stores a string value by key.
 */
export const mmkvSetString = (key: string, value: string): void => {
  mmkv.set(key, value);
};

/**
 * Deletes a key from storage.
 */
export const mmkvDelete = (key: string): void => {
  mmkv.remove(key);
};

// ── JSON Accessors ─────────────────────────────────────────────────────────────

/**
 * Reads and parses JSON at key, returning null for missing/invalid payloads.
 *
 * Invalid JSON is treated as absent data to keep hydration resilient across
 * partial writes or schema transitions.
 */
export const mmkvGetJson = <T>(key: string): T | null => {
  const raw = mmkvGetString(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * Serializes and stores JSON value at key.
 */
export const mmkvSetJson = <T>(key: string, value: T): void => {
  mmkvSetString(key, JSON.stringify(value));
};
