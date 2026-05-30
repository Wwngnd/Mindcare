import Joi from "joi";

const allowedJobs = ["mahasiswa", "pelajar", "karyawan", "wirausaha"];

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
        }),

    jenis_kelamin: Joi.string().valid("laki-laki", "perempuan").optional().messages({
        "any.only": "Hanya ada laki-laki dan perempuan"
    }),

    umur: Joi.number()
        .integer()
        .min(1)
        .max(120)
        .optional()
        .allow(null)
        .messages({
            "number.base": "Umur harus berupa angka.",
            "number.integer": "Umur harus berupa angka bulat.",
            "number.min": "Umur minimal 1 tahun.",
            "number.max": "Umur maksimal 120 tahun."
        }),

    pekerjaan: Joi.string()
        .valid(...allowedJobs)
        .optional()
        .allow(null, "")
        .messages({
            "any.only": "Pekerjaan hanya boleh mahasiswa, pelajar, karyawan, atau wirausaha."
        }),

    avatar: Joi.string()
        .max(2000000)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "Avatar maksimal 2MB."
        }),
    role: Joi.string().valid("user", "admin").optional().messages({
        "any.only": "Hanya ada admin dan user"
    })
})

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
    avatar: Joi.string().max(2000000).optional().allow(null, "").messages({
        "string.max": "Avatar maksimal 2MB."
    }),
    umur: Joi.number().integer().min(1).max(120).optional().allow(null).messages({
        "number.base": "Umur harus berupa angka.",
        "number.integer": "Umur harus berupa angka bulat.",
        "number.min": "Umur minimal 1 tahun.",
        "number.max": "Umur maksimal 120 tahun."
    }),
    pekerjaan: Joi.string().valid(...allowedJobs).optional().allow(null, "").messages({
        "any.only": "Pekerjaan hanya boleh mahasiswa, pelajar, karyawan, atau wirausaha."
    }),
    password: Joi.string().min(6).max(255).optional().allow(null, "").messages({
        "string.min": "Password minimal 6 karakter.",
        "string.max": "Password maksimal 255 karakter."
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).optional().allow(null, "").messages({
        "any.only": "Password dan confirm password tidak cocok."
    })
}).custom((value, helpers) => {
    // Validasi khusus: jika password diisi, confirmPassword harus diisi juga
    if (value.password && !value.confirmPassword) {
        return helpers.error("any.required", { message: "Confirm password harus diisi jika password diubah." });
    }
    return value;
});
