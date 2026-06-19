"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "warning" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export function notify(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("family-day-toast", { detail: { message, type } }));
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; type?: ToastType }>).detail;
      const id = Date.now() + Math.random();
      const message = detail?.message || "Action completed";
      const type = detail?.type || "success";

      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3200);
    };

    window.addEventListener("family-day-toast", handleToast);
    return () => window.removeEventListener("family-day-toast", handleToast);
  }, []);

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast-card toast-${toast.type}`} key={toast.id} role="status">
          <span className="toast-dot" />
          <strong>{toast.message}</strong>
        </div>
      ))}
    </div>
  );
}
