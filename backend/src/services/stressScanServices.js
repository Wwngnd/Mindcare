import stressScanRepository from "../repositories/stressScanRepository.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import ValidationError from "../exceptions/ValidationError.js";
import { getFacePrediction } from "../helper/facePredictionHelper.js";

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const MIMETYPE_TO_EXTENSION = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

const FACE_TO_STRESS_MAP = {
    happy: {
        mood: 4,
        keterangan_mood: "Sangat Baik",
        tingkat_stres: 1,
        keterangan: "Rendah",
    },
    neutral: {
        mood: 2,
        keterangan_mood: "Netral",
        tingkat_stres: 3,
        keterangan: "Sedang",
    },
    sad: {
        mood: 1,
        keterangan_mood: "Buruk",
        tingkat_stres: 4,
        keterangan: "Tinggi",
    },
    angry: {
        mood: 0,
        keterangan_mood: "Sangat Buruk",
        tingkat_stres: 5,
        keterangan: "Sangat Tinggi",
    },
};

const sanitizeBase64 = (value) => value.replace(/\s+/g, "");

const parseImageBase64 = (imageBase64, explicitMimetype) => {
    if (!imageBase64 || typeof imageBase64 !== "string") {
        throw new ValidationError("Field image_base64 wajib diisi.");
    }

    const dataUrlMatch = imageBase64.match(DATA_URL_PATTERN);

    if (dataUrlMatch) {
        const mimetype = dataUrlMatch[1].toLowerCase();
        const base64Content = sanitizeBase64(dataUrlMatch[2]);
        return { mimetype, base64Content };
    }

    const base64Content = sanitizeBase64(imageBase64);
    const mimetype = (explicitMimetype || "image/jpeg").toLowerCase();
    return { mimetype, base64Content };
};

const buildImagePayload = (imageBase64, imageMimetype, imageFilename) => {
    const { mimetype, base64Content } = parseImageBase64(imageBase64, imageMimetype);

    if (!BASE64_PATTERN.test(base64Content)) {
        throw new ValidationError("Format image_base64 tidak valid.");
    }

    const buffer = Buffer.from(base64Content, "base64");
    if (!buffer.length) {
        throw new ValidationError("Gagal membaca data gambar dari image_base64.");
    }

    const fileExtension = MIMETYPE_TO_EXTENSION[mimetype] || "jpg";
    const filename = imageFilename?.trim() || `stress-scan-${Date.now()}.${fileExtension}`;

    return { buffer, mimetype, filename };
};

const mapFacePredictionToScan = (label) => {
    const normalizedLabel = (label || "").toLowerCase().trim();
    return FACE_TO_STRESS_MAP[normalizedLabel] || FACE_TO_STRESS_MAP.neutral;
};

/**
 * Menerima gambar dari frontend, mengirim ke AI Flask, lalu menyimpan hasil scan ke database.
 */
const createStressScan = async (userId, data) => {
    const {
        image_base64,
        image_mimetype,
        image_filename
    } = data;

    const imagePayload = buildImagePayload(image_base64, image_mimetype, image_filename);
    const aiPrediction = await getFacePrediction(
        imagePayload.buffer,
        imagePayload.filename,
        imagePayload.mimetype
    );

    const mappedScanResult = mapFacePredictionToScan(aiPrediction.label);

    const scanId = await stressScanRepository.insertStressScan(userId, {
        ...mappedScanResult,
        foto_path: imagePayload.filename
    });

    const scan = await stressScanRepository.findStressScanById(scanId);

    return {
        ...scan,
        ai_prediction: aiPrediction
    };
};

/**
 * Mengambil semua riwayat stress scan milik user.
 * @throws {Error} Jika belum ada riwayat.
 */
const getAllStressScanByUser = async (userId) => {
    const scans = await stressScanRepository.findStressScanByUserId(userId);

    if (!scans.length) {
        throw new NotFoundError("Belum ada riwayat scan stres.");
    }

    return scans;
};

/**
 * Mengambil detail satu stress scan berdasarkan ID dengan validasi kepemilikan.
 * @throws {Error} Jika data tidak ditemukan / bukan milik user.
 */
const getStressScanById = async (id, userId) => {
    const scan = await stressScanRepository.findStressScanByIdAndUser(id, userId);

    if (!scan) {
        throw new NotFoundError("Data scan stres tidak ditemukan.");
    }

    return scan;
};

/**
 * Menghapus stress scan setelah memvalidasi kepemilikan user.
 * @throws {Error} Jika data tidak ditemukan / bukan milik user.
 */
const deleteStressScan = async (id, userId) => {
    const scan = await stressScanRepository.findStressScanByIdAndUser(id, userId);

    if (!scan) {
        throw new NotFoundError("Data scan stres tidak ditemukan.");
    }

    await stressScanRepository.deleteStressScan(id);
};

/**
 * Mengambil semua stress scan (akses admin).
 * @throws {Error} Jika belum ada data.
 */
const getAllStressScan = async () => {
    const scans = await stressScanRepository.findAllStressScan();

    if (!scans.length) {
        throw new NotFoundError("Belum ada data scan stres.");
    }

    return scans;
};

export default {
    createStressScan,
    getAllStressScanByUser,
    getStressScanById,
    deleteStressScan,
    getAllStressScan
};
