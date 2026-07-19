# TDD — Technical Design Document

**Proyek:** SSO Google App (React Native CLI)
**Versi:** 1.0 · **Tanggal:** 19 Juli 2026
**Referensi:** [PRD.md](./PRD.md) · [SETUP.md](./SETUP.md)

Dokumen ini menjabarkan desain teknis implementasi: struktur modul, kontrak antar-lapisan, alur data, dan contoh kode acuan. Contoh kode bersifat **referensi desain** (bukan final) untuk menyamakan pemahaman sebelum implementasi.

---

## 1. Prinsip Desain

1. **Separation of concerns** — UI (screens) terpisah dari logika auth/session/service.
2. **Single source of truth** — Firestore untuk data pengguna; `authStore` (Zustand) untuk state runtime; MMKV untuk persistensi sesi.
3. **Offline-first auto-login** — validasi sesi murni lokal saat cold start (tanpa jaringan).
4. **Security by default** — token sensitif & encryption key hanya di Keychain/Keystore.
5. **Fail safe** — sesi korup/kadaluarsa selalu jatuh ke layar login, tidak pernah crash.

---

## 2. Arsitektur Lapisan

```
┌─────────────────────────────────────────────┐
│                 UI (screens)                 │  Splash, Login, Home
├─────────────────────────────────────────────┤
│              Navigation (RootNavigator)      │  gate: AuthStack | AppStack
├─────────────────────────────────────────────┤
│           State (authStore - Zustand)        │  status, user, actions
├─────────────────────────────────────────────┤
│   Auth logic (googleAuth, session)           │  orchestration
├─────────────────────────────────────────────┤
│ Services (firebase, userService) │ Storage (mmkv, keychain) │
└─────────────────────────────────────────────┘
```

**Aturan dependensi:** lapisan atas boleh memanggil lapisan bawah, tidak sebaliknya. `screens` tidak memanggil `services` langsung — lewat `authStore`/hooks.

---

## 3. Model Data & Tipe

```ts
// src/types/auth.ts

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated';

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
  issuedAt: number;     // epoch ms
  expiresAt: number;    // epoch ms = issuedAt + SESSION_TTL_MS
  lastActiveAt: number; // untuk sliding session
}
```

