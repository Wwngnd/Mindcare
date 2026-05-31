import csvRaw from "./mindcare_books_dataset.csv?raw";
import { pickBookCategoryKeys } from "../lib/bookCategories";
import { normalizeThumbnailUrl } from "../lib/bookCoverResolver";

const parseCsv = (csv) => {
  const lines = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
};

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const rows = parseCsv(csvRaw);

const booksData = rows.map((row, index) => {
  const categoryKeys = pickBookCategoryKeys(row.categories || "");
  return {
    id: row.book_id || `BOOK${index + 1}`,
    title: row.title,
    author: row.authors,
    year: Number(row.year) || null,
    categoryKeys,
    category: categoryKeys[0],
    categoriesRaw: row.categories || "",
    stressCategory: row.stress_category || "Umum",
    stressLevelTarget: row.stress_level_target || "Sedang",
    moodTag: row.mood_tag || "Umum",
    rating: Number(row.average_rating) || 0,
    match: Math.min(99, Math.max(70, Math.round((Number(row.average_rating) || 4) * 20))),
    desc: row.description || "",
    reason: `Direkomendasikan untuk kategori stres "${row.stress_category}" dengan target level "${row.stress_level_target}" dan mood "${row.mood_tag}".`,
    thumbnail: normalizeThumbnailUrl(row.thumbnail),
    pages: Number(row.num_pages) || 0,
    duration: row.reading_duration_category || "",
    language: row.language || "",
    source: row.source || "",
  };
});

export default booksData;
