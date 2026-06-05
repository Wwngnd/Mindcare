import { FiSave } from "react-icons/fi";

const JournalWritePanel = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  saving = false,
}) => {
  return (
    <div className="relative rounded-4xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="absolute right-8 top-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave size={16} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Judul jurnal..."
          className="w-full border-b-2 border-gray-100 py-3 text-xl font-bold placeholder:text-gray-300 outline-none transition-colors focus:border-[#8B5CF6]"
        />

        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={"Mulai menulis di sini...\n\nCeritakan apa yang kamu rasakan hari ini."}
          className="h-100 w-full resize-none py-4 leading-relaxed text-gray-600 outline-none placeholder:text-gray-300"
        />
      </div>
    </div>
  );
};

export default JournalWritePanel;
