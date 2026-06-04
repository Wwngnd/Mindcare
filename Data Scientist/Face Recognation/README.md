# Face Recognition dengan Google Colab

Panduan lengkap untuk mengolah data dan membangun model **Face Recognition** menggunakan Google Colaboratory beserta berbagai library pendukungnya.

---

## 📁 Dataset

Berikut dataset yang digunakan dalam proyek ini. Unduh terlebih dahulu sebelum memulai:

| Dataset | Deskripsi | Link |
|---|---|---|
| **Dataset Sudah Bersih** | Dataset wajah yang telah melalui proses preprocessing & pembersihan | [Download](https://drive.google.com/file/d/1aLeez6zwONppBFM3V33IMAMH-ezTFLhe/view?usp=drive_link) |
| **Dataset Balance (Training)** | Dataset yang telah di-balance untuk proses training | [Download](https://drive.google.com/file/d/1x1E3PLWNW_JDquo7YIf3wMXB3mt7X5f5/view?usp=drive_link) |
| **Dataset Model Face Recognition** | Dataset siap pakai untuk melatih model face recognition | [Download](https://drive.google.com/file/d/1eIM3JFRKkD-3lWiHueadDmUe4J4CpKRW/view?usp=drive_link) |

> ⚠️ **Pastikan** kamu sudah login ke akun Google dan memiliki akses ke file tersebut sebelum mengunduh.

---

## 🛠️ Persyaratan

### Runtime Google Colab

Gunakan runtime **GPU** untuk mempercepat proses training:

```
Runtime → Change runtime type → Hardware accelerator → GPU (T4 / A100)
```

### Library yang Diperlukan

| Library | Fungsi |
|---|---|
| `opencv-python` | Pemrosesan gambar & deteksi wajah |
| `face_recognition` | Encoding & pengenalan wajah |
| `dlib` | Model landmark wajah (dibutuhkan face_recognition) |
| `deepface` | Framework deep learning face recognition |
| `tensorflow` / `keras` | Training model deep learning |
| `torch` / `torchvision` | Alternatif framework deep learning (PyTorch) |
| `scikit-learn` | Evaluasi model & preprocessing |
| `imbalanced-learn` | Menangani dataset tidak seimbang (SMOTE, dll) |
| `matplotlib` / `seaborn` | Visualisasi data & hasil evaluasi |
| `numpy` / `pandas` | Manipulasi data |
| `Pillow` | Membaca & memanipulasi file gambar |
| `tqdm` | Progress bar saat proses data |

---

## 🚀 Cara Penggunaan

### Langkah 1 — Buka Google Colab

Buka [https://colab.research.google.com](https://colab.research.google.com) dan buat notebook baru, atau upload notebook yang sudah ada.

---

### Langkah 2 — Mount Google Drive

Hubungkan Google Drive agar dataset bisa diakses langsung dari Colab:

```python
from google.colab import drive
drive.mount('/content/drive')
```

Klik link autentikasi yang muncul dan izinkan akses Google Drive kamu.

---

### Langkah 3 — Install Library

Jalankan cell berikut untuk menginstall semua library yang dibutuhkan:

```python
# Library utama face recognition
!pip install face_recognition
!pip install deepface

# Library pendukung
!pip install imbalanced-learn
!pip install opencv-python-headless
!pip install dlib

# Cek versi TensorFlow (sudah tersedia di Colab)
import tensorflow as tf
print("TensorFlow version:", tf.__version__)
```

> 💡 **Tip:** `opencv-python-headless` direkomendasikan untuk Colab karena tidak memerlukan GUI display.

---

### Langkah 4 — Download & Ekstrak Dataset

Karena dataset ada di Google Drive, gunakan cara berikut untuk mengaksesnya:

**Opsi A — Akses Langsung via Path Drive (Direkomendasikan)**

Setelah mount Drive, salin file dataset ke direktori Colab lokal agar lebih cepat diakses:

```python
import shutil
import os

# Sesuaikan path sesuai lokasi file di Google Drive kamu
DRIVE_DATASET_PATH = "/content/drive/MyDrive/dataset_face_recognition"
LOCAL_DATASET_PATH = "/content/dataset"

# Salin ke lokal
shutil.copytree(DRIVE_DATASET_PATH, LOCAL_DATASET_PATH)
print("Dataset berhasil disalin!")
```

**Opsi B — Download via gdown (File ZIP)**

Jika dataset berupa file ZIP yang dibagikan via Google Drive:

```python
!pip install gdown

import gdown

# Dataset Sudah Bersih
gdown.download("https://drive.google.com/uc?id=1aLeez6zwONppBFM3V33IMAMH-ezTFLhe", "dataset_bersih.zip", quiet=False)

# Dataset Balance Training
gdown.download("https://drive.google.com/uc?id=1x1E3PLWNW_JDquo7YIf3wMXB3mt7X5f5", "dataset_balance.zip", quiet=False)

# Dataset Model
gdown.download("https://drive.google.com/uc?id=1eIM3JFRKkD-3lWiHueadDmUe4J4CpKRW", "dataset_model.zip", quiet=False)

# Ekstrak
import zipfile

for zip_name in ["dataset_bersih.zip", "dataset_balance.zip", "dataset_model.zip"]:
    with zipfile.ZipFile(zip_name, 'r') as zip_ref:
        zip_ref.extractall("/content/dataset/")
    print(f"{zip_name} berhasil diekstrak!")
```

---

### Langkah 5 — Eksplorasi Dataset

```python
import os
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np

dataset_path = "/content/dataset"

# Cek struktur folder
for root, dirs, files in os.walk(dataset_path):
    level = root.replace(dataset_path, '').count(os.sep)
    indent = ' ' * 2 * level
    print(f"{indent}{os.path.basename(root)}/")
    if level < 2:
        subindent = ' ' * 2 * (level + 1)
        for file in files[:3]:  # tampilkan 3 file pertama
            print(f"{subindent}{file}")

# Hitung jumlah gambar per kelas
class_counts = {}
for class_name in os.listdir(dataset_path):
    class_path = os.path.join(dataset_path, class_name)
    if os.path.isdir(class_path):
        count = len(os.listdir(class_path))
        class_counts[class_name] = count

print("\nJumlah gambar per kelas:")
for cls, count in sorted(class_counts.items()):
    print(f"  {cls}: {count} gambar")
```

---

### Langkah 6 — Preprocessing Data

```python
import cv2
import numpy as np
from sklearn.model_selection import train_test_split

def load_and_preprocess_images(dataset_path, img_size=(160, 160)):
    """
    Memuat dan memproses gambar dari dataset.
    
    Args:
        dataset_path: path ke folder dataset
        img_size: ukuran resize gambar (default 160x160)
    
    Returns:
        X: array gambar
        y: label
        label_map: mapping nama kelas ke angka
    """
    X = []
    y = []
    label_map = {}
    label_idx = 0

    for class_name in sorted(os.listdir(dataset_path)):
        class_path = os.path.join(dataset_path, class_name)
        if not os.path.isdir(class_path):
            continue

        label_map[label_idx] = class_name

        for img_file in os.listdir(class_path):
            img_path = os.path.join(class_path, img_file)
            img = cv2.imread(img_path)
            if img is None:
                continue

            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, img_size)
            img = img / 255.0  # normalisasi

            X.append(img)
            y.append(label_idx)

        label_idx += 1

    return np.array(X), np.array(y), label_map

# Load dataset
X, y, label_map = load_and_preprocess_images("/content/dataset")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Total data     : {len(X)}")
print(f"Data training  : {len(X_train)}")
print(f"Data testing   : {len(X_test)}")
print(f"Jumlah kelas   : {len(label_map)}")
```

---

### Langkah 7 — Training Model

**Opsi A — Menggunakan DeepFace (Paling Mudah)**

```python
from deepface import DeepFace

# Verifikasi dua gambar
result = DeepFace.verify(
    img1_path="/content/dataset/person1/img1.jpg",
    img2_path="/content/dataset/person1/img2.jpg",
    model_name="VGG-Face"  # atau "Facenet", "ArcFace", "DeepFace"
)

print("Hasil verifikasi:", result)
```

**Opsi B — Menggunakan face_recognition**

```python
import face_recognition

# Encode semua wajah dalam dataset
known_encodings = []
known_names = []

for class_name in os.listdir("/content/dataset"):
    class_path = os.path.join("/content/dataset", class_name)
    if not os.path.isdir(class_path):
        continue

    for img_file in os.listdir(class_path):
        img_path = os.path.join(class_path, img_file)
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)

        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            known_names.append(class_name)

print(f"Total wajah ter-encode: {len(known_encodings)}")
```

**Opsi C — CNN Custom dengan TensorFlow/Keras**

```python
import tensorflow as tf
from tensorflow.keras import layers, models

def build_cnn_model(num_classes, input_shape=(160, 160, 3)):
    model = models.Sequential([
        layers.Conv2D(32, (3,3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(128, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    return model

model = build_cnn_model(num_classes=len(label_map))
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
model.summary()

# Training
history = model.fit(
    X_train, y_train,
    validation_split=0.1,
    epochs=30,
    batch_size=32
)
```

---

### Langkah 8 — Evaluasi Model

```python
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# Prediksi
y_pred = model.predict(X_test)
y_pred_classes = np.argmax(y_pred, axis=1)

# Classification Report
print("=== Classification Report ===")
print(classification_report(
    y_test, y_pred_classes,
    target_names=[label_map[i] for i in range(len(label_map))]
))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred_classes)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=label_map.values(),
            yticklabels=label_map.values())
plt.title('Confusion Matrix')
plt.ylabel('Label Aktual')
plt.xlabel('Label Prediksi')
plt.tight_layout()
plt.show()

# Plot Akurasi & Loss
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

ax1.plot(history.history['accuracy'], label='Train')
ax1.plot(history.history['val_accuracy'], label='Validation')
ax1.set_title('Akurasi Model')
ax1.set_xlabel('Epoch')
ax1.set_ylabel('Akurasi')
ax1.legend()

ax2.plot(history.history['loss'], label='Train')
ax2.plot(history.history['val_loss'], label='Validation')
ax2.set_title('Loss Model')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('Loss')
ax2.legend()

plt.tight_layout()
plt.show()
```

---

### Langkah 9 — Simpan Model

```python
# Simpan ke Google Drive agar tidak hilang saat sesi Colab berakhir
model.save("/content/drive/MyDrive/face_recognition_model.h5")
print("Model berhasil disimpan ke Google Drive!")

# Load model yang sudah disimpan
loaded_model = tf.keras.models.load_model(
    "/content/drive/MyDrive/face_recognition_model.h5"
)
```

---

## ⚠️ Catatan Penting

### Sesi Colab Akan Berakhir Otomatis

Google Colab **akan mereset** semua file lokal jika sesi tidak aktif. Selalu simpan model dan hasil ke **Google Drive**.

### Mengatasi Dataset Tidak Seimbang

Jika dataset kamu tidak seimbang antar kelas, gunakan teknik berikut:

```python
from imblearn.over_sampling import SMOTE

# Reshape untuk SMOTE (harus 2D)
n_samples, h, w, c = X_train.shape
X_flat = X_train.reshape(n_samples, -1)

sm = SMOTE(random_state=42)
X_resampled, y_resampled = sm.fit_resample(X_flat, y_train)

# Reshape kembali ke 4D
X_resampled = X_resampled.reshape(-1, h, w, c)
print(f"Data setelah SMOTE: {X_resampled.shape}")
```


## Referensi

- [DeepFace Documentation](https://github.com/serengil/deepface)
- [face_recognition Library](https://github.com/ageitgey/face_recognition)
- [TensorFlow/Keras Docs](https://www.tensorflow.org/api_docs)
- [Google Colab FAQ](https://research.google.com/colaboratory/faq.html)
- [imbalanced-learn Docs](https://imbalanced-learn.org/stable/)
