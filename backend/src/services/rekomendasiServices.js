import kuesionerRepository from "../repositories/kuesionerRepository.js";
import { enrichAndSaveBuku } from "./buku/enricherBook.js";

export const saveRekomendasiUtama = async (sesiId, rekomendasiUtama) => {
    const aktivitasId = await kuesionerRepository.insertAktivitas(
        sesiId,
        true,
        rekomendasiUtama.aktivitas,
        rekomendasiUtama.confidence,
        rekomendasiUtama.durasi,
        rekomendasiUtama.detail
    );

    const hasBuku = rekomendasiUtama.rekomendasi_buku?.length > 0;

    const enrichedBuku = hasBuku
        ? await enrichAndSaveBuku(rekomendasiUtama.rekomendasi_buku, aktivitasId)
        : [];

    return { aktivitasId, enrichedBuku };
};

export const saveAlternatif = async (sesiId, alternatifList) => {
    const enrichedAlternatif = [];

    for (const alt of alternatifList ?? []) {
        const altId = await kuesionerRepository.insertAktivitas(
            sesiId,
            false,
            alt.aktivitas,
            alt.confidence,
            alt.durasi,
            alt.detail
        );

        const hasBuku = alt.rekomendasi_buku?.length > 0;

        const enrichedBuku = hasBuku
            ? await enrichAndSaveBuku(alt.rekomendasi_buku, altId)
            : [];

        enrichedAlternatif.push({ ...alt, rekomendasi_buku: enrichedBuku });
    }

    return enrichedAlternatif;
};

export const saveDistribusi = async (sesiId, distribusiProbabilitas) => {
    for (const [aktivitas, probabilitas] of Object.entries(distribusiProbabilitas ?? {})) {
        await kuesionerRepository.insertDistribusi(sesiId, aktivitas, probabilitas);
    }
};

export const insertSesi = (userId, kuesionerId, insight) => kuesionerRepository.insertSesi(userId, kuesionerId, insight.model_type, insight.alasan);
