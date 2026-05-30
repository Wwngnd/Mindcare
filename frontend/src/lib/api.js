import { readAppData, writeAppData } from "./storage";

const DEFAULT_API_URL = "http://localhost:3000";

function getApiBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
  return configuredUrl.replace(/\/api$/i, "");
}

function getAccessToken() {
  return readAppData("auth", null)?.accessToken ?? null;
}

function setAccessToken(accessToken) {
  const prev = readAppData("auth", null) ?? {};
  writeAppData("auth", { ...prev, accessToken });
}

async function tryRefreshAccessToken() {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/token`, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) return null;

  const accessToken = json?.payload?.accessToken ?? null;
  if (accessToken) setAccessToken(accessToken);
  return accessToken;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers,
    auth = true,
    retryOnAuthFail = true,
  } = options;

  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${getApiBaseUrl()}${urlPath}`;

  const nextHeaders = { ...(headers ?? {}) };
  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData && !("Content-Type" in nextHeaders)) {
    nextHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) nextHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: nextHeaders,
    body: isFormData ? body : (body === undefined ? undefined : JSON.stringify(body)),
    credentials: "include",
  });

  const json = await res.json().catch(() => null);

  // Hanya retry jika pesan error mengandung "kedaluwarsa"
  if (
    res.status === 401 &&
    retryOnAuthFail &&
    auth &&
    json?.msg?.toLowerCase?.().includes("kedaluwarsa")
  ) {
    const newToken = await tryRefreshAccessToken();
    if (newToken) {
      return apiRequest(path, { ...options, retryOnAuthFail: false });
    }
  }

  if (!res.ok) {
    const msg = json?.msg || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = json;
    throw err;
  }

  return json;
}

export function clearAuth() {
  writeAppData("auth", null);
  writeAppData("user", null);
}

/**
 * POST /api/stress-scan
 * Upload gambar untuk deteksi stress
 */
export async function scanStress(data = {}) {
  return apiRequest("/api/stress-scan", {
    method: "POST",
    body: data,
  });
}

/**
 * GET /api/stress-scan/me
 * Ambil riwayat stress scan milik user
 */
export async function getMyStressScans() {
  return apiRequest("/api/stress-scan/me");
}

/**
 * GET /api/stress-scan/:id
 * Detail hasil scan berdasarkan ID
 */
export async function getStressScanById(id) {
  return apiRequest(`/api/stress-scan/${id}`);
}

/**
 * DELETE /api/stress-scan/:id
 * Hapus riwayat scan
 */
export async function deleteStressScan(id) {
  return apiRequest(`/api/stress-scan/${id}`, { method: "DELETE" });
}

/**
 * GET /api/stress-scan (Admin only)
 */
export async function getAllStressScans() {
  return apiRequest("/api/stress-scan");
}

/**
 * Olahraga (Exercise) API
 */

export async function createOlahraga(data) {
  return apiRequest("/api/olahraga", {
    method: "POST",
    body: data,
  });
}

export async function getMyOlahraga() {
  return apiRequest("/api/olahraga/me");
}

export async function getOlahragaStatistik() {
  return apiRequest("/api/olahraga/statistik");
}

export async function getOlahragaStatistikPerJenis() {
  return apiRequest("/api/olahraga/statistik-per-jenis");
}
