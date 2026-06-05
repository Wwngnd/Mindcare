import db from "../config/Database.js";
import { QueryTypes } from "sequelize";

let tablesReady = false;

const ensureTables = async () => {
    if (tablesReady) return;

    await db.query(
        `CREATE TABLE IF NOT EXISTS tb_user_stress_state (
            id int NOT NULL AUTO_INCREMENT,
            user_id int NOT NULL,
            kuesioner_id int DEFAULT NULL,
            stress_awal_percent decimal(5,2) NOT NULL COMMENT 'baseline terbaru dari kuesioner',
            stress_saat_ini_percent decimal(5,2) NOT NULL COMMENT 'stress berjalan setelah aktivitas',
            kategori_stress varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            keterangan_stress text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_user_stress_state_user (user_id),
            KEY fk_user_stress_state_kuesioner (kuesioner_id),
            CONSTRAINT fk_user_stress_state_user FOREIGN KEY (user_id) REFERENCES tb_users (id) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_user_stress_state_kuesioner FOREIGN KEY (kuesioner_id) REFERENCES tb_kuesioner_hasil (id) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    const [keteranganColumn] = await db.query(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'tb_user_stress_state'
           AND COLUMN_NAME = 'keterangan_stress'
         LIMIT 1`,
        { type: QueryTypes.SELECT }
    );

    if (!keteranganColumn) {
        await db.query(
            `ALTER TABLE tb_user_stress_state
             ADD COLUMN keterangan_stress text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
             AFTER kategori_stress`
        );
    }

    await db.query(
        `CREATE TABLE IF NOT EXISTS tb_stress_reduction_log (
            id int NOT NULL AUTO_INCREMENT,
            user_id int NOT NULL,
            aktivitas enum('membaca','journaling','olahraga') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            source_type varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'journal, book_session, olahraga',
            source_id int DEFAULT NULL,
            durasi_menit smallint NOT NULL,
            stress_sebelum decimal(5,2) NOT NULL,
            penurunan_percent decimal(5,2) NOT NULL,
            stress_sesudah decimal(5,2) NOT NULL,
            createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY fk_stress_reduction_user (user_id),
            KEY idx_stress_reduction_created (createdAt),
            CONSTRAINT fk_stress_reduction_user FOREIGN KEY (user_id) REFERENCES tb_users (id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    tablesReady = true;
};

const mapStateRow = (row) => row ? ({
    id: row.id,
    user_id: row.user_id,
    kuesioner_id: row.kuesioner_id,
    stress_awal_percent: Number(row.stress_awal_percent),
    stress_saat_ini_percent: Number(row.stress_saat_ini_percent),
    kategori_stress: row.kategori_stress,
    keterangan_stress: row.keterangan_stress,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
}) : null;

const mapLogRow = (row) => row ? ({
    id: row.id,
    user_id: row.user_id,
    aktivitas: row.aktivitas,
    source_type: row.source_type,
    source_id: row.source_id,
    durasi_menit: Number(row.durasi_menit),
    stress_sebelum: Number(row.stress_sebelum),
    penurunan_percent: Number(row.penurunan_percent),
    stress_sesudah: Number(row.stress_sesudah),
    createdAt: row.createdAt
}) : null;

const stressProgressRepository = {
    async findStateByUserId(userId) {
        await ensureTables();
        const [row] = await db.query(
            "SELECT * FROM tb_user_stress_state WHERE user_id = ? LIMIT 1",
            {
                replacements: [userId],
                type: QueryTypes.SELECT
            }
        );

        return mapStateRow(row);
    },

    async upsertState(userId, {
        kuesionerId,
        stressAwalPercent,
        stressSaatIniPercent,
        kategoriStress,
        keteranganStress = null
    }) {
        await ensureTables();
        await db.query(
            `INSERT INTO tb_user_stress_state
             (user_id, kuesioner_id, stress_awal_percent, stress_saat_ini_percent, kategori_stress, keterangan_stress)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                kuesioner_id = VALUES(kuesioner_id),
                stress_awal_percent = VALUES(stress_awal_percent),
                stress_saat_ini_percent = VALUES(stress_saat_ini_percent),
                kategori_stress = VALUES(kategori_stress),
                keterangan_stress = VALUES(keterangan_stress),
                updatedAt = CURRENT_TIMESTAMP`,
            {
                replacements: [
                    userId,
                    kuesionerId,
                    stressAwalPercent,
                    stressSaatIniPercent,
                    kategoriStress,
                    keteranganStress
                ],
                type: QueryTypes.INSERT
            }
        );

        return this.findStateByUserId(userId);
    },

    async updateCurrentStress(userId, { stressSaatIniPercent, kategoriStress }) {
        await ensureTables();
        await db.query(
            `UPDATE tb_user_stress_state
             SET stress_saat_ini_percent = ?,
                 kategori_stress = ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            {
                replacements: [stressSaatIniPercent, kategoriStress, userId],
                type: QueryTypes.UPDATE
            }
        );

        return this.findStateByUserId(userId);
    },

    async insertReductionLog(userId, {
        aktivitas,
        sourceType,
        sourceId,
        durasiMenit,
        stressSebelum,
        penurunanPercent,
        stressSesudah
    }) {
        await ensureTables();
        const [id] = await db.query(
            `INSERT INTO tb_stress_reduction_log
             (user_id, aktivitas, source_type, source_id, durasi_menit, stress_sebelum, penurunan_percent, stress_sesudah)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    userId,
                    aktivitas,
                    sourceType,
                    sourceId ?? null,
                    durasiMenit,
                    stressSebelum,
                    penurunanPercent,
                    stressSesudah
                ],
                type: QueryTypes.INSERT
            }
        );

        return this.findReductionLogById(id);
    },

    async findReductionLogById(id) {
        await ensureTables();
        const [row] = await db.query(
            "SELECT * FROM tb_stress_reduction_log WHERE id = ? LIMIT 1",
            {
                replacements: [id],
                type: QueryTypes.SELECT
            }
        );

        return mapLogRow(row);
    },

    async findLatestReductionLogsByUserId(userId, limit = 5) {
        await ensureTables();
        const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 20));
        const rows = await db.query(
            `SELECT * FROM tb_stress_reduction_log
             WHERE user_id = ?
             ORDER BY createdAt DESC, id DESC
             LIMIT ${safeLimit}`,
            {
                replacements: [userId],
                type: QueryTypes.SELECT
            }
        );

        return rows.map(mapLogRow);
    }
};

export default stressProgressRepository;
