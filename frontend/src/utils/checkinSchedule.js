/**
 * checkinSchedule.js
 * ==================
 * Utility untuk logika jadwal daily check-in.
 *
 * Aturan:
 *  - 1x check-in per HARI KALENDER (bukan 24 jam)
 *  - Reset terjadi setiap tengah malam (00:00 hari berikutnya)
 *  - Contoh: check-in jam 23:00 → bisa check-in lagi jam 00:00 keesokan harinya (bukan jam 23:00+24 jam)
 */

/**
 * Mengambil string tanggal hari ini dalam format YYYY-MM-DD (local time).
 * @returns {string} e.g. "2026-05-30"
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Mengambil string tanggal dari objek Date dalam format YYYY-MM-DD (local time).
 * @param {Date|string} date
 * @returns {string}
 */
export const getDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Memeriksa apakah pengguna sudah check-in hari ini
 * berdasarkan daftar scan dari backend.
 *
 * @param {Array} scans - Array scan dari backend (masing-masing memiliki `createdAt`)
 * @returns {{ checkedInToday: boolean, todayScan: object|null }}
 */
export const checkTodayStatus = (scans = []) => {
  const today = getTodayDateString();
  const todayScan = scans.find((s) => getDateString(s.createdAt) === today) ?? null;
  return {
    checkedInToday: todayScan !== null,
    todayScan,
  };
};

/**
 * Menghitung waktu tersisa hingga check-in berikutnya (tengah malam).
 * Mengembalikan string yang mudah dibaca, misal "00:45:30".
 *
 * @returns {string} countdown dalam format HH:MM:SS
 */
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const diffMs = midnight - now;
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
};

/**
 * Mendapatkan tanggal besok dalam format yang mudah dibaca (local time).
 * @returns {string} e.g. "31 Mei 2026"
 */
export const getTomorrowLabel = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Format jam dari objek Date.
 * @param {Date|string} date
 * @returns {string} e.g. "23:05"
 */
export const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};
