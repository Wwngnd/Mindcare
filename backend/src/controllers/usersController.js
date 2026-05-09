import db from "../config/Database.js";
import response from "../utils/response.js";
import bcryptjs from "bcryptjs";
import { QueryTypes } from "sequelize";

const usersController = {
    async Register(req, res, next) {
        const { name, email, password, confPassword, role = "user" } = req.body;

        try {
            if (!name || !email || !password || !confPassword) {
                return response.failed(res, 400, "Semua field wajib diisi.");
            }

            const existingUser = await db.query(
                "SELECT id FROM tb_users WHERE email = ? LIMIT 1",
                {
                    replacements: [email],
                    type: QueryTypes.SELECT
                }
            );

            if (existingUser.length > 0) {
                return response.failed(res, 409, "Email sudah terdaftar. Gunakan email lain.");
            }

            if (password !== confPassword) {
                return response.failed(res, 400, "Password dan confirm password tidak cocok.");
            }

            const salt = await bcryptjs.genSalt(12);
            const hashPassword = await bcryptjs.hash(password, salt);

            const [result] = await db.query(
                "INSERT INTO tb_users (name, email, password) VALUES (?, ?, ?)",
                {
                    replacements: [name, email, hashPassword],
                    type: QueryTypes.INSERT
                }
            );

            const [newUser] = await db.query(
                "SELECT id, name, email, createdAt FROM tb_users WHERE id = ?",
                {
                    replacements: [result],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 201, "Registrasi berhasil! Silakan login.", newUser);

        } catch (error) {
            return response.failed(res, 500, error.message);
        }
    },
    async deleteUser(req, res, next) {
        const { id } = req.params;

        try {
            const [user] = await db.query(
                "SELECT id FROM tb_users WHERE id = ? LIMIT 1",
                {
                    replacements: [id],
                    type: QueryTypes.SELECT
                }
            );

            if (!user) {
                return response.failed(res, 404, "User tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_users WHERE id = ?",
                {
                    replacements: [id],
                    type: QueryTypes.DELETE
                }
            );

            return response.success(res, 200, "User berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    },
    async updateProfile(req, res, next) {
        const { name, avatar } = req.body;

        try {
            const fields = [];
            const values = [];

            if (name !== undefined) {
                fields.push("name = ?");
                values.push(name);
            }

            if (avatar !== undefined) {
                fields.push("avatar = ?");
                values.push(avatar);
            }

            if (!fields.length) {
                return response.failed(res, 400, "Tidak ada data yang diupdate.");
            }

            values.push(req.userId);

            await db.query(
                `UPDATE tb_users SET ${fields.join(", ")} WHERE id = ?`,
                {
                    replacements: values,
                    type: QueryTypes.UPDATE
                }
            );

            const [updatedUser] = await db.query(
                "SELECT id, name, email, avatar, createdAt FROM tb_users WHERE id = ?",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            return response.success(res, 200, "Profil berhasil diupdate.", updatedUser);

        } catch (error) {
            next(error);
        }
    },

    async deleteAccount(req, res, next) {
        try {
            await db.query(
                "DELETE FROM tb_users WHERE id = ?",
                {
                    replacements: [req.userId],
                    type: QueryTypes.DELETE
                }
            );

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return response.success(res, 200, "Akun berhasil dihapus.");

        } catch (error) {
            next(error);
        }
    }
}

export default usersController;