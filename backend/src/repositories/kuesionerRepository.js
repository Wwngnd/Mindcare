import db from "../config/Database.js";
import { QueryTypes } from "sequelize";

// ─── Kuesioner ────────────────────────────────────────────────────────────────

/**
 * Menyimpan data kuesioner baru ke database.
 * @returns {number} ID kuesioner yang baru dibuat.
 */
const insertKuesioner = async (userId, data) => {
    const {
        umur, pekerjaan, tingkat_stres, durasi_stres,
        penyebab_stres, kualitas_tidur, waktu_luang, mood,
        aktivitas_fisik, preferensi_olahraga, preferensi_membaca,
        preferensi_journaling
    } = data;

    const [result] = await db.query(
        `INSERT INTO tb_kuesioner_hasil (
            user_id, umur, pekerjaan, tingkat_stres, durasi_stres,
            penyebab_stres, kualitas_tidur, waktu_luang, mood,
            aktivitas_fisik, preferensi_olahraga, preferensi_membaca,
            preferensi_journaling
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
            replacements: [
                userId, umur, pekerjaan, tingkat_stres, durasi_stres,
                penyebab_stres, kualitas_tidur, waktu_luang, mood,
                aktivitas_fisik, preferensi_olahraga, preferensi_membaca,
                preferensi_journaling
            ],
            type: QueryTypes.INSERT
        }
    );

    const kuesionerId = result?.insertId || result;
    return kuesionerId;
};

/**
 * Mengambil satu data kuesioner berdasarkan ID-nya.
 * @returns {object|null} Data kuesioner, atau null jika tidak ditemukan.
 */
const findKuesionerById = async (id) => {
    const [kuesioner] = await db.query(
        "SELECT * FROM tb_kuesioner_hasil WHERE id = ?",
        {
            replacements: [id],
            type: QueryTypes.SELECT
        }
    );
    return kuesioner ?? null;
};

/**
 * Mengambil semua kuesioner milik user tertentu, diurutkan terbaru dulu.
 * @returns {object[]} Array data kuesioner.
 */
const findKuesionerByUserId = async (userId) => {
    return db.query(
        "SELECT * FROM tb_kuesioner_hasil WHERE user_id = ? ORDER BY createdAt DESC",
        {
            replacements: [userId],
            type: QueryTypes.SELECT
        }
    );
};

/**
 * Mengambil semua kuesioner (admin) beserta nama & email user.
 * @returns {object[]} Array data kuesioner.
 */
const findAllKuesioner = async () => {
    return db.query(
        `SELECT tb_kuesioner_hasil.*, tb_users.name, tb_users.email
         FROM tb_kuesioner_hasil
         JOIN tb_users ON tb_kuesioner_hasil.user_id = tb_users.id
         ORDER BY tb_kuesioner_hasil.createdAt DESC`,
        { type: QueryTypes.SELECT }
    );
};

/**
 * Mengambil kuesioner berdasarkan ID dan memastikan kepemilikan user.
 * @returns {object|null} Data kuesioner, atau null jika tidak ditemukan / bukan miliknya.
 */
const findKuesionerByIdAndUser = async (id, userId) => {
    const [kuesioner] = await db.query(
        "SELECT * FROM tb_kuesioner_hasil WHERE id = ? AND user_id = ? LIMIT 1",
        {
            replacements: [id, userId],
            type: QueryTypes.SELECT
        }
    );
    return kuesioner ?? null;
};

/**
 * Menghapus kuesioner berdasarkan ID.
 */
const deleteKuesioner = async (id) => {
    await db.query(
        "DELETE FROM tb_kuesioner_hasil WHERE id = ?",
        {
            replacements: [id],
            type: QueryTypes.DELETE
        }
    );
};

// ─── Rekomendasi Sesi ─────────────────────────────────────────────────────────

/**
 * Menyimpan sesi rekomendasi hasil AI.
 * @returns {number} ID sesi yang baru dibuat.
 */
const insertSesi = async (userId, kuesionerId, modelType, alasan) => {
    const [result] = await db.query(
        "INSERT INTO tb_rekomendasi_sesi (user_id, kuesioner_id, model_type, alasan) VALUES (?, ?, ?, ?)",
        {
            replacements: [userId, kuesionerId, modelType, alasan],
            type: QueryTypes.INSERT
        }
    );

    const sesiId = result?.insertId || result;
    return sesiId;
};

// ─── Rekomendasi Aktivitas ────────────────────────────────────────────────────

/**
 * Menyimpan satu aktivitas rekomendasi (utama atau alternatif).
 * @param {boolean} isUtama - true jika aktivitas utama, false jika alternatif.
 * @returns {number} ID aktivitas yang baru dibuat.
 */
const insertAktivitas = async (sesiId, isUtama, aktivitas, confidence, durasi, detail) => {
    const [result] = await db.query(
        "INSERT INTO tb_rekomendasi_aktivitas (sesi_id, is_utama, aktivitas, confidence, durasi, detail) VALUES (?, ?, ?, ?, ?, ?)",
        {
            replacements: [sesiId, isUtama ? 1 : 0, aktivitas, confidence, durasi, detail],
            type: QueryTypes.INSERT
        }
    );

    const aktivitasId = result?.insertId || result;
    return aktivitasId;
};

// ─── Rekomendasi Buku ─────────────────────────────────────────────────────────

/**
 * Menyimpan atau mengupdate data buku rekomendasi.
 * Jika buku dengan judul dan penulis yang sama sudah ada, maka akan diupdate (ditimpa).
 * Jika belum ada, akan dibuat baru.
 * @returns {number} ID buku yang sudah ada atau baru dibuat.
 */
const insertBuku = async (aktivitasId, judul, penulis, kategori, thumbnail, deskripsi) => {
    await db.query(
        `INSERT INTO tb_rekomendasi_buku
         (aktivitas_id, judul, penulis, kategori, thumbnail, deskripsi)
         VALUES (?, ?, ?, ?, ?, ?)`,
        {
            replacements: [aktivitasId, judul, penulis, kategori, thumbnail, deskripsi],
            type: QueryTypes.INSERT
        }
    );

    const [newBuku] = await db.query(
        "SELECT LAST_INSERT_ID() as id",
        { type: QueryTypes.SELECT }
    );
    return newBuku?.id;
};

// ─── Rekomendasi Distribusi ───────────────────────────────────────────────────

/**
 * Menyimpan satu entri distribusi probabilitas aktivitas.
 */
const insertDistribusi = async (sesiId, aktivitas, probabilitas) => {
    await db.query(
        "INSERT INTO tb_rekomendasi_distribusi (sesi_id, aktivitas, probabilitas) VALUES (?, ?, ?)",
        {
            replacements: [sesiId, aktivitas, probabilitas],
            type: QueryTypes.INSERT
        }
    );
};

/**
 * Mengambil ringkasan seluruh sesi rekomendasi milik user.
 * Dipakai untuk menampilkan riwayat rekomendasi di frontend.
 */
const findRekomendasiSummaryByUserId = async (userId) => {
    return db.query(
        `SELECT
            rs.id AS sesi_id,
            rs.kuesioner_id,
            rs.model_type,
            rs.alasan,
            rs.createdAt,
            ra.aktivitas AS aktivitas_utama,
            ra.confidence AS confidence_utama,
            ra.durasi AS durasi_utama
         FROM tb_rekomendasi_sesi rs
         LEFT JOIN tb_rekomendasi_aktivitas ra
            ON ra.sesi_id = rs.id
            AND ra.is_utama = 1
         WHERE rs.user_id = ?
         ORDER BY rs.createdAt DESC`,
        {
            replacements: [userId],
            type: QueryTypes.SELECT
        }
    );
};

/**
 * Mengambil satu sesi rekomendasi milik user berdasarkan sesi_id.
 */
const findRekomendasiSesiByIdAndUser = async (sesiId, userId) => {
    const [sesi] = await db.query(
        `SELECT
            id AS sesi_id,
            user_id,
            kuesioner_id,
            model_type,
            alasan,
            createdAt
         FROM tb_rekomendasi_sesi
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        {
            replacements: [sesiId, userId],
            type: QueryTypes.SELECT
        }
    );

    return sesi ?? null;
};

