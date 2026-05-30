import { getBookCover } from "../../utils/bookCover.js";
import { getGoogleBooksThumbnail, getGoogleBooksDescription } from "../../providers/googleBooksProvider.js";
import { fetchOpenLibraryDoc, OPEN_LIBRARY_COVER } from "../../providers/openLibraryProvider.js";

const PLACEHOLDER_COVER = "https://via.placeholder.com/300x450?text=No+Cover";

export const findBookThumbnail = async (judul, penulis, fallbackThumbnail = null) => {
    const result = await getGoogleBooksThumbnail(judul, penulis);
    if (result?.startsWith("http")) return result;       // thumbnail URL
    if (result) return getBookCover(result); // ISBN

    try {
        const doc = await fetchOpenLibraryDoc(judul);
        if (doc?.cover_i) return OPEN_LIBRARY_COVER(doc.cover_i);
        if (doc?.isbn?.[0]) return getBookCover(doc.isbn[0]);
    } catch (error) {
        console.log(`[WARN] Open Library search failed for ${judul}:`, error.message);
    }

    return fallbackThumbnail?.replace?.("http://", "https://") || PLACEHOLDER_COVER;
};

export const findBookDescription = async (judul, penulis, defaultDesc = null) => {
    const description = await getGoogleBooksDescription(judul, penulis);
    if (description) return description;

    try {
        const doc = await fetchOpenLibraryDoc(judul);
        if (doc?.first_sentence?.[0]) return doc.first_sentence[0];
        if (doc?.description) return doc.description;
    } catch {
        console.log(`[WARN] Open Library description failed for ${judul}`);
    }

    return defaultDesc ?? `Rekomendasi buku "${judul}" oleh ${penulis ?? "penulis terkenal"}. Buku ini cocok untuk membantu kesehatan mental Anda.`;
};
