const activities = [
  { name: "Berlari", color: "bg-[#ea6cb1]" },
  { name: "Bersepeda", color: "bg-[#ffc526]" },
  { name: "Berjalan", color: "bg-[#3dd7a8]" },
];

const ExerciseSelectPanel = ({ onSelect, onOpenHistory }) => {
  return (
    <div>
      <div className="mt-8 grid place-items-center gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-8">
        {activities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => onSelect(activity)}
            className="flex min-h-[170px] w-full max-w-[210px] items-center justify-center rounded-[14px] border border-[#656575] bg-[#f7f7f9] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.12)]"
          >
            <div
              className={`flex h-18 w-28 items-center justify-center border-2 border-[#2a2a35] text-sm font-bold text-[#2b2b37] shadow-[2px_2px_0_#2a2a35] ${activity.color}`}
            >
              {activity.name}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={onOpenHistory}
          className="rounded-full border-2 border-[#1E293B] bg-white px-6 py-2.5 text-sm font-bold shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
        >
          Lihat Riwayat Olahraga
        </button>
      </div>
    </div>
  );
};

export default ExerciseSelectPanel;
