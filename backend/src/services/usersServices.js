import bcryptjs from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import usersRepository from "../repositories/usersRepository.js";
import ConflictError from "../exceptions/ConflictError.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import ValidationError from "../exceptions/ValidationError.js";

const saveAvatarImage = async (userId, avatar) => {
    if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) return avatar;

    const match = avatar.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/);
    if (!match) throw new ValidationError("Format foto profile tidak valid.");

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const buffer = Buffer.from(match[2], "base64");
    const uploadDir = path.join(process.cwd(), "uploads", "profiles");
    const filename = `profile-${userId}-${Date.now()}.${ext}`;

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return `/uploads/profiles/${filename}`;
};

const usersService = {
    async register(payload) {
        const { name, email, password, confPassword, avatar, jenis_kelamin, umur, pekerjaan, role } = payload;

        if (password !== confPassword) {
            throw new ValidationError("Password dan confirm password tidak cocok.");
        }

        const existingUser = await usersRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("Email sudah terdaftar. Gunakan email lain.");
        }

        const hashPassword = await bcryptjs.hash(password, 12);

        return usersRepository.create({
            name,
            email,
            password: hashPassword,
            jenis_kelamin: jenis_kelamin ?? null,
            umur: umur ?? null,
            pekerjaan: pekerjaan ?? null,
            avatar,
            role: role ?? 'user'
        });
    },

    async deleteUser(id) {
        const user = await usersRepository.findById(id);
        if (!user) throw new NotFoundError("User tidak ditemukan.");

        await usersRepository.deleteById(id);
    },

    async updateProfile(id, payload) {
        const updateData = {};

        if (Object.prototype.hasOwnProperty.call(payload, "name")) {
            updateData.name = payload.name;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "umur")) {
            updateData.umur = payload.umur;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "pekerjaan")) {
            updateData.pekerjaan = payload.pekerjaan;
        }

        const user = await usersRepository.findById(id);
        if (!user) throw new NotFoundError("User tidak ditemukan.");

        if (Object.prototype.hasOwnProperty.call(payload, "avatar")) {
            updateData.avatar = await saveAvatarImage(id, payload.avatar);
        }

        if (!Object.keys(updateData).length) {
            throw new ValidationError("Tidak ada data yang diupdate.");
        }

        return usersRepository.updateProfile(id, updateData);
    },

    async deleteAccount(id) {
        const user = await usersRepository.findById(id);
        if (!user) throw new NotFoundError("User tidak ditemukan.");

        await usersRepository.deleteById(id);
    }
};

export default usersService;
