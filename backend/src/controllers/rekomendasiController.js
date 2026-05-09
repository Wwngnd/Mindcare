import db from "../config/Database.js";
import { QueryTypes } from "sequelize";
import response from "../utils/response.js";
import { getAIRecommendation } from "../helper/predictionHelper.js";

const rekomendasiController = {
    async createRekomendasi(req, res, next) {
        const { kuesioner_id } = req.body;

        try {
            // 1. Ambil data kuesioner milik user
            const [kuesioner] = await db.query(
                "SELECT * FROM tb_kuesioner_hasil WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [kuesioner_id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!kuesioner) {
                return response.failed(res, 404, "Data kuesioner tidak ditemukan.");
            }

            // 2. Format data sesuai input AI
            const inputAI = {
                "Umur": kuesioner.umur,
                "Pekerjaan": kuesioner.pekerjaan,
                "Tingkat stres": kuesioner.tingkat_stres,
                "Penyebab stres": kuesioner.penyebab_stres,
                "Durasi stres": kuesioner.durasi_stres,
                "Kualitas tidur": kuesioner.kualitas_tidur,
                "Waktu luang per hari": kuesioner.waktu_luang,
                "Aktivitas fisik": kuesioner.aktivitas_fisik,
                "Preferensi": {
                    "olahraga": kuesioner.preferensi_olahraga,
                    "membaca": kuesioner.preferensi_membaca,
                    "journaling": kuesioner.preferensi_journaling
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
                        kuesioner_id,
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

                // Simpan buku jika alternatif = membaca
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

            // 9. Return hasil lengkap
            return response.success(res, 201, "Rekomendasi berhasil dibuat.", {
                sesi_id: sesiId,
                ...hasilAI
            });

        } catch (error) {
            next(error);
        }
    },

    async getRekomendasiByUserLogin(req, res, next) {
        try {
            const sesi = await db.query(
                `SELECT tb_rekomendasi_sesi.*, 
                        tb_kuesioner_hasil.tingkat_stres, 
                        tb_kuesioner_hasil.penyebab_stres
                 FROM tb_rekomendasi_sesi
                 JOIN tb_kuesioner_hasil ON tb_rekomendasi_sesi.kuesioner_id = tb_kuesioner_hasil.id
                 WHERE tb_rekomendasi_sesi.user_id = ?
                 ORDER BY tb_rekomendasi_sesi.createdAt DESC`,
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!sesi.length) {
                return response.failed(res, 404, "Belum ada riwayat rekomendasi.");
            }

            return response.success(res, 200, "Riwayat rekomendasi berhasil diambil.", { sesi });

        } catch (error) {
            next(error);
        }
    },

    async getRekomendasiById(req, res, next) {
        const { id } = req.params;

        try {
            const [sesi] = await db.query(
                "SELECT * FROM tb_rekomendasi_sesi WHERE id = ? AND user_id = ? LIMIT 1",
                {
                    replacements: [id, req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!sesi) {
                return response.failed(res, 404, "Data rekomendasi tidak ditemukan.");
            }

            const aktivitas = await db.query(
                "SELECT * FROM tb_rekomendasi_aktivitas WHERE sesi_id = ?",
                {
                    replacements: [sesi.id],
                    type: QueryTypes.SELECT
                }
            );

            for (const item of aktivitas) {
                if (item.aktivitas === "membaca") {
                    item.buku = await db.query(
                        "SELECT * FROM tb_rekomendasi_buku WHERE aktivitas_id = ?",
                        {
                            replacements: [item.id],
                            type: QueryTypes.SELECT
                        }
                    );
                }
            }

            const distribusi = await db.query(
                "SELECT aktivitas, probabilitas FROM tb_rekomendasi_distribusi WHERE sesi_id = ?",
                {
                    replacements: [sesi.id],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 200, "Detail rekomendasi berhasil diambil.", {
                ...sesi,
                aktivitas,
                distribusi
            });

        } catch (error) {
            next(error);
        }
    },

    async getAllRekomendasi(req, res, next) {
        try {
            const sesi = await db.query(
                `SELECT tb_rekomendasi_sesi.*, tb_users.name, tb_users.email
                 FROM tb_rekomendasi_sesi
                 JOIN tb_users ON tb_rekomendasi_sesi.user_id = tb_users.id
                 ORDER BY tb_rekomendasi_sesi.createdAt DESC`,
                { type: QueryTypes.SELECT }
            );

            if (!sesi.length) {
                return response.failed(res, 404, "Belum ada data rekomendasi.");
            }

            return response.success(res, 200, "Semua data rekomendasi berhasil diambil.", { sesi });

        } catch (error) {
            next(error);
        }
    }
};

export default rekomendasiController;