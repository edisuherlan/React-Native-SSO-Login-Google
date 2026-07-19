# Firestore Security Rules — Dokumentasi

**Proyek Firebase:** `sso-885ba`
**Referensi:** [PRD.md §11](./PRD.md) · [TDD.md §13](./TDD.md)

Dokumen ini berisi Security Rules untuk Cloud Firestore beserta penjelasannya. Rules mengatur **siapa boleh baca/tulis data** dan dievaluasi di sisi server Firebase — tidak bisa di-bypass dari klien.

---

## 1. Rules Aktif (Produksi)

Salin blok di bawah ke **Firebase Console → Firestore Database → tab Rules → Publish**:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Koleksi users: setiap user hanya boleh akses dokumennya sendiri.
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Default: semua path lain ditolak (tidak perlu ditulis eksplisit).
  }
}
```

---

## 2. Penjelasan

| Bagian | Arti |
|---|---|
| `rules_version = '2'` | Menggunakan sintaks rules versi 2 (terbaru). |
| `match /databases/{database}/documents` | Root dari seluruh dokumen Firestore. |
| `match /users/{userId}` | Aturan untuk koleksi `users`; `{userId}` = ID dokumen (disamakan dengan Firebase UID). |
| `request.auth != null` | Wajib sudah login (punya token Firebase Auth yang valid). |
| `request.auth.uid == userId` | User hanya boleh mengakses dokumen yang ID-nya sama dengan UID miliknya. |

**Prinsip:** *deny by default*. Path apa pun yang tidak punya aturan `allow` otomatis **ditolak**. Jadi tidak perlu menulis aturan penolakan eksplisit.

Rules ini konsisten dengan implementasi `src/services/userService.ts` yang menulis ke `users/{uid}`.

---

## 3. Kenapa Tidak Pakai Mode Terbuka

Hindari rules berikut (berbahaya):

```
// JANGAN dipakai di produksi!
allow read, write: if true;
```

- Membuat seluruh database bisa dibaca/ditulis siapa saja tanpa login.
- Firebase akan mengirim email peringatan keamanan.
- Berisiko kebocoran & perusakan data.

Mode test (`allow ... if request.time < timestamp.date(...)`) hanya untuk uji coba sementara dan akan kedaluwarsa — jangan dipakai untuk rilis.

---

## 4. Struktur Data Terkait

Dokumen: `users/{uid}` (lihat [PRD §7.1](./PRD.md)):

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "photoURL": "string | null",
  "provider": "google.com",
  "createdAt": "Timestamp",
  "lastLoginAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## 5. Pengembangan Lanjutan (Contoh)

Jika kelak menambah koleksi baru, tambahkan blok `match` di dalam `match /databases/{database}/documents`.

### 5.1 Validasi field saat menulis

```
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;

  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.data.uid == userId
               && request.resource.data.email is string;
}
```

### 5.2 Contoh koleksi milik user (mis. catatan pribadi)

```
match /notes/{noteId} {
  // Baca/ubah hanya jika dokumen milik user yang sedang login
  allow read, update, delete: if request.auth != null
                              && resource.data.ownerId == request.auth.uid;

  // Buat baru hanya jika ownerId diisi dengan UID sendiri
  allow create: if request.auth != null
                && request.resource.data.ownerId == request.auth.uid;
}
```

> Catatan: `resource.data` = data dokumen yang sudah ada (untuk read/update/delete); `request.resource.data` = data yang akan ditulis (untuk create/update).

---

## 6. Cara Menerapkan

**Via Console (paling mudah):**
1. Firebase Console → **Firestore Database** → tab **Rules**.
2. Tempel isi bagian §1 → klik **Publish**.

**Via Firebase CLI (opsional, untuk versioning):**
1. Simpan rules ke file `firestore.rules` di root proyek.
2. `firebase deploy --only firestore:rules`

---

## 7. Menguji Rules

- **Rules Playground** di Console (tab Rules → tombol "Playground") untuk simulasi read/write dengan/ tanpa auth.
- Uji kasus:
  - [ ] User login membaca dokumennya sendiri → **Allowed**.
  - [ ] User login membaca dokumen user lain → **Denied**.
  - [ ] Request tanpa auth → **Denied**.
  - [ ] Akses ke koleksi tak terdefinisi → **Denied**.
