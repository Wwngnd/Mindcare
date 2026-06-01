import { useCallback, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";
import { AlertPopupContext } from "./alertPopupContext";

const DEFAULT_META = {
  info: {
    title: "Informasi",
    icon: FiInfo,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    buttonClass: "bg-blue-500",
  },
  success: {
    title: "Berhasil",
    icon: FiCheckCircle,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    buttonClass: "bg-emerald-500",
  },
  warning: {
    title: "Perhatian",
    icon: FiAlertCircle,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    buttonClass: "bg-amber-500",
  },
  error: {
    title: "Terjadi Kesalahan",
    icon: FiXCircle,
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    buttonClass: "bg-rose-500",
  },
};

export const AlertPopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    buttonLabel: "Tutup",
  });

  const closeAlert = useCallback(() => {
    setPopup((prev) => ({ ...prev, open: false }));
  }, []);

  const showAlert = useCallback((message, options = {}) => {
    const type = options.type || "info";
    const meta = DEFAULT_META[type] || DEFAULT_META.info;

    setPopup({
      open: true,
      type,
      title: options.title || meta.title,
      message,
      buttonLabel: options.buttonLabel || "Tutup",
    });
  }, []);

  const contextValue = useMemo(
    () => ({ showAlert, closeAlert }),
    [showAlert, closeAlert],
  );

  const meta = DEFAULT_META[popup.type] || DEFAULT_META.info;
  const Icon = meta.icon;

  return (
    <AlertPopupContext.Provider value={contextValue}>
      {children}

      {popup.open ? (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border-4 border-[#1E293B] bg-[#FFFDF5] p-6 shadow-[8px_8px_0px_0px_#1E293B]">
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${meta.badgeClass}`}
            >
              <Icon size={14} />
              {popup.title}
            </div>

            <p className="mb-6 whitespace-pre-line text-sm font-medium text-[#334155]">
              {popup.message}
            </p>

            <button
              type="button"
              onClick={closeAlert}
              className={`w-full rounded-xl border-2 border-[#1E293B] py-3 text-center font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5 ${meta.buttonClass}`}
            >
              {popup.buttonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </AlertPopupContext.Provider>
  );
};
