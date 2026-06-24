"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { WarningIcon } from "@/components/ui/icons";

type ConfirmTone = "danger" | "default";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type PendingConfirm = ConfirmOptions & {
  id: number;
  resolve: (value: boolean) => void;
};

const CONFIRM_EVENT = "family-day-confirm";

/**
 * Imperative, promise-based confirm that renders the themed modal popup
 * instead of the native window.confirm() dialog.
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(
      new CustomEvent<PendingConfirm>(CONFIRM_EVENT, {
        detail: { ...options, id: Date.now() + Math.random(), resolve },
      }),
    );
  });
}

export function ConfirmHost() {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<PendingConfirm>).detail;
      if (!detail) return;
      setPending((current) => {
        // If a dialog is already open, reject it before showing the new one.
        current?.resolve(false);
        return detail;
      });
    };
    window.addEventListener(CONFIRM_EVENT, handle);
    return () => window.removeEventListener(CONFIRM_EVENT, handle);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  if (!mounted || !pending) return null;

  const close = (value: boolean) => {
    pending.resolve(value);
    setPending(null);
  };

  const tone: ConfirmTone = pending.tone ?? "default";
  const isDanger = tone === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default slide-down-animation"
        onClick={() => close(false)}
        type="button"
        aria-label="Cancel"
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-xl max-w-sm w-full p-7 border border-slate-100 space-y-5 slide-up-animation">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDanger ? "bg-rose-50 text-rose-500" : "bg-sky-50 text-brand-primary"
            }`}
          >
            <WarningIcon width={22} height={22} />
          </div>
          <div className="pt-0.5">
            <h3 className="text-base font-extrabold text-slate-800 font-heading leading-tight">
              {pending.title ?? "Are you sure?"}
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1.5 leading-relaxed">{pending.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            className="px-5 py-2.5 rounded-full text-xs font-extrabold text-slate-500 hover:bg-slate-100 transition-all"
            onClick={() => close(false)}
            type="button"
          >
            {pending.cancelLabel ?? "Cancel"}
          </button>
          <button
            className={`px-6 py-2.5 rounded-full text-xs font-extrabold text-white shadow-md transition-all hover:scale-[1.02] ${
              isDanger
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25"
                : "bg-brand-primary hover:bg-sky-400 shadow-brand-primary/25"
            }`}
            onClick={() => close(true)}
            type="button"
            autoFocus
          >
            {pending.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
