import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

import BookDetailModal from "../../components/books/BookDetailModal";
import BooksFilterBar from "../../components/books/BooksFilterBar";
import BooksGrid from "../../components/books/BooksGrid";
import BooksSessionTimer from "../../components/books/BooksSessionTimer";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import {
  createBookRead,
  createBookSession,
  getMyBookRecommendations,
} from "../../lib/api";
import { pickBookCategoryKeys } from "../../lib/bookCategories";
import { normalizeThumbnailUrl } from "../../lib/bookCoverResolver";
import { getBookSessions, saveBookSessions } from "../../lib/mindcareBookSessions";
import { readUserData, writeUserData } from "../../lib/storage";

const normalizeAiBooks = (storedBooks) => (
  Array.isArray(storedBooks)
    ? storedBooks
      .filter((book) => book?.id && (book?.title || book?.judul))
      .map((book) => {
        const title = book.title || book.judul;
        const author = book.author || book.penulis;
        const rawCategory = String(book.categoriesRaw || book.category || book.kategori || "").trim();
        const derivedKeys = pickBookCategoryKeys(rawCategory);
        const mergedKeys = [...new Set(["ai_recommendation", ...derivedKeys, ...(book.categoryKeys || [])])];
        return {
          ...book,
          title,
          author,
          categoryKeys: mergedKeys,
          category: book.category || rawCategory || "Self Help",
          categoriesRaw: rawCategory || book.categoriesRaw || "",
          thumbnail: normalizeThumbnailUrl(book.thumbnail),
        };
      })
    : []
);

const mapRecommendedBooksFromApi = (apiBooks) => {
  const items = Array.isArray(apiBooks) ? apiBooks : [];
  const dedup = new Map();

  items.forEach((book, index) => {
    const title = String(book?.judul || "").trim();
    const author = String(book?.penulis || "").trim();
    if (!title) return;

    const key = `${title.toLowerCase()}::${author.toLowerCase()}`;
    if (dedup.has(key)) return;

    const rawCategory = String(book?.kategori || "").trim();
    dedup.set(key, {
      id: `API_REC_${book?.id ?? index}`,
      title,
      author: author || "Penulis tidak diketahui",
      category: rawCategory || "Self Help",
      categoriesRaw: rawCategory,
      desc: book?.deskripsi || "Rekomendasi buku untuk membantu pemulihan stres.",
      thumbnail: normalizeThumbnailUrl(book?.thumbnail),
      match: 100,
      reason: "Direkomendasikan oleh AI berdasarkan hasil kuesioner Anda.",
    });
  });

  return Array.from(dedup.values());
};

