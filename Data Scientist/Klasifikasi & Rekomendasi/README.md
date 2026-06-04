# 🧠 MindCare — Data Scientist Documentation
---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Tim Data Scientist](#-tim-data-scientist)
- [Link Penting](#-link-penting)
- [Dataset](#-dataset)
- [Tools & Library](#-tools--library)
- [Alur Proses Data Science](#-alur-proses-data-science)
- [Struktur File](#-struktur-file)
- [Hasil Akhir](#-hasil-akhir)
- [Checklist Terpenuhi](#-checklist-terpenuhi)

---

## 🎯 Tentang Proyek

**MindCare** adalah platform kesehatan mental berbasis web yang dirancang untuk membantu pengguna mendeteksi, memahami, dan mengelola tingkat stres secara mandiri dan berkelanjutan.

| Info | Detail |
|------|--------|
| **ID Tim** | CC26-PSU148 |
| **Tema** | Healthy Lives & Well-being |
| **Program** | Coding Camp 2026 powered by DBS Foundation |
| **Learning Path** | Data Scientist |

### Research Questions
> **RQ1:** Bagaimana mengklasifikasikan tingkat stres (Ringan/Sedang/Berat/Sangat Berat) secara akurat menggunakan kuesioner terstruktur?
>
> **RQ2:** Bagaimana memberikan rekomendasi intervensi yang efektif dan personal untuk menurunkan tingkat stres pengguna?

---

## 👥 Tim Data Scientist

| Nama | ID | Role |
|------|----|------|
| Iqbal Nurul Fadli | CDCC657D6Y0751 | Data Scientist |
| Raihan Putra Permana | CDCC657D6Y2401 | Data Scientist |

---

## 🔗 Link Penting

| Resource | Link |
|----------|------|
| 📓 **Google Colab Notebook** | [https://colab.research.google.com/drive/1zT0Q9plJtXo0rD5B6Qp55p-uOY-upy_w?usp=sharing] |
| 📊 **Streamlit Dashboard** | [https://dashboard-mindcare.streamlit.app/] |
| 🗄️ **Dataset 1** — Student Stress Factors | [kaggle.com/datasets/rxnach/student-stress-factors-a-comprehensive-analysis](https://www.kaggle.com/datasets/rxnach/student-stress-factors-a-comprehensive-analysis) |
| 🗄️ **Dataset 2** — Sleep Health & Lifestyle | [kaggle.com/datasets/uom190346a/sleep-health-and-lifestyle-dataset](https://www.kaggle.com/datasets/uom190346a/sleep-health-and-lifestyle-dataset) |
| 🗄️ **Dataset 3** — Student Mental Stress & Coping | [kaggle.com/datasets/salahuddinahmedshuvo/student-mental-stress-and-coping-mechanisms](https://www.kaggle.com/datasets/salahuddinahmedshuvo/student-mental-stress-and-coping-mechanisms) |
| 📁 **GitHub Repository** | [https://github.com/Vyuraii/MindCare] |

---

## 🗄️ Dataset

### Sumber Dataset
Dataset MindCare merupakan hasil penggabungan (**merge**) dari 3 sumber dataset publik Kaggle yang saling melengkapi:

```
Dataset 1: Student Stress Factors (rxnach)
└── Kontribusi: Fitur psikologis, akademik, sosial + label stress_level
    └── Kolom utama: anxiety_level, depression, self_esteem, peer_pressure,
                     sleep_quality, study_load, stress_level

Dataset 2: Sleep Health & Lifestyle (uom190346a)
└── Kontribusi: Fitur demografis + gaya hidup
    └── Kolom utama: Age, Gender, Occupation, Sleep Duration,
                     Physical Activity Level, Quality of Sleep

Dataset 3: Student Mental Stress & Coping (salahuddinahmedshuvo)
└── Kontribusi: Mekanisme coping + penyebab stres
    └── Kolom utama: stress_level, coping_strategy, physical_activity,
                     social_support, financial_pressure
```

### Statistik Dataset

| File | Deskripsi | Jumlah Baris | Jumlah Kolom |
|------|-----------|:------------:|:------------:|
| `data_raw.csv` | Data mentah sebelum cleaning (termasuk data kotor) | 11.200 | 25 |
| `data_cleaned.csv` | Data bersih setelah proses wrangling | 10.716 | 25 |
| `data_final_model_ready.csv` | Data final siap training (encoded + feature engineered) | 10.716 | 31 |
| `data_train.csv` | Data training (70%) | 7.500 | 31 |
| `data_test.csv` | Data testing (15%) | 1.608 | 31 |
| `data_validation.csv` | Data validasi (15%) | 1.608 | 31 |

### Konfigurasi Data Split

```
Total Data Bersih : 10.716 baris
├── Training Set  :  7.500 baris (70%) ← untuk melatih model
├── Test Set      :  1.608 baris (15%) ← untuk evaluasi akhir
└── Validation Set:  1.608 baris (15%) ← untuk tuning & validasi
```

### Kolom Dataset (25 Fitur Raw)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `umur` | int | Usia responden (17–60 tahun) |
| `jenis_kelamin` | str | Male / Female |
| `pekerjaan` | str | 17 jenis pekerjaan (Student, Engineer, dll.) |
| `stress_level_1_5` | int | Tingkat stres skala 1–5 |
| `penyebab_stres` | str | Akademik / Pekerjaan / Keuangan / Sosial / Lainnya |
| `durasi_stres` | str | <1 minggu / 1-2 minggu / 2-4 minggu / >1 bulan |
| `kualitas_tidur_1_5` | int | Kualitas tidur skala 1–5 |
| `durasi_tidur_jam` | float | Rata-rata jam tidur per malam |
| `waktu_luang_mnt` | int | Waktu luang per hari (menit) |
| `aktivitas_fisik_mnt` | int | Menit olahraga per hari |
| `preferensi_olahraga` | int | Ketertarikan olahraga (1–4) |
| `preferensi_baca` | int | Ketertarikan membaca (1–4) |
| `preferensi_jurnal` | int | Ketertarikan journaling (1–4) |
| `komitmen_hari_per_minggu` | int | Hari per minggu siap berkomitmen (1–7) |
| `tujuan_utama` | str | Tujuan penggunaan aplikasi |
| `anxiety_score` | int | Skor kecemasan GAD-7 (0–21) |
| `depression_score` | int | Skor depresi PHQ-9 (0–27) |
| `self_esteem_score` | int | Skor kepercayaan diri Rosenberg (0–30) |
| `study_load_1_5` | int | Beban belajar/kerja (1–5) |
| `peer_pressure_1_5` | int | Tekanan dari sesama (1–5) |
| `social_support_1_5` | int | Dukungan sosial (1–5) |
| `future_concern_1_5` | int | Kekhawatiran masa depan (1–5) |
| `aktivitas_dipilih` | str | **TARGET** — olahraga / membaca / journaling |
| `durasi_menit` | int | Durasi aktivitas rekomendasi (menit) |
| `source` | str | Asal dataset (Dataset 1/2/3) |

### Kolom Tambahan Hasil Feature Engineering (6 Fitur Baru)

| Kolom | Formula | Tujuan |
|-------|---------|--------|
| `psikologis_score` | (anxiety/21 + depression/27 + 1-se/30) / 3 × 100 | Skor kondisi psikologis terpadu (0–100) |
| `gaya_hidup_score` | (tidur/5 + aktivitas/120) / 2 × 100 | Skor gaya hidup sehat (0–100) |
| `activity_score` | Gabungan aktivitas fisik + komitmen | Skor keaktifan pengguna |
| `sleep_quality_ratio` | kualitas_tidur / durasi_tidur | Rasio efisiensi tidur |
| `stress_anxiety_inter` | stress_level × anxiety_score | Interaksi stres-kecemasan |
| `wellbeing_index` | Gabungan sosial + tidur - stres | Indeks kesejahteraan keseluruhan |
| `support_pressure_ratio` | social_support / peer_pressure | Rasio dukungan vs tekanan |

### Distribusi Target Variable

```
aktivitas_dipilih (Target KNN):
├── membaca    : 5.029 sampel (46.9%) ← mayoritas
├── journaling : 3.218 sampel (30.0%)
└── olahraga   : 2.469 sampel (23.0%)
```

---

## 🛠️ Tools & Library

### Tools Utama

| Tool | Versi | Kegunaan |
|------|-------|----------|
| ![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python) | 3.10+ | Bahasa pemrograman utama |
| ![Google Colab](https://img.shields.io/badge/Google%20Colab-orange?logo=googlecolab) | — | Environment pengembangan & training model |
| ![Kaggle](https://img.shields.io/badge/Kaggle-Dataset-cyan?logo=kaggle) | — | Sumber pengumpulan dataset |
| ![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-red?logo=streamlit) | 1.x | Dashboard interaktif visualisasi |
| ![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github) | — | Version control & kolaborasi |

### Library Python

```python
# Data Manipulation & Analysis
pandas >= 1.5.0          # Manipulasi dataframe, data wrangling
numpy >= 1.23.0           # Operasi numerik & array

# Visualization
matplotlib >= 3.6.0       # Visualisasi dasar & chart
seaborn >= 0.12.0         # Statistical visualization & heatmap
plotly >= 5.0.0           # Interactive charts (Streamlit)

# Machine Learning
scikit-learn >= 1.1.0     # KNN, preprocessing, evaluasi model
  ├── KNeighborsClassifier  # Model utama rekomendasi aktivitas
  ├── StandardScaler        # Feature scaling (wajib untuk KNN)
  ├── LabelEncoder          # Encoding variabel kategorik
  ├── train_test_split      # Pembagian dataset
  ├── cross_val_score       # Cross-validation
  ├── StratifiedKFold       # Stratified K-Fold CV
  └── classification_report # Evaluasi performa model

# Statistical Testing
scipy >= 1.9.0            # Kruskal-Wallis test, uji statistik A/B

# Model Persistence
joblib >= 1.2.0           # Simpan & load model (.pkl)

# Dashboard
streamlit >= 1.20.0       # Web dashboard interaktif
```

---

## 🔄 Alur Proses Data Science

```
📥 GATHERING          📋 ASSESSING          🧹 CLEANING
Kaggle Dataset 1  ──►  Cek duplikat     ──►  Drop duplikat (504)
Kaggle Dataset 2  ──►  Cek missing      ──►  Imputasi mode/median
Kaggle Dataset 3  ──►  Cek outlier      ──►  IQR Capping
     Merge        ──►  Cek inkonsistensi──►  Standarisasi kategorik
  (11.200 baris)       Cek format salah       Fix format regex
                                           (10.716 baris bersih)
        │
        ▼
📊 EDA & BUSINESS QUESTIONS
  ├── BQ1: Faktor psikologis penentu tingkat stres
  ├── BQ2: Kualitas tidur & aktivitas fisik vs stres
  ├── BQ3: Tingkat stres vs jenis rekomendasi aktivitas
  ├── BQ4: Kondisi psikologis vs jenis intervensi
  ├── BQ5: Preferensi & waktu luang vs durasi intervensi
  └── BQ6: Feature selection untuk model KNN
        │
        ▼
⚙️ FEATURE ENGINEERING
  ├── psikologis_score    (gabungan anxiety + depression + self_esteem)
  ├── gaya_hidup_score    (gabungan tidur + aktivitas fisik)
  ├── activity_score      (keaktifan pengguna)
  ├── sleep_quality_ratio (efisiensi tidur)
  ├── stress_anxiety_inter(interaksi stres × kecemasan)
  ├── wellbeing_index     (indeks kesejahteraan)
  └── support_pressure_ratio (dukungan vs tekanan)
        │
        ▼
🔤 ENCODING & PREPROCESSING
  ├── LabelEncoder untuk variabel kategorik
  │   ├── jenis_kelamin_enc (Male=1, Female=0)
  │   ├── pekerjaan_enc     (0–16, 17 jenis pekerjaan)
  │   ├── penyebab_stres_enc(0–4)
  │   ├── durasi_stres_enc  (0–3)
  │   └── tujuan_utama_enc  (0–4)
  ├── target_aktivitas: journaling=0, membaca=1, olahraga=2
  └── StandardScaler untuk normalisasi fitur numerik
        │
        ▼
✂️ DATA SPLITTING
  ├── Training Set   : 7.500 baris (70%)
  ├── Validation Set : 1.608 baris (15%)
  └── Test Set       : 1.608 baris (15%)
        │
        ▼
🤖 MODELING (KNN)
  ├── Model A: KNN dengan 22 fitur original
  ├── Model B: KNN dengan 22 + fitur engineered
  ├── Pencarian K optimal: GridSearch K=3–21 (5-Fold CV)
  └── Metrik evaluasi: F1-Score Macro (karena class imbalance)
        │
        ▼
🔬 A/B TESTING
  ├── Paired t-test (10-Fold Stratified CV)
  ├── H0: F1(Model B) = F1(Model A)
  ├── H1: F1(Model B) > F1(Model A)
  └── α = 0.05
        │
        ▼
📊 STREAMLIT DASHBOARD
  ├── Overview & Dataset
  ├── EDA & Business Questions (interaktif)
  ├── Feature Engineering
  ├── A/B Testing & Model Evaluation
  └── Demo Rekomendasi (input kuesioner → output aktivitas)
```

### Detail Setiap Tahap

#### 1️⃣ Data Wrangling (DS #2)

**Masalah yang ditemukan pada data raw (11.200 baris):**

| Jenis Masalah | Jumlah | Penanganan |
|---------------|:------:|-----------|
| Data duplikat | 359 baris | `drop_duplicates()` |
| Missing values | 1.072 nilai | Mode (kategorik) / Median (numerik) imputation |
| Format salah | 125 nilai | Regex cleaning (`"25 tahun"` → `25`, `"level_3"` → `3`) |
| Nilai di luar skala | 200 nilai | Set NaN → Imputation |
| Inkonsistensi kategorik | 200 baris | Mapping standarisasi |

**Hasil:** 11.200 baris → **10.716 baris bersih** (484 baris dihapus)

---

#### 2️⃣ Exploratory Data Analysis / EDA (DS #4)

Menjawab 6 Business Questions SMART sesuai Research Questions project plan:

```
BQ1 → Kruskal-Wallis test pada anxiety, depression, self_esteem per stress level
      Hasil: Ketiga fitur signifikan (p < 0.05) → wajib masuk model

BQ2 → Analisis kualitas tidur & aktivitas fisik vs rata-rata stress level
      Hasil: Tidur buruk & minim aktivitas → stres lebih tinggi (selisih > 1 level)

BQ3 → Crosstab proporsi aktivitas per stress level
      Hasil: Pola rekomendasi berbeda signifikan (selisih > 15%) antar level

BQ4 → Kruskal-Wallis test kondisi psikologis antar kelompok aktivitas
      Hasil: Signifikan (p < 0.05) → journaling dominan saat anxiety/depression tinggi

BQ5 → Analisis waktu luang & preferensi vs durasi rekomendasi
      Hasil: Waktu luang > 90 mnt → durasi lebih panjang (selisih > 10 menit)

BQ6 → Pearson correlation fitur vs durasi_menit (threshold |r| ≥ 0.15)
      Hasil: Fitur preferensi, stress, psikologis memenuhi threshold
```

---

#### 3️⃣ Feature Engineering (DS #8)

Dibuat 6 fitur baru dari kombinasi fitur yang sudah ada:

```python
# Skor kondisi psikologis terpadu (0-100)
psikologis_score = (anxiety/21 + depression/27 + (1-self_esteem/30)) / 3 * 100

# Skor gaya hidup sehat (0-100)
gaya_hidup_score = ((kualitas_tidur/5) + (aktivitas_fisik/120)) / 2 * 100

# Rasio efisiensi tidur
sleep_quality_ratio = kualitas_tidur_1_5 / durasi_tidur_jam

# Interaksi stres × kecemasan
stress_anxiety_inter = stress_level_1_5 * anxiety_score

# Indeks kesejahteraan keseluruhan
wellbeing_index = (social_support - peer_pressure + self_esteem_normalized) * 50 + 25

# Rasio dukungan vs tekanan
support_pressure_ratio = social_support_1_5 / (peer_pressure_1_5 + 1)
```

---

#### 4️⃣ Model KNN & A/B Testing (DS #10)

```
Model A (Control)  : KNN — 22 fitur original
Model B (Treatment): KNN — 22 + 6 fitur engineered

Proses:
1. StandardScaler → normalisasi fitur (wajib untuk KNN)
2. GridSearchCV K=3,5,7,...,21 dengan 5-Fold Stratified CV
3. Training pada train set (7.500 baris)
4. Evaluasi pada test set (1.608 baris)
5. A/B Testing: Paired t-test 10-Fold CV

Hasil:
├── Model A: F1-Score = 0.7377 | Accuracy = 0.7561
├── Model B: F1-Score = 0.7505 | Accuracy = 0.7654
└── p-value = 0.2355 (belum signifikan, tapi Model B lebih baik secara empiris)
```

---

## 📁 Struktur File

```
MindCare/
│
├── 📄 README.md                          ← Dokumentasi ini
│
├── 📊 Dataset/
│   ├── data_raw.csv                      ← Data mentah (11.200 baris, 25 kolom)
│   ├── data_cleaned.csv                  ← Data bersih (10.716 baris, 25 kolom)
│   ├── data_final_model_ready.csv        ← Data siap model (10.716 baris, 31 kolom)
│   ├── data_train.csv                    ← Training set (7.500 baris)
│   ├── data_test.csv                     ← Test set (1.608 baris)
│   └── data_validation.csv              ← Validation set (1.608 baris)
│
├── 🤖 Model/
│   ├── encoder_features.pkl              ← Encoder untuk fitur kategorik
│   ├── encoder_target_le.pkl             ← Label encoder untuk target
│   └── encoder_target_map.pkl            ← Mapping encoding target
│
├── 📓 Notebook/
│   └── MindCare_DS_Complete.ipynb        ← Notebook lengkap (Wrangling→EDA→Model)
│
└── 📊 Dashboard/
    └── mindcare-dashboard/               ← Source code Streamlit dashboard
```

---

## 🏆 Hasil Akhir

### Performa Model

| Metrik | Model A (Original) | Model B (+ Feature Eng.) |
|--------|:-----------------:|:------------------------:|
| **F1-Score Macro** | 0.7377 | **0.7505** ✅ |
| **Accuracy** | 0.7561 | **0.7654** ✅ |
| **K Optimal** | 21 | 17 |
| **Jumlah Fitur** | 22 | 28 |

### Output Model

Model KNN MindCare menghasilkan output berupa:

```json
{
  "rekomendasi_aktivitas": "journaling",
  "durasi_menit": 20,
  "tingkat_stres": "Berat",
  "confidence": {
    "journaling": 58.2,
    "membaca": 28.4,
    "olahraga": 13.4
  }
}
```

### Dataset yang Diserahkan ke AI Engineer

| File | Kegunaan |
|------|----------|
| `data_train.csv` | Training model KNN (7.500 sampel) |
| `data_validation.csv` | Tuning & validasi model (1.608 sampel) |
| `data_test.csv` | Evaluasi performa akhir (1.608 sampel) |
| `encoder_features.pkl` | Encoder fitur kategorik (untuk inference) |
| `encoder_target_le.pkl` | Label encoder target (untuk decode hasil prediksi) |
| `encoder_target_map.pkl` | Mapping label → nama aktivitas |

---

## ✅ Checklist Terpenuhi

| Checklist | Keterangan | Status |
|-----------|-----------|:------:|
| **DS #1** — Mengumpulkan dan menganalisis permasalahan | Menentukan satu solusi utama | ✅ |
| **DS #2** — Data Wrangling | Gathering → Assessing → Cleaning | ✅ |
| **DS #3** — Business Questions | 6 BQ SMART sesuai project plan | ✅ |
| **DS #4** — EDA | 7 visualisasi menjawab semua BQ | ✅ |
| **DS #5** — Explanatory Analysis | Jawaban konkret + insight actionable | ✅ |
| **DS #6** — Streamlit Dashboard | 5 halaman interaktif | ✅ |
| **DS #7** — Data Dictionary | 31 kolom terdokumentasi lengkap | ✅ |
| **DS #8** — Feature Engineering | 6 fitur baru berbasis domain knowledge | ✅ |
| **DS #9** — Deployment dashboard | Melakukan deployment ke Streamlit Cloud | ✅ |
| **DS #10** — A/B Testing | Paired t-test 10-Fold CV | ✅ |

---

## 🚀 Cara Menjalankan

### Prasyarat
```bash
pip install pandas numpy matplotlib seaborn plotly scikit-learn scipy streamlit joblib
```

### Jalankan Notebook
1. Buka [Google Colab](https://colab.research.google.com)
2. Upload file `MindCare_DS_Complete.ipynb`
3. Upload semua file dataset
4. Jalankan semua cell: **Runtime → Run All**

### Jalankan Streamlit Dashboard
```bash
# Clone repository
git clone [URL_REPO_KAMU]
cd mindcare-dashboard

# Install dependencies
pip install -r requirements.txt

# Jalankan dashboard
streamlit run app.py
```

---

## 📬 Kontak

| Nama | ID | GitHub |
|------|----|--------|
| Iqbal Nurul Fadli | CDCC657D6Y0751 | `Ikyuuu` |
| Raihan Putra Permana | CDCC657D6Y2401 | `Vyuraii` |

---

<div align="center">

**CC26-PSU148 | Data Scientist Team | Coding Camp 2026 powered by DBS Foundation**

*"Kenali stresmu, ambil kendali hidupmu."* 🧠💚

</div>
