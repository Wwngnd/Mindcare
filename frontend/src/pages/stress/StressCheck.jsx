import { useMemo, useState } from "react";
import { FiMenu } from "react-icons/fi";

import AppSidebar from "../../components/layout/AppSidebar";
import StressIntroPanel from "../../components/stress/StressIntroPanel";
import StressLoadingPanel from "../../components/stress/StressLoadingPanel";
import StressQuizPanel from "../../components/stress/StressQuizPanel";
import StressResultPanel from "../../components/stress/StressResultPanel";
import stressQuestions from "../../data/stressQuestions";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import { apiRequest } from "../../lib/api";
import { pickBookCategoryKeys } from "../../lib/bookCategories";
import { normalizeThumbnailUrl } from "../../lib/bookCoverResolver";
import { readAppData, writeUserData } from "../../lib/storage";

const activityLabel = (aktivitas) => {
  const map = {
    membaca: "Membaca Buku",
    journaling: "Menulis Jurnal",
    olahraga: "Olahraga",
  };
  return map[aktivitas] || aktivitas;
};

const mapAnswersToKuesionerPayload = (answers) => {
  const user = readAppData("user", {});
  // Umur default ke 21 jika tidak ada di profile (karena register tidak minta umur di Step 1/2)
  const umur = user.umur || 21; 
  const pekerjaan = user.pekerjaan || "mahasiswa";

  const tingkat_stres = parseInt(stressQuestions[0].opts[answers[0]], 10) || 3;
  const durasi_stres = Number(answers[1]) || 14;
  const penyebab_stres = stressQuestions[2].opts[answers[2]] ?? "akademik";
  const kualitas_tidur = parseInt(stressQuestions[3].opts[answers[3]], 10) || 3;
  const waktu_luang = Math.round((Number(answers[4]) || 1.5) * 60);
  const mood = parseInt(stressQuestions[5].opts[answers[5]], 10) || 2;
  const aktivitas_fisik = stressQuestions[6].opts[answers[6]] ?? "jarang";
  const preferensi_olahraga = stressQuestions[7].opts[answers[7]] ?? "tidak";
  const preferensi_membaca = stressQuestions[8].opts[answers[8]] ?? "ya";
  const preferensi_journaling = stressQuestions[9].opts[answers[9]] ?? "tidak";

  return {
    umur,
    pekerjaan,
    tingkat_stres,
    durasi_stres,
    penyebab_stres,
    kualitas_tidur,
    waktu_luang,
    mood,
    aktivitas_fisik,
    preferensi_olahraga,
    preferensi_membaca,
    preferensi_journaling,
  };
};

const StressCheck = () => {
  const { showAlert } = useAlertPopup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(new Array(stressQuestions.length).fill(null));
  const [resultData, setResultData] = useState(null);

  const startQuiz = () => {
    setCurrentQ(0);
    setAnswers(new Array(stressQuestions.length).fill(null));
    setPanel("quiz");
  };

  const cancelQuiz = () => {
    setCurrentQ(0);
    setAnswers(new Array(stressQuestions.length).fill(null));
    setResultData(null);
    setPanel("intro");
  };

  const handleSelectAnswer = (value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = value;
      return next;
    });
  };

  const nextQuestion = () => {
    if (answers[currentQ] === null) {
      showAlert("Silakan pilih jawaban!", { type: "warning", title: "Jawaban belum lengkap" });
      return;
    }
    if (currentQ < stressQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      return;
    }
    setPanel("loading");

    const payload = mapAnswersToKuesionerPayload(answers);
    apiRequest("/api/kuesioner", { method: "POST", body: payload })
      .then((json) => {
        const rekomendasi = json?.payload?.rekomendasi ?? null;
        const stressProgress = json?.payload?.stress_progress ?? null;
        setResultData(rekomendasi ? { ...rekomendasi, stress_progress: stressProgress } : null);

        if (rekomendasi?.rekomendasi_utama?.rekomendasi_buku) {
          const booksToSave = rekomendasi.rekomendasi_utama.rekomendasi_buku.map((b, i) => {
            const rawCategory = b.kategori || "";
            const categoryKeys = [...new Set(["ai_recommendation", ...pickBookCategoryKeys(rawCategory)])];
            return {
              id: `AI_REC_${Date.now()}_${i}`,
              title: b.judul,
              author: b.penulis,
              categoryKeys,
              category: rawCategory || "Self Help",
              categoriesRaw: rawCategory,
              desc: b.deskripsi,
              thumbnail: normalizeThumbnailUrl(b.thumbnail),
              match: 100,
              reason: "Direkomendasikan oleh AI berdasarkan hasil kuesioner Anda."
            };
          });
          writeUserData("ai_books", booksToSave);
        }

        setPanel("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        showAlert(err?.message || "Gagal mengirim kuesioner.", {
          type: "error",
          title: "Kuesioner gagal dikirim",
        });
        setPanel("quiz");
      });
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ((prev) => prev - 1);
  };

  const mappedResult = useMemo(() => {
    const activity = resultData?.rekomendasi_utama?.aktivitas ?? "";
    const buku = resultData?.rekomendasi_utama?.rekomendasi_buku ?? [];
    const assessment = resultData?.stress_assessment ?? {};
    return {
      insight: resultData?.insight?.alasan ?? "",
      confidencePct: Math.round((resultData?.rekomendasi_utama?.confidence ?? 0) * 100),
      stressPercent: assessment.stress_percentage ?? resultData?.stress_progress?.stress_saat_ini_percent ?? null,
      stressCategory: assessment.stress_level ?? resultData?.stress_progress?.kategori_stress ?? "",
      stressDescription: assessment.keterangan ?? resultData?.stress_progress?.keterangan_stress ?? "",
      activityLabel: activityLabel(activity),
      duration: resultData?.rekomendasi_utama?.durasi ?? 0,
      activityDetail: resultData?.rekomendasi_utama?.detail ?? "",
      books: buku.map((b) => ({
        title: b.judul,
        author: b.penulis,
        category: b.kategori,
        description: b.deskripsi,
        thumbnail: normalizeThumbnailUrl(b.thumbnail),
      })),
    };
  }, [resultData]);

  const featureStarted = panel === "quiz" || panel === "loading";

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu="Cek Stress"
          navigationLocked={featureStarted}
        />

        <main className="flex-1 min-h-screen">
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
              <h1 className="mb-1 text-3xl font-extrabold text-[#1E293B]">Cek Stress</h1>
              <p className="font-medium text-[#64748B]">Ukur tingkat stres dengan kuesioner</p>
            </div>
          </header>

          <div className="mx-auto max-w-4xl p-8 lg:p-12">
            {featureStarted ? (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={cancelQuiz}
                  className="rounded-xl border-2 border-[#1E293B] bg-white px-5 py-3 font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B]"
                >
                  Batalkan
                </button>
              </div>
            ) : null}
            {panel === "intro" ? <StressIntroPanel onStart={startQuiz} /> : null}

            {panel === "quiz" ? (
              <StressQuizPanel
                question={stressQuestions[currentQ]}
                questionIndex={currentQ}
                totalQuestions={stressQuestions.length}
                selectedAnswer={answers[currentQ]}
                onSelectAnswer={handleSelectAnswer}
                onPrev={prevQuestion}
                onNext={nextQuestion}
              />
            ) : null}

            {panel === "loading" ? <StressLoadingPanel /> : null}

            {panel === "result" && resultData ? <StressResultPanel result={mappedResult} onRetry={startQuiz} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StressCheck;
