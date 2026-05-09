import db from "../config/Database.js";
import { QueryTypes } from "sequelize";
import response from "../utils/response.js";

const stressScanController = {
    async createStressScan(req, res, next) {
        const { tingkat_stres, keterangan, mood, keterangan_mood } = req.body;

        try {
            const [result] = await db.query(
                `INSERT INTO tb_stress_scan 
                (user_id, tingkat_stres, keterangan, mood, keterangan_mood) 
                VALUES (?, ?, ?, ?, ?)`,
                {
                    replacements: [req.userId, tingkat_stres, keterangan, mood, keterangan_mood],
                    type: QueryTypes.INSERT
                }
            );

            const [newScan] = await db.query(
                "SELECT * FROM tb_stress_scan WHERE id = ?",
                {
                    replacements: [result],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 201, "Hasil scan stres berhasil disimpan.", newScan);

        } catch (error) {
            next(error);
        }
    },

    async getAllStressScanByUserLogin(req, res, next) {
        try {
            const scans = await db.query(
                "SELECT * FROM tb_stress_scan WHERE user_id = ? ORDER BY createdAt DESC",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!scans.length) {
                return response.failed(res, 404, "Belum ada riwayat scan stres.");
            }

            return response.success(res, 200, "Riwayat scan stres berhasil diambil.", { scans });

        } catch (error) {
            next(error);
        }
    },

    async getStressScanById(req, res, next) {
        const { id } = req.params;

        try {
            const [scan] = await db.query(
                "SELECT * FROM tb_stress_scan WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!scan) {
                return response.failed(res, 404, "Data scan stres tidak ditemukan.");
            }

            return response.success(res, 200, "Detail scan stres berhasil diambil.", scan);

        } catch (error) {
            next(error);
        }
    },

    async deleteStressScan(req, res, next) {
        const { id } = req.params;

        try {
            const [scan] = await db.query(
                "SELECT id FROM tb_stress_scan WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!scan) {
                return response.failed(res, 404, "Data scan stres tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_stress_scan WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.DELETE
                }
            );

            return response.success(res, 200, "Data scan stres berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    },

    async getAllStressScan(req, res, next) {
        try {
            const scans = await db.query(
                `SELECT tb_stress_scan.*, tb_users.name, tb_users.email
                 FROM tb_stress_scan
                 JOIN tb_users ON tb_stress_scan.user_id = tb_users.id
                 ORDER BY tb_stress_scan.createdAt DESC`,
                { type: QueryTypes.SELECT }
            );

            if (!scans.length) {
                return response.failed(res, 404, "Belum ada data scan stres.");
            }

            return response.success(res, 200, "Semua data scan stres berhasil diambil.", { scans });

        } catch (error) {
            next(error);
        }
    }
};

export default stressScanController;