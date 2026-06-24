"use client";

import { useEffect, useState } from "react";

export type StandingRow = {
  id: number;
  name: string;
  color?: string | null;
  totalScore: number;
};

type LiveStandingsProps = {
  eventId: number;
  rows: StandingRow[];
};

type Delta = "up" | "down" | "same" | "new";

export function LiveStandings({ eventId, rows }: LiveStandingsProps) {
  // Deltas are computed on the client by comparing the freshly-rendered order
  // against the order we stored on the previous auto-refresh.
  const [deltas, setDeltas] = useState<Record<number, Delta>>({});

  useEffect(() => {
    const key = `fd-ranks-${eventId}`;
    let previous: Record<number, number> = {};
    try {
      previous = JSON.parse(localStorage.getItem(key) ?? "{}");
    } catch {
      previous = {};
    }

    const next: Record<number, number> = {};
    const computed: Record<number, Delta> = {};
    rows.forEach((row, index) => {
      const rank = index + 1;
      next[row.id] = rank;
      const prevRank = previous[row.id];
      if (prevRank == null) computed[row.id] = "new";
      else if (prevRank > rank) computed[row.id] = "up";
      else if (prevRank < rank) computed[row.id] = "down";
      else computed[row.id] = "same";
    });

    setDeltas(computed);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — deltas just won't persist */
    }
  }, [eventId, rows]);

  if (rows.length === 0) {
    return <p className="text-slate-400 italic text-xs font-semibold py-8 text-center">No scores recorded</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((team, idx) => {
        const rank = idx + 1;
        const isFirst = rank === 1;
        const accent = team.color ?? "#00668a";
        const delta = deltas[team.id];
        const moved = delta === "up" || delta === "down";

        return (
          <div
            key={team.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              isFirst ? "bg-slate-50 shadow-sm" : "bg-white border-slate-100"
            } ${moved ? "rank-flash" : ""}`}
            style={isFirst ? { borderLeft: `4px solid ${accent}` } : { borderColor: undefined }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="font-heading font-extrabold text-base w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: accent }}
              >
                {rank}
              </span>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="font-bold text-slate-800 text-sm truncate">{team.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {delta === "up" && <span className="text-green-500 text-xs font-extrabold leading-none">▲</span>}
              {delta === "down" && <span className="text-rose-400 text-xs font-extrabold leading-none">▼</span>}
              {delta === "new" && <span className="text-sky-400 text-[9px] font-extrabold uppercase">new</span>}
              <span className="font-heading font-extrabold text-lg text-[#00668a]">{team.totalScore}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
