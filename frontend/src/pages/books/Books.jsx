import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

import BookDetailModal from "../../components/books/BookDetailModal";
import BooksFilterBar from "../../components/books/BooksFilterBar";
import BooksGrid from "../../components/books/BooksGrid";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import {
  createBookRead,
  createBookSession,
  getGeneralBookRecommendations,
  getMyBookRecommendations,
} from "../../lib/api";
import { pickBookCategoryKeys } from "../../lib/bookCategories";
import { normalizeThumbnailUrl } from "../../lib/bookCoverResolver";
import { getBookSessions, saveBookSessions } from "../../lib/mindcareBookSessions";
import { readUserData, writeUserData } from "../../lib/storage";

const formatPercent = (value) => {
  const percent = Number(value);
  return Number.isFinite(percent) ? `${Math.round(percent)}%` : "--";
};

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

const mapGeneralBooksFromApi = (apiBooks) => {
  const items = Array.isArray(apiBooks) ? apiBooks : [];

  return items
    .filter((book) => book?.id && (book?.judul || book?.title))
    .map((book, index) => {
      const title = String(book.judul || book.title || "").trim();
      const author = String(book.penulis || book.author || "Penulis tidak diketahui").trim();
      const rawCategory = String(book.kategori || book.category || "").trim();
      const categoryKeys = pickBookCategoryKeys(rawCategory);

      return {
        id: `GENERAL_${book.id ?? index}`,
        title,
        author,
        categoryKeys,
        category: rawCategory || "Self Help",
        categoriesRaw: rawCategory,
        desc: book.deskripsi || book.description || "Pilihan bacaan umum dari katalog MindCare.",
        thumbnail: normalizeThumbnailUrl(book.thumbnail),
        rating: Number(book.average_rating || book.rating) || 4.2,
        match: 85,
        reason: "Pilihan umum dari katalog MindCare. Isi Cek Stress untuk rekomendasi yang lebih personal.",
      };
    });
};

const Books = () => {
  const { showAlert } = useAlertPopup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [aiBooks, setAiBooks] = useState(() => normalizeAiBooks(readUserData("ai_books", [])));
  const [generalBooks, setGeneralBooks] = useState([]);
  const activeReadingSessionRef = useRef(null);

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

  useEffect(() => {
    let mounted = true;

    const syncGeneralBooks = async () => {
      try {
        const res = await getGeneralBookRecommendations();
        const normalized = mapGeneralBooksFromApi(res?.payload?.books || []);
        if (mounted) setGeneralBooks(normalized);
      } catch (err) {
        console.error("Gagal mengambil rekomendasi buku umum:", err);
      }
    };

    syncGeneralBooks();
    return () => {
      mounted = false;
    };
  }, []);

  const mergedBooks = useMemo(() => {
    const personalKeys = new Set(aiBooks.map((book) => `${book.title.toLowerCase()}::${book.author.toLowerCase()}`));
    return [
      ...aiBooks,
      ...generalBooks.filter((book) => !personalKeys.has(`${book.title.toLowerCase()}::${book.author.toLowerCase()}`)),
    ];
  }, [aiBooks, generalBooks]);

  const availableFilters = useMemo(() => {
    const categoryKeys = new Set();

    mergedBooks.forEach((book) => {
      (book.categoryKeys || []).forEach((key) => categoryKeys.add(key));
    });

    return Array.from(categoryKeys);
  }, [mergedBooks]);

  const activeFilter = currentFilter === "all" || availableFilters.includes(currentFilter)
    ? currentFilter
    : "all";

  const filteredBooks = useMemo(() => {
    const items =
      activeFilter === "all"
        ? mergedBooks
        : mergedBooks.filter((book) => (book.categoryKeys || []).includes(activeFilter));

    return items.sort((a, b) => {
      const aiPriority = Number((b.categoryKeys || []).includes("ai_recommendation")) - Number((a.categoryKeys || []).includes("ai_recommendation"));
      if (aiPriority !== 0) return aiPriority;
      return (Number(b.match) || 0) - (Number(a.match) || 0);
    });
  }, [activeFilter, mergedBooks]);

  const hasPersonalRecommendations = aiBooks.length > 0;

  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter);
  };

  const saveReadingSession = async (session) => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
    const payload = {
      durationSeconds,
      date: new Date().toISOString(),
      exploredBooks: [
        {
          bookId: session.bookId,
          title: session.title,
          author: session.author,
        },
      ],
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

      const stressLog = saved?.stress_progress?.reduction_log;
      const stressState = saved?.stress_progress?.state;
      showAlert(
        stressLog
          ? `Sesi membaca tersimpan. Stress turun ${formatPercent(stressLog.penurunan_percent)} menjadi ${formatPercent(stressState?.stress_saat_ini_percent)}.`
          : "Sesi membaca tersimpan dan tersinkron ke akun Anda.",
        { type: "success", title: "Sesi tersimpan" },
      );
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
        "Sesi membaca tersimpan lokal, tetapi sinkronisasi backend gagal. Coba lagi nanti.",
        { type: "warning", title: "Sinkronisasi gagal" },
      );
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleReadNow = (book) => {
    const bookId = String(book.id);
    const activeSession = activeReadingSessionRef.current;
    if (!activeSession || activeSession.bookId !== bookId) {
      activeReadingSessionRef.current = {
        bookId,
        title: book.title,
        author: book.author,
        startedAt: Date.now(),
      };
    }

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

  const handleCloseBook = () => {
    const activeSession = activeReadingSessionRef.current;
    activeReadingSessionRef.current = null;
    setSelectedBook(null);

    if (activeSession) {
      saveReadingSession(activeSession);
    }
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
            </div>
          </header>

          <div className="mx-auto max-w-6xl p-8 pt-2 lg:p-12 lg:pt-4">
            <div className="rounded-3xl border-2 border-[#1E293B] bg-white/50 p-8">
              <div className="mb-6 flex flex-col gap-3 border-b border-[#CBD5E1] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1E293B]">
                    {hasPersonalRecommendations ? "Untuk Kamu" : "Pilihan Umum MindCare"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm font-medium text-[#64748B]">
                    {hasPersonalRecommendations
                      ? "Rekomendasi personal dari hasil Cek Stress terbaru tetap diprioritaskan, dengan katalog umum sebagai eksplorasi tambahan."
                      : "Kamu tetap bisa melihat buku umum. Isi Cek Stress untuk mendapatkan rekomendasi yang lebih sesuai kondisimu."}
                  </p>
                </div>

                {!hasPersonalRecommendations ? (
                  <Link
                    to="/stress-check"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
                  >
                    Personalisasi
                  </Link>
                ) : null}
              </div>
              <BooksFilterBar
                currentFilter={activeFilter}
                onChange={handleFilterChange}
                availableFilters={availableFilters}
              />
              <BooksGrid books={filteredBooks} onSelect={handleSelectBook} />
            </div>
          </div>
        </main>
      </div>

      <BookDetailModal book={selectedBook} onClose={handleCloseBook} onReadNow={handleReadNow} />
    </div>
  );
};

export default Books;
