import { readUserData, writeUserData } from "./storage";

const STORAGE_KEY = "book_sessions";

export const getBookSessions = () => {
  return readUserData(STORAGE_KEY, []);
};

export const saveBookSessions = (sessions) => {
  writeUserData(STORAGE_KEY, sessions);
};
