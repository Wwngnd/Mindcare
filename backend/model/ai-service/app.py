"""
MindCare AI Service

Menjalankan dua endpoint AI:
1. POST /predict       -> rekomendasi aktivitas dari data kuesioner
2. POST /predict-face  -> prediksi mood/emosi dari gambar wajah

Jalankan:
    cd backend/model/ai-service
    python -m venv venv
    # Windows PowerShell:
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python app.py

Default URL:
    http://localhost:5000/predict
    http://localhost:5000/predict-face
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import tensorflow as tf
from tensorflow import keras

BASE_DIR = Path(__file__).resolve().parent

RECOMMENDATION_DIR = BASE_DIR.parent / "recommendation"
FACE_DIR = BASE_DIR.parent / "face"

# Agar class DeepLearningInference bisa diimport dari folder recommendation
sys.path.insert(0, str(RECOMMENDATION_DIR))

# pyrefly: ignore [missing-import]
from predict import DeepLearningInference


app = Flask(__name__)
CORS(app)

recommendation_model: DeepLearningInference | None = None
face_model: keras.Model | None = None

# Sesuaikan label ini dengan urutan class saat training model wajah.
# Bisa dioverride dari .env/terminal:
# FACE_LABELS=angry,happy,neutral,sad python app.py
FACE_LABELS = [
    label.strip()
    for label in os.getenv("FACE_LABELS", "angry,happy,neutral,sad").split(",")
    if label.strip()
]


class NumpyEncoder(json.JSONEncoder):
    """JSON encoder agar tipe data NumPy aman dikirim sebagai response."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def success(message: str, data: Any = None, status_code: int = 200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": json.loads(json.dumps(data, cls=NumpyEncoder)),
    }), status_code


def failed(message: str, status_code: int = 500):
    return jsonify({
        "status": "error",
        "message": message,
        "data": None,
    }), status_code


def load_recommendation_model() -> DeepLearningInference:
    """Load model rekomendasi sekali saja saat pertama kali dipakai."""
    global recommendation_model

    if recommendation_model is None:
        recommendation_model = DeepLearningInference(
            model_path=str(RECOMMENDATION_DIR / "model.h5"),
            scaler_path=str(RECOMMENDATION_DIR / "scaler.pkl"),
            le_path=str(RECOMMENDATION_DIR / "label_encoder.pkl"),
        )

    return recommendation_model


def load_face_model() -> keras.Model:
    """Load model wajah sekali saja saat pertama kali dipakai."""
    global face_model

    if face_model is None:
        face_model_path = FACE_DIR / "best_model.keras"
        face_model = keras.models.load_model(str(face_model_path), compile=False)

    return face_model


def preprocess_face_image(image_file) -> np.ndarray:
    """Ubah file gambar menjadi tensor input model: (1, 224, 224, 3)."""
    image = Image.open(image_file).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


@app.get("/")
def index():
    return success("MindCare AI service aktif.", {
        "endpoints": {
            "recommendation": "/predict",
            "face": "/predict-face",
            "health": "/health",
        }
    })


@app.get("/health")
def health():
    return success("AI service siap digunakan.", {
        "recommendation_model": (RECOMMENDATION_DIR / "model.h5").exists(),
        "face_model": (FACE_DIR / "best_model.keras").exists(),
    })


@app.post("/predict")
def predict_recommendation():
    """Endpoint yang sudah cocok dengan helper backend Express: AI_URL=/predict."""
    try:
        payload = request.get_json(silent=True) or {}

        if not payload:
            return failed("Body JSON tidak boleh kosong.", 400)

        model = load_recommendation_model()
        result_json = model.recommend(payload)
        result = json.loads(result_json)

        return success("Rekomendasi berhasil dibuat.", result)

    except Exception as error:  # noqa: BLE001
        return failed(f"Gagal membuat rekomendasi: {error}", 500)


@app.post("/predict-face")
def predict_face():
    """
    Prediksi mood/emosi wajah.

    Request:
      multipart/form-data dengan field image
      atau JSON {"image_url": "..."} belum didukung di versi ini.
    """
    try:
        if "image" not in request.files:
            return failed("File gambar wajib dikirim dengan field 'image'.", 400)

        model = load_face_model()
        image_tensor = preprocess_face_image(request.files["image"])

        prediction = model.predict(image_tensor, verbose=0)[0]
        class_index = int(np.argmax(prediction))
        confidence = float(prediction[class_index])

        label = FACE_LABELS[class_index] if class_index < len(FACE_LABELS) else str(class_index)

        return success("Prediksi wajah berhasil dibuat.", {
            "label": label,
            "class_index": class_index,
            "confidence": round(confidence, 4),
            "probabilities": {
                FACE_LABELS[index] if index < len(FACE_LABELS) else str(index): round(float(value), 4)
                for index, value in enumerate(prediction)
            },
        })

    except Exception as error:  # noqa: BLE001
        return failed(f"Gagal memprediksi wajah: {error}", 500)


if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
