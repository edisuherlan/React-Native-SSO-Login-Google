export type AuthStatus =
  | 'idle'
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: 'google.com';
}

export interface LocalSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  issuedAt: number;
  expiresAt: number;
  lastActiveAt: number;
}
