import kuesionerRepository from "../repositories/kuesionerRepository.js";
import { getAIRecommendation } from "../helper/predictionHelper.js";
import { buildAIInput } from "../helper/aiInputBuilder.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import { saveAlternatif, saveRekomendasiUtama, saveDistribusi, insertSesi } from "./rekomendasiServices.js";
import { readMindcareBooksDataset } from "../utils/mindcareBooksDataset.js";
import stressProgressServices from "./stressProgressServices.js";

const toNumberIfPossible = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
};

const getStressLevelTarget = (tingkatStres) => {
    const stress = Number(tingkatStres);
    if (Number.isNaN(stress)) return "Sedang";
    if (stress <= 2) return "Ringan";
    if (stress === 3) return "Sedang";
    return "Berat";
};

const getStressCategoryTarget = (penyebabStres = "") => {
    const penyebab = String(penyebabStres).toLowerCase();
    if (penyebab.includes("akademik")) return "Akademik";
    if (penyebab.includes("pekerjaan")) return "Pekerjaan";
    if (penyebab.includes("hubungan")) return "Sosial";
    if (penyebab.includes("finansial")) return "Keuangan";
    return "Umum";
};

const shuffleBooks = (books) => [...books].sort(() => Math.random() - 0.5);

const getFallbackBooks = async (inputAI, limit = 3) => {
    const rows = await readMindcareBooksDataset();
    const level = getStressLevelTarget(inputAI?.Tingkat_stres ?? inputAI?.["Tingkat stres"]);
    const category = getStressCategoryTarget(inputAI?.Penyebab_stres ?? inputAI?.["Penyebab stres"]);

    const exactMatches = rows.filter((book) =>
        book.stressLevelTarget === level &&
        String(book.stressCategory).toLowerCase().includes(category.toLowerCase())
    );
    const levelMatches = rows.filter((book) => book.stressLevelTarget === level);
    const candidates = exactMatches.length >= limit ? exactMatches : [...exactMatches, ...levelMatches];
    const uniqueBooks = Array.from(
        new Map(candidates.map((book) => [book.judul.toLowerCase(), book])).values()
    );

    return shuffleBooks(uniqueBooks.length ? uniqueBooks : rows).slice(0, limit);
};

const ensureBookRecommendations = async (hasilAI, inputAI) => {
    const mainBooks = hasilAI.rekomendasi_utama?.rekomendasi_buku ?? [];
    const alternativeBooks = (hasilAI.alternatif ?? []).flatMap((item) => item.rekomendasi_buku ?? []);
    let books = [...mainBooks, ...alternativeBooks]
        .filter((book) => book?.judul)
        .slice(0, 3);

    if (books.length < 3) {
        const fallbackBooks = await getFallbackBooks(inputAI, 6);
        const existingTitles = new Set(books.map((book) => book.judul.toLowerCase()));
        books = [
            ...books,
            ...fallbackBooks.filter((book) => !existingTitles.has(book.judul.toLowerCase()))
        ].slice(0, 3);
    }

    hasilAI.rekomendasi_utama.rekomendasi_buku = books;
    return hasilAI;
};

const buildStoredRekomendasiPayload = (sesi, aktivitasRows, bukuRows, distribusiRows) => {
    const bukuByAktivitasId = new Map();

    for (const buku of bukuRows) {
        const existing = bukuByAktivitasId.get(buku.aktivitas_id) || [];
        existing.push({
            id: buku.id,
            judul: buku.judul,
            penulis: buku.penulis,
            kategori: buku.kategori,
            thumbnail: buku.thumbnail,
            deskripsi: buku.deskripsi
        });
        bukuByAktivitasId.set(buku.aktivitas_id, existing);
    }

    const aktivitasDenganBuku = aktivitasRows.map((item) => ({
        aktivitas: item.aktivitas,
        confidence: toNumberIfPossible(item.confidence),
        durasi: toNumberIfPossible(item.durasi),
        detail: item.detail,
        is_utama: Number(item.is_utama) === 1,
        rekomendasi_buku: bukuByAktivitasId.get(item.id) || []
    }));

    const rekomendasiUtamaRaw = aktivitasDenganBuku.find((item) => item.is_utama) || null;

    const rekomendasiUtama = rekomendasiUtamaRaw
        ? {
            aktivitas: rekomendasiUtamaRaw.aktivitas,
            confidence: rekomendasiUtamaRaw.confidence,
            durasi: rekomendasiUtamaRaw.durasi,
            detail: rekomendasiUtamaRaw.detail,
            rekomendasi_buku: rekomendasiUtamaRaw.rekomendasi_buku
        }
        : null;

    const alternatif = aktivitasDenganBuku
        .filter((item) => !item.is_utama)
        .map((item) => ({
            aktivitas: item.aktivitas,
            confidence: item.confidence,
            durasi: item.durasi,
            detail: item.detail,
            rekomendasi_buku: item.rekomendasi_buku
        }));

    const distribusiProbabilitas = {};
    for (const row of distribusiRows) {
        distribusiProbabilitas[row.aktivitas] = toNumberIfPossible(row.probabilitas);
    }

    return {
        sesi_id: sesi.sesi_id,
        kuesioner_id: sesi.kuesioner_id,
        createdAt: sesi.createdAt,
        insight: {
            model_type: sesi.model_type,
            alasan: sesi.alasan,
            distribusi_probabilitas: distribusiProbabilitas
        },
        rekomendasi_utama: rekomendasiUtama,
        alternatif
    };
};

