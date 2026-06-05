import db from "../config/Database.js";
import { QueryTypes } from "sequelize";

// ─── Stress Scan ──────────────────────────────────────────────────────────────

/**
 * Menyimpan data stress scan baru ke database.
 * @returns {number} ID stress scan yang baru dibuat.
 */
const insertStressScan = async (userId, data) => {
    const {
        tingkat_stres,
        keterangan,
        mood,
        keterangan_mood,
        foto_path = null
    } = data;

    const [scanId] = await db.query(
        `INSERT INTO tb_stress_scan
         (user_id, tingkat_stres, keterangan, mood, keterangan_mood, foto_path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        {
            replacements: [userId, tingkat_stres, keterangan, mood, keterangan_mood, foto_path],
            type: QueryTypes.INSERT
        }
    );

    return scanId;
};

/**
 * Mengambil satu data stress scan berdasarkan ID-nya.
 * @returns {object|null} Data stress scan, atau null jika tidak ditemukan.
 */
const findStressScanById = async (id) => {
    const [scan] = await db.query(
        "SELECT * FROM tb_stress_scan WHERE id = ?",
        {
            replacements: [id],
            type: QueryTypes.SELECT
        }
    );
    return scan ?? null;
};

/**
 * Mengambil semua stress scan milik user tertentu, diurutkan terbaru dulu.
 * @returns {object[]} Array data stress scan.
 */
const findStressScanByUserId = async (userId) => {
    return db.query(
        "SELECT * FROM tb_stress_scan WHERE user_id = ? ORDER BY createdAt DESC",
        {
            replacements: [userId],
            type: QueryTypes.SELECT
        }
    );
};

const findTodayStressScanByUserId = async (userId) => {
    const [scan] = await db.query(
        `SELECT * FROM tb_stress_scan
         WHERE user_id = ?
           AND createdAt >= CURRENT_DATE()
           AND createdAt < CURRENT_DATE() + INTERVAL 1 DAY
         ORDER BY createdAt DESC
         LIMIT 1`,
        {
            replacements: [userId],
            type: QueryTypes.SELECT
        }
    );
    return scan ?? null;
};

/**
 * Mengambil stress scan berdasarkan ID dan memvalidasi kepemilikan user.
 * @returns {object|null} Data stress scan, atau null jika tidak ditemukan / bukan miliknya.
 */
const findStressScanByIdAndUser = async (id, userId) => {
    const [scan] = await db.query(
        "SELECT * FROM tb_stress_scan WHERE id = ? AND user_id = ? LIMIT 1",
        {
            replacements: [id, userId],
            type: QueryTypes.SELECT
        }
    );
    return scan ?? null;
};

/**
 * Mengambil semua stress scan (admin), JOIN dengan data user.
 * @returns {object[]} Array data stress scan.
 */
const findAllStressScan = async () => {
    return db.query(
        `SELECT tb_stress_scan.*, tb_users.name, tb_users.email
         FROM tb_stress_scan
         JOIN tb_users ON tb_stress_scan.user_id = tb_users.id
         ORDER BY tb_stress_scan.createdAt DESC`,
        { type: QueryTypes.SELECT }
    );
};

/**
 * Menghapus stress scan berdasarkan ID.
 */
const deleteStressScan = async (id) => {
    await db.query(
        "DELETE FROM tb_stress_scan WHERE id = ?",
        {
            replacements: [id],
            type: QueryTypes.DELETE
        }
    );
};

export default {
    insertStressScan,
    findStressScanById,
    findStressScanByUserId,
    findTodayStressScanByUserId,
    findStressScanByIdAndUser,
    findAllStressScan,
    deleteStressScan
};
