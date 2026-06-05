import { FiAperture, FiCamera, FiCameraOff } from "react-icons/fi";

const CheckinCameraPanel = ({
  videoRef,
  canvasRef,
  cameraStarted,
  faceDetected,
  autoCaptureMessage,
  captureDisabled,
  onStartCamera,
  onCapture,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-white shadow-[8px_8px_0px_0px_#E2E8F0]">
      <div className="border-b border-[#1E293B] px-6 py-5">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <FiCamera size={18} className="text-[#8B5CF6]" />
          Posisikan Wajahmu
        </h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">Pastikan wajah terlihat jelas di dalam bingkai</p>
      </div>

      <div className="flex flex-col items-center p-6 sm:p-10">
        <div className="relative mb-8 flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden bg-[#1E293B]">
          <video ref={videoRef} className="h-full w-full -scale-x-100 object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {cameraStarted ? (
            <>
              <div
                className={`pointer-events-none absolute top-1/2 left-1/2 h-[280px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] ${
                  faceDetected
                    ? "border-solid border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                    : "border-dashed border-[#8B5CF6]"
                }`}
              />
              {!faceDetected ? (
                <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-[3px] rounded bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scanline_2s_ease-in-out_infinite]" />
              ) : null}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E293B] text-white">
              <FiCameraOff size={36} className="mb-3 opacity-50" />
              <p className="text-[13px] font-bold">Kamera tidak aktif</p>
              <p className="mt-1 text-[11px] text-white/60">Klik tombol di bawah untuk mengaktifkan</p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto">
          {!cameraStarted ? (
            <button
              onClick={onStartCamera}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] sm:w-auto"
            >
              <FiCamera size={18} />
              Aktifkan Kamera
            </button>
          ) : (
            <button
              onClick={onCapture}
              disabled={captureDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#1E293B] bg-pink-400 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <FiAperture size={18} />
              Capture Foto
            </button>
          )}
          <p className="mt-1 min-h-4 text-center text-xs font-medium text-[#64748B]">{autoCaptureMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckinCameraPanel;
