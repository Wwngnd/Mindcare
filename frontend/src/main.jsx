import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AlertPopupProvider } from "./components/ui/AlertPopupProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AlertPopupProvider>
        <App />
      </AlertPopupProvider>
    </BrowserRouter>
  </React.StrictMode>
);
