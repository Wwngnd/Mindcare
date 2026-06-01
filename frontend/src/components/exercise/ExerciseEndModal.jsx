const ExerciseEndModal = ({ open, onContinue, onFinish }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-[#1E293B] bg-white p-8 text-center shadow-[4px_4px_0px_0px_#1E293B]">
        <h3 className="mb-4 text-xl font-bold">Selesaikan Olahraga?</h3>
        <div className="flex justify-center gap-3">
          <button onClick={onContinue} className="rounded-full border-2 border-[#1E293B] px-6 py-2 font-bold">
            Lanjut
          </button>
          <button
            onClick={onFinish}
            className="rounded-full border-2 border-[#1E293B] bg-emerald-400 px-6 py-2 font-bold shadow-[4px_4px_0px_0px_#1E293B]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseEndModal;
