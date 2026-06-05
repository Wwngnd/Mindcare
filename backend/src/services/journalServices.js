import NotFoundError from "../exceptions/NotFoundError.js";
import ValidationError from "../exceptions/ValidationError.js";
import journalRepository from "../repositories/journalRepository.js";
import stressProgressServices from "./stressProgressServices.js";

const formatCreatedJournal = (journal) => ({
    id: journal.id,
    user_id: journal.user_id,
    journal: {
        judul: journal.judul,
        deskripsi: journal.deskripsi,
        durasi: journal.durasi
    }
});

const journalService = {
    async createJournal(userId, payload) {
        const journal = await journalRepository.create(userId, payload);
        const stressProgress = await stressProgressServices.applyActivityReduction(userId, {
            activity: "journaling",
            durationMinutes: journal.durasi,
            sourceType: "journal",
            sourceId: journal.id
        });

        return {
            ...formatCreatedJournal(journal),
            stress_progress: stressProgress
        };
    },

    async getAllJournalByUserLogin(userId) {
        const journals = await journalRepository.findAllByUserId(userId);
        if (!journals.length) throw new NotFoundError("Belum ada journal.");

        return journals;
    },

    async getAllJournal() {
        const journals = await journalRepository.findAll();
        if (!journals.length) throw new NotFoundError("Belum ada journal.");

        return journals;
    },

    async getJournalById(id) {
        const journal = await journalRepository.findById(id);
        if (!journal) throw new NotFoundError("Journal tidak ditemukan.");

        return journal;
    },

    async updateJournal(id, userId, payload) {
        const journal = await journalRepository.findByIdAndUserId(id, userId);
        if (!journal) throw new NotFoundError("Journal tidak ditemukan.");

        const updateData = {};
        if (Object.prototype.hasOwnProperty.call(payload, "judul")) updateData.judul = payload.judul;
        if (Object.prototype.hasOwnProperty.call(payload, "deskripsi")) updateData.deskripsi = payload.deskripsi;
        if (Object.prototype.hasOwnProperty.call(payload, "durasi")) updateData.durasi = payload.durasi;

        if (!Object.keys(updateData).length) {
            throw new ValidationError("Tidak ada data yang diupdate.");
        }

        return journalRepository.updateById(id, updateData);
    },

    async deleteJournal(id, userId) {
        const journal = await journalRepository.findByIdAndUserId(id, userId);
        if (!journal) throw new NotFoundError("Journal tidak ditemukan.");

        await journalRepository.deleteById(id);
    }
};

export default journalService;
