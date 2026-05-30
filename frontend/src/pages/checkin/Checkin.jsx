import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

import CheckinAnalyzingPanel from "../../components/checkin/CheckinAnalyzingPanel";
import CheckinCameraPanel from "../../components/checkin/CheckinCameraPanel";
import CheckinPreviewPanel from "../../components/checkin/CheckinPreviewPanel";
import CheckinResultPanel from "../../components/checkin/CheckinResultPanel";
import AppSidebar from "../../components/layout/AppSidebar";
import { scanStress, getMyStressScans } from "../../lib/api";
import { checkTodayStatus } from "../../utils/checkinSchedule";

// ─── Konstanta & Peta Mood ────────────────────────────────────────────────────

const moodDictionary = {
  happy: {
    emoji: "😊",
    label: "Happy",
    title: "Hari ini Anda terlihat Senang!",
    desc: "Mood positif terdeteksi. Tetap jaga semangatmu!",
    color: "#34D399",
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    title: "Mood Anda terlihat Netral",
    desc: "Kondisi stabil. Coba lakukan aktivitas yang menyenangkan!",
    color: "#8B5CF6",
  },
  sad: {
    emoji: "😢",
    label: "Sad",
    title: "Anda terlihat sedikit Sedih",
    desc: "Tidak apa-apa. Coba journaling atau olahraga ringan.",
    color: "#F472B6",
  },
  surprised: {
    emoji: "😲",
    label: "Surprised",
    title: "Ekspresi Anda terlihat Terkejut!",
    desc: "Ekspresi unik terdeteksi. Semoga harimu menyenangkan!",
    color: "#FBBF24",
  },
  angry: {
    emoji: "😠",
    label: "Angry",
    title: "Anda terlihat Kesal",
    desc: "Tarik napas dalam. Coba meditasi atau journaling.",
    color: "#EF4444",
  },
};

