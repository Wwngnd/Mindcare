import { FiArrowLeft, FiArrowRight, FiHome } from "react-icons/fi";

const RegisterNavigation = ({
  currentStep,
  totalSteps,
  isQuizLastQuestion,
  onBack,
  onNext,
}) => {
  const isFinalStep = currentStep === totalSteps;
  const nextText = isFinalStep
    ? "Daftar Sekarang"
    : "Lanjutkan";

  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      {currentStep > 1 && !isFinalStep ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#FFFDF5] px-5 py-3 text-sm font-bold text-[#1E293B] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E293B]"
        >
          <FiArrowLeft size={16} />
          Kembali
        </button>
      ) : (
        <span />
      )}

      <button
        type="button"
        onClick={onNext}
        className={`ml-auto flex items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] px-6 py-3.5 text-base font-bold shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] ${
          isFinalStep ? "bg-emerald-400 text-[#1E293B]" : "bg-[#8B5CF6] text-white"
        }`}
      >
        <span>{nextText}</span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            isFinalStep ? "bg-[#1E293B] text-emerald-400" : "bg-white text-[#8B5CF6]"
          }`}
        >
          {isFinalStep ? <FiHome size={14} /> : <FiArrowRight size={14} />}
        </span>
      </button>
    </div>
  );
};

export default RegisterNavigation;
