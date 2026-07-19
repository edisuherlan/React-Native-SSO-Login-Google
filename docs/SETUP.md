# Panduan Setup — React Native CLI + Google SSO + Firestore + Session 14 Hari

Dokumen ini adalah panduan langkah-demi-langkah untuk menyiapkan proyek dari nol sesuai [PRD.md](./PRD.md). Ikuti berurutan. Setelah setup selesai, kode aplikasi (`src/`) akan ditambahkan pada tahap berikutnya.

> **Catatan OS:** Kamu memakai **Windows**. Untuk Windows kamu bisa build & jalankan **Android**. Build **iOS wajib macOS** (Xcode). Langkah iOS tetap disertakan sebagai referensi jika nanti pakai Mac.

---

## STATUS IMPLEMENTASI (Update Terakhir)

Bagian ini merangkum apa yang **sudah dikerjakan otomatis** dan apa yang **masih perlu kamu lakukan manual**.

### Sudah selesai
- [x] **§0** Environment terverifikasi: Node v22, JDK 17, Android SDK (`D:\SDK\android`), adb OK.
- [x] **§1** Proyek React Native **0.86.0** ter-init, folder `docs/` dipertahankan.
- [x] **§2** Semua dependensi terpasang (navigation stack + **bottom-tabs**, firebase, google-signin, mmkv v4 + nitro-modules, keychain, zustand, react-query, zod, get-random-values, **linear-gradient**, **vector-icons**).
- [x] **Firebase** project `sso-885ba`: Auth Google aktif, SHA-1 terdaftar, Firestore + rules terpasang.
- [x] **§5.1** `google-services.json` di `android/app/`, `applicationId` = `com.audhighasu.sso`, plugin google-services ter-wiring.
- [x] **Web Client ID** sudah diisi di `src/config/constants.ts`.
- [x] **Kode `src/`** lengkap: types, config, storage (keychain+mmkv), session 14 hari, firebase, userService, googleAuth (idToken+accessToken), authStore, navigasi, screens, **design system + komponen UI**, `App.tsx`. TypeScript typecheck **lolos**.
- [x] New Architecture & Hermes aktif.
- [x] **Login Google BERHASIL** & UI modern (gradient, dark mode, responsif) terpasang di device.
- [x] **Navigasi bottom tab** (Beranda/Aktivitas/Profil) + **animasi** (entrance stagger, progress bar, press scale) aktif.
- [x] **Collapsing header + pull-to-refresh + skeleton loading** di semua tab (tanpa native module tambahan → cukup Fast Refresh).
- [x] `react-native-vector-icons` dikonfigurasi di Android via `apply from: fonts.gradle`.

### Catatan
- Setelah menambah native module (mis. `react-native-linear-gradient`, `react-native-vector-icons`), **wajib rebuild**: `npx react-native run-android` (bukan sekadar reload Metro).
- Jika Metro sudah jalan di port 8081, gunakan `npx react-native run-android --no-packager` agar tidak muncul prompt ganti port.
- Perubahan file `.ts/.tsx` cukup di-reload Metro (Fast Refresh), tidak perlu rebuild.

### Opsional / lanjutan
1. (macOS) **[ ] iOS**: `GoogleService-Info.plist` + URL scheme + `pod install` (§5.2), lalu `npx react-native run-ios`.
2. **[ ] SHA-1 rilis**: saat build release, daftarkan SHA-1 keystore produksi ke Firebase.

Menjalankan ulang:

```powershell
npx react-native run-android
```

---

## 0. Prasyarat Environment

### 0.1 Wajib (Windows / Android)

| Tool | Versi Disarankan | Cek |
|---|---|---|
| Node.js | LTS ≥ 20 | `node -v` |
| JDK | 17 (Temurin/Adoptium) | `java -version` |
| Android Studio | terbaru (+ SDK, Platform Tools, Emulator) | — |
| React Native CLI | via `npx` (tidak perlu install global) | — |

