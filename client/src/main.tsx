import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2200,
        style: {
          border: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(14, 18, 34, 0.9)",
          color: "#f8fafc",
          backdropFilter: "blur(18px)"
        }
      }}
    />
  </React.StrictMode>
);
