import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../config/constants';
import { upsertUser } from '../services/userService';
import { createSession } from './session';
import type { AppUser } from '../types/auth';

export function configureGoogle(): void {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export async function signInWithGoogle(): Promise<AppUser> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new Error('SIGN_IN_CANCELLED');
  }

  // Ambil idToken + accessToken. RN Firebase (New Arch) memerlukan keduanya.
  const { idToken, accessToken } = await GoogleSignin.getTokens();
  if (!idToken) {
    throw new Error('NO_ID_TOKEN');
  }

  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(getAuth(), credential);
  const fbUser = result.user;

  const appUser: AppUser = {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? '',
    photoURL: fbUser.photoURL ?? null,
    provider: 'google.com',
  };

  await upsertUser(appUser);
  await createSession(appUser);
  return appUser;
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.revokeAccess();
  } catch {
    // abaikan jika gagal revoke
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // abaikan jika gagal sign out google
  }
  await signOut(getAuth());
}
