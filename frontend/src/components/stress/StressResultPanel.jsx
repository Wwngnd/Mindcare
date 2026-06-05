import { Link } from "react-router-dom";
import { FiActivity, FiBookOpen, FiCheckCircle, FiStar } from "react-icons/fi";

import BookCoverImage from "../books/BookCoverImage";

const StressResultPanel = ({ result, onRetry }) => {
  const stressPercent = Number(result.stressPercent);
  const hasStressPercent = Number.isFinite(stressPercent);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border-2 border-[#1E293B] bg-white p-8 shadow-[6px_6px_0px_0px_#CBD5E1]">
        <div className="flex items-start gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#9333EA] bg-[#F3E8FF]">
            <FiStar className="text-[#9333EA]" size={32} />
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-extrabold">Hasil Analisis AI</h2>
            <p className="mb-4 text-sm leading-relaxed text-[#64748B]">{result.insight}</p>
            <div className="flex flex-wrap gap-2">
              {hasStressPercent ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                  <FiActivity size={14} /> Tingkat Stres: {Math.round(stressPercent)}% - {result.stressCategory}
                </div>
              ) : null}
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                <FiCheckCircle size={14} /> Tingkat Kepercayaan AI: {result.confidencePct}%
              </div>
            </div>
            {result.stressDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">{result.stressDescription}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-[#1E293B] bg-white p-8 shadow-[6px_6px_0px_0px_#CBD5E1]">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
          <FiStar className="text-yellow-500" /> Rekomendasi Aktivitas Utama
        </h3>

        <div className="mb-6 rounded-2xl border-2 border-[#1E293B] bg-gray-50 p-6">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-[#9333EA] text-white">
              <FiBookOpen />
            </div>
            <div>
              <h4 className="text-xl font-extrabold">{result.activityLabel}</h4>
              <p className="text-sm font-medium text-[#64748B]">Durasi ideal: {result.duration} Menit</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#1E293B]">{result.activityDetail}</p>
        </div>

        <h4 className="mb-4 text-lg font-bold">Rekomendasi Buku</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {result.books.map((book) => (
            <div
              key={book.title}
              className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#9333EA]"
            >
              <div className="mb-4 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                <BookCoverImage
                  key={`${book.title}-${book.author}-${book.thumbnail || ""}`}
                  title={book.title}
                  author={book.author}
                  thumbnail={book.thumbnail}
                  alt={book.title}
                  className="h-full w-full object-cover"
                  preferResolvedCover
                />
              </div>
              <div className="mb-2">
                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase text-gray-600">
                  {book.category}
                </span>
              </div>
              <h5 className="mb-1 font-bold text-[#1E293B]">{book.title}</h5>
              <p className="mb-2 text-xs font-medium text-[#64748B]">Oleh {book.author}</p>
              <p className="mt-auto text-xs text-gray-500">{book.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={onRetry}
          className="rounded-xl border-2 border-[#1E293B] bg-white px-6 py-3 font-bold text-[#1E293B] transition-all hover:bg-gray-50"
        >
          Ulangi Kuesioner
        </button>
        <Link
          to="/dashboard"
          className="rounded-xl border-2 border-[#1E293B] bg-[#9333EA] px-6 py-3 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default StressResultPanel;
