import AppError from "./AppError.js";

class NotFoundError extends AppError {
    constructor(message = "Data tidak ditemukan.") {
        super(message, 404);
    }
}

export default NotFoundError;