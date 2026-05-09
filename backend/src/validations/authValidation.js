import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
            "string.empty": "Nama tidak boleh kosong.",
            "string.min": "Nama minimal 2 karakter.",
            "string.max": "Nama maksimal 255 karakter.",
            "any.required": "Nama wajib diisi."
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(255)
        .required()
        .messages({
            "string.empty": "Email tidak boleh kosong.",
            "string.email": "Format email tidak valid.",
            "string.max": "Email maksimal 255 karakter.",
            "any.required": "Email wajib diisi."
        }),

    password: Joi.string()
        .min(8)
        .max(255)
        .required()
        .messages({
            "string.empty": "Password tidak boleh kosong.",
            "string.min": "Password minimal 8 karakter.",
            "string.max": "Password maksimal 255 karakter.",
            "any.required": "Password wajib diisi."
        }),

    confPassword: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Password dan confirm password tidak cocok.",
            "any.required": "Confirm password wajib diisi."
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.empty": "Email tidak boleh kosong.",
            "string.email": "Format email tidak valid.",
            "any.required": "Email wajib diisi."
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password tidak boleh kosong.",
            "any.required": "Password wajib diisi."
        })
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional().allow(null).messages({
        "string.empty": "Nama tidak boleh kosong.",
        "string.min": "Nama minimal 2 karakter."
    }),
    avatar: Joi.number().integer().optional().allow(null).messages({
        "number.base": "Avatar harus berupa angka."
    })
});