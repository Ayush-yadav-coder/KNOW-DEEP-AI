import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global suppression for harmless ResizeObserver loop notification events
if (typeof window !== "undefined") {
  const isResizeObserverError = (msg: unknown) => {
    if (typeof msg === "string") {
      return (
        msg.includes("ResizeObserver loop") ||
        msg.includes("ResizeObserver loop completed") ||
        msg.includes("ResizeObserver loop limit exceeded")
      );
    }
    return false;
  };

  const origOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = typeof message === "string" ? message : error?.message;
    if (isResizeObserverError(msg)) {
      return true;
    }
    if (origOnError) {
      return origOnError.apply(this, arguments as any);
    }
  };

  window.addEventListener(
    "error",
    (e: ErrorEvent) => {
      const msg = e?.message || e?.error?.message;
      if (isResizeObserverError(msg)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (e: PromiseRejectionEvent) => {
      const msg = e?.reason?.message || (typeof e?.reason === "string" ? e.reason : "");
      if (isResizeObserverError(msg)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(<App />);
