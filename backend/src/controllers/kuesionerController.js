import db from "../config/Database.js";
import { QueryTypes } from "sequelize";
import response from "../utils/response.js";
import { getAIRecommendation } from "../helper/predictionHelper.js";

const kuesionerController = {
    async createKuesioner(req, res, next) {
        const {
            umur,
            pekerjaan,
            tingkat_stres,
            durasi_stres,
            penyebab_stres,
            kualitas_tidur,
            waktu_luang,
            mood,
            aktivitas_fisik,
            preferensi_olahraga,
            preferensi_membaca,
            preferensi_journaling
        } = req.body;

        try {
            // 1. Simpan data kuesioner
            const [kuesionerId] = await db.query(
                `INSERT INTO tb_kuesioner_hasil (
                    user_id, umur, pekerjaan, tingkat_stres, durasi_stres,
                    penyebab_stres, kualitas_tidur, waktu_luang, mood,
                    aktivitas_fisik, preferensi_olahraga, preferensi_membaca,
                    preferensi_journaling
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        req.userId, umur, pekerjaan, tingkat_stres, durasi_stres,
                        penyebab_stres, kualitas_tidur, waktu_luang, mood,
                        aktivitas_fisik, preferensi_olahraga, preferensi_membaca,
                        preferensi_journaling
                    ],
                    type: QueryTypes.INSERT
                }
            );

            const [newKuesioner] = await db.query(
                "SELECT * FROM tb_kuesioner_hasil WHERE id = ?",
                {
                    replacements: [kuesionerId],
                    type: QueryTypes.SELECT
                }
            );

            // 2. Format input untuk AI
            const inputAI = {
                "Umur": newKuesioner.umur,
                "Pekerjaan": newKuesioner.pekerjaan,
                "Tingkat stres": newKuesioner.tingkat_stres,
                "Penyebab stres": newKuesioner.penyebab_stres,
                "Durasi stres": newKuesioner.durasi_stres,
                "Kualitas tidur": newKuesioner.kualitas_tidur,
                "Waktu luang per hari": newKuesioner.waktu_luang,
                "Aktivitas fisik": newKuesioner.aktivitas_fisik,
                "Preferensi": {
                    "olahraga": newKuesioner.preferensi_olahraga,
                    "membaca": newKuesioner.preferensi_membaca,
                    "journaling": newKuesioner.preferensi_journaling
                }
            };

            // 3. Kirim ke AI
            const hasilAI = await getAIRecommendation(inputAI);

            // 4. Simpan sesi rekomendasi
            const [sesiId] = await db.query(
                "INSERT INTO tb_rekomendasi_sesi (user_id, kuesioner_id, model_type, alasan) VALUES (?, ?, ?, ?)",
                {
                    replacements: [
                        req.userId,
                        kuesionerId,
                        hasilAI.insight.model_type,
                        hasilAI.insight.alasan
                    ],
                    type: QueryTypes.INSERT
                }
            );

            // 5. Simpan rekomendasi utama
            const [aktivitasUtamaId] = await db.query(
                "INSERT INTO tb_rekomendasi_aktivitas (sesi_id, is_utama, aktivitas, confidence, durasi, detail) VALUES (?, ?, ?, ?, ?, ?)",
                {
                    replacements: [
                        sesiId,
                        1,
                        hasilAI.rekomendasi_utama.aktivitas,
                        hasilAI.rekomendasi_utama.confidence,
                        hasilAI.rekomendasi_utama.durasi,
                        hasilAI.rekomendasi_utama.detail
                    ],
                    type: QueryTypes.INSERT
                }
            );

            // 6. Simpan buku jika rekomendasi utama = membaca
            if (hasilAI.rekomendasi_utama.aktivitas === "membaca" && hasilAI.rekomendasi_utama.rekomendasi_buku?.length > 0) {
                for (const buku of hasilAI.rekomendasi_utama.rekomendasi_buku) {
                    await db.query(
                        "INSERT INTO tb_rekomendasi_buku (aktivitas_id, judul, penulis, kategori, thumbnail, deskripsi) VALUES (?, ?, ?, ?, ?, ?)",
                        {
                            replacements: [aktivitasUtamaId, buku.judul, buku.penulis, buku.kategori, buku.thumbnail ?? null, buku.deskripsi ?? null],
                            type: QueryTypes.INSERT
                        }
                    );
                }
            }

            // 7. Simpan alternatif
            for (const alt of hasilAI.alternatif) {
                const [altId] = await db.query(
                    "INSERT INTO tb_rekomendasi_aktivitas (sesi_id, is_utama, aktivitas, confidence, durasi, detail) VALUES (?, ?, ?, ?, ?, ?)",
                    {
                        replacements: [sesiId, 0, alt.aktivitas, alt.confidence, alt.durasi, alt.detail],
                        type: QueryTypes.INSERT
                    }
                );

                if (alt.aktivitas === "membaca" && alt.rekomendasi_buku?.length > 0) {
                    for (const buku of alt.rekomendasi_buku) {
                        await db.query(
                            "INSERT INTO tb_rekomendasi_buku (aktivitas_id, judul, penulis, kategori, thumbnail, deskripsi) VALUES (?, ?, ?, ?, ?, ?)",
                            {
                                replacements: [altId, buku.judul, buku.penulis, buku.kategori, buku.thumbnail ?? null, buku.deskripsi ?? null],
                                type: QueryTypes.INSERT
                            }
                        );
                    }
                }
            }

            // 8. Simpan distribusi probabilitas
            for (const [aktivitas, probabilitas] of Object.entries(hasilAI.insight.distribusi_probabilitas)) {
                await db.query(
                    "INSERT INTO tb_rekomendasi_distribusi (sesi_id, aktivitas, probabilitas) VALUES (?, ?, ?)",
                    {
                        replacements: [sesiId, aktivitas, probabilitas],
                        type: QueryTypes.INSERT
                    }
                );
            }

            // 9. Return semua hasil sekaligus
            return response.success(res, 201, "Kuesioner berhasil disimpan dan rekomendasi berhasil dibuat.", {
                kuesioner: newKuesioner,
                rekomendasi: {
                    sesi_id: sesiId,
                    ...hasilAI
                }
            });

        } catch (error) {
            next(error);
        }
    },

    // ... sisa method tidak berubah
    async getAllKuesionerByUserLogin(req, res, next) {
        try {
            const kuesioner = await db.query(
                "SELECT * FROM tb_kuesioner_hasil WHERE user_id = ? ORDER BY createdAt DESC",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!kuesioner.length) {
                return response.failed(res, 404, "Belum ada data kuesioner.");
            }

            return response.success(res, 200, "Data kuesioner berhasil diambil.", { kuesioner });

        } catch (error) {
            next(error);
        }
    },

    async getAllKuesioner(req, res, next) {
        try {
            const kuesioner = await db.query(
                `SELECT tb_kuesioner_hasil.*, tb_users.name, tb_users.email 
                 FROM tb_kuesioner_hasil 
                 JOIN tb_users ON tb_kuesioner_hasil.user_id = tb_users.id 
                 ORDER BY tb_kuesioner_hasil.createdAt DESC`,
                { type: QueryTypes.SELECT }
            );

            if (!kuesioner.length) {
                return response.failed(res, 404, "Belum ada data kuesioner.");
            }

            return response.success(res, 200, "Data semua kuesioner berhasil diambil.", { kuesioner });

        } catch (error) {
            next(error);
        }
    },

    async getKuesionerById(req, res, next) {
        const { id } = req.params;

        try {
            const [kuesioner] = await db.query(
                "SELECT * FROM tb_kuesioner_hasil WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!kuesioner) {
                return response.failed(res, 404, "Data kuesioner tidak ditemukan.");
            }

            return response.success(res, 200, "Detail kuesioner berhasil diambil.", kuesioner);

        } catch (error) {
            next(error);
        }
    },

    async deleteKuesioner(req, res, next) {
        const { id } = req.params;

        try {
            const [kuesioner] = await db.query(
                "SELECT id FROM tb_kuesioner_hasil WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!kuesioner) {
                return response.failed(res, 404, "Data kuesioner tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_kuesioner_hasil WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.DELETE
                }
            );

            return response.success(res, 200, "Data kuesioner berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    }
};

export default kuesionerController;