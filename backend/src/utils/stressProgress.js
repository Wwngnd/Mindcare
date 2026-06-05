const STRESS_CATEGORY_RANGES = [
    { max: 20, label: "Sangat Rendah" },
    { max: 40, label: "Rendah" },
    { max: 60, label: "Sedang" },
    { max: 80, label: "Tinggi" },
    { max: 100, label: "Sangat Tinggi" }
];

const ACTIVITY_REDUCTION_RULES = {
    membaca: { rate: 0.2, maxReduction: 10 },
    journaling: { rate: 0.4, maxReduction: 12 },
    olahraga: { rate: 0.4, maxReduction: 20 }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const roundPercent = (value) => Math.round(value * 100) / 100;

export const normalizeStressPercent = (value) => {
    const percent = Number(value);
    if (!Number.isFinite(percent)) return 0;
    return roundPercent(clamp(percent, 0, 100));
};

export const mapStressLevelToPercent = (stressLevel) => {
    const level = Number(stressLevel);
    if (!Number.isFinite(level)) return 60;
    return normalizeStressPercent(clamp(Math.round(level), 1, 5) * 20);
};

export const getStressCategory = (stressPercent) => {
    const percent = normalizeStressPercent(stressPercent);
    return STRESS_CATEGORY_RANGES.find((item) => percent <= item.max)?.label || "Sangat Tinggi";
};

export const getActivityReduction = (activity, durationMinutes) => {
    const normalizedActivity = String(activity || "").toLowerCase().trim();
    const rule = ACTIVITY_REDUCTION_RULES[normalizedActivity];
    const minutes = Number(durationMinutes);

    if (!rule || !Number.isFinite(minutes) || minutes <= 0) {
        return 0;
    }

    return roundPercent(Math.min(minutes * rule.rate, rule.maxReduction));
};

export const calculateStressAfterActivity = (stressBefore, activity, durationMinutes) => {
    const before = normalizeStressPercent(stressBefore);
    const reduction = getActivityReduction(activity, durationMinutes);
    const after = normalizeStressPercent(before - reduction);

    return {
        stress_sebelum: before,
        penurunan_percent: reduction,
        stress_sesudah: after,
        kategori_stress: getStressCategory(after)
    };
};
