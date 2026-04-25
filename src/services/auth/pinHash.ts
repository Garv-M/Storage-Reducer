import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_SALT_KEY = 'pin.salt';
const PIN_HASH_KEY = 'pin.hash';
const PIN_LENGTH_KEY = 'pin.length';
const bytesToHex = (bytes: Uint8Array) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');

const normalizePin = (pin: string) => pin.trim();

const hashWithSalt = async (pin: string, salt: string) => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${normalizePin(pin)}`);
};

export const hashPin = async (pin: string) => {
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const hash = await hashWithSalt(pin, salt);
  return { salt, hash };
};

export const verifyPin = async (pin: string, salt: string, hash: string) => {
  const nextHash = await hashWithSalt(pin, salt);
  return nextHash === hash;
};

export const savePin = async (pin: string) => {
  const { salt, hash } = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await SecureStore.setItemAsync(PIN_LENGTH_KEY, String(pin.length));
};

export const loadPin = async () => {
  const [salt, hash] = await Promise.all([SecureStore.getItemAsync(PIN_SALT_KEY), SecureStore.getItemAsync(PIN_HASH_KEY)]);

  if (!salt || !hash) return null;
  return { salt, hash };
};

export const hasPin = async () => {
  const pin = await loadPin();
  return Boolean(pin?.salt && pin?.hash);
};

export const loadPinLength = async (): Promise<number | null> => {
  const length = await SecureStore.getItemAsync(PIN_LENGTH_KEY);
  return length ? parseInt(length, 10) : null;
};

export const clearPin = async () => {
  await Promise.all([SecureStore.deleteItemAsync(PIN_SALT_KEY), SecureStore.deleteItemAsync(PIN_HASH_KEY), SecureStore.deleteItemAsync(PIN_LENGTH_KEY)]);
};
