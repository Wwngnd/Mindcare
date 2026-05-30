const APP_PREFIX = "mindcare_";

function safeUserKeyPart(value) {
  return String(value || "anonymous")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_");
}

export function readJson(storageKey, fallback) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(storageKey, value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function getCurrentUser() {
  return readAppData("user", null);
}

export function getCurrentUserKey() {
  const user = getCurrentUser();
  return safeUserKeyPart(user?.id || user?.email || user?.name);
}

export function readAppData(key, fallback) {
  return readJson(`${APP_PREFIX}${key}`, fallback);
}

export function writeAppData(key, value) {
  writeJson(`${APP_PREFIX}${key}`, value);
}

export function getUserStorageKey(key) {
  return `${APP_PREFIX}user_${getCurrentUserKey()}_${key}`;
}

export function readUserData(key, fallback) {
  return readJson(getUserStorageKey(key), fallback);
}

export function writeUserData(key, value) {
  writeJson(getUserStorageKey(key), value);
}
