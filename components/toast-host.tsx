"use client";

import { useEffect, useState } from "react";
import { CheckIcon, InfoIcon, WarningIcon, XIcon } from "@/components/ui/icons";

type ToastType = "success" | "warning" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

const toastConfig: Record<ToastType, { icon: typeof CheckIcon; label: string; className: string }> = {
  success: { icon: CheckIcon, label: "Success", className: "toast-success" },
  warning: { icon: WarningIcon, label: "Warning", className: "toast-warning" },
  error: { icon: InfoIcon, label: "Error", className: "toast-error" },
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
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        const Icon = config.icon;
        return (
          <div className={`toast-card ${config.className}`} key={toast.id} role="status">
            <div className="toast-icon-wrap">
              <Icon width={18} height={18} />
            </div>
            <div className="toast-body">
              <span className="toast-label">{config.label}</span>
              <strong>{toast.message}</strong>
            </div>
            <button
              className="toast-close"
              onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
              type="button"
              aria-label="Dismiss notification"
            >
              <XIcon width={14} height={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
