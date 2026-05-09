import db from "../config/Database.js";
import { QueryTypes } from "sequelize";
import response from "../utils/response.js";

const lariController = {
    async createLari(req, res, next) {
        const { jarak_km, durasi_menit, rute_maps, tanggal } = req.body;

        try {
            const [result] = await db.query(
                "INSERT INTO tb_lari (user_id, jarak_km, durasi_menit, rute_maps, tanggal) VALUES (?, ?, ?, ?, ?)",
                {
                    replacements: [
                        req.userId,
                        jarak_km,
                        durasi_menit,
                        JSON.stringify(rute_maps ?? []),
                        tanggal
                    ],
                    type: QueryTypes.INSERT
                }
            );

            const [newLari] = await db.query(
                "SELECT * FROM tb_lari WHERE id = ?",
                {
                    replacements: [result],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 201, "Aktivitas lari berhasil disimpan.", newLari);

        } catch (error) {
            next(error);
        }
    },

    async getAllLariByUserLogin(req, res, next) {
        try {
            const lari = await db.query(
                "SELECT * FROM tb_lari WHERE user_id = ? ORDER BY tanggal DESC",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!lari.length) {
                return response.failed(res, 404, "Belum ada riwayat lari.");
            }

            return response.success(res, 200, "Riwayat lari berhasil diambil.", { lari });

        } catch (error) {
            next(error);
        }
    },

    async getLariById(req, res, next) {
        const { id } = req.params;

        try {
            const [lari] = await db.query(
                "SELECT * FROM tb_lari WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!lari) {
                return response.failed(res, 404, "Data lari tidak ditemukan.");
            }

            return response.success(res, 200, "Detail lari berhasil diambil.", lari);

        } catch (error) {
            next(error);
        }
    },

    async deleteLari(req, res, next) {
        const { id } = req.params;

        try {
            const [lari] = await db.query(
                "SELECT id FROM tb_lari WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!lari) {
                return response.failed(res, 404, "Data lari tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_lari WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.DELETE
                }
            );

            return response.success(res, 200, "Data lari berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    },

    async getStatistikLari(req, res, next) {
        try {
            const [allTime] = await db.query(
                "SELECT COALESCE(SUM(jarak_km), 0) as total_jarak, COALESCE(SUM(durasi_menit), 0) as total_durasi, COUNT(id) as total_sesi FROM tb_lari WHERE user_id = ?",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            const [hariIni] = await db.query(
                "SELECT COALESCE(SUM(jarak_km), 0) as total_jarak, COALESCE(SUM(durasi_menit), 0) as total_durasi, COUNT(id) as total_sesi FROM tb_lari WHERE user_id = ? AND DATE(tanggal) = CURDATE()",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            const [mingguIni] = await db.query(
                "SELECT COALESCE(SUM(jarak_km), 0) as total_jarak, COALESCE(SUM(durasi_menit), 0) as total_durasi, COUNT(id) as total_sesi FROM tb_lari WHERE user_id = ? AND YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            const [bulanIni] = await db.query(
                "SELECT COALESCE(SUM(jarak_km), 0) as total_jarak, COALESCE(SUM(durasi_menit), 0) as total_durasi, COUNT(id) as total_sesi FROM tb_lari WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 200, "Statistik lari berhasil diambil.", {
                all_time: allTime,
                hari_ini: hariIni,
                minggu_ini: mingguIni,
                bulan_ini: bulanIni
            });

        } catch (error) {
            next(error);
        }
    },

    async getAllLari(req, res, next) {
        try {
            const lari = await db.query(
                `SELECT tb_lari.*, tb_users.name, tb_users.email 
                 FROM tb_lari 
                 JOIN tb_users ON tb_lari.user_id = tb_users.id 
                 ORDER BY tb_lari.tanggal DESC`,
                { type: QueryTypes.SELECT }
            );

            if (!lari.length) {
                return response.failed(res, 404, "Belum ada data lari.");
            }

            return response.success(res, 200, "Semua data lari berhasil diambil.", { lari });

        } catch (error) {
            next(error);
        }
    }
};

export default lariController;