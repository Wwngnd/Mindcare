import { useEffect, useMemo, useState } from "react";
import { FiMenu } from "react-icons/fi";

import ActivityGrid from "../../components/dashboard/ActivityGrid";
import AppSidebar from "../../components/layout/AppSidebar";
import MoodChartCard from "../../components/dashboard/MoodChartCard";
import StatusCards from "../../components/dashboard/StatusCards";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import ExerciseStatsCard from "../../components/dashboard/ExerciseStatsCard";
import { readAppData } from "../../lib/storage";
import { apiRequest, getOlahragaStatistikPerJenis } from "../../lib/api";

const moodToEmoji = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    user: readAppData("user", {}),
    moods: [],
    stressScans: [],
    journals: [],
    exerciseStats: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch User Profile (to get latest data)
        const userRes = await apiRequest("/api/auth/me");
        
        // Fetch Moods/Stress Scans
        const scansRes = await apiRequest("/api/stress-scan/me").catch(() => ({ success: true, payload: { scans: [] } }));
        
        // Fetch Journals
        const journalsRes = await apiRequest("/api/journal/me").catch(() => ({ success: true, payload: { journals: [] } }));

        // Fetch Exercise Stats
        const exerciseStatsRes = await getOlahragaStatistikPerJenis().catch(() => null);

        setDashboardData({
          user: userRes?.payload?.user || dashboardData.user,
          moods: scansRes?.payload?.scans || [],
          stressScans: scansRes?.payload?.scans || [],
          journals: journalsRes?.payload?.journals || [],
          exerciseStats: exerciseStatsRes?.payload || null,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const moodInfo = useMemo(() => {
    const today = new Date().toDateString();
    const todayMood = dashboardData.moods.find((item) => new Date(item.createdAt).toDateString() === today);
    
    const moodMapping = { 0: "angry", 1: "sad", 2: "neutral", 3: "neutral", 4: "happy", 5: "happy" };
    const moodLabel = todayMood ? (typeof todayMood.mood === 'number' ? moodMapping[todayMood.mood] : todayMood.mood) : null;

    return {
      hasCheckIn: Boolean(todayMood),
      moodToday: moodLabel ? moodToEmoji[moodLabel] || "😊" : "--",
    };
  }, [dashboardData.moods]);

  const stressInfo = useMemo(() => {
    if (!dashboardData.stressScans.length) return { score: "--", trend: "flat" };
    const scans = [...dashboardData.stressScans].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const latest = scans[scans.length - 1];
    
    const score = latest.tingkat_stres;
    
    if (scans.length === 1) return { score, trend: "down" };
    const prev = scans[scans.length - 2];
    if (latest.tingkat_stres > prev.tingkat_stres) return { score, trend: "up" };
    if (latest.tingkat_stres < prev.tingkat_stres) return { score, trend: "down" };
    return { score, trend: "flat" };
  }, [dashboardData.stressScans]);

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F5F9]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent"></div>
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
            <WelcomeCard userName={dashboardData.user.name} />
            <StatusCards
              stressScore={stressInfo.score}
              stressTrend={stressInfo.trend}
              moodToday={moodInfo.moodToday}
              hasCheckIn={moodInfo.hasCheckIn}
            />
            <ActivityGrid />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <MoodChartCard moods={dashboardData.moods} />
              <ExerciseStatsCard stats={dashboardData.exerciseStats} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
