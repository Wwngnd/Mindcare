import kuesionerRepository from "../../repositories/kuesionerRepository.js";
import { findBookThumbnail, findBookDescription } from "./findBook.js";

const PLACEHOLDER_COVER = "https://via.placeholder.com/300x450?text=No+Cover";
const RATE_LIMIT_DELAY_MS = 300;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enrichOneBuku = async (buku) => {
    try {
        const thumbnail = await findBookThumbnail(buku.judul, buku.penulis, buku.thumbnail);
        const deskripsi = await findBookDescription(buku.judul, buku.penulis, buku.deskripsi);
        return { thumbnail, deskripsi };
    } catch {
        return {
            thumbnail: PLACEHOLDER_COVER,
            deskripsi: buku.deskripsi ?? `Rekomendasi buku "${buku.judul}" untuk kesehatan mental Anda.`
        };
    }
};

export const enrichAndSaveBuku = async (bukuList, aktivitasId) => {
    const enrichedList = [];

    for (let i = 0; i < bukuList.length; i++) {
        const buku = bukuList[i];
        console.log(`[INFO] Processing book ${i + 1}/${bukuList.length}: ${buku.judul}`);

        const { thumbnail, deskripsi } = await enrichOneBuku(buku);

        await kuesionerRepository.insertBuku(
            aktivitasId, buku.judul, buku.penulis,
            buku.kategori, thumbnail, deskripsi
        );

        enrichedList.push({ ...buku, thumbnail, deskripsi });
        await delay(RATE_LIMIT_DELAY_MS);
    }

    return enrichedList;
};
