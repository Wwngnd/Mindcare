import { FiBarChart2 } from "react-icons/fi";

const moodValuesMap = { angry: 1, sad: 2, neutral: 3, happy: 5 };
const moodMapping = { 0: "angry", 1: "sad", 2: "neutral", 3: "neutral", 4: "happy", 5: "happy" };
const moodColors = {
  happy: "#34D399",
  neutral: "#8B5CF6",
  sad: "#F472B6",
  angry: "#EF4444",
};
const moodEmoji = ["", "😠", "😢", "😐", "😊", "😊"];

const MoodChartCard = ({ moods }) => {
  const rows = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayLabel = date.toLocaleDateString("id-ID", { weekday: "short" });
    const found = moods.find((item) => 
      new Date(item.createdAt || item.date).toDateString() === date.toDateString()
    );
    
    let moodKey = "neutral";
    if (found) {
        if (typeof found.mood === 'number') {
            moodKey = moodMapping[found.mood] || "neutral";
        } else {
            moodKey = found.mood;
        }
    }
    
    const value = found ? moodValuesMap[moodKey] || 3 : 0;
    rows.push({
      dayLabel,
      value,
      color: found ? moodColors[moodKey] || "#8B5CF6" : "#E2E8F0",
    });
  }

  return (
    <section className="rounded-xl border-2 border-[#1E293B] bg-white p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold">
        <FiBarChart2 className="text-[#8B5CF6]" size={20} />
        Mood 7 Hari Terakhir
      </h3>
      <div className="h-64">
        <div className="flex h-full items-end justify-between gap-3">
          {rows.map((item) => (
            <div key={item.dayLabel} className="flex h-full flex-1 flex-col justify-end">
              <div className="mb-2 flex min-h-8 items-center justify-center text-sm">{moodEmoji[item.value] || ""}</div>
              <div
                className="w-full rounded-md border-2 border-[#1E293B] transition-all"
                style={{
                  backgroundColor: item.color,
                  height: `${(item.value / 5) * 75}%`,
                  minHeight: item.value ? "24px" : "8px",
                }}
              />
              <p className="mt-2 text-center text-xs font-bold text-[#64748B]">{item.dayLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoodChartCard;
