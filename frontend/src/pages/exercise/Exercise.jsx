import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ExerciseEndModal from "../../components/exercise/ExerciseEndModal";
import ExerciseHistoryPanel from "../../components/exercise/ExerciseHistoryPanel";
import ExercisePrepPanel from "../../components/exercise/ExercisePrepPanel";
import ExerciseSelectPanel from "../../components/exercise/ExerciseSelectPanel";
import ExerciseSummaryPanel from "../../components/exercise/ExerciseSummaryPanel";
import ExerciseTrackingPanel from "../../components/exercise/ExerciseTrackingPanel";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import { createOlahraga, getMyOlahraga, matchRoute } from "../../lib/api";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatPercent = (value) => {
  const percent = Number(value);
  return Number.isFinite(percent) ? `${Math.round(percent)}%` : "--";
};

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 1000,
  timeout: 15000,
};

const MAX_DISTANCE_ACCURACY_M = 45;
const MAX_DISPLAY_ACCURACY_M = 100;
const MAX_SPEED_KMH = 45;
const SMOOTHING_ALPHA = 0.35;

const smoothPoint = (prev, next) => {
  if (!prev) return next;
  return {
    lat: prev.lat + (next.lat - prev.lat) * SMOOTHING_ALPHA,
    lng: prev.lng + (next.lng - prev.lng) * SMOOTHING_ALPHA,
  };
};

const getMinDistanceThresholdKm = (accuracyMeters) => {
  const dynamicKm = (accuracyMeters ?? 0) / 1000 * 0.5;
  return Math.max(0.002, Math.min(0.015, dynamicKm));
};

