import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

import JournalHistoryPanel from "../../components/journaling/JournalHistoryPanel";
import JournalTabs from "../../components/journaling/JournalTabs";
import JournalWritePanel from "../../components/journaling/JournalWritePanel";
import AppSidebar from "../../components/layout/AppSidebar";
import { apiRequest } from "../../lib/api";

const Journaling = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const sessionStartedRef = useRef(false);

  const [journals, setJournals] = useState([]);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await apiRequest("api/journal/me");
        if (res.success && res.payload) {
          const fetchedJournals = Object.values(res.payload).map((item) => ({
            id: item.id,
            title: item.judul,
            content: item.deskripsi,
            durationSeconds: item.durasi,
            date: item.createdAt,
          }));
          setJournals(fetchedJournals);
        }
      } catch (err) {
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

  const cancelJournal = () => {
    setTitle("");
    setContent("");
    resetSessionTimer();
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Konten tidak boleh kosong!");
      return;
    }

    try {
      await apiRequest("api/journal", {
        method: "POST",
        body: {
          judul: title.trim() || "Tanpa Judul",
          deskripsi: content.trim(),
          durasi: elapsedSeconds,
        },
      });

      alert("Jurnal disimpan!");
      setTitle("");
      setContent("");
      resetSessionTimer();
      setRefreshKey((prev) => prev + 1);
      setActiveTab("history");
    } catch (err) {
      alert(err.message || "Gagal menyimpan jurnal");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jurnal ini?")) return;
    try {
      await apiRequest(`api/journal/${id}`, { method: "DELETE" });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert(err.message || "Gagal menghapus jurnal");
    }
  };

  const featureStarted = activeTab === "write" && Boolean(title.trim() || content.trim() || timerRunning);

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

            {featureStarted ? (
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
                elapsedSeconds={elapsedSeconds}
                timerActive={timerRunning}
              />
            ) : (
              <JournalHistoryPanel journals={journals} onDelete={handleDelete} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Journaling;
