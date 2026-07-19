import { getStorage } from '../storage/mmkv';
import {
  SESSION_TTL_MS,
  SLIDING_SESSION,
  SLIDING_REFRESH_THRESHOLD_MS,
} from '../config/constants';
import type { AppUser, LocalSession } from '../types/auth';

const SESSION_KEY = 'auth.session';

export async function createSession(user: AppUser): Promise<LocalSession> {
  const now = Date.now();
  const session: LocalSession = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    lastActiveAt: now,
  };
  const storage = await getStorage();
  storage.set(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function getValidSession(): Promise<LocalSession | null> {
  const storage = await getStorage();
  const raw = storage.getString(SESSION_KEY);
  if (!raw) {
    return null;
  }

  let session: LocalSession;
  try {
    session = JSON.parse(raw) as LocalSession;
  } catch {
    storage.remove(SESSION_KEY);
    return null;
  }

  const now = Date.now();
  if (now >= session.expiresAt) {
    storage.remove(SESSION_KEY);
    return null;
  }

  if (
    SLIDING_SESSION &&
    now - session.lastActiveAt > SLIDING_REFRESH_THRESHOLD_MS
  ) {
    session.lastActiveAt = now;
    session.expiresAt = now + SESSION_TTL_MS;
    storage.set(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export async function clearSession(): Promise<void> {
  const storage = await getStorage();
  storage.remove(SESSION_KEY);
}
