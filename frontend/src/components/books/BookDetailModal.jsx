import { FiExternalLink, FiStar, FiTarget, FiX } from "react-icons/fi";

import BookCoverImage from "./BookCoverImage";

const catColors = {
  mindfulness: "#8B5CF6",
  selfhelp: "#F472B6",
  psychology: "#1E293B",
  fiction: "#FBBF24",
};

const catLabels = {
  mindfulness: "Mindfulness & Health",
  selfhelp: "Self-Help",
  psychology: "Psikologi",
  fiction: "Fiksi",
  education: "Edukasi",
  career: "Karier",
  business: "Bisnis",
  finance: "Keuangan",
  social: "Sosial",
  health: "Kesehatan",
  philosophy: "Filosofi",
  spirituality: "Spiritualitas",
  productivity: "Produktivitas",
  relationships: "Relasi",
  science: "Sains",
  memoir: "Memoar",
  communication: "Komunikasi",
  management: "Manajemen",
};

const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;
  const categoryKeys = book.categoryKeys || [book.category];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-white/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-[#1E293B] bg-white shadow-[8px_8px_0px_0px_#E2E8F0]">
        <div className="relative">
          <div className="flex h-56 w-full items-center justify-center rounded-t-3xl border-b-2 border-[#1E293B] bg-[#8B5CF6]/10">
            <BookCoverImage
              key={`${book.id}-${book.thumbnail || ""}`}
              title={book.title}
              author={book.author}
              thumbnail={book.thumbnail}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1E293B] bg-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-7">
          <div className="mb-4 flex flex-wrap gap-2">
            {categoryKeys.map((categoryKey) => (
              <span
                key={`${book.id}-${categoryKey}`}
                className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${(catColors[categoryKey] || "#8B5CF6")}20`,
                  color: catColors[categoryKey] || "#8B5CF6",
                }}
              >
                {catLabels[categoryKey] || categoryKey}
              </span>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold text-[#64748B]">
            Kategori: {book.categoriesRaw || "Tidak tersedia"}
          </p>
          <h2 className="mb-2 text-3xl font-extrabold leading-tight text-[#1E293B]">{book.title}</h2>
          <p className="mb-1 font-semibold text-[#64748B]">{book.author}</p>
          <p className="mb-5 text-xs text-[#64748B]">
            {book.year ? `Tahun: ${book.year}` : "Data tahun tidak tersedia"}
          </p>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-500">
              <FiTarget size={14} /> <span>{book.match}% Match</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
              <FiStar size={14} /> <span>{book.rating}</span>
            </div>
          </div>

          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1E293B]">Deskripsi</h3>
          <p className="mb-5 text-sm font-medium leading-relaxed text-[#64748B]">{book.desc}</p>

          <div className="mb-7 rounded-2xl border-2 border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-4">
            <h3 className="mb-1 text-sm font-bold text-[#8B5CF6]">Mengapa Direkomendasikan?</h3>
            <p className="text-sm font-medium text-[#64748B]">{book.reason}</p>
          </div>

          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1E293B] bg-[#8B5CF6] py-3.5 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
          >
            <FiExternalLink size={16} /> Baca Sekarang
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
