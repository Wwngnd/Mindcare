import Joi from "joi";

export const stressScanSchema = Joi.object({
    tingkat_stres: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": "Tingkat stres harus berupa angka.",
        "number.min": "Tingkat stres minimal 1.",
        "number.max": "Tingkat stres maksimal 5.",
        "any.required": "Tingkat stres wajib diisi."
    }),
    keterangan: Joi.string().max(50).required().messages({
        "string.empty": "Keterangan tidak boleh kosong.",
        "string.max": "Keterangan maksimal 50 karakter.",
        "any.required": "Keterangan wajib diisi."
    }),
    mood: Joi.number().integer().min(0).max(4).required().messages({
        "number.base": "Mood harus berupa angka.",
        "number.min": "Mood minimal 0.",
        "number.max": "Mood maksimal 4.",
        "any.required": "Mood wajib diisi."
    }),
    keterangan_mood: Joi.string().max(50).required().messages({
        "string.empty": "Keterangan mood tidak boleh kosong.",
        "string.max": "Keterangan mood maksimal 50 karakter.",
        "any.required": "Keterangan mood wajib diisi."
    })
});