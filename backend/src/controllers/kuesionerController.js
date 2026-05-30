import kuesionerServices from "../services/kuesionerServices.js";
import response from "../utils/response.js";

const kuesionerController = {

    /**
     * POST /kuesioner
     * Menyimpan jawaban kuesioner, memanggil AI, dan mengembalikan rekomendasi.
     */
    async createKuesioner(req, res, next) {
        try {
            const result = await kuesionerServices.createKuesionerWithRekomendasi(
                req.userId,
                req.body
            );
            return response.success(res, 201, "Kuesioner berhasil disimpan dan rekomendasi berhasil dibuat.", result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /kuesioner/rekomendasi
     * Mengambil riwayat rekomendasi yang sudah tersimpan di database.
     */
    async getAllRekomendasiByUserLogin(req, res, next) {
        try {
            const rekomendasiHistory = await kuesionerServices.getAllStoredRekomendasiByUser(req.userId);
            return response.success(res, 200, "Riwayat rekomendasi berhasil diambil.", {
                rekomendasi: rekomendasiHistory.sesi,
                rekomendasi_buku: rekomendasiHistory.rekomendasi_buku
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /kuesioner/rekomendasi/:sesiId
     * Mengambil detail hasil rekomendasi yang tersimpan berdasarkan sesi_id.
     */
    async getRekomendasiBySesiId(req, res, next) {
        try {
            const rekomendasi = await kuesionerServices.getStoredRekomendasiBySesi(
                req.userId,
                req.params.sesiId
            );
            return response.success(res, 200, "Detail rekomendasi berhasil diambil.", rekomendasi);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /kuesioner/me
     * Mengambil semua kuesioner milik user yang sedang login.
     */
    async getAllKuesionerByUserLogin(req, res, next) {
        try {
            const kuesioner = await kuesionerServices.getAllKuesionerByUser(req.userId);
            return response.success(res, 200, "Data kuesioner berhasil diambil.", { kuesioner });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /kuesioner/all  (admin only)
     * Mengambil semua kuesioner dari seluruh user.
     */
    async getAllKuesioner(req, res, next) {
        try {
            const kuesioner = await kuesionerServices.getAllKuesioner();
            return response.success(res, 200, "Data semua kuesioner berhasil diambil.", { kuesioner });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /kuesioner/all/:id  (admin only)
     * Mengambil detail satu kuesioner berdasarkan ID.
     */
    async getKuesionerById(req, res, next) {
        try {
            const kuesioner = await kuesionerServices.getKuesionerById(req.params.id, req.userId);
            return response.success(res, 200, "Detail kuesioner berhasil diambil.", kuesioner);
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * DELETE /kuesioner/:id
     * Menghapus kuesioner milik user berdasarkan ID.
     */
    async deleteKuesioner(req, res, next) {
        try {
            await kuesionerServices.deleteKuesioner(req.params.id, req.userId);
            return response.success(res, 200, "Data kuesioner berhasil dihapus.");
        } catch (error) {
            next(error);
        }
    }
};

export default kuesionerController;
