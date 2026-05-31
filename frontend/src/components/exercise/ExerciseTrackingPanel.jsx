import { FiLoader } from "react-icons/fi";

const ExerciseTrackingPanel = ({
  mapReady,
  elapsed,
  distance,
  isPaused,
  currentCoords,
  gpsAccuracy,
  mapContainerRef,
  onPause,
  onResume,
  onStop,
}) => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative z-0 h-[350px] overflow-hidden rounded-3xl border-2 border-[#1E293B]">
        {!mapReady ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#F1F5F9]">
            <FiLoader className="mb-2 animate-spin text-[#8B5CF6]" size={36} />
            <p className="text-sm font-bold">Menyiapkan Peta...</p>
          </div>
        ) : null}
        <div ref={mapContainerRef} className="h-full w-full bg-slate-100" />
      </div>

      <div className="rounded-3xl border-2 border-[#1E293B] bg-white p-6 shadow-[8px_8px_0px_0px_#E2E8F0]">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs font-bold text-[#64748B]">WAKTU</p>
            <p className="text-2xl font-extrabold">{elapsed}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#64748B]">JARAK</p>
            <p className="text-2xl font-extrabold">{distance.toFixed(2)} km</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-[#64748B]">
          {currentCoords ? `Posisi: ${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}` : "Menunggu GPS..."}
        </p>
        <p className="mt-1 text-center text-[11px] font-medium text-[#8B5CF6]">
          {gpsAccuracy ? `Akurasi GPS: ±${gpsAccuracy} m` : "Mencari akurasi GPS..."}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {!isPaused ? (
            <button
              onClick={onPause}
              className="rounded-full border-2 border-[#1E293B] bg-amber-300 px-8 py-3 font-bold shadow-[4px_4px_0px_0px_#1E293B]"
            >
              Jeda
            </button>
          ) : (
            <button
              onClick={onResume}
              className="rounded-full border-2 border-[#1E293B] bg-emerald-400 px-8 py-3 font-bold shadow-[4px_4px_0px_0px_#1E293B]"
            >
              Lanjut
            </button>
          )}
          <button
            onClick={onStop}
            className="rounded-full border-2 border-[#1E293B] bg-red-500 px-8 py-3 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B]"
          >
            Berhenti
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTrackingPanel;
