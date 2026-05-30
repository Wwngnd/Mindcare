import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiClock, FiHome } from "react-icons/fi";
import { formatTime, getTomorrowLabel, getTimeUntilMidnight } from "../../utils/checkinSchedule";

/**
 * CheckinResultPanel
 * Menampilkan hasil mood hari ini beserta countdown check-in berikutnya.
 *
 * Props:
 *  - result    : objek mood (emoji, label, title, desc, color, confidence)
 *  - checkinAt : Date|string waktu check-in dilakukan (opsional)
 */
const CheckinResultPanel = ({ result, checkinAt }) => {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Countdown tick setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#1E293B] bg-white p-10 text-center shadow-[8px_8px_0px_0px_#E2E8F0]">
      {/* Emoji mood */}
      <div className="mb-4 text-[5rem] leading-none">{result.emoji}</div>

      {/* Label mood */}
      <div
        className="mb-4 inline-block rounded-full border-2 border-[#1E293B] px-4 py-1.5 text-xs font-bold text-[#1E293B] shadow-[2px_2px_0px_0px_#1E293B]"
        style={{ backgroundColor: result.color }}
      >
        {result.label}
      </div>

      <h2 className="mb-2 text-2xl font-extrabold">{result.title}</h2>
      <p className="mb-2 text-sm text-[#64748B]">{result.desc}</p>
      <p className="mb-6 text-xs font-bold text-[#8B5CF6]">Akurasi: {result.confidence}%</p>

      {/* Waktu check-in & jadwal berikutnya */}
      <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 text-left">
        {checkinAt && (
          <p className="mb-2 text-xs text-[#64748B]">
            ✅ Check-in hari ini:{" "}
            <span className="font-bold text-[#1E293B]">{formatTime(checkinAt)}</span>
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <FiClock size={13} className="shrink-0 text-[#8B5CF6]" />
          <span>
            Check-in berikutnya:{" "}
            <span className="font-bold text-[#1E293B]">{getTomorrowLabel()}</span>
          </span>
        </div>
        <p className="mt-2 font-mono text-lg font-extrabold tracking-wider text-[#8B5CF6]">
          {countdown}
        </p>
        <p className="text-[10px] text-[#94A3B8]">tersisa hingga tengah malam</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
        >
          <FiHome size={16} /> Ke Dashboard
        </Link>
        <a
          href="/stress-check.html"
          className="flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-white px-6 py-3 text-sm font-bold text-[#1E293B] shadow-[3px_3px_0px_0px_#E2E8F0] transition-all hover:-translate-y-0.5"
        >
          <FiActivity size={16} /> Cek Stress
        </a>
      </div>
    </div>
  );
};

export default CheckinResultPanel;
