import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiHome,
} from "react-icons/fi";
import { formatTime, getTomorrowLabel, getTimeUntilMidnight } from "../../utils/checkinSchedule";

const CheckinResultPanel = ({ result, checkinAt }) => {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const hasConfidence = Number.isFinite(result.confidence);
  const emotionProbabilities = Array.isArray(result.probabilities) ? result.probabilities : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#1E293B] bg-white p-6 text-center shadow-[8px_8px_0px_0px_#E2E8F0] sm:p-10">
      <div className="mb-4 text-[5rem] leading-none" aria-hidden="true">{result.emoji}</div>

      <div
        className="mb-4 inline-block rounded-full border-2 border-[#1E293B] px-4 py-1.5 text-xs font-bold text-[#1E293B] shadow-[2px_2px_0px_0px_#1E293B]"
        style={{ backgroundColor: result.color }}
      >
        {result.label}
      </div>

      <h2 className="mb-2 text-2xl font-extrabold">{result.title}</h2>
      <p className="mb-2 text-sm text-[#64748B]">{result.desc}</p>
      {hasConfidence ? (
        <p className="mb-4 text-xs font-bold text-[#8B5CF6]">Confidence AI: {result.confidence}%</p>
      ) : null}

      {emotionProbabilities.length ? (
        <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-left">
          <p className="mb-3 text-xs font-extrabold text-[#1E293B]">Distribusi emosi AI</p>
          <div className="space-y-2">
            {emotionProbabilities.map((item) => (
              <div key={item.key} className="grid grid-cols-[56px_1fr_38px] items-center gap-2 text-xs">
                <span className="font-bold text-[#475569]">{item.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#8B5CF6]"
                    style={{ width: `${Math.max(0, Math.min(100, item.percent))}%` }}
                  />
                </div>
                <span className="text-right font-bold text-[#1E293B]">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 text-left">
        {checkinAt && (
          <p className="mb-2 flex items-center gap-2 text-xs text-[#64748B]">
            <FiCheckCircle size={13} className="shrink-0 text-emerald-500" />
            <span>
              Check-in hari ini:{" "}
              <span className="font-bold text-[#1E293B]">{formatTime(checkinAt)}</span>
            </span>
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

      <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
        >
          <FiHome size={16} /> Ke Dashboard
        </Link>
        <Link
          to="/stress-check"
          className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-white px-6 py-3 text-sm font-bold text-[#1E293B] shadow-[3px_3px_0px_0px_#E2E8F0] transition-all hover:-translate-y-0.5"
        >
          <FiActivity size={16} /> Cek Stress
        </Link>
      </div>
    </div>
  );
};

export default CheckinResultPanel;
