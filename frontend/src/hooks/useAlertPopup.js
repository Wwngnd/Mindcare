import { useContext } from "react";
import { AlertPopupContext } from "../components/ui/alertPopupContext";

export const useAlertPopup = () => {
  const context = useContext(AlertPopupContext);
  if (!context) {
    throw new Error("useAlertPopup harus digunakan di dalam AlertPopupProvider.");
  }
  return context;
};
