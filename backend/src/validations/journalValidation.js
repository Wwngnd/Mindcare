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
    }),
    durasi: Joi.number().integer().min(0).max(255).required().messages({
        "number.empty": "Durasi tidak boleh kosong.",
        "number.base": "Durasi harus berupa angka.",
        "number.integer": "Durasi harus berupa bilangan bulat.",
        "number.min": "Durasi minimal 0 menit.",
        "number.max": "Durasi maksimal 255 menit.",
        "any.required": "Durasi wajib diisi."
    })
});

export const updateJournalSchema = Joi.object({
    judul: Joi.string().max(255).messages({
        "string.empty": "Judul tidak boleh kosong.",
        "string.max": "Judul maksimal 255 karakter."
    }),
    deskripsi: Joi.string().messages({
        "string.empty": "Isi journal tidak boleh kosong."
    }),
    durasi: Joi.number().integer().min(0).max(255).messages({
        "number.base": "Durasi harus berupa angka.",
        "number.integer": "Durasi harus berupa bilangan bulat.",
        "number.min": "Durasi minimal 0 menit.",
        "number.max": "Durasi maksimal 255 menit."
    })
});
