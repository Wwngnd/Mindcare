# Mindcare

**MindCare** adalah layanan backend untuk fitur autentikasi, kuesioner kesehatan mental, jurnal, olahraga, stress scan berbasis AI, dan rekomendasi buku.

---

## 🌐 Demo / Base URL

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---
## 📷 Tampilan

### Dasboard
<img width="1366" height="854" alt="Dasboard" src="https://github.com/user-attachments/assets/95494271-b7c6-4c98-bcb1-43fce743772c" />

### Daily Check-in
<img width="1366" height="659" alt="Daily Checkin" src="https://github.com/user-attachments/assets/dd5919b3-8b39-4e22-b82a-a613992a7f50" />

### Cek Stress
<img width="1366" height="599" alt="Cek Stress" src="https://github.com/user-attachments/assets/db507aa5-3c4a-4255-94a2-6c64dc4441cf" />

### Journaling
<img width="1366" height="685" alt="Journaling" src="https://github.com/user-attachments/assets/c17c25c1-3ad2-43da-82ca-ca3d6d0e20a5" />

### Olahraga
<img width="1366" height="685" alt="Journaling" src="https://github.com/user-attachments/assets/2dafe377-dec3-4cc3-a511-8845ef8fdbe7" />

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
git clone https://github.com/Wwngnd/Mindcare-Fullstack.git
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

## 📌 Daftar Endpoint Inti|

### 🔑 Authentication

| Method | Endpoint           | Deskripsi                               |
| ------ | ------------------ | --------------------------------------- |
| POST   | `/api/auth/login`  | Login pengguna                          |
| GET    | `/api/auth/token`  | Refresh access token                    |
| DELETE | `/api/auth/logout` | Logout pengguna                         |
| GET    | `/api/auth/me`     | Mendapatkan data user yang sedang login |

---

### 👤 Users

| Method | Endpoint              | Deskripsi                |
| ------ | --------------------- | ------------------------ |
| POST   | `/api/users/register` | Registrasi pengguna baru |
| PUT    | `/api/users/me`       | Mengubah profil pengguna |
| DELETE | `/api/users/me`       | Menghapus akun pengguna  |

---

### 📔 Journal

| Method | Endpoint           | Deskripsi                         |
| ------ | ------------------ | --------------------------------- |
| POST   | `/api/journal`     | Membuat jurnal baru               |
| GET    | `/api/journal/me`  | Mengambil seluruh jurnal pengguna |
| PUT    | `/api/journal/:id` | Mengubah jurnal berdasarkan ID    |
| DELETE | `/api/journal/:id` | Menghapus jurnal berdasarkan ID   |

---

### 📋 Kuesioner & Rekomendasi

| Method | Endpoint                             | Deskripsi                                |
| ------ | ------------------------------------ | ---------------------------------------- |
| POST   | `/api/kuesioner`                     | Mengirim hasil kuesioner stres           |
| GET    | `/api/kuesioner/rekomendasi`         | Mendapatkan rekomendasi terbaru          |
| GET    | `/api/kuesioner/rekomendasi/:sesiId` | Mendapatkan rekomendasi berdasarkan sesi |

---

### 🏃 Olahraga

| Method | Endpoint                            | Deskripsi                            |
| ------ | ----------------------------------- | ------------------------------------ |
| POST   | `/api/olahraga`                     | Menambahkan aktivitas olahraga       |
| GET    | `/api/olahraga/me`                  | Mengambil riwayat olahraga pengguna  |
| GET    | `/api/olahraga/statistik`           | Menampilkan statistik olahraga       |
| GET    | `/api/olahraga/statistik-per-jenis` | Statistik olahraga berdasarkan jenis |

---

### 🧠 Stress Scan

| Method | Endpoint              | Deskripsi                              |
| ------ | --------------------- | -------------------------------------- |
| POST   | `/api/stress-scan`    | Mengirim hasil stress scan             |
| GET    | `/api/stress-scan/me` | Mengambil riwayat stress scan pengguna |

---

### 📚 Books

| Method | Endpoint                             | Deskripsi                                     |
| ------ | ------------------------------------ | --------------------------------------------- |
| GET    | `/api/books/recommendations`         | Mendapatkan rekomendasi buku terbaru          |
| GET    | `/api/books/recommendations/:sesiId` | Mendapatkan rekomendasi buku berdasarkan sesi |
| POST   | `/api/books/reads`                   | Menandai buku sebagai telah dibaca            |
| GET    | `/api/books/reads`                   | Mengambil daftar buku yang telah dibaca       |
| DELETE | `/api/books/reads/:bookExternalId`   | Menghapus riwayat buku yang telah dibaca      |

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
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

-----