const Exercise = () => {
  const { showAlert } = useAlertPopup();
  const timerRef = useRef(null);
  const watchRef = useRef(null);
  const lastPositionRef = useRef(null);
  const smoothedPositionRef = useRef(null);
  const weakSignalNoticeRef = useRef(false);
  const pausedRef = useRef(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeRef = useRef(null);
  const routePointsRef = useRef([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState("select");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("checking");
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [history, setHistory] = useState([]);
  const [matchedGeoJSON, setMatchedGeoJSON] = useState(null);
  const [rawPoints, setRawPoints] = useState([]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const fetchHistory = async () => {
    try {
      const res = await getMyOlahraga();
      setHistory(res?.payload?.olahraga || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      lastPositionRef.current = null;
      smoothedPositionRef.current = null;
      weakSignalNoticeRef.current = false;
    };
  }, []);

  const checkGPSPermission = () => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const accuracy = Number(pos?.coords?.accuracy);
        setGpsAccuracy(Number.isFinite(accuracy) ? Math.round(accuracy) : null);
        setGpsStatus(
          Number.isFinite(accuracy) && accuracy <= MAX_DISTANCE_ACCURACY_M
            ? "ready"
            : "weak",
        );
      },
      (error) => {
        if (error?.code === 1) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("weak");
        }
      },
      GPS_OPTIONS,
    );
  };

  const showPanel = (nextPanel) => {
    setPanel(nextPanel);
    if (nextPanel === "prep") {
      setGpsStatus("checking");
      checkGPSPermission();
    }
    if (nextPanel === "history") {
      fetchHistory();
    }
  };

  const selectActivity = (activity) => {
    setSelectedActivity(activity);
    showPanel("prep");
  };

  const startTracking = () => {
    if (gpsStatus === "checking" || gpsStatus === "denied") return;
    if (gpsStatus === "weak") {
      showAlert("Sinyal GPS masih lemah. Tracking tetap dimulai, tapi akurasi bisa kurang stabil.", {
        type: "warning",
        title: "Akurasi GPS",
      });
    }

    setSeconds(0);
    setDistance(0);
    setIsPaused(false);
    setMapReady(false);
    setCurrentCoords(null);
    setGpsAccuracy(null);
    lastPositionRef.current = null;
    smoothedPositionRef.current = null;
    weakSignalNoticeRef.current = false;
    routePointsRef.current = [];
    setMatchedGeoJSON(null);
    setRawPoints([]);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    userMarkerRef.current = null;
    routeRef.current = null;
    showPanel("tracking");

    if (timerRef.current) clearInterval(timerRef.current);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => (pausedRef.current ? prev : prev + 1));
    }, 1000);

    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (pausedRef.current) return;

          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          const accuracy = Number(pos?.coords?.accuracy);
          const timestamp = Number(pos?.timestamp || Date.now());

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          if (Number.isFinite(accuracy)) {
            setGpsAccuracy(Math.round(accuracy));
          }

          if (Number.isFinite(accuracy) && accuracy > MAX_DISPLAY_ACCURACY_M) {
            if (!weakSignalNoticeRef.current) {
              weakSignalNoticeRef.current = true;
              showAlert("Sinyal GPS sangat lemah. Pindah ke area lebih terbuka agar titik lebih akurat.", {
                type: "warning",
                title: "GPS belum stabil",
              });
            }
            return;
          }

          // ─── Simpan titik akurat (≤ 20 m) untuk map matching ────────────
          if (Number.isFinite(accuracy) && accuracy <= 20) {
            routePointsRef.current.push({ lat, lng });
          }

          const smoothed = smoothPoint(smoothedPositionRef.current, { lat, lng });
          smoothedPositionRef.current = smoothed;
          setCurrentCoords(smoothed);

          if (!mapRef.current && mapContainerRef.current) {
            const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
              [smoothed.lat, smoothed.lng],
              17,
            );
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
              maxZoom: 19,
            }).addTo(map);

            userMarkerRef.current = L.circleMarker([smoothed.lat, smoothed.lng], {
              radius: 8,
              color: "#ffffff",
              weight: 2,
              fillColor: "#8B5CF6",
              fillOpacity: 1,
            }).addTo(map);

            routeRef.current = L.polyline([[smoothed.lat, smoothed.lng]], {
              color: "#8B5CF6",
              weight: 5,
              opacity: 0.9,
              lineJoin: "round",
            }).addTo(map);

            mapRef.current = map;
            setMapReady(true);
            setTimeout(() => map.invalidateSize(), 0);
          } else {
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([smoothed.lat, smoothed.lng]);
            }
            if (mapRef.current) {
              mapRef.current.panTo([smoothed.lat, smoothed.lng], {
                animate: true,
                duration: 0.4,
              });
            }
          }

          if (!Number.isFinite(accuracy) || accuracy > MAX_DISTANCE_ACCURACY_M) {
            if (!weakSignalNoticeRef.current) {
              weakSignalNoticeRef.current = true;
              showAlert("Sinyal GPS belum stabil. Jarak sementara ditahan sampai akurasi membaik.", {
                type: "warning",
                title: "Akurasi rendah",
              });
            }
            return;
          }

          const last = lastPositionRef.current;
          if (!last) {
            lastPositionRef.current = {
              lat: smoothed.lat,
              lng: smoothed.lng,
              timestamp,
              accuracy,
            };
            return;
          }

          const deltaHours = (timestamp - last.timestamp) / (1000 * 3600);
          if (!Number.isFinite(deltaHours) || deltaHours <= 0) return;

          const d = haversine(last.lat, last.lng, smoothed.lat, smoothed.lng);
          const minDistance = getMinDistanceThresholdKm(Math.max(accuracy, last.accuracy ?? accuracy));
          const speedKmh = d / deltaHours;

          if (d < minDistance || speedKmh > MAX_SPEED_KMH) {
            return;
          }

          if (routeRef.current) {
            routeRef.current.addLatLng([smoothed.lat, smoothed.lng]);
          }
          setDistance((prev) => prev + d);
          lastPositionRef.current = {
            lat: smoothed.lat,
            lng: smoothed.lng,
            timestamp,
            accuracy,
          };
        },
        (error) => {
          if (error?.code === 1) {
            setGpsStatus("denied");
            showAlert("Izin lokasi dicabut saat tracking berjalan.", {
              type: "error",
              title: "GPS terputus",
            });
            return;
          }

          if (!weakSignalNoticeRef.current) {
            weakSignalNoticeRef.current = true;
            showAlert("Sinyal GPS sedang bermasalah. Coba bergerak ke area terbuka.", {
              type: "warning",
              title: "GPS bermasalah",
            });
          }
        },
        GPS_OPTIONS,
      );
    }
  };

  const pauseTracking = () => setIsPaused(true);
  const resumeTracking = () => setIsPaused(false);

  const cancelExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    timerRef.current = null;
    watchRef.current = null;
    lastPositionRef.current = null;
    smoothedPositionRef.current = null;
    weakSignalNoticeRef.current = false;
    userMarkerRef.current = null;
    routeRef.current = null;
    setShowEndModal(false);
    setSelectedActivity(null);
    setSeconds(0);
    setDistance(0);
    setIsPaused(false);
    setMapReady(false);
    setCurrentCoords(null);
    setGpsAccuracy(null);
    showPanel("select");
  };

  const finishTracking = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);

    // ✅ Joi validation expects lowercase: "lari", "jalan", "sepeda"
    const typeMapping = {
      "Berlari": "lari",
      "Berjalan": "jalan",
      "Bersepeda": "sepeda"
    };

    const payload = {
      jenis: typeMapping[selectedActivity?.name] || "lari",
      jarak_km: Math.max(0.01, Number(distance.toFixed(2))),
      durasi_menit: Math.max(1, Math.floor(seconds / 60)),
      tanggal: new Date().toISOString().split("T")[0],
      rute_maps: []
    };

    try {
      const res = await createOlahraga(payload);
      const stressLog = res?.payload?.stress_progress?.reduction_log;
      const stressState = res?.payload?.stress_progress?.state;

      if (stressLog) {
        showAlert(
          `Olahraga tersimpan. Stress turun ${formatPercent(stressLog.penurunan_percent)} menjadi ${formatPercent(stressState?.stress_saat_ini_percent)}.`,
          { type: "success", title: "Stress diperbarui" },
        );
      }

      // ─── Map Matching via OSRM ────────────────────────────────────────────
      const collectedPoints = [...routePointsRef.current];
      setRawPoints(collectedPoints);

      if (collectedPoints.length >= 2) {
        try {
          const matchRes = await matchRoute(collectedPoints);
          setMatchedGeoJSON(matchRes?.payload?.geometry ?? null);
        } catch (matchErr) {
          console.warn("Map matching gagal, rute raw digunakan:", matchErr?.message);
          setMatchedGeoJSON(null);
        }
      } else {
        setMatchedGeoJSON(null);
      }
      // ─────────────────────────────────────────────────────────────────────

      setShowEndModal(false);
      showPanel("summary");
    } catch (err) {
      console.error("Failed to save exercise:", err);
      const msg = err.response?.msg || err.message || "Terjadi kesalahan.";
      showAlert(`Gagal menyimpan data olahraga: ${msg}`, {
        type: "error",
        title: "Gagal menyimpan olahraga",
      });
    }
  };

  const featureStarted = panel === "prep" || panel === "tracking";
  const showCancelButton = panel === "prep";

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu="Olahraga"
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
              <h1 className="mb-1 text-3xl font-extrabold">Olahraga</h1>
              <p className="font-medium text-[#64748B]">Olahraga biar sehat</p>
            </div>
          </header>

          <div className="mx-auto max-w-6xl p-8 lg:p-12">
            {showCancelButton ? (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={cancelExercise}
                  className="rounded-xl border-2 border-[#1E293B] bg-white px-5 py-3 font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B]"
                >
                  Batalkan
                </button>
              </div>
            ) : null}
            {panel === "select" ? (
              <ExerciseSelectPanel onSelect={selectActivity} onOpenHistory={() => showPanel("history")} />
            ) : null}
            {panel === "prep" ? (
              <ExercisePrepPanel
                selectedActivity={selectedActivity}
                gpsStatus={gpsStatus}
                onCancel={() => showPanel("select")}
                onStart={startTracking}
                onRetryGPS={checkGPSPermission}
              />
            ) : null}
            {panel === "tracking" ? (
              <ExerciseTrackingPanel
                mapReady={mapReady}
                elapsed={formatTimer(seconds)}
                distance={distance}
                isPaused={isPaused}
                currentCoords={currentCoords}
                gpsAccuracy={gpsAccuracy}
                mapContainerRef={mapContainerRef}
                onPause={pauseTracking}
                onResume={resumeTracking}
                onStop={() => setShowEndModal(true)}
              />
            ) : null}
            {panel === "summary" ? (
              <ExerciseSummaryPanel
                durationText={`${Math.floor(seconds / 60)}m`}
                distance={distance}
                matchedGeoJSON={matchedGeoJSON}
                rawPoints={rawPoints}
                onBack={() => showPanel("select")}
              />
            ) : null}
            {panel === "history" ? <ExerciseHistoryPanel history={history} onBack={() => showPanel("select")} /> : null}
          </div>
        </main>
      </div>

      <ExerciseEndModal open={showEndModal} onContinue={() => setShowEndModal(false)} onFinish={finishTracking} />
    </div>
  );
};

export default Exercise;
