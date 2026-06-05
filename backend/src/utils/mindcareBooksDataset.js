import fs from "fs/promises";
import path from "path";

const parseCsvLine = (line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && next === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
};

const toNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeThumbnail = (value) => String(value || "").trim().replace(/^http:\/\//i, "https://");

export const readMindcareBooksDataset = async () => {
    const csvPath = path.join(process.cwd(), "src", "data", "mindcare_books_dataset.csv");
    const csv = await fs.readFile(csvPath, "utf8");
    const lines = csv.trim().split(/\r?\n/);
    const headers = parseCsvLine(lines[0]);

    return lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex] ?? ""]));

        return {
            id: row.book_id || `BOOK${index + 1}`,
            judul: row.title,
            penulis: row.authors,
            kategori: row.categories,
            thumbnail: normalizeThumbnail(row.thumbnail),
            deskripsi: row.description,
            stressLevelTarget: row.stress_level_target,
            stressCategory: row.stress_category,
            moodTag: row.mood_tag,
            averageRating: toNumber(row.average_rating),
            ratingsCount: toNumber(row.ratings_count),
            pages: toNumber(row.num_pages),
            readingDurationMinutes: toNumber(row.reading_duration_minutes),
            readingDurationCategory: row.reading_duration_category,
            language: row.language,
            source: row.source,
        };
    });
};
