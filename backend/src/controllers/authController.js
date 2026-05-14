import authService from "../services/authServices.js";
import response from "../utils/response.js";

const authController = {
    async getUserByToken(req, res, next) {
        try {
            const user = await authService.getUserByToken(req.userId);
            return response.success(res, 200, "Data user berhasil diambil.", { user });
        } catch (error) {
            next(error);
        }
    },

    async Login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await authService.login(email, password);

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
                token: { accessToken }
            });
        } catch (error) {
            next(error);
        }
    },

    async RefreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) return response.failed(res, 401, "Refresh token tidak ditemukan. Silakan login.");

            const accessToken = await authService.refreshToken(refreshToken);
            return response.success(res, 200, "Access token berhasil diperbarui.", { accessToken });
        } catch (error) {
            next(error);
        }
    },

    async Logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) return response.failed(res, 401, "Anda belum login.");

            await authService.logout(refreshToken);

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

    async getAllUsers(req, res, next) {
        try {
            const users = await authService.getAllUsers();
            return response.success(res, 200, "Data semua user berhasil diambil.", { users });
        } catch (error) {
            next(error);
        }
    },

    async getUserById(req, res, next) {
        try {
            const user = await authService.getUserById(req.params.id);
            return response.success(res, 200, "Data user berhasil diambil.", user);
        } catch (error) {
            next(error);
        }
    },

    async deleteUser(req, res, next) {
        try {
            await authService.deleteUser(req.params.id);
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
            return response.success(res, 200, "User berhasil dihapus.");
        } catch (error) {
            next(error);
        }
    }
};

export default authController;