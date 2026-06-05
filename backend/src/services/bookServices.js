import axios from "axios";

import ValidationError from "../exceptions/ValidationError.js";
import bookRepository from "../repositories/bookRepository.js";
import { readMindcareBooksDataset } from "../utils/mindcareBooksDataset.js";
import stressProgressServices from "./stressProgressServices.js";

const FETCH_TIMEOUT_MS = 8000;
const ALLOWED_COVER_HOST_PATTERN = /^books\.google\.[a-z.]+$/i;

const normalizeExploredBooks = (books = []) => (
    Array.isArray(books)
        ? books
            .filter((item) => item?.bookId)
            .map((item) => ({
                bookId: String(item.bookId).slice(0, 100),
                title: item.title ? String(item.title).slice(0, 255) : null,
                author: item.author ? String(item.author).slice(0, 255) : null
            }))
        : []
);

const parseAllowedCoverUrl = (value) => {
    if (!value) {
        throw new ValidationError("URL cover wajib diisi.");
    }

    let parsed;
    try {
        parsed = new URL(String(value));
    } catch {
        throw new ValidationError("URL cover tidak valid.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new ValidationError("Protocol URL cover tidak didukung.");
    }

    if (!ALLOWED_COVER_HOST_PATTERN.test(parsed.hostname)) {
        throw new ValidationError("Host URL cover tidak diizinkan.");
    }

    return parsed.toString();
};

const mapGeneralBook = (book) => ({
    id: book.id,
    judul: book.judul,
    penulis: book.penulis,
    kategori: book.kategori,
    thumbnail: book.thumbnail,
    deskripsi: book.deskripsi,
    stress_category: book.stressCategory,
    stress_level_target: book.stressLevelTarget,
    mood_tag: book.moodTag,
    average_rating: book.averageRating,
    ratings_count: book.ratingsCount,
    num_pages: book.pages,
    reading_duration_minutes: book.readingDurationMinutes,
    reading_duration_category: book.readingDurationCategory,
    language: book.language
});

const bookServices = {
    async createBookSession(userId, payload) {
        const durationSeconds = Number(payload.durationSeconds);
        const date = payload.date ? new Date(payload.date) : new Date();
        const exploredBooks = normalizeExploredBooks(payload.exploredBooks);

        const session = await bookRepository.createSession(userId, {
            durationSeconds,
            date,
            exploredBooks
        });

        const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
        const stressProgress = await stressProgressServices.applyActivityReduction(userId, {
            activity: "membaca",
            durationMinutes,
            sourceType: "book_session",
            sourceId: session?.id
        });

        return {
            ...session,
            stress_progress: stressProgress
        };
    },

    async getAllBookSessionsByUserLogin(userId) {
        return bookRepository.findAllSessionsByUserId(userId);
    },

    async createBookRead(userId, payload) {
        const bookId = String(payload.bookId);
        const title = payload.title ? String(payload.title) : null;
        const author = payload.author ? String(payload.author) : null;

        return bookRepository.upsertBookRead(userId, {
            bookId,
            title,
            author
        });
    },

    async getAllBookReadsByUserLogin(userId) {
        return bookRepository.findAllReadsByUserId(userId);
    },

    async getGeneralBookRecommendations(limit) {
        const books = await readMindcareBooksDataset();
        const requestedLimit = Number(limit);
        const safeLimit = Number.isFinite(requestedLimit) && requestedLimit > 0
            ? Math.min(books.length, Math.max(6, requestedLimit))
            : books.length;

        return books
            .filter((book) => book.judul)
            .sort((a, b) => {
                const ratingDiff = b.averageRating - a.averageRating;
                if (ratingDiff !== 0) return ratingDiff;
                return b.ratingsCount - a.ratingsCount;
            })
            .slice(0, safeLimit)
            .map(mapGeneralBook);
    },

    async fetchBookCover(url) {
        const safeUrl = parseAllowedCoverUrl(url);
        const result = await axios.get(safeUrl, {
            responseType: "arraybuffer",
            timeout: FETCH_TIMEOUT_MS,
            headers: {
                Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "User-Agent": "Mozilla/5.0 MindCare/1.0"
            }
        });

        return {
            buffer: Buffer.from(result.data),
            contentType: result.headers["content-type"] || "image/jpeg"
        };
    }
};

export default bookServices;
