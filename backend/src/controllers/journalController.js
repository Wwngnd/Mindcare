import { QueryTypes } from "sequelize";
import db from "../config/Database.js";
import response from "../utils/response.js";

const journalController = {
    async createJournal(req, res, next) {
        const { judul, deskripsi, durasi } = req.body;

        try {
            const [result] = await db.query(
                "INSERT INTO tb_journal (user_id, judul, deskripsi, durasi) VALUES (?, ?, ?, ?)",
                {
                    replacements: [req.userId, judul, deskripsi, durasi],
                    type: QueryTypes.INSERT
                }
            );

            const [newJournal] = await db.query(
                "SELECT id, user_id, judul, deskripsi, durasi, createdAt FROM tb_journal WHERE id = ?",
                {
                    replacements: [result],
                    type: QueryTypes.SELECT
                }
            );
            const data = {
                id: newJournal.id,
                user_id: newJournal.user_id,
                journal: { judul: newJournal.judul, deskripsi: newJournal.deskripsi, durasi: newJournal.durasi }
            }

            return response.success(res, 201, "Journal berhasil dibuat.", data);

        } catch (error) {
            next(error);
        }
    },
    async getAllJournalByUserLogin(req, res, next) {
        try {
            const journals = await db.query(
                "SELECT id, judul, deskripsi, durasi, createdAt, updatedAt FROM tb_journal WHERE user_id = ? ORDER BY createdAt DESC",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );
            if (!journals.length) {
                return response.failed(res, 404, "Belum ada journal.");
            }


            return response.success(res, 200, "Data journal berhasil diambil.", journals);

        } catch (error) {
            next(error);
        }
    },
    async getAllJournal(req, res, next) {
        try {
            const journals = await db.query(
                "SELECT id, judul, deskripsi, durasi, createdAt, updatedAt FROM tb_journal ORDER BY createdAt DESC",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );
            if (!journals.length) {
                return response.failed(res, 404, "Belum ada journal.");
            }


            return response.success(res, 200, "Data journal berhasil diambil.", journals);

        } catch (error) {
            next(error);
        }
    },
    async getJournalById(req, res, next) {
        const { id } = req.params;

        try {
            const [journal] = await db.query(
                "SELECT id, judul, deskripsi, durasi, createdAt, updatedAt FROM tb_journal WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!journal) {
                return response.failed(res, 404, "Journal tidak ditemukan.");
            }

            return response.success(res, 200, "Detail journal berhasil diambil.", journal);

        } catch (error) {
            next(error);
        }
    },
    async updateJournal(req, res, next) {
        const { id } = req.params;
        const { judul, deskripsi, durasi } = req.body;

        try {
            const [journal] = await db.query(
                "SELECT id FROM tb_journal WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!journal) {
                return response.failed(res, 404, "Journal tidak ditemukan.");
            }

            await db.query(
                "UPDATE tb_journal SET judul = ?, deskripsi = ?, durasi = ? WHERE id = ?",
                {
                    replacements: [judul, deskripsi, durasi, id],
                    type: QueryTypes.UPDATE
                }
            );

            const [updatedJournal] = await db.query(
                "SELECT id, user_id, judul, deskripsi, durasi, createdAt, updatedAt FROM tb_journal WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 200, "Journal berhasil diupdate.", updatedJournal);

        } catch (error) {
            next(error);
        }
    },

    async deleteJournal(req, res, next) {
        const { id } = req.params;

        try {
            const [journal] = await db.query(
                "SELECT id FROM tb_journal WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!journal) {
                return response.failed(res, 404, "Journal tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_journal WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.DELETE
                }
            );

            return response.success(res, 200, "Journal berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    }
}

export default journalController;