import stressProgressRepository from "../repositories/stressProgressRepository.js";
import {
    calculateStressAfterActivity,
    getActivityReduction,
    getStressCategory,
    mapStressLevelToPercent,
    normalizeStressPercent
} from "../utils/stressProgress.js";

const normalizeActivity = (activity) => String(activity || "").toLowerCase().trim();

const stressProgressServices = {
    async setBaselineFromKuesioner(userId, kuesioner, stressAssessment = null) {
        const aiStressPercent = Number(stressAssessment?.stress_percentage);
        const stressPercent = Number.isFinite(aiStressPercent)
            ? normalizeStressPercent(aiStressPercent)
            : mapStressLevelToPercent(kuesioner?.tingkat_stres);
        const aiStressLevel = String(stressAssessment?.stress_level || "").trim();
        const kategoriStress = aiStressLevel || getStressCategory(stressPercent);
        const keteranganStress = stressAssessment?.keterangan
            ? String(stressAssessment.keterangan)
            : null;

        return stressProgressRepository.upsertState(userId, {
            kuesionerId: kuesioner?.id ?? null,
            stressAwalPercent: stressPercent,
            stressSaatIniPercent: stressPercent,
            kategoriStress,
            keteranganStress
        });
    },

    async applyActivityReduction(userId, {
        activity,
        durationMinutes,
        sourceType,
        sourceId = null
    }) {
        const normalizedActivity = normalizeActivity(activity);
        const minutes = Number(durationMinutes);
        const reduction = getActivityReduction(normalizedActivity, minutes);

        const currentState = await stressProgressRepository.findStateByUserId(userId);
        if (!currentState || reduction <= 0) {
            return {
                state: currentState,
                reduction_log: null
            };
        }

        const result = calculateStressAfterActivity(
            currentState.stress_saat_ini_percent,
            normalizedActivity,
            minutes
        );

        const reductionLog = await stressProgressRepository.insertReductionLog(userId, {
            aktivitas: normalizedActivity,
            sourceType,
            sourceId,
            durasiMenit: Math.max(1, Math.round(minutes)),
            stressSebelum: result.stress_sebelum,
            penurunanPercent: result.penurunan_percent,
            stressSesudah: result.stress_sesudah
        });

        const updatedState = await stressProgressRepository.updateCurrentStress(userId, {
            stressSaatIniPercent: result.stress_sesudah,
            kategoriStress: result.kategori_stress
        });

        return {
            state: updatedState,
            reduction_log: reductionLog
        };
    },

    async getCurrentProgress(userId) {
        const [state, logs] = await Promise.all([
            stressProgressRepository.findStateByUserId(userId),
            stressProgressRepository.findLatestReductionLogsByUserId(userId, 5)
        ]);

        return {
            state,
            recent_logs: logs
        };
    }
};

export default stressProgressServices;
