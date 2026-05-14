import db from "../config/Database.js";
import { QueryTypes } from "sequelize";

const authRepository = {
    async findUserByEmail(email) {
        const [user] = await db.query(
            "SELECT id, name, email, password, role FROM tb_users WHERE email = ? LIMIT 1",
            { replacements: [email], type: QueryTypes.SELECT }
        );
        return user;
    },

    async findUserById(id) {
        const [user] = await db.query(
            "SELECT id, name, email, role, avatar, createdAt FROM tb_users WHERE id = ? LIMIT 1",
            { replacements: [id], type: QueryTypes.SELECT }
        );
        return user;
    },

    async findAllUsers() {
        return await db.query(
            "SELECT id, name, email, role, avatar, createdAt FROM tb_users ORDER BY createdAt DESC",
            { type: QueryTypes.SELECT }
        );
    },

    async deleteUserById(id) {
        await db.query(
            "DELETE FROM tb_users WHERE id = ?",
            { replacements: [id], type: QueryTypes.DELETE }
        );
    },

    async saveRefreshToken(userId, token) {
        await db.query(
            "INSERT INTO tb_authentications (user_id, token) VALUES (?, ?)",
            { replacements: [userId, token], type: QueryTypes.INSERT }
        );
    },

    async findAuthByToken(token) {
        const [auth] = await db.query(
            `SELECT tb_authentications.id, tb_users.id as userId, 
             tb_users.name, tb_users.email, tb_users.role 
             FROM tb_authentications 
             JOIN tb_users ON tb_authentications.user_id = tb_users.id 
             WHERE tb_authentications.token = ? LIMIT 1`,
            { replacements: [token], type: QueryTypes.SELECT }
        );
        return auth;
    },

    async deleteAuthById(id) {
        await db.query(
            "DELETE FROM tb_authentications WHERE id = ?",
            { replacements: [id], type: QueryTypes.DELETE }
        );
    }
};

export default authRepository;