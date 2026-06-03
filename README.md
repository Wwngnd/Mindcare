# Mindcare

**MindCare** adalah layanan backend untuk fitur autentikasi, kuesioner kesehatan mental, jurnal, olahraga, stress scan berbasis AI, dan rekomendasi buku.

---

## 🌐 Demo / Base URL

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---
## 📷 Tampilan

### Dasboard
<img width="1283" height="1226" alt="dasboard" src="https://github.com/user-attachments/assets/837ec66f-e11c-4f88-be5b-6336e2ac75f9" />

### Daily Check-in
<img width="1366" height="659" alt="Daily Checkin" src="https://github.com/user-attachments/assets/dd5919b3-8b39-4e22-b82a-a613992a7f50" />

### Cek Stress
<img width="1366" height="599" alt="Cek Stress" src="https://github.com/user-attachments/assets/db507aa5-3c4a-4255-94a2-6c64dc4441cf" />

### Journaling
<img width="1366" height="685" alt="Journaling" src="https://github.com/user-attachments/assets/c17c25c1-3ad2-43da-82ca-ca3d6d0e20a5" />

### Olahraga
<img width="1366" height="599" alt="screencapture-capstone-project-mindcare-tfi1-vercel-app-exercise-2026-06-03-19_26_35" src="https://github.com/user-attachments/assets/dba75523-603a-4e3e-9065-0b407382ecb7" />

### Rekomendasi Buku
<img width="1354" height="600" alt="Buku" src="https://github.com/user-attachments/assets/23fa7f38-52c9-4bad-8da9-5c049582c061" />

-----

## ✨ Fitur Utama
### 😊 Daily Check-in
Pengguna dapat melakukan check-in suasana hati harian untuk memantau kondisi emosional mereka dari waktu ke waktu.

### 📋 Cek Stress
Melakukan penilaian tingkat stres melalui kuisioner yang telah disediakan.

### 📔 Journaling
Mencatat aktivitas, pengalaman, dan perasaan pengguna setiap hari.

### 🏃 Olahraga
Memberikan rekomendasi olahraga berdasarkan kondisi mental pengguna.

### 📚 Book Recommendation
Memberikan rekomendasi buku self-development dan kesehatan mental.

------

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MySQL + Sequelize |
| Auth | JWT + Cookie Parser |
| Frontend | React.js, Tailwind CSS |

---

## 📦 Cara Menjalankan Proyek

### 1. Clone repository

```bash
git clone https://github.com/Lukmanul6305/capstone-project-mindcare.git
```
### 2. Frontend

```bash
cd frontend
npm install 
npm run dev
```

### 3. Backend

```bash
cd frontend
npm install 
npm run server
```
------

## 🔐 Auth Flow Dasar

| Langkah         | Method | Endpoint              | Keterangan                            |
| --------------- | ------ | --------------------- | ------------------------------------- |
| Register        | POST   | `/api/users/register` | Membuat akun baru                     |
| Login           | POST   | `/api/auth/login`     | Login dan mendapatkan token           |
| Ambil Data User | GET    | `/api/auth/me`        | Mengambil data user yang sedang login |

> Endpoint yang membutuhkan autentikasi harus menggunakan header:

```http
Authorization: Bearer <accessToken>
```

---

## 📌 Daftar Endpoint API

### 🔑 Authentication

| Method | Endpoint              | Deskripsi            |
| ------ | --------------------- | -------------------- |
| POST   | `/api/users/register` | Register user baru   |
| POST   | `/api/auth/login`     | Login user           |
| GET    | `/api/auth/token`     | Refresh Access Token |
| DELETE | `/api/auth/logout`    | Logout user          |

---

### 👤 Profile

| Method | Endpoint        | Deskripsi                           |
| ------ | --------------- | ----------------------------------- |
| GET    | `/api/auth/me`  | Ambil profil user yang sedang login |
| PUT    | `/api/users/me` | Update profil user                  |
| DELETE | `/api/users/me` | Hapus akun sendiri                  |

---

### 👥 Users (Admin Only)

| Method | Endpoint              | Deskripsi                        |
| ------ | --------------------- | -------------------------------- |
| GET    | `/api/auth/users`     | Ambil semua data user            |
| GET    | `/api/auth/users/:id` | Ambil detail user berdasarkan ID |
| DELETE | `/api/auth/users/:id` | Hapus user berdasarkan ID        |

