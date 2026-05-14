import bcryptjs from "bcryptjs";
import authRepository from "../repositories/authRepository.js";
import jwtUtils from "../utils/jwtUtils.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import UnauthorizedError from "../exceptions/UnauthorizedError.js";
import ForbiddenError from "../exceptions/ForbiddenError.js";

const authService = {
    async login(email, password) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new NotFoundError("Email tidak ditemukan.");

        const match = await bcryptjs.compare(password, user.password);
        if (!match) throw new UnauthorizedError("Password salah.");

        const payload = { userId: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = jwtUtils.generateAccessToken(payload);
        const refreshToken = jwtUtils.generateRefreshToken(payload);

        await authRepository.saveRefreshToken(user.id, refreshToken);

        return { user, accessToken, refreshToken };
    },

    async refreshToken(token) {
        const auth = await authRepository.findAuthByToken(token);
        if (!auth) throw new ForbiddenError("Refresh token tidak valid.");

        try {
            jwtUtils.verifyRefreshToken(token);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ForbiddenError("Refresh token kedaluwarsa. Silakan login kembali.");
            }
            throw new ForbiddenError("Refresh token tidak valid.");
        }

        const payload = { userId: auth.userId, name: auth.name, email: auth.email, role: auth.role };
        return jwtUtils.generateAccessToken(payload);
    },

    async logout(token) {
        const auth = await authRepository.findAuthByToken(token);
        if (!auth) throw new NotFoundError("Sesi tidak ditemukan.");
        await authRepository.deleteAuthById(auth.id);
    },

    async getUserByToken(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) throw new NotFoundError("User tidak ditemukan.");
        return user;
    },

    async getAllUsers() {
        const users = await authRepository.findAllUsers();
        if (!users.length) throw new NotFoundError("Belum ada user terdaftar.");
        return users;
    },

    async getUserById(id) {
        const user = await authRepository.findUserById(id);
        if (!user) throw new NotFoundError("User tidak ditemukan.");
        return user;
    },

    async deleteUser(id) {
        const user = await authRepository.findUserById(id);
        if (!user) throw new NotFoundError("User tidak ditemukan.");
        await authRepository.deleteUserById(id);
    }
};

export default authService;