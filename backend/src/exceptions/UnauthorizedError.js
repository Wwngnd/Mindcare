import AppError from "./AppError.js";

class UnauthorizedError extends AppError {
    constructor(message = "Akses ditolak. Silakan login.") {
        super(message, 401);
    }
}

export default UnauthorizedError;