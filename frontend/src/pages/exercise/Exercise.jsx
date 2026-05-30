import { useEffect, useMemo, useRef, useState } from "react";
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
import { createOlahraga, getMyOlahraga } from "../../lib/api";

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

const Exercise = () => {
  const timerRef = useRef(null);
  const watchRef = useRef(null);
  const lastPositionRef = useRef(null);
  const pausedRef = useRef(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeRef = useRef(null);

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
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await getMyOlahraga();
      setHistory(res?.payload?.olahraga || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (panel === "history") {
      fetchHistory();
    }
  }, [panel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const checkGPSPermission = () => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGpsStatus("ready"),
      () => setGpsStatus("denied"),
    );
  };

  const showPanel = (nextPanel) => {
    setPanel(nextPanel);
    if (nextPanel === "prep") {
      setGpsStatus("checking");
      checkGPSPermission();
    }
  };

  const selectActivity = (activity) => {
    setSelectedActivity(activity);
    showPanel("prep");
  };

  const startTracking = () => {
    if (gpsStatus !== "ready") return;
    setSeconds(0);
    setDistance(0);
    setIsPaused(false);
    setMapReady(false);
    setCurrentCoords(null);
    lastPositionRef.current = null;
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
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentCoords({ lat, lng });

          if (!mapRef.current && mapContainerRef.current) {
            const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([lat, lng], 17);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
              maxZoom: 19,
            }).addTo(map);

            userMarkerRef.current = L.circleMarker([lat, lng], {
              radius: 8,
              color: "#ffffff",
              weight: 2,
              fillColor: "#8B5CF6",
              fillOpacity: 1,
            }).addTo(map);

            routeRef.current = L.polyline([[lat, lng]], {
              color: "#8B5CF6",
              weight: 5,
              opacity: 0.9,
              lineJoin: "round",
            }).addTo(map);

            mapRef.current = map;
            setMapReady(true);
            setTimeout(() => map.invalidateSize(), 0);
          } else {
            if (userMarkerRef.current) userMarkerRef.current.setLatLng([lat, lng]);
            if (routeRef.current) routeRef.current.addLatLng([lat, lng]);
            if (mapRef.current) mapRef.current.panTo([lat, lng], { animate: true, duration: 0.4 });
          }

          if (lastPositionRef.current) {
            const d = haversine(lastPositionRef.current.lat, lastPositionRef.current.lng, lat, lng);
            if (d > 0.002) setDistance((prev) => prev + d);
          }
          lastPositionRef.current = { lat, lng };
        },
        () => undefined,
        { enableHighAccuracy: true },
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
    userMarkerRef.current = null;
    routeRef.current = null;
    setShowEndModal(false);
    setSelectedActivity(null);
    setSeconds(0);
    setDistance(0);
    setIsPaused(false);
    setMapReady(false);
    setCurrentCoords(null);
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
      jarak_km: Math.max(0.01, Number(distance.toFixed(2))), // Minimal 0.01 agar lolos Joi positive()
      durasi_menit: Math.max(1, Math.floor(seconds / 60)),
      tanggal: new Date().toISOString().split("T")[0], // ✅ Format YYYY-MM-DD untuk kolom DATE MySQL
      rute_maps: []
    };

    try {
      await createOlahraga(payload);
      setShowEndModal(false);
      showPanel("summary");
    } catch (err) {
      console.error("Failed to save exercise:", err);
      const msg = err.response?.msg || err.message || "Terjadi kesalahan.";
      alert(`Gagal menyimpan data olahraga: ${msg}`);
    }
  };

  const featureStarted = panel === "prep" || panel === "tracking";

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
            {featureStarted ? (
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
