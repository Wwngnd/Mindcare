import Joi from "joi";

export const stressScanSchema = Joi.object({
    image_base64: Joi.string()
        .required()
        .messages({
            "string.empty": "Gambar wajib diisi.",
            "any.required": "Gambar wajib diisi."
        }),
    image_mimetype: Joi.string()
        .valid("image/jpeg", "image/jpg", "image/png", "image/webp")
        .optional()
        .allow("", null)
        .messages({
            "any.only": "Format gambar harus jpeg, jpg, png, atau webp."
        }),
    image_filename: Joi.string()
        .max(255)
        .optional()
        .allow("", null)
        .messages({
            "string.max": "Nama file maksimal 255 karakter."
        }),

    // ✅ Tambahkan field berikut
    stress_level: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .optional()
        .messages({
            "number.base": "Stress level harus berupa angka.",
            "number.min": "Stress level minimal 1.",
            "number.max": "Stress level maksimal 10."
        }),
    gejala: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            "array.base": "Gejala harus berupa array."
        }),
    pemicu: Joi.string()
        .optional()
        .allow("", null)
        .messages({
            "string.base": "Pemicu harus berupa teks."
        }),
    catatan: Joi.string()
        .optional()
        .allow("", null)
        .messages({
            "string.base": "Catatan harus berupa teks."
        })
});