---

### 📔 Journal

| Method | Endpoint           | Deskripsi                                       |
| ------ | ------------------ | ----------------------------------------------- |
| GET    | `/api/journal`     | Ambil semua jurnal (Admin Only)                 |
| POST   | `/api/journal`     | Buat entri jurnal baru                          |
| GET    | `/api/journal/me`  | Ambil semua jurnal milik user login             |
| GET    | `/api/journal/:id` | Ambil detail jurnal berdasarkan ID (Admin Only) |
| PUT    | `/api/journal/:id` | Update jurnal milik user                        |
| DELETE | `/api/journal/:id` | Hapus jurnal milik user                         |

---

### 📋 Kuesioner & Rekomendasi

| Method | Endpoint                             | Deskripsi                                                   |
| ------ | ------------------------------------ | ----------------------------------------------------------- |
| POST   | `/api/kuesioner`                     | Simpan kuesioner, panggil AI, lalu simpan hasil rekomendasi |
| GET    | `/api/kuesioner/me`                  | Ambil semua data kuesioner milik user login                 |
| GET    | `/api/kuesioner/rekomendasi`         | Ambil riwayat rekomendasi tersimpan                         |
| GET    | `/api/kuesioner/rekomendasi/:sesiId` | Ambil detail rekomendasi berdasarkan sesi ID                |
| DELETE | `/api/kuesioner/:id`                 | Hapus kuesioner berdasarkan ID                              |
| GET    | `/api/kuesioner/all`                 | Ambil semua data kuesioner (Admin Only)                     |
| GET    | `/api/kuesioner/all/:id`             | Ambil detail kuesioner berdasarkan ID (Admin Only)          |

---

### 🏃 Olahraga

| Method | Endpoint                            | Deskripsi                                 |
| ------ | ----------------------------------- | ----------------------------------------- |
| GET    | `/api/olahraga`                     | Ambil semua log olahraga (Admin Only)     |
| POST   | `/api/olahraga`                     | Simpan log olahraga baru                  |
| GET    | `/api/olahraga/me`                  | Ambil semua log olahraga milik user login |
| GET    | `/api/olahraga/statistik`           | Ambil statistik total durasi dan kalori   |
| GET    | `/api/olahraga/statistik-per-jenis` | Ambil statistik durasi per jenis olahraga |
| GET    | `/api/olahraga/:id`                 | Ambil detail log olahraga berdasarkan ID  |
| DELETE | `/api/olahraga/:id`                 | Hapus log olahraga berdasarkan ID         |

---

### 🧠 Stress Scan

| Method | Endpoint               | Deskripsi                                       |
| ------ | ---------------------- | ----------------------------------------------- |
| POST   | `/api/stress-scan`     | Kirim gambar ke AI Flask lalu simpan hasil scan |
| GET    | `/api/stress-scan`     | Ambil semua stress scan (Admin Only)            |
| GET    | `/api/stress-scan/me`  | Ambil riwayat stress scan milik user login      |
| GET    | `/api/stress-scan/:id` | Ambil detail stress scan berdasarkan ID         |
| DELETE | `/api/stress-scan/:id` | Hapus stress scan berdasarkan ID                |

---

### 📚 Books

| Method | Endpoint                 | Deskripsi                                 |
| ------ | ------------------------ | ----------------------------------------- |
| POST   | `/api/books/sessions`    | Simpan sesi membaca buku baru             |
| GET    | `/api/books/sessions/me` | Ambil semua sesi membaca milik user login |
| POST   | `/api/books/reads`       | Tandai buku sebagai sudah dibaca          |
| GET    | `/api/books/reads/me`    | Ambil semua riwayat buku yang dibaca      |

---

### 🗺️ Match Route

| Method | Endpoint           | Deskripsi                              |
| ------ | ------------------ | -------------------------------------- |
| POST   | `/api/match-route` | Mencocokkan rute berdasarkan koordinat |

---

### 📊 HTTP Response Codes

| Status Code | Keterangan            |
| ----------- | --------------------- |
| 200         | Request berhasil      |
| 201         | Data berhasil dibuat  |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Data tidak ditemukan  |
| 500         | Internal Server Error |

---

### 🔒 Authorization Example

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```
