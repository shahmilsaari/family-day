"use client";

import { useEffect, useState } from "react";
import { notify } from "@/components/toast-host";
import { CopyIcon } from "@/components/ui/icons";

type TeamJoinPanelProps = {
  code: string | null;
  color?: string | null;
  teamName: string;
};

export function TeamJoinPanel({ code, color, teamName }: TeamJoinPanelProps) {
  const accent = color ?? "#38bdf8";
  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const joinUrl = origin && code ? `${origin}/join/${code}` : "";

  useEffect(() => {
    if (!showQr || !joinUrl || qr) return;
    let cancelled = false;
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(joinUrl, {
          margin: 1,
          width: 200,
          color: { dark: "#1e293b", light: "#ffffff" },
        }),
      )
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) notify("Could not render QR code", "error");
      });
    return () => {
      cancelled = true;
    };
  }, [showQr, joinUrl, qr]);

  if (!code) return null;

  const copyLink = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      notify("Join link copied", "success");
    } catch {
      notify("Copy failed — long-press the link", "error");
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Join code</p>
          <p className="font-mono font-extrabold tracking-[0.2em] text-sm" style={{ color: accent }}>
            {code}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:border-slate-300 transition"
          >
            <CopyIcon width={12} height={12} />
            Copy
          </button>
          <button
            type="button"
            onClick={() => setShowQr((s) => !s)}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {showQr ? "Hide QR" : "QR"}
          </button>
        </div>
      </div>

      {showQr && (
        <div className="mt-3 flex flex-col items-center gap-2 border-t border-slate-100 pt-3">
          {qr ? (
            <img
              src={qr}
              alt={`Join QR for ${teamName}`}
              className="w-36 h-36 rounded-xl border border-slate-100 bg-white"
            />
          ) : (
            <div className="w-36 h-36 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-[10px] font-bold text-slate-300">
              Generating…
            </div>
          )}
          <p className="text-[10px] font-bold text-slate-400 text-center">Scan to join {teamName}</p>
        </div>
      )}
    </div>
  );
}
