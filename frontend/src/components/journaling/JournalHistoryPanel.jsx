import { FiTrash2 } from "react-icons/fi";

const JournalHistoryPanel = ({ journals, onDelete }) => {
  if (!journals.length) {
    return <p className="italic text-gray-400">Belum ada riwayat jurnal.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {journals.map((journal, index) => (
        <div key={`${journal.id || journal.date}-${index}`} className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm group">
          {onDelete && (
            <button
              onClick={() => onDelete(journal.id)}
              className="absolute top-4 right-4 text-gray-400 opacity-100 transition-opacity hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              title="Hapus Jurnal"
            >
              <FiTrash2 size={18} />
            </button>
          )}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase text-[#8B5CF6]">
            <span>{new Date(journal.date).toLocaleDateString()}</span>
          </div>
          <h3 className="mb-2 pr-6 text-lg font-bold">{journal.title}</h3>
          <p className="line-clamp-3 text-sm text-gray-500">{journal.content}</p>
        </div>
      ))}
    </div>
  );
};

export default JournalHistoryPanel;