const Books = () => {
  const { showAlert } = useAlertPopup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [aiBooks, setAiBooks] = useState(() => normalizeAiBooks(readUserData("ai_books", [])));
  const sessionStartedRef = useRef(false);
  const exploredBooksRef = useRef([]);

  useEffect(() => {
    let mounted = true;

    const syncAiBooks = async () => {
      try {
        const res = await getMyBookRecommendations();
        const apiBooks = mapRecommendedBooksFromApi(res?.payload?.rekomendasi_buku || []);
        const normalized = normalizeAiBooks(apiBooks);

        if (!mounted) return;
        setAiBooks(normalized);
        writeUserData("ai_books", normalized);
      } catch (err) {
        if (err?.status !== 404) {
          console.error("Gagal mengambil rekomendasi buku dari backend:", err);
        } else {
          // Jika 404 (belum ada kuesioner), kosongkan local storage agar sinkron
          if (mounted) {
            setAiBooks([]);
            writeUserData("ai_books", []);
          }
        }
      }
    };

    syncAiBooks();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const items =
      currentFilter === "all"
        ? aiBooks
        : aiBooks.filter((book) => (book.categoryKeys || []).includes(currentFilter));

    return items.sort((a, b) => {
      const aiPriority = Number((b.categoryKeys || []).includes("ai_recommendation")) - Number((a.categoryKeys || []).includes("ai_recommendation"));
      if (aiPriority !== 0) return aiPriority;
      return (Number(b.match) || 0) - (Number(a.match) || 0);
    });
  }, [currentFilter, aiBooks]);


  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const tryStartTimer = () => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    setTimerRunning(true);
  };

  const resetSessionTimer = () => {
    sessionStartedRef.current = false;
    exploredBooksRef.current = [];
    setTimerRunning(false);
    setElapsedSeconds(0);
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter !== currentFilter) {
      tryStartTimer();
    }
    setCurrentFilter(newFilter);
  };

  const handleRecordSession = async () => {
    if (!timerRunning || savingSession) return;

    setSavingSession(true);
    const payload = {
      durationSeconds: elapsedSeconds,
      date: new Date().toISOString(),
      exploredBooks: exploredBooksRef.current.map((item) => ({ ...item })),
    };

    try {
      const res = await createBookSession(payload);
      const saved = res?.payload?.session;
      const localSession = {
        id: saved?.id ?? Date.now(),
        date: saved?.date || payload.date,
        durationSeconds: saved?.durationSeconds ?? payload.durationSeconds,
        exploredBooks: Array.isArray(saved?.exploredBooks) ? saved.exploredBooks : payload.exploredBooks,
      };

      const sessions = getBookSessions();
      sessions.push(localSession);
      saveBookSessions(sessions);

      showAlert(
        "Waktu sesi eksplorasi tersimpan dan tersinkron ke akun Anda.",
        { type: "success", title: "Sesi tersimpan" },
      );
      resetSessionTimer();
    } catch {
      const sessions = getBookSessions();
      sessions.push({
        id: Date.now(),
        date: payload.date,
        durationSeconds: payload.durationSeconds,
        exploredBooks: payload.exploredBooks,
      });
      saveBookSessions(sessions);

      showAlert(
        "Sesi tersimpan lokal, tetapi sinkronisasi backend gagal. Coba lagi nanti.",
        { type: "warning", title: "Sinkronisasi gagal" },
      );
    } finally {
      setSavingSession(false);
    }
  };

  const handleSelectBook = (book) => {
    tryStartTimer();
    if (!exploredBooksRef.current.some((b) => b.bookId === book.id)) {
      exploredBooksRef.current = [
        ...exploredBooksRef.current,
        { bookId: book.id, title: book.title, author: book.author },
      ];
    }
    setSelectedBook(book);

    const booksRead = readUserData("books_read", []);
    if (!booksRead.find((item) => item.bookId === book.id)) {
      booksRead.push({ id: Date.now(), bookId: book.id, date: new Date().toISOString() });
      writeUserData("books_read", booksRead);
    }

    createBookRead({
      bookId: String(book.id),
      title: book.title,
      author: book.author,
    }).catch((err) => {
      if (err?.status !== 404) {
        console.error("Gagal sinkron riwayat buku dibuka:", err);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeMenu="Rekomendasi Buku" />

        <main className="min-h-screen flex-1">
          <div className="p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-white"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <header className="flex flex-col gap-5 px-8 pt-6 pb-2 lg:flex-row lg:items-start lg:justify-between lg:pt-10 lg:pb-4">
            <div>
              <h1 className="mb-1 text-2xl font-extrabold text-[#1E293B] lg:text-3xl">Rekomendasi Buku</h1>
              <p className="max-w-xl text-sm font-medium text-[#64748B] lg:text-base">
                Bacaan yang dipersonalisasi untukmu. Jelajahi buku rekomendasi sesuai kebutuhanmu.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/books/riwayat"
                className="rounded-full border-2 border-[#1E293B] bg-white px-5 py-2 text-sm font-bold text-[#1E293B] shadow-[3px_3px_0px_0px_#E2E8F0] transition-all hover:-translate-y-0.5"
              >
                Riwayat eksplorasi
              </Link>
              <BooksSessionTimer
                onRecordSession={handleRecordSession}
                disabledRecord={!timerRunning || savingSession}
              />
            </div>
          </header>

          <div className="mx-auto max-w-6xl p-8 pt-2 lg:p-12 lg:pt-4">
            <div className="rounded-3xl border-2 border-[#1E293B] bg-white/50 p-8">
              <BooksFilterBar currentFilter={currentFilter} onChange={handleFilterChange} />
              <BooksGrid books={filteredBooks} onSelect={handleSelectBook} />
            </div>
          </div>
        </main>
      </div>

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};

export default Books;
