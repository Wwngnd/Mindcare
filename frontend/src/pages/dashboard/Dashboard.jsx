import { useEffect, useMemo, useState } from "react";
import { FiMenu } from "react-icons/fi";

import ActivityGrid from "../../components/dashboard/ActivityGrid";
import MoodChartCard from "../../components/dashboard/MoodChartCard";
import StatusCards from "../../components/dashboard/StatusCards";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import AppSidebar from "../../components/layout/AppSidebar";
import { apiRequest } from "../../lib/api";
import { readAppData } from "../../lib/storage";

const moodToEmoji = {
  happy: "\uD83D\uDE0A",
  neutral: "\uD83D\uDE10",
  sad: "\uD83D\uDE22",
  angry: "\uD83D\uDE20",
  surprised: "\uD83D\uDE32",
};

const moodScoreMap = {
  0: "angry",
  1: "sad",
  2: "neutral",
  3: "neutral",
  4: "happy",
  5: "happy",
};

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDayStart = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const toDateKey = (value) => {
  const date = toDayStart(value);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractArrayPayload = (payload, expectedKey) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (expectedKey && Array.isArray(payload[expectedKey])) return payload[expectedKey];
  return Object.values(payload).filter((item) => item && typeof item === "object");
};

const normalizeMoodKey = (value) => {
  if (value == null) return null;
  if (typeof value === "number") return moodScoreMap[value] || null;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return moodScoreMap[numericValue] || null;

  const key = String(value).toLowerCase().trim();
  return moodToEmoji[key] ? key : null;
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    user: readAppData("user", {}),
    stressScans: [],
    stressProgress: null,
  });

  useEffect(() => {
    let mounted = true;

    const withFallback = async (request) => {
      try {
        return await request;
      } catch (err) {
        if (err?.status !== 404) {
          console.error("Dashboard endpoint error:", err);
        }
        return { success: true, payload: {} };
      }
    };

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const [userRes, scansRes, progressRes] = await Promise.all([
          withFallback(apiRequest("/api/auth/me")),
          withFallback(apiRequest("/api/stress-scan/me")),
          withFallback(apiRequest("/api/stress-progress/me")),
        ]);

        if (!mounted) return;

        setDashboardData((prev) => ({
          user: userRes?.payload?.user || prev.user,
          stressScans: extractArrayPayload(scansRes?.payload, "scans"),
          stressProgress: progressRes?.payload || null,
        }));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const moodInfo = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const todayCandidates = dashboardData.stressScans
      .filter((item) => toDateKey(item?.createdAt || item?.tanggal) === todayKey)
      .sort((a, b) => new Date(b.createdAt || b.tanggal) - new Date(a.createdAt || a.tanggal));

    const latest = todayCandidates[0] || null;
    const moodKey = normalizeMoodKey(latest?.mood);

    return {
      hasCheckIn: Boolean(latest),
      moodToday: moodKey ? moodToEmoji[moodKey] : "--",
    };
  }, [dashboardData.stressScans]);

  const moodRows = useMemo(() => {
    const byDay = new Map();
    const registerMood = (entries) => {
      entries.forEach((item) => {
        const timestamp = toDate(item?.createdAt || item?.tanggal);
        const dayKey = toDateKey(timestamp);
        const moodKey = normalizeMoodKey(item?.mood);
        if (!timestamp || !dayKey || !moodKey) return;

        const prev = byDay.get(dayKey);
        if (!prev || timestamp > prev.timestamp) {
          byDay.set(dayKey, { moodKey, timestamp });
        }
      });
    };

    registerMood(dashboardData.stressScans);

    const today = toDayStart(new Date()) || new Date();
    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - offset));
      const dateKey = toDateKey(date);
      const found = byDay.get(dateKey);

      return {
        dateKey,
        dayLabel: date.toLocaleDateString("id-ID", { weekday: "short" }),
        moodKey: found?.moodKey ?? null,
      };
    });
  }, [dashboardData.stressScans]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F9]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeMenu="Dashboard" />

        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-white shadow-[4px_4px_0px_0px_#1E293B]"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
            <WelcomeCard userName={dashboardData.user?.name} />
            <StatusCards
              stressProgress={dashboardData.stressProgress}
              moodToday={moodInfo.moodToday}
              hasCheckIn={moodInfo.hasCheckIn}
            />
            <ActivityGrid />
            <MoodChartCard moodRows={moodRows} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
