import AppError from "./AppError.js";

class ValidationError extends AppError {
    constructor(message = "Validasi gagal.") {
        super(message, 422);
    }
}

export default ValidationError;