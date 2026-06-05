import { Link } from "react-router-dom";
import BookCoverImage from "./BookCoverImage";

const catLabels = {
  mindfulness: "🙏 Mindfulness & Health",
  selfhelp: "💪 Self-Help",
  psychology: "🧠 Psikologi",
  fiction: "📖 Fiksi",
  education: "🎓 Edukasi",
  career: "💼 Karier",
  business: "📊 Bisnis",
  finance: "💰 Keuangan",
  social: "👥 Sosial",
  health: "🩺 Kesehatan",
  philosophy: "🧭 Filosofi",
  spirituality: "✨ Spiritualitas",
  productivity: "⚡ Produktivitas",
  relationships: "❤️ Relasi",
  science: "🔬 Sains",
  memoir: "📘 Memoar",
  communication: "🗣️ Komunikasi",
  management: "🧱 Manajemen",
};

const catEmojis = {
  mindfulness: "🙏",
  selfhelp: "💪",
  psychology: "🧠",
  fiction: "📖",
  education: "🎓",
  career: "💼",
  business: "📊",
  finance: "💰",
  social: "👥",
  health: "🩺",
  philosophy: "🧭",
  spirituality: "✨",
  productivity: "⚡",
  relationships: "❤️",
  science: "🔬",
  memoir: "📘",
  communication: "🗣️",
  management: "🧱",
};

const getCategoryEmoji = (category) => {
  return catEmojis[category] || "📚";
};

const getCategoryLabel = (category) => {
  return catLabels[category] || category;
};

const BooksGrid = ({ books, onSelect }) => {
  if (!books.length) {
    return (
      <div className="col-span-full py-16 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f2f3f7]">
          <span className="text-4xl">📚</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-[#1E293B]">Belum ada buku di kategori ini</h3>
        <p className="mx-auto mb-8 max-w-sm text-sm text-[#64748B]">
          Coba kategori lain, atau isi Cek Stress untuk mendapatkan rekomendasi buku yang lebih personal.
        </p>
        <Link
          to="/stress-check"
          className="inline-flex items-center gap-2 rounded-full bg-[#7c4dff] px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
        >
          Mulai Kuesioner
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelect(book)}
          className="cursor-pointer overflow-hidden rounded-[14px] border border-[#5e6070] bg-white text-left shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5"
        >
          <div className="h-44 border-b border-[#5e6070] bg-[#ededf7]">
            <BookCoverImage
              key={`${book.id}-${book.thumbnail || ""}`}
              title={book.title}
              author={book.author}
              thumbnail={book.thumbnail}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-h-30 bg-white px-4 py-4">
            <div className="mb-2 flex items-center gap-1.5">
              {(book.categoryKeys || [book.category]).slice(0, 2).map((categoryKey) => (
                <span
                  key={`${book.id}-${categoryKey}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f2f3f7] px-2 py-0.5 text-[9px] font-bold text-[#374151]"
                >
                  {getCategoryEmoji(categoryKey)} {getCategoryLabel(categoryKey)}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f3f7] px-2 py-0.5 text-[9px] font-bold text-[#374151]">
                ⭐ {book.rating || 4.5}
              </span>
            </div>
            <h3 className="text-[18px] font-extrabold leading-tight text-slate-900">{book.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{book.author}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#64748B] line-clamp-1">
              {book.categoriesRaw || "Kategori tidak tersedia"}
            </p>
            <p className="mt-2 line-clamp-2 text-xs text-[#64748B]">{book.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default BooksGrid;
