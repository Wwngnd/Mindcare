import Joi from "joi";

export const journalSchema = Joi.object({
    judul: Joi.string().max(255).required().messages({
        "string.empty": "Judul tidak boleh kosong.",
        "string.max": "Judul maksimal 255 karakter.",
        "any.required": "Judul wajib diisi."
    }),
    deskripsi: Joi.string().required().messages({
        "string.empty": "Isi journal tidak boleh kosong.",
        "any.required": "Isi journal wajib diisi."
    })
});