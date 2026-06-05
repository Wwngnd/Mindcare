"""
MindCare AI Service

Menjalankan dua endpoint AI:
1. POST /predict-face  -> prediksi mood/emosi dari gambar wajah

Rekomendasi aktivitas sekarang menggunakan service Railway lewat AI_URL
di backend Express, bukan lagi model lokal di folder recommendation.

Jalankan:
    cd backend/model/ai-service
    python -m venv venv
    # Windows PowerShell:
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python app.py

Default URL:
    http://localhost:5000/predict-face
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any

import h5py
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import keras
from keras.src.models import functional as keras_functional

sys.modules.setdefault("keras.src.engine.functional", keras_functional)


_original_batch_norm_from_config = keras.layers.BatchNormalization.from_config.__func__


def _compat_batch_norm_from_config(cls, config):
    axis = config.get("axis")
    if isinstance(axis, list) and len(axis) == 1:
        config = {**config, "axis": axis[0]}
    return _original_batch_norm_from_config(cls, config)


keras.layers.BatchNormalization.from_config = classmethod(_compat_batch_norm_from_config)


def patch_legacy_keras_config(value):
    if isinstance(value, dict):
        if value.get("module") == "keras.src.engine.functional":
            value["module"] = "keras.src.models.functional"

        config = value.get("config")
        if value.get("class_name") == "BatchNormalization" and isinstance(config, dict):
            axis = config.get("axis")
            if isinstance(axis, list) and len(axis) == 1:
                config["axis"] = axis[0]

        for child in value.values():
            patch_legacy_keras_config(child)

    elif isinstance(value, list):
        if len(value) >= 4 and value[0] == "resnet50" and value[1] == 1:
            value[1] = 0

        for child in value:
            patch_legacy_keras_config(child)


def build_patched_keras_file(model_path: Path) -> str:
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".keras")
    temp_file.close()

    with zipfile.ZipFile(model_path, "r") as source, zipfile.ZipFile(temp_file.name, "w") as target:
        for item in source.infolist():
            data = source.read(item.filename)
            if item.filename == "config.json":
                config = json.loads(data.decode("utf-8"))
                patch_legacy_keras_config(config)
                data = json.dumps(config).encode("utf-8")
            elif item.filename == "model.weights.h5":
                data = rewrite_legacy_h5_paths(data)
            target.writestr(item, data)

    return temp_file.name


def copy_h5_attrs(source, target):
    for key, value in source.attrs.items():
        target.attrs[key] = value


def rewrite_legacy_h5_paths(data: bytes) -> bytes:
    source_file = tempfile.NamedTemporaryFile(delete=False, suffix=".h5")
    target_file = tempfile.NamedTemporaryFile(delete=False, suffix=".h5")
    source_file.write(data)
    source_file.close()
    target_file.close()

    try:
        with h5py.File(source_file.name, "r") as source, h5py.File(target_file.name, "w") as target:
            copy_h5_attrs(source, target)

            def copy_item(name, obj):
                normalized_name = name.replace("\\", "/")
                if isinstance(obj, h5py.Dataset):
                    parent = "/".join(normalized_name.split("/")[:-1])
                    if parent:
                        target.require_group(parent)
                    copied = target.create_dataset(normalized_name, data=obj[()])
                    copy_h5_attrs(obj, copied)
                else:
                    group = target.require_group(normalized_name)
                    copy_h5_attrs(obj, group)

            source.visititems(copy_item)

        with open(target_file.name, "rb") as patched:
            return patched.read()
    finally:
        for filename in (source_file.name, target_file.name):
            if os.path.exists(filename):
                os.remove(filename)

BASE_DIR = Path(__file__).resolve().parent

FACE_DIR = BASE_DIR / "face"


app = Flask(__name__)
CORS(app)

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


def load_face_model() -> keras.Model:
    """Load model wajah sekali saja saat pertama kali dipakai."""
    global face_model

    if face_model is None:
        face_model_path = FACE_DIR / "facial_expression_model.keras"
        patched_model_path = build_patched_keras_file(face_model_path)
        try:
            face_model = keras.models.load_model(
                patched_model_path,
                compile=False,
                safe_mode=False,
            )
            output_units = int(face_model.output_shape[-1])
            if len(FACE_LABELS) != output_units:
                raise ValueError(
                    f"Jumlah FACE_LABELS ({len(FACE_LABELS)}) harus sama dengan output model ({output_units})."
                )
        finally:
            if os.path.exists(patched_model_path):
                os.remove(patched_model_path)

    return face_model


def center_crop_square(image: Image.Image) -> Image.Image:
    """Crop tengah agar wajah tidak kalah oleh background webcam."""
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def preprocess_face_image(image_file) -> np.ndarray:
    """Ubah file gambar menjadi tensor input model: (1, 224, 224, 3)."""
    image = Image.open(image_file).convert("RGB")
    image = center_crop_square(image)
    image = image.resize((224, 224))
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


@app.get("/")
def index():
    return success("MindCare AI service aktif.", {
        "endpoints": {
            "face": "/predict-face",
            "health": "/health",
        }
    })


@app.get("/health")
def health():
    return success("AI service siap digunakan.", {
        "face_model": (FACE_DIR / "facial_expression_model.keras").exists(),
    })


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
    port = int(os.getenv("PORT", os.getenv("AI_PORT", "5000")))
    app.run(host="0.0.0.0", port=port)
