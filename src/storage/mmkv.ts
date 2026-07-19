import { createMMKV, type MMKV } from 'react-native-mmkv';
import { getOrCreateMmkvKey } from './keychain';

let storage: MMKV | null = null;
let initPromise: Promise<MMKV> | null = null;

export async function getStorage(): Promise<MMKV> {
  if (storage) {
    return storage;
  }
  if (!initPromise) {
    initPromise = (async () => {
      const encryptionKey = await getOrCreateMmkvKey();
      const instance = createMMKV({
        id: 'app-session',
        encryptionKey,
        encryptionType: 'AES-256',
      });
      storage = instance;
      return instance;
    })();
  }
  return initPromise;
}
