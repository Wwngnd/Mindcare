import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Komponen peta ringkasan (Leaflet vanilla, konsisten dengan Exercise.jsx) ──
const SummaryMap = ({ matchedGeoJSON, rawPoints }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // sudah init

    // Tentukan center dari GeoJSON atau rawPoints
    let center = [-6.2, 106.816]; // fallback Jakarta
    if (matchedGeoJSON?.coordinates?.length) {
      const [lng, lat] = matchedGeoJSON.coordinates[0];
      center = [lat, lng];
    } else if (rawPoints?.length) {
      center = [rawPoints[0].lat, rawPoints[0].lng];
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(center, 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (matchedGeoJSON) {
      // Render rute snap-to-road (GeoJSON LineString dari OSRM)
      const layer = L.geoJSON(matchedGeoJSON, {
        style: {
          color: "#8B5CF6",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
        },
      }).addTo(map);

      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24] });
    } else if (rawPoints?.length >= 2) {
      // Fallback: render polyline raw GPS
      const latlngs = rawPoints.map((p) => [p.lat, p.lng]);
      const poly = L.polyline(latlngs, {
        color: "#94a3b8",
        weight: 4,
        opacity: 0.8,
        lineJoin: "round",
        dashArray: "8, 6",
      }).addTo(map);

      const bounds = poly.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24] });
    }

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [matchedGeoJSON, rawPoints]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

// ─── Panel Summary ─────────────────────────────────────────────────────────────
const ExerciseSummaryPanel = ({ durationText, distance, matchedGeoJSON, rawPoints, onBack }) => {
  const hasRoute = matchedGeoJSON || (rawPoints && rawPoints.length >= 2);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Peta rute */}
      {hasRoute && (
        <div className="overflow-hidden rounded-3xl border-2 border-[#1E293B] shadow-[8px_8px_0px_0px_#E2E8F0]">
          <div className="border-b border-[#1E293B] bg-white px-5 py-3 flex items-center gap-2">
            <span className="text-sm font-bold">
              {matchedGeoJSON ? "🛣️ Rute Akurat (Map Matched)" : "📍 Rute GPS"}
            </span>
            {!matchedGeoJSON && rawPoints?.length >= 2 && (
              <span className="text-[11px] text-[#64748B] font-medium">(rute raw — map matching tidak tersedia)</span>
            )}
          </div>
          <div className="h-[280px] bg-slate-100">
            <SummaryMap matchedGeoJSON={matchedGeoJSON} rawPoints={rawPoints} />
          </div>
        </div>
      )}

      {/* Statistik & tombol kembali */}
      <div className="rounded-3xl border-2 border-[#1E293B] bg-white p-8 text-center shadow-[8px_8px_0px_0px_#E2E8F0]">
        <h2 className="mb-4 text-2xl font-extrabold">Selesai! 🎉</h2>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#F1F5F9] p-4">
            <p className="text-xl font-bold">{durationText}</p>
            <p className="text-xs">Durasi</p>
          </div>
          <div className="rounded-2xl bg-[#F1F5F9] p-4">
            <p className="text-xl font-bold">{distance.toFixed(2)}km</p>
            <p className="text-xs">Jarak</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B]"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default ExerciseSummaryPanel;
