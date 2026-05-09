import response from "../utils/response.js";

const verifyAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        return response.failed(res, 403, "Akses ditolak. Hanya admin yang diizinkan.");
    }
    next();
};

export default verifyAdmin;