Skema Firestore `users/{uid}` mengikuti [PRD §7.1](./PRD.md#71-firestore--koleksi-users).

---

## 4. Konfigurasi & Konstanta

```ts
// src/config/constants.ts

export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 hari

// Aktifkan sliding session: perpanjang expiresAt saat pengguna aktif.
export const SLIDING_SESSION = true;

// Ambang minimal untuk memperpanjang (hindari tulis MMKV terlalu sering).
export const SLIDING_REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // 1 jam

// WAJIB diisi dari Google Cloud / Firebase (Web client ID).
export const GOOGLE_WEB_CLIENT_ID = '<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com';
```

> Rekomendasi: pindahkan `GOOGLE_WEB_CLIENT_ID` ke `.env` via `react-native-config` agar tidak hardcoded di repo.

---

## 5. Storage Layer

### 5.1 Keychain (secure)

```ts
// src/storage/keychain.ts
import * as Keychain from 'react-native-keychain';

const MMKV_KEY_SERVICE = 'app.mmkv.encryptionKey';

export async function getOrCreateMmkvKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({ service: MMKV_KEY_SERVICE });
  if (existing) return existing.password;

  // Generate key acak 256-bit (base64). Bisa pakai react-native-get-random-values + crypto.
  const key = generateRandomKey();
  await Keychain.setGenericPassword('mmkv', key, {
    service: MMKV_KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
  });
  return key;
}

export async function saveSecret(service: string, value: string) {
  await Keychain.setGenericPassword('secret', value, { service });
}

export async function getSecret(service: string): Promise<string | null> {
  const r = await Keychain.getGenericPassword({ service });
  return r ? r.password : null;
}

export async function deleteSecret(service: string) {
  await Keychain.resetGenericPassword({ service });
}
```

### 5.2 MMKV (metadata sesi, terenkripsi)

```ts
// src/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';
import { getOrCreateMmkvKey } from './keychain';

let storage: MMKV | null = null;

export async function getStorage(): Promise<MMKV> {
  if (storage) return storage;
  const encryptionKey = await getOrCreateMmkvKey();
  storage = new MMKV({ id: 'app-session', encryptionKey });
  return storage;
}
```

> Karena `getOrCreateMmkvKey()` async, inisialisasi MMKV dilakukan sekali saat bootstrap (Splash) sebelum akses sesi.

---

## 6. Session Manager (Inti Logika 14 Hari)

```ts
// src/auth/session.ts
import { getStorage } from '../storage/mmkv';
import {
  SESSION_TTL_MS, SLIDING_SESSION, SLIDING_REFRESH_THRESHOLD_MS,
} from '../config/constants';
import type { LocalSession, AppUser } from '../types/auth';

const SESSION_KEY = 'auth.session';

export async function createSession(user: AppUser): Promise<LocalSession> {
  const now = Date.now();
  const session: LocalSession = {
    ...user,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    lastActiveAt: now,
  };
  const s = await getStorage();
  s.set(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function getValidSession(): Promise<LocalSession | null> {
  const s = await getStorage();
  const raw = s.getString(SESSION_KEY);
  if (!raw) return null;

  let session: LocalSession;
  try {
    session = JSON.parse(raw);
  } catch {
    s.delete(SESSION_KEY); // korup → hapus
    return null;
  }

  const now = Date.now();
  if (now >= session.expiresAt) {
    s.delete(SESSION_KEY); // kadaluarsa
    return null;
  }

  // Sliding: perpanjang jika aktif & sudah lewat threshold
  if (SLIDING_SESSION && now - session.lastActiveAt > SLIDING_REFRESH_THRESHOLD_MS) {
    session.lastActiveAt = now;
    session.expiresAt = now + SESSION_TTL_MS;
    s.set(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export async function clearSession(): Promise<void> {
  const s = await getStorage();
  s.delete(SESSION_KEY);
}
```

**Edge case yang ditangani:** tidak ada sesi, sesi korup (JSON invalid), sesi kadaluarsa, perpanjangan sliding. Manipulasi jam perangkat dimitigasi di lapisan server untuk aksi sensitif ([PRD §12](./PRD.md#12-penanganan-error--edge-case)).

---

## 7. Firebase Service

```ts
// src/services/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const fbAuth = auth;
export const db = firestore;
```

```ts
// src/services/userService.ts
import firestore from '@react-native-firebase/firestore';
import type { AppUser } from '../types/auth';

export async function upsertUser(user: AppUser): Promise<void> {
  const ref = firestore().collection('users').doc(user.uid);
  const now = firestore.FieldValue.serverTimestamp();
  const snap = await ref.get();

  if (snap.exists) {
    await ref.update({ ...user, lastLoginAt: now, updatedAt: now });
  } else {
    await ref.set({ ...user, createdAt: now, lastLoginAt: now, updatedAt: now });
  }
}
```

---

## 8. Google Auth Orchestration

```ts
// src/auth/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../config/constants';
import { upsertUser } from '../services/userService';
import { createSession } from './session';
import type { AppUser } from '../types/auth';

export function configureGoogle() {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export async function signInWithGoogle(): Promise<AppUser> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();
  const idToken = data?.idToken;
  if (!idToken) throw new Error('NO_ID_TOKEN');

  const credential = auth.GoogleAuthProvider.credential(idToken);
  const result = await auth().signInWithCredential(credential);
  const fu = result.user;

  const appUser: AppUser = {
    uid: fu.uid,
    email: fu.email ?? '',
    displayName: fu.displayName ?? '',
    photoURL: fu.photoURL,
    provider: 'google.com',
  };

  await upsertUser(appUser);      // Firestore
  await createSession(appUser);   // Local session 14 hari
  return appUser;
}

export async function signOutGoogle(): Promise<void> {
  try { await GoogleSignin.revokeAccess(); } catch {}
  try { await GoogleSignin.signOut(); } catch {}
  await auth().signOut();
}
```

---

## 9. State Management (Zustand)

```ts
// src/auth/authStore.ts
import { create } from 'zustand';
import type { AppUser, AuthStatus } from '../types/auth';
import { signInWithGoogle, signOutGoogle } from './googleAuth';
import { getValidSession, clearSession } from './session';

interface AuthState {
  status: AuthStatus;
  user: AppUser | null;
  error: string | null;
  bootstrap: () => Promise<void>;   // dipanggil di Splash
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  error: null,

  bootstrap: async () => {
    set({ status: 'checking' });
    const session = await getValidSession();
    if (session) {
      set({ status: 'authenticated', user: { ...session, provider: 'google.com' } });
    } else {
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async () => {
    set({ error: null });
    try {
      const user = await signInWithGoogle();
      set({ status: 'authenticated', user });
    } catch (e: any) {
      set({ error: mapAuthError(e), status: 'unauthenticated' });
    }
  },

  logout: async () => {
    await signOutGoogle();
    await clearSession();
    set({ status: 'unauthenticated', user: null });
  },
}));

function mapAuthError(e: any): string {
  const code = e?.code ?? e?.message ?? '';
  if (String(code).includes('CANCEL')) return 'Login dibatalkan.';
  if (String(code).includes('NETWORK')) return 'Periksa koneksi internet.';
  return 'Gagal login. Coba lagi.';
}
```

---

## 10. Navigasi (Auth Gate)

```tsx
// src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../auth/authStore';
import { configureGoogle } from '../auth/googleAuth';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    configureGoogle();
    bootstrap();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === 'idle' || status === 'checking' ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : status === 'authenticated' ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 11. Alur Runtime (Sequence Ringkas)

**Cold start:**
```
App.tsx → RootNavigator → bootstrap()
  → getValidSession() [MMKV+Keychain]
      → valid   → status=authenticated → HomeScreen
      → invalid → status=unauthenticated → LoginScreen
```

**Login:**
```
LoginScreen → authStore.login()
  → signInWithGoogle() → Firebase signInWithCredential
  → upsertUser() [Firestore] → createSession() [MMKV]
  → status=authenticated → HomeScreen
```

**Logout:**
```
HomeScreen → authStore.logout()
  → signOutGoogle() (revoke+signOut) → clearSession()
  → status=unauthenticated → LoginScreen
```

---

## 12. Penanganan Error (Ringkas)

| Sumber | Error | Aksi |
|---|---|---|
| Google Sign-In | `SIGN_IN_CANCELLED` | Diam, kembali ke Login |
| Google Sign-In | `PLAY_SERVICES_NOT_AVAILABLE` | Pesan minta update Play Services |
| Firebase | network error | Pesan "Periksa koneksi" |
| Session | JSON korup | Hapus sesi, ke Login |
| Firestore | permission denied | Paksa logout, ke Login |

---

## 13. Pertimbangan Keamanan

- Encryption key MMKV **tidak pernah** disimpan di kode/AsyncStorage — hanya Keychain/Keystore.
- Token Google/Firebase sensitif → Keychain (bukan MMKV biasa).
- Firestore Rules membatasi akses ke dokumen milik sendiri.
- Untuk aksi sensitif, verifikasi ulang ke server (jangan hanya percaya TTL lokal — antisipasi manipulasi jam perangkat).
- Jangan log token/PII ke console di build rilis.

---

## 14. Strategi Pengujian

| Level | Fokus | Alat |
|---|---|---|
| Unit | `session.ts` (TTL, sliding, korup, kadaluarsa) | Jest |
| Unit | `mapAuthError`, `upsertUser` (mock Firestore) | Jest + mock |
| Integration | flow login end-to-end (mock Google/Firebase) | Jest + RNTL |
| Manual/E2E | login nyata, cold start dalam 14 hari, logout | Device/Emulator |

**Kasus uji kritis session:**
1. `expiresAt` di masa depan → sesi valid.
2. `expiresAt` lewat → null + terhapus.
3. JSON korup → null + terhapus.
4. Sliding: `lastActiveAt` lama → `expiresAt` diperpanjang.
5. Sliding: baru saja aktif (< threshold) → tidak menulis ulang.

---

## 15. Rangkuman File yang Akan Dibuat

| File | Tanggung jawab |
|---|---|
| `src/types/auth.ts` | Tipe & interface |
| `src/config/constants.ts` | Konstanta (TTL, client id) |
| `src/storage/keychain.ts` | Secure key/token |
| `src/storage/mmkv.ts` | MMKV terenkripsi |
| `src/auth/session.ts` | Logika session 14 hari |
| `src/services/firebase.ts` | Init Firebase |
| `src/services/userService.ts` | Upsert Firestore |
| `src/auth/googleAuth.ts` | Google SSO orchestration |
| `src/auth/authStore.ts` | State (Zustand) — termasuk `sessionExpiresAt` untuk UI |
| `src/navigation/RootNavigator.tsx` | Auth gate (Splash/Login/Main) |
| `src/navigation/TabNavigator.tsx` | Bottom tab: Beranda/Aktivitas/Profil |
| `src/theme/theme.ts` | Design system: palette light/dark, spacing, radius, tipografi, `useTheme()` |
| `src/components/*.tsx` | GradientBackground, CollapsibleScreen, BrandLogo, GoogleGlyph, GoogleButton, Avatar, Card, FadeInView, AnimatedBar, PressableScale, Skeleton |
| `src/screens/{Splash,Login,Home,Activity,Profile,About,Security,Help}Screen.tsx` | UI layar |
| `src/navigation/types.ts` | Tipe `RootStackParamList`, `TabParamList`, `TabScreenNavigation` |
| `App.tsx` | Providers + RootNavigator |

> Setelah [SETUP.md](./SETUP.md) checklist §8 selesai, file-file di atas siap diimplementasikan.

---

## 16. Lapisan UI/UX (Design System)

### 16.1 Tema (`src/theme/theme.ts`)
- Menyediakan dua palette (`light`, `dark`) yang dipilih otomatis via `useColorScheme()`.
- Token: `colors`, `spacing`, `radius`, `typography`. Diakses lewat hook `useTheme()`.
- Warna brand: gradient biru (`#4285F4`) → ungu (`#7B5CF0`).

### 16.2 Prinsip
- **Konsistensi**: seluruh screen & komponen memakai token tema (tanpa warna hardcode acak).
- **Responsif**: `maxWidth: 480` + `alignSelf: 'center'`; tinggi hero relatif `useWindowDimensions`.
- **Dark mode**: otomatis mengikuti sistem.
- **Aksesibilitas**: `accessibilityRole`/`accessibilityLabel`, target sentuh ≥ 52px, kontras memadai.
- **Aman notch**: `SafeAreaView` per-edge + `StatusBar` translucent (light-content di atas gradient).

### 16.3 Komponen
| Komponen | Fungsi |
|---|---|
| `GradientBackground` | `LinearGradient` diagonal + dua blob translusen |
| `GradientHeader` | Header gradient dengan judul/subjudul + slot kanan (avatar) |
| `BrandLogo` | Kotak membulat dengan inisial brand |
| `GoogleGlyph` | Lingkaran putih berisi "G" (pengganti logo SVG) |
| `GoogleButton` | Tombol pill primary, ikon + label, state loading |
| `Avatar` | Foto profil bulat atau fallback inisial |
| `Card` | Permukaan kartu berbayang, radius konsisten |
| `FadeInView` | Animasi masuk fade + slide-up, mendukung `delay` (stagger) |
| `AnimatedBar` | Progress bar mengisi (animasi width) 0 → target |
| `PressableScale` | Wrapper Pressable dengan animasi skala saat ditekan |
| `CollapsibleScreen` | Layar dengan header gradient collapse saat scroll + pull-to-refresh (RefreshControl) |
| `Skeleton` / `SkeletonRowCard` / `SkeletonStatCard` | Placeholder loading berpulsa |

### 16.6 Collapsing Header, Pull-to-Refresh & Skeleton
- **Collapsing header** (`CollapsibleScreen`): `Animated.ScrollView` menyetir `scrollY` (via `Animated.event`, `useNativeDriver:false`). `scrollY` di-`interpolate` untuk tinggi header, ukuran judul, opacity subjudul, dan skala slot kanan (avatar) dengan `extrapolate:'clamp'`. Ambang: `HEADER_MAX=180` → `HEADER_MIN=insets.top+64`.
- **Pull-to-refresh**: `RefreshControl` pada scroll view; setiap layar menyuplai `onRefresh` (Beranda/Profil memanggil `authStore.bootstrap()`; Aktivitas mensimulasikan reload). State `refreshing` dikelola di dalam `CollapsibleScreen`.
- **Skeleton**: state `loading` per layar (true saat mount ±800–900ms, dan saat refresh pada Aktivitas). Saat `loading`, render komponen `Skeleton*`; setelah selesai, konten asli muncul dengan animasi `FadeInView`.

### 16.5 Navigasi (revisi)
Setelah autentikasi, `RootNavigator` menampilkan `TabNavigator` (bukan satu layar Home).

```
RootNavigator (native-stack, animation: 'fade')
├─ Splash        (status: idle | checking)
├─ Login         (status: unauthenticated)
└─ (status: authenticated)
     ├─ Main      → TabNavigator
     │    ├─ Beranda   (HomeScreen)
     │    ├─ Aktivitas (ActivityScreen)
     │    └─ Profil    (ProfileScreen)
     ├─ About     (AboutScreen, slide_from_right, fullscreen di atas tab)
     ├─ Security  (SecurityScreen, slide_from_right)
     └─ Help      (HelpScreen, slide_from_right)
```

- **About/Security/Help** didaftarkan di root stack (bukan di dalam tab) agar tampil fullscreen dengan tombol kembali & menutupi tab bar.
- Dibuka via `navigation.navigate(...)`: baris "Tentang Aplikasi" (Profil) → About; kartu **Aksi Cepat** (Beranda) → Profil/Aktivitas (pindah tab) & Security/Help (push root).
- Navigasi dari layar dalam tab memakai `TabScreenNavigation` (`CompositeNavigationProp` bottom-tab + root-stack) di `src/navigation/types.ts`, sehingga bisa pindah tab **dan** push rute root.

- `TabNavigator` = `@react-navigation/bottom-tabs`; ikon Ionicons (`react-native-vector-icons`), warna aktif = `colors.primary`, tab bar bergaya tema.
- **Android**: `react-native-vector-icons` memerlukan `apply from: file(".../fonts.gradle")` di `android/app/build.gradle` (menyalin font ikon). Wajib rebuild setelah ditambah.
- Animasi memakai API `Animated` bawaan RN (tanpa Reanimated/babel plugin) untuk menjaga build tetap sederhana.

### 16.4 Catatan Implementasi Auth (revisi)
- `signInWithGoogle` mengambil token via `GoogleSignin.getTokens()` → `{ idToken, accessToken }`, lalu `GoogleAuthProvider.credential(idToken, accessToken)`. **Kedua token wajib** pada RN Firebase (New Architecture); tanpa `accessToken` muncul error `auth/unknown: accessToken cannot be empty`.
- `authStore` mengekspos `sessionExpiresAt` agar Home dapat menampilkan sisa hari & progress bar masa sesi 14 hari.
