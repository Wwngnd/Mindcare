const filters = [
  { key: "all", label: "Semua" },
  { key: "ai_recommendation", label: "Rekomendasi AI" },
  { key: "mindfulness", label: "Mindfulness & Health" },
  { key: "selfhelp", label: "Self-Help" },
  { key: "psychology", label: "Psikologi" },
  { key: "fiction", label: "Fiksi" },
  { key: "education", label: "Edukasi" },
  { key: "career", label: "Karier" },
  { key: "business", label: "Bisnis" },
  { key: "finance", label: "Keuangan" },
  { key: "social", label: "Sosial" },
  { key: "health", label: "Kesehatan" },
  { key: "philosophy", label: "Filosofi" },
  { key: "spirituality", label: "Spiritualitas" },
  { key: "productivity", label: "Produktivitas" },
  { key: "relationships", label: "Relasi" },
  { key: "science", label: "Sains" },
  { key: "memoir", label: "Memoar" },
  { key: "communication", label: "Komunikasi" },
  { key: "management", label: "Manajemen" },
];

const BooksFilterBar = ({ currentFilter, onChange, availableFilters = [] }) => {
  const availableFilterSet = new Set(availableFilters);
  const visibleFilters = filters.filter((filter) => filter.key === "all" || availableFilterSet.has(filter.key));

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      {visibleFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={`rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all ${
            currentFilter === filter.key
              ? "border-[#434356] bg-[#7c4dff] text-white shadow-[2px_2px_0px_0px_#2a2a35]"
              : "border-[#434356] bg-white text-[#20202a]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default BooksFilterBar;
