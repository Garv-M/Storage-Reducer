import { createMMKV } from 'react-native-mmkv';

export const mmkv = createMMKV({
  id: 'storage-reducer-mmkv',
  encryptionKey: 'storage-reducer-phase-1-key',
});

export const mmkvGetString = (key: string): string | undefined => mmkv.getString(key);

export const mmkvSetString = (key: string, value: string): void => {
  mmkv.set(key, value);
};

export const mmkvDelete = (key: string): void => {
  mmkv.remove(key);
};

export const mmkvGetJson = <T>(key: string): T | null => {
  const raw = mmkvGetString(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const mmkvSetJson = <T>(key: string, value: T): void => {
  mmkvSetString(key, JSON.stringify(value));
};