const getStoredRekomendasiBySesi = async (userId, sesiId) => {
    const sesi = await kuesionerRepository.findRekomendasiSesiByIdAndUser(sesiId, userId);

    if (!sesi) {
        throw new NotFoundError("Data rekomendasi tidak ditemukan.");
    }

    const [aktivitasRows, bukuRows, distribusiRows] = await Promise.all([
        kuesionerRepository.findRekomendasiAktivitasBySesiId(sesi.sesi_id),
        kuesionerRepository.findRekomendasiBukuBySesiId(sesi.sesi_id),
        kuesionerRepository.findRekomendasiDistribusiBySesiId(sesi.sesi_id)
    ]);

    return buildStoredRekomendasiPayload(sesi, aktivitasRows, bukuRows, distribusiRows);
};

const getAllStoredRekomendasiByUser = async (userId) => {
    const [rekomendasiList, bukuHistory] = await Promise.all([
        kuesionerRepository.findRekomendasiSummaryByUserId(userId),
        kuesionerRepository.findRekomendasiBukuHistoryByUserId(userId)
    ]);

    if (!rekomendasiList.length && !bukuHistory.length) {
        throw new NotFoundError("Belum ada riwayat rekomendasi.");
    }

    return {
        sesi: rekomendasiList.map((item) => ({
            sesi_id: item.sesi_id,
            kuesioner_id: item.kuesioner_id,
            model_type: item.model_type,
            alasan: item.alasan,
            createdAt: item.createdAt,
            rekomendasi_utama: item.aktivitas_utama
                ? {
                    aktivitas: item.aktivitas_utama,
                    confidence: toNumberIfPossible(item.confidence_utama),
                    durasi: toNumberIfPossible(item.durasi_utama)
                }
                : null
        })),
        rekomendasi_buku: bukuHistory.map((book) => ({
            id: book.id,
            sesi_id: book.sesi_id,
            kuesioner_id: book.kuesioner_id,
            aktivitas_id: book.aktivitas_id,
            aktivitas: book.aktivitas,
            is_utama: Number(book.is_utama) === 1,
            judul: book.judul,
            penulis: book.penulis,
            kategori: book.kategori,
            thumbnail: book.thumbnail,
            deskripsi: book.deskripsi,
            recommended_at: book.recommended_at
        }))
    };
};


const createKuesionerWithRekomendasi = async (userId, data) => {
    // 1. Simpan kuesioner
    const kuesionerId = await kuesionerRepository.insertKuesioner(userId, data);
    const kuesioner = await kuesionerRepository.findKuesionerById(kuesionerId);

    // 2. Panggil model AI
    const inputAI = buildAIInput(kuesioner);
    const hasilAI = await getAIRecommendation(inputAI);
    await ensureBookRecommendations(hasilAI, inputAI);

    const sesiId = await insertSesi(userId, kuesionerId, hasilAI.insight);

    // 4. Simpan rekomendasi utama + buku
    await saveRekomendasiUtama(sesiId, hasilAI.rekomendasi_utama);

    // 5. Simpan alternatif + buku
    await saveAlternatif(sesiId, hasilAI.alternatif);

    // 6. Simpan distribusi probabilitas
    await saveDistribusi(sesiId, hasilAI.insight.distribusi_probabilitas);

    // 7. Ambil ulang hasil rekomendasi dari database
    const storedRekomendasi = await getStoredRekomendasiBySesi(userId, sesiId);
    const stressAssessment = hasilAI.stress_assessment ?? null;
    const stressProgress = await stressProgressServices.setBaselineFromKuesioner(userId, kuesioner, stressAssessment);

    // 7. Susun response payload
    return {
        kuesioner,
        rekomendasi: {
            ...storedRekomendasi,
            ...(stressAssessment ? { stress_assessment: stressAssessment } : {})
        },
        stress_assessment: stressAssessment,
        stress_progress: stressProgress
    };
};

const getAllKuesionerByUser = async (userId) => {
    const kuesioner = await kuesionerRepository.findKuesionerByUserId(userId);

    if (!kuesioner.length) {
        throw new NotFoundError("Belum ada data kuesioner.");
    }

    return kuesioner;
};

const getAllKuesioner = async () => {
    const kuesioner = await kuesionerRepository.findAllKuesioner();

    if (!kuesioner.length) {
        throw new NotFoundError("Belum ada data kuesioner.");
    }

    return kuesioner;
};

const getKuesionerById = async (id, userId) => {
    const kuesioner = await kuesionerRepository.findKuesionerByIdAndUser(id, userId);

    if (!kuesioner) {
        throw new NotFoundError("Data kuesioner tidak ditemukan.");
    }

    return kuesioner;
};

const deleteKuesioner = async (id, userId) => {
    const kuesioner = await kuesionerRepository.findKuesionerByIdAndUser(id, userId);

    if (!kuesioner) {
        throw new NotFoundError("Data kuesioner tidak ditemukan.");
    }

    await kuesionerRepository.deleteKuesioner(id);
};

export default {
    createKuesionerWithRekomendasi,
    getAllKuesionerByUser,
    getAllKuesioner,
    getKuesionerById,
    deleteKuesioner,
    getAllStoredRekomendasiByUser,
    getStoredRekomendasiBySesi
};
