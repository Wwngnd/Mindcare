import { FiActivity, FiMap, FiClock, FiTrendingUp } from "react-icons/fi";

const ExerciseStatsCard = ({ stats }) => {
  if (!stats || !stats.overall) {
    return (
      <section className="rounded-xl border-2 border-[#1E293B] bg-white p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold">
          <FiActivity className="text-pink-500" size={20} />
          Statistik Olahraga
        </h3>
        <p className="py-8 text-center text-[#64748B]">Belum ada data olahraga.</p>
      </section>
    );
  }

  const { overall, per_jenis } = stats;

  const typeIcons = {
    Lari: "🏃",
    Jalan: "🚶",
    Sepeda: "🚴",
    Yoga: "🧘",
    Lainnya: "💪",
  };

  const typeColors = {
    Lari: "bg-emerald-400/10 text-emerald-600 border-emerald-400/20",
    Jalan: "bg-blue-400/10 text-blue-600 border-blue-400/20",
    Sepeda: "bg-orange-400/10 text-orange-600 border-orange-400/20",
    Yoga: "bg-purple-400/10 text-purple-600 border-purple-400/20",
    Lainnya: "bg-gray-400/10 text-gray-600 border-gray-400/20",
  };

  return (
    <section className="rounded-xl border-2 border-[#1E293B] bg-white p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold">
        <FiActivity className="text-pink-500" size={20} />
        Statistik Olahraga
      </h3>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] p-4 text-center">
          <FiActivity className="mb-2 text-[#8B5CF6]" size={18} />
          <p className="text-xl font-extrabold">{overall.total_aktivitas}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Sesi</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] p-4 text-center">
          <FiMap className="mb-2 text-emerald-500" size={18} />
          <p className="text-xl font-extrabold">{Number(overall.total_jarak_km).toFixed(1)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Km Total</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] p-4 text-center">
          <FiClock className="mb-2 text-amber-500" size={18} />
          <p className="text-xl font-extrabold">{overall.total_durasi_menit}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Menit</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-[#64748B]">
          <FiTrendingUp size={14} />
          Berdasarkan Jenis
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {per_jenis.map((item) => (
            <div
              key={item.jenis}
              className={`flex items-center justify-between rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-[3px_3px_0px_0px_#1E293B]`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeIcons[item.jenis] || typeIcons.Lainnya}</span>
                <div>
                  <p className="text-sm font-extrabold">{item.jenis}</p>
                  <p className="text-[10px] font-bold text-[#64748B]">{item.total_aktivitas} Aktivitas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-[#8B5CF6]">{Number(item.total_jarak_km).toFixed(1)} km</p>
                <p className="text-[10px] font-bold text-[#64748B]">{item.total_durasi_menit} min</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExerciseStatsCard;
