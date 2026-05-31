# MindCare Backend + AI Integration

Folder ini sudah digabungkan dengan dua model AI:

- `model/recommendation` untuk rekomendasi aktivitas dari hasil kuesioner.
- `model/face/best_model.keras` untuk prediksi mood/emosi dari gambar wajah.
- `model/ai-service/app.py` sebagai server Flask yang menjalankan endpoint AI.

## 1. Jalankan database

Import file:

```sql
src/config/project_mindcare.sql
```

Pastikan `.env` backend sesuai:

```env
PORT=3000
DB_HOST=localhost
DB_NAME=project_mindcare
DB_USER=root
DB_PASSWORD=
ALLOWED_ORIGINS=http://localhost:5173
AI_URL=http://localhost:5000/predict
FACE_AI_URL=http://localhost:5000/predict-face
```

## 2. Jalankan AI service Python

```bash
cd backend/model/ai-service
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Git Bash:

```bash
source venv/Scripts/activate
```

Install dependency:

```bash
pip install -r requirements.txt
python app.py
```

Tes:

```bash
curl http://localhost:5000/health
```

## 3. Jalankan backend Express

Buka terminal baru:

```bash
cd backend
npm install
npm run server
```

Backend berjalan di:

```text
http://localhost:3000
```

## 4. Endpoint yang sudah terintegrasi

### Rekomendasi dari kuesioner

Backend sudah memiliki alur:

```text
POST /api/kuesioner
```

Saat endpoint ini dipanggil, backend akan:

1. Menyimpan jawaban kuesioner ke database.
2. Membentuk input AI lewat `src/helper/aiInputBuilder.js`.
3. Mengirim data ke `AI_URL=http://localhost:5000/predict`.
4. Menyimpan hasil rekomendasi aktivitas, alternatif, distribusi probabilitas, dan buku ke database.
5. Mengambil ulang data rekomendasi dari database untuk dikirim sebagai response.

Untuk mengambil ulang hasil yang sudah tersimpan dari database (tanpa memanggil model lagi), gunakan:

```text
GET /api/kuesioner/rekomendasi
GET /api/kuesioner/rekomendasi/:sesiId
```

### Prediksi wajah

Alur backend untuk stress scan sekarang:

```text
POST /api/stress-scan
```

Saat endpoint ini dipanggil, backend akan:

1. Menerima `image_base64` dari frontend.
2. Mengirim gambar ke `FACE_AI_URL=http://localhost:5000/predict-face`.
3. Mengonversi hasil prediksi wajah menjadi `mood`, `tingkat_stres`, dan keterangannya.
4. Menyimpan hasil scan ke `tb_stress_scan`.
5. Mengembalikan data yang tersimpan ke frontend.

AI service juga menyediakan endpoint langsung:

```text
POST http://localhost:5000/predict-face
```

Gunakan `multipart/form-data`:

```text
image: file_gambar.jpg
```

Catatan: urutan label model wajah masih perlu disesuaikan dengan class saat training. Default saat ini:

```text
angry,happy,neutral,sad
```

Bisa diganti saat menjalankan service:

```bash
FACE_LABELS=label1,label2,label3,label4 python app.py
```

## Catatan penting

- Model rekomendasi sudah cocok dengan format input yang dibuat backend.
- File backend `.env` masih berisi secret/token contoh dari ZIP asli. Untuk produksi, ganti semua secret.
- Untuk deploy, AI service lebih aman dipisah dari Vercel karena TensorFlow berat dan biasanya tidak cocok untuk serverless Node.
