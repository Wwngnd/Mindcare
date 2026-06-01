// const formatDuration = (seconds) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

const ExerciseHistoryPanel = ({ history, onBack }) => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Riwayat Latihan</h2>
        <button onClick={onBack} className="rounded-xl border-2 border-[#1E293B] px-4 py-1 text-sm font-bold">
          Kembali
        </button>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="py-8 text-center text-[#64748B]">Belum ada riwayat.</p>
        ) : (
          history.map((item, index) => (
            <div key={`${item.date}-${index}`} className="rounded-3xl border-2 border-[#1E293B] bg-white p-5 shadow-[4px_4px_0px_0px_#1E293B]">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">🏋️</div>
                  <div>
                    <p className="text-sm font-extrabold">{item.jenis}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-[#8B5CF6]">{item.jarak_km}km</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 border-t-2 border-dashed border-[#E2E8F0] pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#64748B]">Durasi</p>
                  <p className="text-sm font-bold">{item.durasi_menit}m</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseHistoryPanel;