// Mapping mood integer dari backend → mood key string
const MOOD_BACKEND_MAP = {
  0: "angry",
  1: "sad",
  2: "neutral",
  3: "neutral",
  4: "happy",
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────

const Checkin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState("camera");

  // State kamera & capture
  const [cameraStarted, setCameraStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureDisabled, setCaptureDisabled] = useState(true);
  const [autoCaptureMessage, setAutoCaptureMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  // State hasil mood
  const [resultMood, setResultMood] = useState("neutral");
  const [resultConfidence, setResultConfidence] = useState(90);

  // ✅ Waktu check-in hari ini (diisi dari backend atau setelah konfirmasi foto)
  const [checkinAt, setCheckinAt] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectTimerRef = useRef(null);
  const countdownRef = useRef(null);

  // ─── Cek apakah hari ini sudah check-in (ambil dari backend) ─────────────
  useEffect(() => {
    const fetchTodayMood = async () => {
      try {
        setLoading(true);
        const response = await getMyStressScans();
        const scans = response?.payload?.scans || [];

        // Gunakan utility untuk cek status hari ini (berdasarkan hari kalender)
        const { checkedInToday, todayScan } = checkTodayStatus(scans);

        if (checkedInToday && todayScan) {
          const moodKey = MOOD_BACKEND_MAP[todayScan.mood] || "neutral";
          const confidence = todayScan.ai_prediction?.confidence
            ? Math.round(todayScan.ai_prediction.confidence * 100)
            : 90;

          setResultMood(moodKey);
          setResultConfidence(confidence);
          setCheckinAt(new Date(todayScan.createdAt));
          setPanel("result"); // ← langsung ke result, skip kamera
        }
      } catch (err) {
        console.error("Failed to fetch today's mood:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMood();
  }, []);

  // ─── Memoize objek hasil mood ─────────────────────────────────────────────
  const result = useMemo(() => {
    const base = moodDictionary[resultMood] || moodDictionary.neutral;
    return { ...base, confidence: resultConfidence };
  }, [resultMood, resultConfidence]);

  // ─── Helper: bersihkan timer ──────────────────────────────────────────────
  const clearTimers = () => {
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    detectTimerRef.current = null;
    countdownRef.current = null;
  };

  // ─── Helper: hentikan stream kamera ──────────────────────────────────────
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const cancelCheckin = () => {
    clearTimers();
    stopCamera();
    setCapturedImage(null);
    setCameraStarted(false);
    setFaceDetected(false);
    setCaptureDisabled(true);
    setAutoCaptureMessage("");
    setPanel("camera");
  };

  // Cleanup saat komponen unmount
  useEffect(() => {
    return () => {
      clearTimers();
      stopCamera();
    };
  }, []);

  // ─── Mulai kamera ────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      clearTimers();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStarted(true);
      setCaptureDisabled(true);
      setFaceDetected(false);
      setAutoCaptureMessage("");
      setPanel("camera");

      // Simulasi deteksi wajah + auto-capture countdown
      detectTimerRef.current = setTimeout(() => {
        setFaceDetected(true);
        setCaptureDisabled(false);

        let count = 3;
        setAutoCaptureMessage(`Auto-capture dalam ${count} detik...`);
        countdownRef.current = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            setAutoCaptureMessage("");
            capturePhoto();
          } else {
            setAutoCaptureMessage(`Auto-capture dalam ${count} detik...`);
          }
        }, 1000);
      }, 2000);
    } catch (error) {
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
      console.error(error);
    }
  };

  // ─── Capture foto ────────────────────────────────────────────────────────
  const capturePhoto = () => {
    clearTimers();
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(image);

    stopCamera();
    setPanel("preview");
  };

  // ─── Retake foto ─────────────────────────────────────────────────────────
  const retakePhoto = () => {
    setCapturedImage(null);
    setCameraStarted(false);
    setFaceDetected(false);
    setCaptureDisabled(true);
    setAutoCaptureMessage("");
    startCamera();
  };

  // ─── Helper: ambil payload dari berbagai struktur response ────────────────
  const getPredictionPayload = (response) => {
    return response?.payload || response?.data || null;
  };

  // ─── Helper: normalisasi confidence 0-1 atau 0-100 → integer persen ──────
  const normalizeConfidence = (confidence) => {
    const num = Number(confidence);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num <= 1 ? num * 100 : num);
  };

  // ─── Konfirmasi & kirim foto ke backend ──────────────────────────────────
  const confirmPhoto = async () => {
    setPanel("analyzing");

    try {
      const mimeMatch = capturedImage.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const imageMimetype = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const imageBase64 = capturedImage.split(",")[1];

      const response = await scanStress({
        image_base64: imageBase64,
        image_mimetype: imageMimetype,
      });

      const scanResult = getPredictionPayload(response);

      if (!response.success || !scanResult) {
        throw new Error("Gagal mendapatkan prediksi.");
      }

      // Backend returns the scan object: 'mood' (int) + 'ai_prediction' { label, confidence }
      const moodInt = scanResult.mood;
      const moodKey = MOOD_BACKEND_MAP[moodInt] || scanResult.ai_prediction?.label || "neutral";
      const confidence = normalizeConfidence(scanResult.ai_prediction?.confidence || 0.9);

      setResultMood(moodKey.toLowerCase());
      setResultConfidence(confidence);

      // ✅ Catat waktu check-in (gunakan createdAt dari response, atau waktu lokal sekarang)
      const checkinTime = scanResult.createdAt ? new Date(scanResult.createdAt) : new Date();
      setCheckinAt(checkinTime);

      setPanel("result");
    } catch (err) {
      console.error("Error predicting emotion:", err);
      const errMsg =
        err?.response?.errors?.[0]?.message ??
        err?.response?.msg ??
        err.message ??
        "Terjadi kesalahan.";
      alert(`Gagal menganalisis foto: ${errMsg}`);
      setPanel("preview");
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F9]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent"></div>
      </div>
    );
  }

  const featureStarted = cameraStarted || panel === "preview" || panel === "analyzing";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <style>{`@keyframes scanline{0%{top:0}100%{top:100%}}`}</style>
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu="Daily Check-in"
          navigationLocked={featureStarted}
        />

        <main className="relative min-h-screen flex-1">
          {/* Mobile menu button */}
          <div className="p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-white"
            >
              <FiMenu size={20} />
            </button>
          </div>

          {/* Desktop header */}
          <header className="hidden items-center gap-4 px-8 pt-10 pb-6 lg:flex">
            <div>
              <h1 className="mb-1 text-3xl font-extrabold text-[#1E293B]">Daily Check-in</h1>
              <p className="font-medium text-[#64748B]">Deteksi mood harianmu dengan kamera</p>
            </div>
          </header>

          {/* Panel content */}
          <div className="mx-auto max-w-4xl p-8 lg:p-12">
            {featureStarted ? (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={cancelCheckin}
                  className="rounded-xl border-2 border-[#1E293B] bg-white px-5 py-3 font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B]"
                >
                  Batalkan
                </button>
              </div>
            ) : null}
            {panel === "camera" && (
              <CheckinCameraPanel
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraStarted={cameraStarted}
                faceDetected={faceDetected}
                autoCaptureMessage={autoCaptureMessage}
                captureDisabled={captureDisabled}
                onStartCamera={startCamera}
                onCapture={capturePhoto}
              />
            )}
            {panel === "preview" && (
              <CheckinPreviewPanel imageSrc={capturedImage} onRetake={retakePhoto} onConfirm={confirmPhoto} />
            )}
            {panel === "analyzing" && <CheckinAnalyzingPanel />}
            {panel === "result" && (
              <CheckinResultPanel result={result} checkinAt={checkinAt} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkin;
