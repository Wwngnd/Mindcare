import AppError from "./AppError.js";

class ConflictError extends AppError {
    constructor(message = "Data sudah terdaftar.") {
        super(message, 409);
    }
}

export default ConflictError;