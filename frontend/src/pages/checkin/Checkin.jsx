import { useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

import CheckinAnalyzingPanel from "../../components/checkin/CheckinAnalyzingPanel";
import CheckinCameraPanel from "../../components/checkin/CheckinCameraPanel";
import CheckinPreviewPanel from "../../components/checkin/CheckinPreviewPanel";
import CheckinResultPanel from "../../components/checkin/CheckinResultPanel";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import { scanStress, getMyStressScans } from "../../lib/api";
import { readUserData, writeUserData } from "../../lib/storage";
import { checkTodayStatus, getDateString } from "../../utils/checkinSchedule";

// ─── Konstanta & Peta Mood ────────────────────────────────────────────────────

const moodDictionary = {
  happy: {
    emoji: "\uD83D\uDE0A",
    label: "Happy",
    title: "Hari ini Anda terlihat Senang!",
    desc: "Mood positif terdeteksi. Tetap jaga semangatmu!",
    color: "#34D399",
  },
  neutral: {
    emoji: "\uD83D\uDE10",
    label: "Neutral",
    title: "Mood Anda terlihat Netral",
    desc: "Kondisi stabil. Coba lakukan aktivitas yang menyenangkan!",
    color: "#8B5CF6",
  },
  sad: {
    emoji: "\uD83D\uDE22",
    label: "Sad",
    title: "Anda terlihat sedikit Sedih",
    desc: "Tidak apa-apa. Coba journaling atau olahraga ringan.",
    color: "#F472B6",
  },
  surprised: {
    emoji: "\uD83D\uDE32",
    label: "Surprised",
    title: "Ekspresi Anda terlihat Terkejut!",
    desc: "Ekspresi unik terdeteksi. Semoga harimu menyenangkan!",
    color: "#FBBF24",
  },
  angry: {
    emoji: "\uD83D\uDE20",
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

const CAPTURE_SIZE = 512;
const FACE_CROP_SCALE = 0.82;
const MIN_FRAME_BRIGHTNESS = 35;
const MAX_FRAME_BRIGHTNESS = 225;
const MIN_FRAME_CONTRAST = 16;
const FACE_PROBABILITY_ORDER = ["happy", "neutral", "sad", "angry"];
const FACE_PROBABILITY_LABELS = {
  happy: "Senang",
  neutral: "Netral",
  sad: "Sedih",
  angry: "Marah",
};
const FACE_PREDICTION_CACHE_KEY = "daily_checkin_face_prediction";

const getCanvasQuality = (ctx, width, height) => {
  const { data } = ctx.getImageData(0, 0, width, height);
  let count = 0;
  let sum = 0;
  let squaredSum = 0;

  for (let i = 0; i < data.length; i += 16) {
    const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += luminance;
    squaredSum += luminance * luminance;
    count += 1;
  }

  const brightness = count ? sum / count : 0;
  const variance = count ? squaredSum / count - brightness * brightness : 0;
  const contrast = Math.sqrt(Math.max(variance, 0));

  return { brightness, contrast };
};

const isFrameClearEnough = ({ brightness, contrast }) => {
  return (
    brightness >= MIN_FRAME_BRIGHTNESS &&
    brightness <= MAX_FRAME_BRIGHTNESS &&
    contrast >= MIN_FRAME_CONTRAST
  );
};

const normalizeConfidence = (confidence) => {
  const num = Number(confidence);
  if (!Number.isFinite(num)) return null;
  return Math.round(num <= 1 ? num * 100 : num);
};

const normalizeFaceProbabilities = (probabilities = {}) => {
  if (!probabilities || typeof probabilities !== "object") return [];

  const probabilityMap = new Map();
  Object.entries(probabilities).forEach(([key, value]) => {
    const normalizedKey = String(key).toLowerCase().trim();
    const num = Number(value);

    if (FACE_PROBABILITY_ORDER.includes(normalizedKey) && Number.isFinite(num)) {
      probabilityMap.set(normalizedKey, Math.round(num <= 1 ? num * 100 : num));
    }
  });

  return FACE_PROBABILITY_ORDER
    .filter((key) => probabilityMap.has(key))
    .map((key) => ({
      key,
      label: FACE_PROBABILITY_LABELS[key],
      percent: probabilityMap.get(key),
    }));
};

const readTodayFacePredictionCache = (createdAt) => {
  const cached = readUserData(FACE_PREDICTION_CACHE_KEY, null);
  if (!cached?.date || !createdAt) return null;
  return cached.date === getDateString(createdAt) ? cached.ai_prediction : null;
};

const writeTodayFacePredictionCache = (createdAt, aiPrediction) => {
  if (!aiPrediction) return;
  writeUserData(FACE_PREDICTION_CACHE_KEY, {
    date: getDateString(createdAt),
    ai_prediction: aiPrediction,
  });
};

const Checkin = () => {
  const { showAlert } = useAlertPopup();
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
  const [resultConfidence, setResultConfidence] = useState(null);
  const [resultProbabilities, setResultProbabilities] = useState([]);

  // ✅ Waktu check-in hari ini (diisi dari backend atau setelah konfirmasi foto)
  const [checkinAt, setCheckinAt] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const retakingRef = useRef(false);
  const confirmingRef = useRef(false);

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
          const cachedPrediction = todayScan.ai_prediction || readTodayFacePredictionCache(todayScan.createdAt);
          const confidence = normalizeConfidence(cachedPrediction?.confidence);
          const probabilities = normalizeFaceProbabilities(cachedPrediction?.probabilities);

          setResultMood(moodKey);
          setResultConfidence(confidence);
          setResultProbabilities(probabilities);
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
    return {
      ...base,
      confidence: resultConfidence,
      probabilities: resultProbabilities,
    };
  }, [resultMood, resultConfidence, resultProbabilities]);

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

      // Simulasi kesiapan wajah. User tetap memilih momen capture agar ekspresi lebih jelas.
      detectTimerRef.current = setTimeout(() => {
        setFaceDetected(true);
        setCaptureDisabled(false);
        setAutoCaptureMessage("Wajah siap. Tekan Capture saat ekspresimu sudah sesuai.");
      }, 2000);
    } catch (error) {
      showAlert("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.", {
        type: "warning",
        title: "Akses kamera ditolak",
      });
      console.error(error);
    }
  };

  // ─── Capture foto ────────────────────────────────────────────────────────
  const capturePhoto = () => {
    clearTimers();
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      showAlert("Kamera belum siap. Tunggu sebentar lalu coba capture lagi.", {
        type: "warning",
        title: "Kamera belum siap",
      });
      setCaptureDisabled(false);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const sourceSize = Math.floor(Math.min(videoWidth, videoHeight) * FACE_CROP_SCALE);
    const sourceX = Math.max(0, Math.round((videoWidth - sourceSize) / 2));
    const sourceY = Math.max(0, Math.round((videoHeight - sourceSize) / 2));

    canvas.width = CAPTURE_SIZE;
    canvas.height = CAPTURE_SIZE;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(CAPTURE_SIZE, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
    ctx.restore();

    const frameQuality = getCanvasQuality(ctx, CAPTURE_SIZE, CAPTURE_SIZE);
    if (!isFrameClearEnough(frameQuality)) {
      showAlert("Foto kurang jelas. Pastikan wajah berada di tengah dan pencahayaan cukup.", {
        type: "warning",
        title: "Foto belum siap",
      });
      setCaptureDisabled(false);
      setAutoCaptureMessage("");
      return;
    }

    const image = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(image);

    stopCamera();
    setCameraStarted(false);
    setPanel("preview");
  };

  // ─── Retake foto ─────────────────────────────────────────────────────────
  // Tandai bahwa kita sedang retake; useEffect di bawah akan mulai kamera
  // setelah React selesai me-render panel "camera" (videoRef tersedia).
  const retakePhoto = () => {
    clearTimers();
    stopCamera();
    setCapturedImage(null);
    setCameraStarted(false);
    setFaceDetected(false);
    setCaptureDisabled(true);
    setAutoCaptureMessage("");
    retakingRef.current = true;
    setPanel("camera");
  };

  // ─── Mulai kamera otomatis setelah retake (tunggu render selesai) ─────────
  useEffect(() => {
    if (panel === "camera" && retakingRef.current) {
      retakingRef.current = false;
      // Beri satu frame agar videoRef.current sudah ada di DOM
      const raf = requestAnimationFrame(() => {
        startCamera();
      });
      return () => cancelAnimationFrame(raf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  // ─── Helper: ambil payload dari berbagai struktur response ────────────────
  const getPredictionPayload = (response) => {
    return response?.payload || response?.data || null;
  };

  // ─── Helper: normalisasi confidence 0-1 atau 0-100 → integer persen ──────
  // ─── Konfirmasi & kirim foto ke backend ──────────────────────────────────
  const confirmPhoto = async () => {
    if (confirmingRef.current) return;

    confirmingRef.current = true;
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
      const confidence = normalizeConfidence(scanResult.ai_prediction?.confidence);
      const probabilities = normalizeFaceProbabilities(scanResult.ai_prediction?.probabilities);

      if (import.meta.env.DEV) {
        console.debug("Face scan prediction", scanResult.ai_prediction);
      }

      setResultMood(moodKey.toLowerCase());
      setResultConfidence(confidence);
      setResultProbabilities(probabilities);

      // ✅ Catat waktu check-in (gunakan createdAt dari response, atau waktu lokal sekarang)
      const checkinTime = scanResult.createdAt ? new Date(scanResult.createdAt) : new Date();
      writeTodayFacePredictionCache(checkinTime, scanResult.ai_prediction);
      setCheckinAt(checkinTime);

      setPanel("result");
    } catch (err) {
      console.error("Error predicting emotion:", err);
      const errMsg =
        err?.response?.errors?.[0]?.message ??
        err?.response?.msg ??
        err.message ??
        "Terjadi kesalahan.";
      showAlert(`Gagal menganalisis foto: ${errMsg}`, {
        type: "error",
        title: "Analisis foto gagal",
      });
      confirmingRef.current = false;
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