/**
 * Mengambil daftar aktivitas rekomendasi (utama + alternatif) dalam satu sesi.
 */
const findRekomendasiAktivitasBySesiId = async (sesiId) => {
    return db.query(
        `SELECT
            id,
            sesi_id,
            is_utama,
            aktivitas,
            confidence,
            durasi,
            detail
         FROM tb_rekomendasi_aktivitas
         WHERE sesi_id = ?
         ORDER BY is_utama DESC, id ASC`,
        {
            replacements: [sesiId],
            type: QueryTypes.SELECT
        }
    );
};

/**
 * Mengambil daftar buku rekomendasi dalam satu sesi (via relasi aktivitas).
 */
const findRekomendasiBukuBySesiId = async (sesiId) => {
    return db.query(
        `SELECT
            b.id,
            b.aktivitas_id,
            b.judul,
            b.penulis,
            b.kategori,
            b.thumbnail,
            b.deskripsi
         FROM tb_rekomendasi_buku b
         JOIN tb_rekomendasi_aktivitas a
            ON a.id = b.aktivitas_id
         WHERE a.sesi_id = ?
         ORDER BY b.id ASC`,
        {
            replacements: [sesiId],
            type: QueryTypes.SELECT
        }
    );
};

/**
 * Mengambil semua buku yang pernah direkomendasikan ke user dari seluruh sesi kuesioner.
 */
const findRekomendasiBukuHistoryByUserId = async (userId) => {
    return db.query(
        `SELECT
            b.id,
            b.aktivitas_id,
            b.judul,
            b.penulis,
            b.kategori,
            b.thumbnail,
            b.deskripsi,
            a.sesi_id,
            a.aktivitas,
            a.is_utama,
            rs.kuesioner_id,
            rs.createdAt AS recommended_at
         FROM tb_rekomendasi_buku b
         JOIN tb_rekomendasi_aktivitas a
            ON a.id = b.aktivitas_id
         JOIN tb_rekomendasi_sesi rs
            ON rs.id = a.sesi_id
         WHERE rs.user_id = ?
         ORDER BY rs.createdAt DESC, b.id ASC`,
        {
            replacements: [userId],
            type: QueryTypes.SELECT
        }
    );
};

/**
 * Mengambil distribusi probabilitas aktivitas dalam satu sesi.
 */
const findRekomendasiDistribusiBySesiId = async (sesiId) => {
    return db.query(
        `SELECT aktivitas, probabilitas
         FROM tb_rekomendasi_distribusi
         WHERE sesi_id = ?
         ORDER BY id ASC`,
        {
            replacements: [sesiId],
            type: QueryTypes.SELECT
        }
    );
};

export default {
    insertKuesioner,
    findKuesionerById,
    findKuesionerByUserId,
    findAllKuesioner,
    findKuesionerByIdAndUser,
    deleteKuesioner,
    insertSesi,
    insertAktivitas,
    insertBuku,
    insertDistribusi,
    findRekomendasiSummaryByUserId,
    findRekomendasiSesiByIdAndUser,
    findRekomendasiAktivitasBySesiId,
    findRekomendasiBukuBySesiId,
    findRekomendasiBukuHistoryByUserId,
    findRekomendasiDistribusiBySesiId
};
