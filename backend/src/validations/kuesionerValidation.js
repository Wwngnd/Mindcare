import Joi from "joi";

export const kuesionerSchema = Joi.object({
    umur: Joi.number().integer().min(10).max(100).required().messages({
        "number.base": "Umur harus berupa angka.",
        "number.min": "Umur minimal 10 tahun.",
        "number.max": "Umur maksimal 100 tahun.",
        "any.required": "Umur wajib diisi."
    }),
    pekerjaan: Joi.string().valid("mahasiswa", "pelajar", "karyawan", "wirausaha").required().messages({
        "any.only": "Pekerjaan hanya boleh: mahasiswa, pelajar, karyawan, wirausaha.",
        "any.required": "Pekerjaan wajib diisi."
    }),
    tingkat_stres: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Tingkat stres minimal 1.",
        "number.max": "Tingkat stres maksimal 5.",
        "any.required": "Tingkat stres wajib diisi."
    }),
    durasi_stres: Joi.number().integer().min(1).required().messages({
        "number.base": "Durasi stres harus berupa angka.",
        "any.required": "Durasi stres wajib diisi."
    }),
    penyebab_stres: Joi.string().valid("akademik", "pekerjaan", "hubungan", "finansial").required().messages({
        "any.only": "Penyebab stres hanya boleh: akademik, pekerjaan, hubungan, finansial.",
        "any.required": "Penyebab stres wajib diisi."
    }),
    kualitas_tidur: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Kualitas tidur minimal 1.",
        "number.max": "Kualitas tidur maksimal 5.",
        "any.required": "Kualitas tidur wajib diisi."
    }),
    waktu_luang: Joi.number().integer().min(1).required().messages({
        "number.base": "Waktu luang harus berupa angka dalam menit.",
        "any.required": "Waktu luang wajib diisi."
    }),
    mood: Joi.number().integer().min(0).max(4).required().messages({
        "number.min": "Mood minimal 0.",
        "number.max": "Mood maksimal 4.",
        "any.required": "Mood wajib diisi."
    }),
    aktivitas_fisik: Joi.string().valid("sering", "jarang").required().messages({
        "any.only": "Aktivitas fisik hanya boleh: sering, jarang.",
        "any.required": "Aktivitas fisik wajib diisi."
    }),
    preferensi_olahraga: Joi.string().valid("ya", "tidak").required().messages({
        "any.only": "Preferensi olahraga hanya boleh: ya, tidak.",
        "any.required": "Preferensi olahraga wajib diisi."
    }),
    preferensi_membaca: Joi.string().valid("ya", "tidak").required().messages({
        "any.only": "Preferensi membaca hanya boleh: ya, tidak.",
        "any.required": "Preferensi membaca wajib diisi."
    }),
    preferensi_journaling: Joi.string().valid("ya", "tidak").required().messages({
        "any.only": "Preferensi journaling hanya boleh: ya, tidak.",
        "any.required": "Preferensi journaling wajib diisi."
    })
});