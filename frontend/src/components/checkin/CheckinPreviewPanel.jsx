import { FiCheck, FiImage, FiRotateCcw } from "react-icons/fi";

const CheckinPreviewPanel = ({ imageSrc, onRetake, onConfirm }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-white shadow-[8px_8px_0px_0px_#E2E8F0]">
      <div className="border-b border-[#1E293B] px-6 py-5">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <FiImage size={18} className="text-[#8B5CF6]" />
          Preview Foto
        </h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">Pastikan fotomu terlihat jelas</p>
      </div>

      <div className="flex flex-col items-center p-6 sm:p-10">
        <div className="relative mb-8 flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden bg-[#1E293B]">
          <img src={imageSrc} className="h-full w-full object-cover" alt="Preview" />
        </div>

        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-white px-6 py-3 text-sm font-bold text-[#1E293B] shadow-[3px_3px_0px_0px_#E2E8F0] transition-all hover:-translate-y-0.5"
          >
            <FiRotateCcw size={16} />
            Ambil Ulang
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-emerald-400 px-6 py-3 text-sm font-bold text-[#1E293B] shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
          >
            <FiCheck size={16} />
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinPreviewPanel;
