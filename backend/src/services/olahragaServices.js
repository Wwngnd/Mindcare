import NotFoundError from "../exceptions/NotFoundError.js";
import olahragaRepository from "../repositories/olahragaRepository.js";
import stressProgressServices from "./stressProgressServices.js";

const olahragaService = {
    async createOlahraga(userId, payload) {
        const olahraga = await olahragaRepository.create(userId, payload);
        const stressProgress = await stressProgressServices.applyActivityReduction(userId, {
            activity: "olahraga",
            durationMinutes: olahraga?.durasi_menit,
            sourceType: "olahraga",
            sourceId: olahraga?.id
        });

        return {
            ...olahraga,
            stress_progress: stressProgress
        };
    },

    async getAllOlahragaByUserLogin(userId) {
        const olahraga = await olahragaRepository.findAllByUserId(userId);
        if (!olahraga.length) throw new NotFoundError("Belum ada riwayat olahraga.");

        return olahraga;
    },

    async getOlahragaById(id, userId) {
        const olahraga = await olahragaRepository.findByIdAndUserId(id, userId);
        if (!olahraga) throw new NotFoundError("Data olahraga tidak ditemukan.");

        return olahraga;
    },

    async deleteOlahraga(id, userId) {
        const olahraga = await olahragaRepository.findByIdAndUserId(id, userId);
        if (!olahraga) throw new NotFoundError("Data olahraga tidak ditemukan.");

        await olahragaRepository.deleteById(id);
    },

    async getStatistikOlahraga(userId) {
        return olahragaRepository.getStatisticsByUserId(userId);
    },
    
    async getStatistikOlahragaPerJenis(userId) {
        return olahragaRepository.getStatisticsGroupedByJenis(userId);
    },

    async getAllOlahraga() {
        const olahraga = await olahragaRepository.findAllWithUser();
        if (!olahraga.length) throw new NotFoundError("Belum ada data olahraga.");

        return olahraga;
    }
};

export default olahragaService;
