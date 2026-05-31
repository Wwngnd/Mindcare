const ExercisePrepPanel = ({ selectedActivity, gpsStatus, onCancel, onStart, onRetryGPS }) => {
  const icon =
    selectedActivity?.name === "Berlari"
      ? "🏃"
      : selectedActivity?.name === "Bersepeda"
      ? "🚴"
      : "🚶";

  const gpsStyle =
    gpsStatus === "ready"
      ? "bg-emerald-400"
      : gpsStatus === "weak"
      ? "bg-amber-400"
      : gpsStatus === "denied"
      ? "bg-red-500"
      : "bg-gray-400";

  const gpsLabel =
    gpsStatus === "ready"
      ? "GPS Siap"
      : gpsStatus === "weak"
      ? "Sinyal GPS Lemah"
      : gpsStatus === "denied"
      ? "Izin GPS Ditolak"
      : "Memeriksa GPS...";

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border-2 border-[#1E293B] bg-white p-8 text-center shadow-[8px_8px_0px_0px_#E2E8F0]">
      <div className="mb-4 text-6xl">{icon}</div>
      <h2 className="mb-2 text-2xl font-extrabold">{selectedActivity?.name || "Aktivitas"}</h2>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] px-4 py-2 text-sm font-bold">
        <span className={`h-2.5 w-2.5 rounded-full ${gpsStyle}`} />
        <span>{gpsLabel}</span>
      </div>

      {gpsStatus !== "ready" ? (
        <p className="mb-4 text-xs font-medium text-[#64748B]">
          {gpsStatus === "weak"
            ? "Pindah ke area lebih terbuka agar akurasi GPS membaik."
            : "Izinkan akses lokasi terlebih dahulu agar tracking bisa dimulai."}
        </p>
      ) : null}

      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="rounded-full border-2 border-[#1E293B] px-6 py-2 font-bold">
          Batal
        </button>

        {gpsStatus === "denied" || gpsStatus === "weak" ? (
          <button
            onClick={onRetryGPS}
            className="rounded-full border-2 border-[#1E293B] bg-amber-300 px-6 py-2 font-bold shadow-[4px_4px_0px_0px_#1E293B]"
          >
            Cek GPS Lagi
          </button>
        ) : null}

        <button
          onClick={onStart}
          disabled={gpsStatus === "checking" || gpsStatus === "denied"}
          className="rounded-full border-2 border-[#1E293B] bg-emerald-400 px-8 py-2 font-bold shadow-[4px_4px_0px_0px_#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mulai
        </button>
      </div>
    </div>
  );
};

export default ExercisePrepPanel;
