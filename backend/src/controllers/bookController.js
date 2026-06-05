import bookServices from "../services/bookServices.js";
import response from "../utils/response.js";

const bookController = {
    async proxyBookCover(req, res, next) {
        try {
            const cover = await bookServices.fetchBookCover(req.query.url);
            res.setHeader("Content-Type", cover.contentType);
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.status(200).send(cover.buffer);
        } catch (error) {
            next(error);
        }
    },

    async getGeneralBooks(req, res, next) {
        try {
            const books = await bookServices.getGeneralBookRecommendations(req.query.limit);
            return response.success(res, 200, "Rekomendasi buku umum berhasil diambil.", { books });
        } catch (error) {
            next(error);
        }
    },

    async createBookSession(req, res, next) {
        try {
            const session = await bookServices.createBookSession(req.userId, req.body);
            return response.success(res, 201, "Sesi eksplorasi buku berhasil disimpan.", { session });
        } catch (error) {
            next(error);
        }
    },

    async getAllBookSessionsByUserLogin(req, res, next) {
        try {
            const sessions = await bookServices.getAllBookSessionsByUserLogin(req.userId);
            return response.success(res, 200, "Riwayat sesi buku berhasil diambil.", { sessions });
        } catch (error) {
            next(error);
        }
    },

    async createBookRead(req, res, next) {
        try {
            const read = await bookServices.createBookRead(req.userId, req.body);
            return response.success(res, 201, "Riwayat buku dibuka berhasil disimpan.", { read });
        } catch (error) {
            next(error);
        }
    },

    async getAllBookReadsByUserLogin(req, res, next) {
        try {
            const reads = await bookServices.getAllBookReadsByUserLogin(req.userId);
            return response.success(res, 200, "Riwayat buku dibuka berhasil diambil.", { reads });
        } catch (error) {
            next(error);
        }
    }
};

export default bookController;
