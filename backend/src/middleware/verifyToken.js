import jwtUtils from "../utils/jwtUtils.js";
import response from "../utils/response.js";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return response.failed(res, 401, "Akses ditolak. Token tidak ditemukan.");
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwtUtils.verifyAccessToken(token);
        req.userId = decoded.userId;
        req.name = decoded.name;
        req.email = decoded.email;
        req.role = decoded.role;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return response.failed(res, 401, "Access token kedaluwarsa. Silakan refresh token.");
        }
        return response.failed(res, 403, "Token tidak valid.");
    }
};

export default verifyToken;