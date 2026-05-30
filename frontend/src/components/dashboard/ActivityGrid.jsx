import { Link } from "react-router-dom";
import { FiActivity, FiBookOpen, FiClipboard, FiEdit3, FiZap } from "react-icons/fi";

const activities = [
  {
    label: "Cek Stress",
    href: "/stress-check",
    bg: "bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
    iconBg: "bg-[#8B5CF6] text-white",
    Icon: FiClipboard,
  },
  {
    label: "Journaling",
    href: "/journaling",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    iconBg: "bg-emerald-400 text-[#1E293B]",
    Icon: FiEdit3,
  },
  {
    label: "Olahraga",
    href: "/exercise",
    bg: "bg-pink-400/10 border-pink-400/20",
    iconBg: "bg-pink-400 text-white",
    Icon: FiActivity,
  },
  {
    label: "Baca Buku",
    href: "/books",
    bg: "bg-amber-300/10 border-amber-300/20",
    iconBg: "bg-amber-300 text-[#1E293B]",
    Icon: FiBookOpen,
  },
];

const ActivityGrid = () => {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
        <FiZap className="text-amber-400" size={20} />
        Mulai Aktivitas
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {activities.map(({ label, href, bg, iconBg, Icon }) => (
          <Link
            key={label}
            to={href}
            className={`rounded-xl border p-6 flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E293B] ${bg}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B] ${iconBg}`}>
              <Icon size={20} />
            </div>
            <span className="text-center text-sm font-bold">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ActivityGrid;
