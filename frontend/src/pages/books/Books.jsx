import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

import BookDetailModal from "../../components/books/BookDetailModal";
import BooksFilterBar from "../../components/books/BooksFilterBar";
import BooksGrid from "../../components/books/BooksGrid";
import BooksSessionTimer from "../../components/books/BooksSessionTimer";
import AppSidebar from "../../components/layout/AppSidebar";
import { getBookSessions, saveBookSessions } from "../../lib/mindcareBookSessions";
import { readUserData, writeUserData } from "../../lib/storage";

const Books = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [aiBooks, setAiBooks] = useState([]);
  const sessionStartedRef = useRef(false);
  const exploredBooksRef = useRef([]);

  useEffect(() => {
    setAiBooks(readUserData("ai_books", []));
  }, []);

  const filteredBooks = useMemo(() => {
    const allBooks = [...aiBooks];
    const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.id, item])).values());
    
    const items =
      currentFilter === "all"
        ? uniqueBooks
        : uniqueBooks.filter((book) => (book.categoryKeys || []).includes(currentFilter));
    return items.sort((a, b) => b.match - a.match);
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

  const handleRecordSession = () => {
    const sessions = getBookSessions();
    sessions.push({
      id: Date.now(),
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exploredBooks: exploredBooksRef.current.map((b) => ({ ...b })),
    });
    saveBookSessions(sessions);
    alert("Waktu sesi eksplorasi tersimpan. Terima kasih sudah meluangkan waktu untuk dirimu.");
    resetSessionTimer();
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
                Bacaan yang dipersonalisasi untukmu. Timer mencatat lama Anda menjelajahi halaman ini — mulai dari filter
                atau buku pertama yang Anda buka. Gunakan <span className="font-semibold text-[#1E293B]">Catat sesi</span>{" "}
                untuk menyimpan durasinya.
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
                elapsedSeconds={elapsedSeconds}
                timerActive={timerRunning}
                onRecordSession={handleRecordSession}
                disabledRecord={!timerRunning}
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
