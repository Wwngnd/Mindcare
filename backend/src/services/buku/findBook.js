import { getBookCover } from "../../utils/bookCover.js";
import { searchBookMetadata } from "../../utils/bookSearch.js";
import { fetchOpenLibraryDoc, OPEN_LIBRARY_COVER } from "../../providers/openLibraryProvider.js";

const PLACEHOLDER_COVER = "https://via.placeholder.com/300x450?text=No+Cover";
const USE_GOOGLE_BOOKS = process.env.BOOK_GOOGLE_LOOKUP_ENABLED === "true";
const USE_OPEN_LIBRARY = process.env.BOOK_OPEN_LIBRARY_ENABLED === "true";

const normalizeThumbnail = (thumbnail, fallbackThumbnail = null) =>
    thumbnail?.replace?.("http://", "https://") ||
    fallbackThumbnail?.replace?.("http://", "https://") ||
    PLACEHOLDER_COVER;

const buildDefaultDescription = (judul, penulis) =>
    `Rekomendasi buku "${judul}" oleh ${penulis ?? "penulis terkenal"}. Buku ini cocok untuk membantu kesehatan mental Anda.`;

export const findBookEnrichment = async (judul, penulis, fallbackThumbnail = null, defaultDesc = null) => {
    let thumbnail = null;
    let deskripsi = null;

    if (USE_GOOGLE_BOOKS) {
        const metadata = await searchBookMetadata(judul, penulis);
        if (metadata?.thumbnail) {
            thumbnail = metadata.thumbnail;
        } else if (metadata?.isbn) {
            thumbnail = getBookCover(metadata.isbn);
        }

        if (metadata?.description) {
            deskripsi = metadata.description;
        }
    }

    if (USE_OPEN_LIBRARY && (!thumbnail || !deskripsi)) {
        try {
            const doc = await fetchOpenLibraryDoc(judul);
            if (!thumbnail && doc?.cover_i) thumbnail = OPEN_LIBRARY_COVER(doc.cover_i);
            if (!thumbnail && doc?.isbn?.[0]) thumbnail = getBookCover(doc.isbn[0]);
            if (!deskripsi && doc?.first_sentence?.[0]) deskripsi = doc.first_sentence[0];
            if (!deskripsi && typeof doc?.description === "string") deskripsi = doc.description;
        } catch (error) {
            console.log(`[WARN] Open Library search failed for ${judul}:`, error.message);
        }
    }

    return {
        thumbnail: normalizeThumbnail(thumbnail, fallbackThumbnail),
        deskripsi: deskripsi ?? defaultDesc ?? buildDefaultDescription(judul, penulis)
    };
};
