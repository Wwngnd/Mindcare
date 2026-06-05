import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

import JournalHistoryPanel from "../../components/journaling/JournalHistoryPanel";
import JournalTabs from "../../components/journaling/JournalTabs";
import JournalWritePanel from "../../components/journaling/JournalWritePanel";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import { apiRequest } from "../../lib/api";

const formatPercent = (value) => {
  const percent = Number(value);
  return Number.isFinite(percent) ? `${Math.round(percent)}%` : "--";
};

const Journaling = () => {
  const { showAlert } = useAlertPopup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deletingJournal, setDeletingJournal] = useState(false);
  const sessionStartedRef = useRef(false);
  const savingRef = useRef(false);

  const [journals, setJournals] = useState([]);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await apiRequest("api/journal/me");
        if (res.success && res.payload) {
          const journalRows = Array.isArray(res.payload) ? res.payload : Object.values(res.payload);
          const fetchedJournals = journalRows.map((item) => ({
            id: item.id,
            title: item.judul,
            content: item.deskripsi,
            durationMinutes: item.durasi,
            date: item.createdAt,
          }));
          setJournals(fetchedJournals);
        }
      } catch (err) {
        // Backend mengembalikan 404 saat jurnal kosong.
        // Pastikan state frontend ikut kosong agar UI tidak menampilkan data stale.
        if (err?.status === 404) {
          setJournals([]);
          return;
        }
        console.error("Gagal mengambil data jurnal:", err);
      }
    };
    fetchJournals();
  }, [refreshKey]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const tryStartTimer = (nextTitle, nextContent) => {
    if (sessionStartedRef.current) return;
    const hasText = Boolean(nextTitle.trim() || nextContent.trim());
    if (!hasText) return;
    sessionStartedRef.current = true;
    setTimerRunning(true);
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    tryStartTimer(value, content);
  };

  const handleContentChange = (value) => {
    setContent(value);
    tryStartTimer(title, value);
  };

  const resetSessionTimer = () => {
    sessionStartedRef.current = false;
    setTimerRunning(false);
    setElapsedSeconds(0);
  };

  const getDurationMinutes = () => {
    if (!elapsedSeconds) return 1;
    return Math.min(255, Math.max(1, Math.ceil(elapsedSeconds / 60)));
  };

  const cancelJournal = () => {
    setTitle("");
    setContent("");
    resetSessionTimer();
  };

  const handleSave = async () => {
    if (savingRef.current) return;

    if (!content.trim()) {
      showAlert("Konten tidak boleh kosong!", { type: "warning", title: "Data belum lengkap" });
      return;
    }

    try {
      savingRef.current = true;
      setSavingJournal(true);
      const res = await apiRequest("api/journal", {
        method: "POST",
        body: {
          judul: title.trim() || "Tanpa Judul",
          deskripsi: content.trim(),
          durasi: getDurationMinutes(),
        },
      });

      const stressLog = res?.payload?.stress_progress?.reduction_log;
      const stressState = res?.payload?.stress_progress?.state;
      showAlert(
        stressLog
          ? `Jurnal disimpan. Stress turun ${formatPercent(stressLog.penurunan_percent)} menjadi ${formatPercent(stressState?.stress_saat_ini_percent)}.`
          : "Jurnal disimpan!",
        { type: "success", title: "Berhasil" },
      );
      setTitle("");
      setContent("");
      resetSessionTimer();
      setRefreshKey((prev) => prev + 1);
      setActiveTab("history");
    } catch (err) {
      showAlert(err.message || "Gagal menyimpan jurnal", {
        type: "error",
        title: "Simpan jurnal gagal",
      });
    } finally {
      savingRef.current = false;
      setSavingJournal(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setDeleteTargetId(id);
  };

  const closeDeleteModal = () => {
    if (deletingJournal) return;
    setDeleteTargetId(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    try {
      setDeletingJournal(true);
      const targetId = deleteTargetId;
      await apiRequest(`api/journal/${targetId}`, { method: "DELETE" });
      setJournals((prev) => prev.filter((item) => item.id !== targetId));
      setRefreshKey((prev) => prev + 1);
      showAlert("Jurnal berhasil dihapus.", { type: "success", title: "Berhasil" });
      setDeleteTargetId(null);
    } catch (err) {
      showAlert(err.message || "Gagal menghapus jurnal", {
        type: "error",
        title: "Hapus jurnal gagal",
      });
    } finally {
      setDeletingJournal(false);
    }
  };

  const hasDraft = Boolean(title.trim() || content.trim() || timerRunning);
  const featureStarted = hasDraft;

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu="Journaling"
          navigationLocked={featureStarted}
        />

        <main className="min-h-screen flex-1">
          <div className="p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-white"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <header className="hidden items-center gap-4 px-8 pt-10 pb-6 lg:flex">
            <div>
              <h1 className="mb-1 text-3xl font-extrabold text-[#1E293B]">Journaling</h1>
              <p className="font-medium text-[#64748B]">Tulis pikiran dan perasaanmu</p>
            </div>
          </header>

          <div className="mx-auto max-w-4xl p-8 lg:p-12">
            <JournalTabs activeTab={activeTab} onChange={setActiveTab} />

            {hasDraft && activeTab === "write" ? (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={cancelJournal}
                  className="rounded-xl border-2 border-[#1E293B] bg-white px-5 py-3 font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B]"
                >
                  Batalkan
                </button>
              </div>
            ) : null}

            {activeTab === "write" ? (
              <JournalWritePanel
                title={title}
                content={content}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onSave={handleSave}
                saving={savingJournal}
              />
            ) : (
              <JournalHistoryPanel journals={journals} onDelete={handleDeleteRequest} />
            )}
          </div>
        </main>
      </div>

      {deleteTargetId !== null ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border-4 border-[#1E293B] bg-[#FFFDF5] p-6 shadow-[8px_8px_0px_0px_#1E293B]">
            <h3 className="mb-2 text-xl font-extrabold text-[#1E293B]">Hapus jurnal ini?</h3>
            <p className="mb-6 text-sm font-medium text-[#64748B]">
              Data yang sudah dihapus tidak bisa dikembalikan lagi.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingJournal}
                className="flex-1 rounded-[12px] border-2 border-[#1E293B] bg-white py-3 font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingJournal}
                className="flex-1 rounded-[12px] border-2 border-[#1E293B] bg-[#F43F5E] py-3 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingJournal ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Journaling;
