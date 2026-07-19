import { create } from 'zustand';
import type { AppUser, AuthStatus } from '../types/auth';
import { signInWithGoogle, signOutGoogle } from './googleAuth';
import { getValidSession, clearSession } from './session';

interface AuthState {
  status: AuthStatus;
  user: AppUser | null;
  sessionExpiresAt: number | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function mapAuthError(e: unknown): string {
  const err = e as { code?: string | number; message?: string };
  const code = String(err?.code ?? err?.message ?? '').toUpperCase();
  if (code.includes('CANCEL')) {
    return 'Login dibatalkan.';
  }
  if (code.includes('NETWORK')) {
    return 'Periksa koneksi internet Anda.';
  }
  if (code.includes('PLAY_SERVICES')) {
    return 'Google Play Services perlu diperbarui.';
  }
  return 'Gagal login. Silakan coba lagi.';
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  sessionExpiresAt: null,
  error: null,

  bootstrap: async () => {
    set({ status: 'checking' });
    try {
      const session = await getValidSession();
      if (session) {
        set({
          status: 'authenticated',
          sessionExpiresAt: session.expiresAt,
          user: {
            uid: session.uid,
            email: session.email,
            displayName: session.displayName,
            photoURL: session.photoURL,
            provider: 'google.com',
          },
        });
      } else {
        set({ status: 'unauthenticated', user: null, sessionExpiresAt: null });
      }
    } catch {
      set({ status: 'unauthenticated', user: null, sessionExpiresAt: null });
    }
  },

  login: async () => {
    set({ error: null });
    try {
      const user = await signInWithGoogle();
      const session = await getValidSession();
      set({
        status: 'authenticated',
        user,
        sessionExpiresAt: session?.expiresAt ?? null,
      });
    } catch (e) {
      set({ error: mapAuthError(e), status: 'unauthenticated' });
    }
  },

  logout: async () => {
    try {
      await signOutGoogle();
    } finally {
      await clearSession();
      set({ status: 'unauthenticated', user: null, sessionExpiresAt: null });
    }
  },

  clearError: () => set({ error: null }),
}));
