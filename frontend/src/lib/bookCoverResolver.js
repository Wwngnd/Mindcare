const COVER_CACHE_KEY = "mindcare_book_cover_cache_v1";
const inMemoryCoverCache = new Map();

const isHttpUrl = (value) => /^https?:\/\//i.test(value);

const sanitizeIsbn = (value = "") => String(value).replace(/[^0-9X]/gi, "");

const getCacheFromStorage = () => {
  try {
    const raw = localStorage.getItem(COVER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCacheToStorage = (cache) => {
  try {
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write issues (quota/private mode)
  }
};

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const normalizeThumbnailUrl = (thumbnail) => {
  const value = String(thumbnail || "").trim();
  if (!value) return "";
  if (value.startsWith("data:image/")) return value;
  if (!isHttpUrl(value)) return "";
  return value.replace(/^http:\/\//i, "https://");
};

export const buildBookPlaceholderCover = (title, author = "") => {
  const safeTitle = escapeXml(title || "MindCare Book");
  const safeAuthor = escapeXml(author || "MindCare");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)"/>
  <rect x="18" y="18" width="264" height="414" rx="16" fill="#FFFFFF" opacity="0.92"/>
  <text x="150" y="70" text-anchor="middle" font-size="14" font-family="Arial, sans-serif" fill="#334155" font-weight="700">MindCare</text>
  <foreignObject x="30" y="92" width="240" height="230">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#0F172A;font-size:23px;font-weight:700;line-height:1.25;text-align:center;display:flex;align-items:center;justify-content:center;height:100%;">
      ${safeTitle}
    </div>
  </foreignObject>
  <text x="150" y="360" text-anchor="middle" font-size="15" font-family="Arial, sans-serif" fill="#475569">${safeAuthor}</text>
  <text x="150" y="390" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" fill="#64748B">Cover otomatis</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const getCachedCover = (cacheKey) => {
  if (inMemoryCoverCache.has(cacheKey)) {
    return inMemoryCoverCache.get(cacheKey);
  }

  const storageCache = getCacheFromStorage();
  if (storageCache[cacheKey]) {
    inMemoryCoverCache.set(cacheKey, storageCache[cacheKey]);
    return storageCache[cacheKey];
  }

  return null;
};

const setCachedCover = (cacheKey, value) => {
  inMemoryCoverCache.set(cacheKey, value);
  const storageCache = getCacheFromStorage();
  storageCache[cacheKey] = value;
  saveCacheToStorage(storageCache);
};

const buildOpenLibraryCoverUrl = (doc) => {
  if (doc?.cover_i) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  }

  const isbn = sanitizeIsbn(doc?.isbn?.[0] || "");
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  return "";
};

export const resolveFallbackBookCover = async (title, author = "") => {
  const keyTitle = String(title || "").trim().toLowerCase();
  const keyAuthor = String(author || "").trim().toLowerCase();
  const cacheKey = `${keyTitle}::${keyAuthor}`;

  if (!keyTitle) {
    return buildBookPlaceholderCover(title, author);
  }

  const cached = getCachedCover(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      title: String(title || "").trim(),
      author: String(author || "").trim(),
      limit: "1",
    });
    const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
    if (response.ok) {
      const payload = await response.json();
      const doc = payload?.docs?.[0];
      const coverUrl = normalizeThumbnailUrl(buildOpenLibraryCoverUrl(doc));
      if (coverUrl) {
        setCachedCover(cacheKey, coverUrl);
        return coverUrl;
      }
    }
  } catch {
    // Use local placeholder on network/API errors
  }

  const placeholder = buildBookPlaceholderCover(title, author);
  setCachedCover(cacheKey, placeholder);
  return placeholder;
};

