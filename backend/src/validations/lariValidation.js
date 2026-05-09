import Joi from "joi";

export const lariSchema = Joi.object({
    jarak_km: Joi.number().positive().required().messages({
        "number.base": "Jarak harus berupa angka.",
        "number.positive": "Jarak harus lebih dari 0.",
        "any.required": "Jarak wajib diisi."
    }),
    durasi_menit: Joi.number().integer().positive().required().messages({
        "number.base": "Durasi harus berupa angka.",
        "number.positive": "Durasi harus lebih dari 0.",
        "any.required": "Durasi wajib diisi."
    }),
    rute_maps: Joi.array().default([]).messages({
        "array.base": "Rute maps harus berupa array."
    }),
    tanggal: Joi.date().required().messages({
        "date.base": "Format tanggal tidak valid.",
        "any.required": "Tanggal wajib diisi."
    })
});