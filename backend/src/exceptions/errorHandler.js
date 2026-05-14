import response from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);

    if (err.statusCode) {
        return response.failed(res, err.statusCode, err.message);
    }

    if (err.name === "SequelizeUniqueConstraintError") {
        return response.failed(res, 409, "Data sudah terdaftar.");
    }

    if (err.name === "SequelizeValidationError") {
        return response.failed(res, 422, err.errors[0].message);
    }

    if (err.name === "TokenExpiredError") {
        return response.failed(res, 401, "Token kedaluwarsa. Silakan login kembali.");
    }

    if (err.name === "JsonWebTokenError") {
        return response.failed(res, 401, "Token tidak valid.");
    }

    return response.failed(res, 500, "Terjadi kesalahan pada server.");
};

export default errorHandler;