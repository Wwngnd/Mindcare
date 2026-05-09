import db from "../config/Database.js";
import bcryptjs from "bcryptjs";
import { QueryTypes } from "sequelize";
import response from "../utils/response.js";
import jwtUtils from "../utils/jwtUtils.js";

const authController = {
    async getUserByToken(req, res, next) {
        try {
            const [user] = await db.query(
                "SELECT id, name, email, avatar, role, createdAt FROM tb_users WHERE id = ? LIMIT 1",
                {
                    replacements: [req.userId],
                    type: QueryTypes.SELECT
                }
            );

            if (!user) {
                return response.failed(res, 404, "User tidak ditemukan.");
            }

            return response.success(res, 200, "Data user berhasil diambil.", { user });

        } catch (error) {
            next(error);
        }
    },

    async Login(req, res, next) {
        const { email, password } = req.body;

        try {
            const [user] = await db.query(
                "SELECT id, name, email, password, role FROM tb_users WHERE email = ? LIMIT 1",
                {
                    replacements: [email],
                    type: QueryTypes.SELECT
                }
            );

            if (!user) {
                return response.failed(res, 404, "Email tidak ditemukan.");
            }

            const match = await bcryptjs.compare(password, user.password);
            if (!match) {
                return response.failed(res, 401, "Password salah.");
            }

            const payload = { userId: user.id, name: user.name, email: user.email, role: user.role };
            const accessToken = jwtUtils.generateAccessToken(payload);
            const refreshToken = jwtUtils.generateRefreshToken(payload);

            await db.query(
                "INSERT INTO tb_authentications (user_id, token) VALUES (?, ?)",
                {
                    replacements: [user.id, refreshToken],
                    type: QueryTypes.INSERT
                }
            );

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            });

            return response.success(res, 200, "Login berhasil!", {
                id: user.id,
                name: user.name,
                email: user.email,
                token: { accessToken, refreshToken }
            });

        } catch (error) {
            next(error);
        }
    },

    async RefreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return response.failed(res, 401, "Refresh token tidak ditemukan. Silakan login.");
            }

            const [auth] = await db.query(
                "SELECT tb_authentications.id, tb_users.id as userId, tb_users.name, tb_users.email, tb_users.role FROM tb_authentications JOIN tb_users ON tb_authentications.user_id = tb_users.id WHERE tb_authentications.token = ? LIMIT 1",
                {
                    replacements: [refreshToken],
                    type: QueryTypes.SELECT
                }
            );

            if (!auth) {
                return response.failed(res, 403, "Refresh token tidak valid.");
            }

            try {
                jwtUtils.verifyRefreshToken(refreshToken);
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    return response.failed(res, 403, "Refresh token kedaluwarsa. Silakan login kembali.");
                }
                return response.failed(res, 403, "Refresh token tidak valid.");
            }

            const payload = { userId: auth.userId, name: auth.name, email: auth.email, role: auth.role };
            const accessToken = jwtUtils.generateAccessToken(payload);

            return response.success(res, 200, "Access token berhasil diperbarui.", { accessToken });

        } catch (error) {
            next(error);
        }
    },

    async getAllUsers(req, res, next) {
        try {
            const users = await db.query(
                "SELECT id, name, email, role, avatar, createdAt FROM tb_users ORDER BY createdAt DESC",
                { type: QueryTypes.SELECT }
            );

            if (!users.length) {
                return response.failed(res, 404, "Belum ada user terdaftar.");
            }

            return response.success(res, 200, "Data semua user berhasil diambil.", { users });

        } catch (error) {
            next(error);
        }
    },

    async getUserById(req, res, next) {
        const { id } = req.params;

        try {
            const [user] = await db.query(
                "SELECT id, name, email, role, avatar, createdAt FROM tb_users WHERE id = ? LIMIT 1",
                {
                    replacements: [id],
                    type: QueryTypes.SELECT
                }
            );

            if (!user) {
                return response.failed(res, 404, "User tidak ditemukan.");
            }

            return response.success(res, 200, "Data user berhasil diambil.", user);

        } catch (error) {
            next(error);
        }
    },

    async Logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return response.failed(res, 401, "Anda belum login.");
            }

            const [auth] = await db.query(
                "SELECT id FROM tb_authentications WHERE token = ? LIMIT 1",
                {
                    replacements: [refreshToken],
                    type: QueryTypes.SELECT
                }
            );

            if (!auth) {
                return response.failed(res, 404, "Sesi tidak ditemukan.");
            }

            await db.query(
                "DELETE FROM tb_authentications WHERE id = ?",
                {
                    replacements: [auth.id],
                    type: QueryTypes.DELETE
                }
            );

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return response.success(res, 200, "Logout berhasil.");

        } catch (error) {
            next(error);
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
    }
};

export default authController;