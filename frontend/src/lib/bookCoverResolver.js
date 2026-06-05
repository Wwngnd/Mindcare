const COVER_CACHE_KEY = "mindcare_book_cover_cache_v1";
const inMemoryCoverCache = new Map();
const DEFAULT_API_URL = "http://localhost:3000";

const isHttpUrl = (value) => /^https?:\/\//i.test(value);

const sanitizeIsbn = (value = "") => String(value).replace(/[^0-9X]/gi, "");

const isGeneratedPlaceholder = (value = "") => String(value).startsWith("data:image/svg+xml");

const getApiBaseUrl = () => {
  const configuredUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
  return configuredUrl.replace(/\/api$/i, "");
};

const isGoogleBooksCoverUrl = (value) => {
  try {
    const url = new URL(value);
    return /^books\.google\.[a-z.]+$/i.test(url.hostname);
  } catch {
    return false;
  }
};

const proxiedCoverUrl = (value) =>
  `${getApiBaseUrl()}/api/books/cover?url=${encodeURIComponent(value)}`;

const isKnownNoCoverUrl = (value) => {
  try {
    const url = new URL(value);
    const normalizedHref = url.href.toLowerCase();
    const normalizedHost = url.hostname.toLowerCase();

    return (
      normalizedHost.includes("placeholder.") ||
      normalizedHref.includes("no+cover") ||
      normalizedHref.includes("no%20cover") ||
      normalizedHref.includes("image+not+available") ||
      normalizedHref.includes("image%20not%20available")
    );
  } catch {
    return false;
  }
};

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
  const normalized = value.replace(/^http:\/\//i, "https://");
  if (isKnownNoCoverUrl(normalized)) return "";
  return isGoogleBooksCoverUrl(normalized) ? proxiedCoverUrl(normalized) : normalized;
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
    if (isGeneratedPlaceholder(storageCache[cacheKey])) {
      delete storageCache[cacheKey];
      saveCacheToStorage(storageCache);
      return null;
    }

    inMemoryCoverCache.set(cacheKey, storageCache[cacheKey]);
    return storageCache[cacheKey];
  }

  return null;
};

const setCachedCover = (cacheKey, value) => {
  if (isGeneratedPlaceholder(value)) return;

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
  return placeholder;
};

