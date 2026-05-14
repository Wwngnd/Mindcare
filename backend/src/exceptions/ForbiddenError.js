import AppError from "./AppError.js";

class ForbiddenError extends AppError {
    constructor(message = "Akses ditolak. Anda tidak memiliki izin.") {
        super(message, 403);
    }
}

export default ForbiddenError;