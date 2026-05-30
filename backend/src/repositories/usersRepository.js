import db from "../config/Database.js";
import { QueryTypes } from "sequelize";

const userSelectFields = "id, name, email, role, avatar, jenis_kelamin, umur, pekerjaan, createdAt";

const usersRepository = {
    async findByEmail(email) {
        const [user] = await db.query(
            "SELECT id, email FROM tb_users WHERE email = ? LIMIT 1",
            { replacements: [email], type: QueryTypes.SELECT }
        );
        return user;
    },

    async findById(id) {
        const [user] = await db.query(
            `SELECT ${userSelectFields} FROM tb_users WHERE id = ? LIMIT 1`,
            { replacements: [id], type: QueryTypes.SELECT }
        );
        return user;
    },

    async create({ name, email, password, role = 'user', avatar = null, jenis_kelamin = null, umur = null, pekerjaan = null }) {
        const [id] = await db.query(
            "INSERT INTO tb_users (name, email, password, role, avatar, jenis_kelamin, umur, pekerjaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            {
                replacements: [name, email, password, role, avatar, jenis_kelamin, umur, pekerjaan],
                type: QueryTypes.INSERT
            }
        );

        return this.findById(id);
    },

    async updateProfile(id, data) {
        const fields = [];
        const values = [];

        if (Object.prototype.hasOwnProperty.call(data, "name")) {
            fields.push("name = ?");
            values.push(data.name);
        }

        if (Object.prototype.hasOwnProperty.call(data, "avatar")) {
            fields.push("avatar = ?");
            values.push(data.avatar);
        }

        if (Object.prototype.hasOwnProperty.call(data, "umur")) {
            fields.push("umur = ?");
            values.push(data.umur);
        }

        if (Object.prototype.hasOwnProperty.call(data, "pekerjaan")) {
            fields.push("pekerjaan = ?");
            values.push(data.pekerjaan);
        }

        values.push(id);

        await db.query(
            `UPDATE tb_users SET ${fields.join(", ")} WHERE id = ?`,
            { replacements: values, type: QueryTypes.UPDATE }
        );

        return this.findById(id);
    },

    async deleteById(id) {
        await db.query(
            "DELETE FROM tb_users WHERE id = ?",
            { replacements: [id], type: QueryTypes.DELETE }
        );
    }
};

export default usersRepository;
