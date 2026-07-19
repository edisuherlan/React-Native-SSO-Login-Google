import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';

const MMKV_KEY_SERVICE = 'app.mmkv.encryptionKey';

// Menghasilkan string 32 karakter (32 byte) — sesuai batas maksimum kunci AES-256 pada MMKV.
function generateRandomKey(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  // crypto disediakan oleh polyfill react-native-get-random-values
  const cryptoObj = (globalThis as { crypto?: { getRandomValues: (arr: Uint8Array) => Uint8Array } })
    .crypto;
  if (!cryptoObj) {
    throw new Error('CRYPTO_UNAVAILABLE');
  }
  cryptoObj.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getOrCreateMmkvKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({
    service: MMKV_KEY_SERVICE,
  });
  if (existing) {
    return existing.password;
  }

  const key = generateRandomKey();
  await Keychain.setGenericPassword('mmkv', key, {
    service: MMKV_KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
  });
  return key;
}

export async function saveSecret(service: string, value: string): Promise<void> {
  await Keychain.setGenericPassword('secret', value, { service });
}

export async function getSecret(service: string): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service });
  return result ? result.password : null;
}

export async function deleteSecret(service: string): Promise<void> {
  await Keychain.resetGenericPassword({ service });
}