Ikuti panduan resmi environment: **React Native → Set up dev environment → pilih "React Native CLI Quickstart" → OS Windows, Target Android**.

### 0.2 Environment Variables (Windows)

Pastikan variabel ini terpasang (biasanya diatur oleh Android Studio):

```
ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
```

Tambahkan ke `Path`:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

Verifikasi:

```powershell
adb --version
```

### 0.3 Tambahan untuk iOS (hanya di macOS)

- Xcode + Command Line Tools
- CocoaPods (`sudo gem install cocoapods` atau via Homebrew)

---

## 1. Inisialisasi Proyek React Native CLI

> Karena folder proyek (`sso-google`) sudah ada, kita init di folder sementara lalu pindahkan, ATAU init langsung dengan nama app di parent. Cara paling bersih: init proyek baru, lalu salin folder `docs/` ke dalamnya.

### Opsi A — Init proyek baru (disarankan)

Jalankan di folder **parent** (`e:\MOBILE APP\ReactNative\`):

```powershell
npx @react-native-community/cli@latest init SsoGoogle --pm npm
```

Lalu pindahkan folder `docs/` yang sudah ada ke dalam `SsoGoogle/docs/`.

### Opsi B — Init di dalam folder yang sudah ada

Jika ingin tetap memakai folder `sso-google` saat ini (harus hampir kosong, hanya berisi `docs/`):

```powershell
# dari dalam e:\MOBILE APP\ReactNative\sso-google
npx @react-native-community/cli@latest init SsoGoogle --directory . --pm npm
```

> Nama package Android/iOS default akan menjadi `com.ssogoogle`. Catat ini — dibutuhkan saat konfigurasi OAuth & Firebase.

### Verifikasi jalan

```powershell
npm run android
```

Aplikasi template default harus muncul di emulator/device. Jika ini berhasil, environment sudah benar.

---

## 2. Install Dependensi

Dari root proyek:

```powershell
# Navigasi
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Google Sign-In
npm install @react-native-google-signin/google-signin

# Firebase (RN Firebase)
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Storage sesi
npm install react-native-mmkv react-native-keychain

# State & utilitas
npm install zustand @tanstack/react-query zod
```

iOS (di macOS saja):

```bash
cd ios && pod install && cd ..
```

---

## 3. Buat Project Firebase

1. Buka **Firebase Console** → **Add project**.
2. Aktifkan **Authentication** → tab **Sign-in method** → aktifkan **Google**.
3. Aktifkan **Firestore Database** → **Create database** → mode **Production** → pilih lokasi region terdekat.
4. Terapkan **Security Rules** (lihat [PRD §11](./PRD.md#11-firestore-security-rules-baseline)):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

## 4. Konfigurasi Google OAuth Client ID

Google Sign-In butuh beberapa OAuth Client ID di **Google Cloud Console** (project yang sama dengan Firebase):

| Client ID | Kegunaan |
|---|---|
| **Web client** | WAJIB — dipakai sebagai `webClientId` di `GoogleSignin.configure()` |
| **Android client** | Terikat ke package name + SHA-1 |
| **iOS client** | Terikat ke bundle ID (untuk build iOS) |

> Saat kamu mendaftarkan app Android di Firebase (langkah 5), Firebase otomatis membuat OAuth client. Yang penting: **salin Web client ID** dari Firebase Console → Authentication → Google → "Web SDK configuration", atau dari Google Cloud Console → APIs & Services → Credentials.

### 4.1 Dapatkan SHA-1 (Android, debug)

```powershell
cd android
./gradlew signingReport
cd ..
```

Ambil nilai **SHA1** dari varian `debug` (dan nanti SHA-1 keystore rilis untuk produksi). Daftarkan SHA-1 ini di:
- Firebase Console → Project Settings → Your apps → Android app → **Add fingerprint**.

---

## 5. Registrasi App di Firebase & File Konfigurasi

### 5.1 Android

1. Firebase Console → **Add app** → Android.
2. Isi **package name** persis: `com.ssogoogle` (sesuai proyek RN).
3. Masukkan SHA-1 (dari langkah 4.1).
4. Unduh **`google-services.json`** → letakkan di:

```
android/app/google-services.json
```

5. Edit **`android/build.gradle`** (project-level) — tambahkan classpath plugin:

```gradle
buildscript {
    dependencies {
        // ...
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

6. Edit **`android/app/build.gradle`** — terapkan plugin di baris paling bawah / setelah plugin lain:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 5.2 iOS (referensi, di macOS)

1. Firebase Console → **Add app** → iOS.
2. Isi **bundle ID**: `org.reactjs.native.example.SsoGoogle` atau bundle ID kustommu.
3. Unduh **`GoogleService-Info.plist`** → tambahkan ke Xcode project (folder root target) via Xcode (Add Files), bukan sekadar copy manual.
4. Tambahkan **URL scheme** = nilai `REVERSED_CLIENT_ID` dari plist ke `Info` → URL Types.
5. `cd ios && pod install`.

---

## 6. Konfigurasi Native Google Sign-In (Android)

Untuk RN CLI, `@react-native-google-signin/google-signin` sudah autolink. Yang perlu dipastikan di **`android/build.gradle`** ada Google Play Services version yang kompatibel (biasanya sudah diatur). Tidak ada langkah manual tambahan yang wajib untuk Android modern selain `google-services.json` sudah terpasang.

---

## 7. Konfigurasi Enkripsi Session (Keychain + MMKV)

Ringkasan strategi (detail di [PRD §8](./PRD.md#8-strategi-session-14-hari)):
- `react-native-keychain` menyimpan **encryption key** MMKV + token sensitif di secure hardware.
- `react-native-mmkv` diinisialisasi dengan `encryptionKey` tersebut untuk menyimpan metadata sesi (`uid`, `expiresAt`, dll).

Tidak ada konfigurasi native tambahan yang wajib — cukup install (langkah 2). Implementasi kode menyusul di tahap berikutnya.

---

## 8. Checklist Verifikasi Setup

Centang sebelum lanjut ke tahap koding aplikasi:

- [ ] `npm run android` menampilkan app template tanpa error.
- [ ] Semua dependensi (§2) terpasang tanpa konflik versi.
- [ ] Firebase project dibuat; Authentication (Google) & Firestore aktif.
- [ ] Firestore Security Rules terpasang.
- [ ] SHA-1 debug terdaftar di Firebase.
- [ ] `google-services.json` ada di `android/app/`.
- [ ] Gradle plugin `google-services` diterapkan.
- [ ] **Web client ID** sudah dicatat (untuk `GoogleSignin.configure`).
- [ ] (macOS) `GoogleService-Info.plist` + URL scheme + `pod install` selesai.

---

## 9. Troubleshooting Umum

| Gejala | Kemungkinan Penyebab | Solusi |
|---|---|---|
| `DEVELOPER_ERROR` saat Google Sign-In | SHA-1 salah / `webClientId` salah | Daftarkan SHA-1 yang benar, gunakan **Web** client ID |
| Build gagal `google-services.json missing` | File belum diletakkan | Taruh di `android/app/` |
| `Duplicate class` / versi bentrok | Versi Play Services / Firebase tidak cocok | Samakan versi, `cd android && ./gradlew clean` |
| Metro cache aneh | Cache lama | `npm start -- --reset-cache` |
| iOS pod error | Pods belum sinkron | `cd ios && pod install --repo-update` |

---

## 10. Langkah Berikutnya

Setelah semua checklist §8 tercentang, lanjut ke:
1. **Implementasi kode** (`src/`) — Google Sign-In, integrasi Firebase, session manager 14 hari, navigasi.
2. Baca [TDD.md](./TDD.md) untuk detail desain teknis tiap modul.

> Beri tahu saya jika checklist §8 sudah beres, saya akan lanjut membuat file-file kode di `src/`.
