"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { ChevronDownIcon, MedalIcon, PodiumIcon, SearchIcon, TableIcon, TrophyIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

type LeaderboardRow = {
  id: number;
  name: string;
  members: string[];
  perGame: { gameId: number; gameName: string; placement: number | null; points?: number | null; completedRounds?: number; totalRounds?: number }[];
  completedGames: number;
  roundWins?: number;
  secondPlaces?: number;
  thirdPlaces?: number;
  totalScore: number;
  totalPlacement: number;
};

type GameWithScores = {
  id: number;
  name: string;
  order: number;
  rounds: number;
  includeInScore: boolean;
};

type LeaderboardInteractiveProps = {
  leaderboard: LeaderboardRow[];
  games: GameWithScores[];
};

function ConfettiEffect() {
  const [particles, setParticles] = useState<{ id: number; left: number; color: string; delay: number; scale: number; rotation: number }[]>([]);

  useEffect(() => {
    const colors = ["#ffd700", "#ff4c4c", "#4cafff", "#4cff8a", "#e04cff", "#ff9b4c"];
    const items = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2.5,
      scale: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * 360,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm animate-confetti"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            top: -10%;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            top: 110%;
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-confetti {
          animation: confetti-fall 3.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

export function LeaderboardInteractive({ leaderboard, games }: LeaderboardInteractiveProps) {
  const [viewMode, setViewMode] = useState<"podium" | "table">("podium");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "completed" | "name">("rank");
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLeaderId, setPrevLeaderId] = useState<number | null>(null);

  useEffect(() => {
    if (leaderboard.length > 0) {
      const currentLeaderId = leaderboard[0].id;
      if (prevLeaderId !== null && prevLeaderId !== currentLeaderId) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
      setPrevLeaderId(currentLeaderId);
    }
  }, [leaderboard, prevLeaderId]);

  const toggleRow = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const processedLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (row) =>
          row.name.toLowerCase().includes(query) ||
          row.members.some((m) => m.toLowerCase().includes(query))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "completed") {
        return (
          b.totalScore - a.totalScore ||
          (b.roundWins ?? 0) - (a.roundWins ?? 0) ||
          (b.secondPlaces ?? 0) - (a.secondPlaces ?? 0) ||
          (b.thirdPlaces ?? 0) - (a.thirdPlaces ?? 0) ||
          b.completedGames - a.completedGames
        );
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      const aIndex = leaderboard.findIndex((item) => item.id === a.id);
      const bIndex = leaderboard.findIndex((item) => item.id === b.id);
      return aIndex - bIndex;
    });

    return list;
  }, [leaderboard, searchQuery, sortBy]);

  const podiumTeams = useMemo(() => {
    if (leaderboard.length === 0) return [];
    const top3 = leaderboard.slice(0, 3);
    const podium: { rank: number; team: LeaderboardRow | null }[] = [
      { rank: 2, team: top3[1] || null },
      { rank: 1, team: top3[0] || null },
      { rank: 3, team: top3[2] || null },
    ];
    return podium.filter((p) => p.team !== null) as { rank: number; team: LeaderboardRow }[];
  }, [leaderboard]);

  const nonPodiumTeams = useMemo(() => {
    return processedLeaderboard.filter((team) => {
      const origIndex = leaderboard.findIndex((item) => item.id === team.id);
      return origIndex >= 3;
    });
  }, [processedLeaderboard, leaderboard]);

  const scoringGames = games.filter((game) => game.includeInScore);
  const totalGamesCount = scoringGames.length;

  const placementLabel = (placement: number | null) => {
    if (placement === null) return "-";
    if (placement === 1) return "🥇 Champion";
    if (placement === 2) return "🥈 2nd Place";
    if (placement === 3) return "🥉 3rd Place";
    return `${placement} Place`;
  };

  return (
    <div className="relative">
      {showConfetti && <ConfettiEffect />}

      {/* Explainer Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-xs font-bold text-slate-500 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
        <div className="md:col-span-8 space-y-1.5">
          <p className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">How Victory Is Calculated</p>
          <strong className="text-slate-800 font-bold block text-sm">Leaderboard scores are finalized per game.</strong>
          <span className="block font-medium">
            Rounds determine game standings. Then, points are distributed based on game placements (highest rank gets points equal to the number of teams). The team with the highest total points wins.
          </span>
        </div>
        <div className="md:col-span-4 bg-white border border-slate-150 p-4 rounded-xl space-y-1">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1 mb-1">Tie-breaker Priority</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-[10px] font-bold text-slate-600">
            <li>Highest total score points</li>
            <li>Most 1st places (game wins)</li>
            <li>Most 2nd places, then 3rd places</li>
            <li>Most completed games scored</li>
          </ol>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute left-3.5 top-3 text-slate-350">
            <SearchIcon width={16} height={16} />
          </span>
          <input
            type="text"
            placeholder="Search team or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-850"
          />
          {searchQuery && (
            <button 
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Sort & Toggle */}
        <div className="flex items-center gap-4 justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rank" | "completed" | "name")}
              className="bg-white border border-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl text-slate-650 focus:outline-none"
            >
              <option value="rank">Current Rank</option>
              <option value="completed">Completed Games</option>
              <option value="name">Team Name</option>
            </select>
          </div>

          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center select-none">
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === "podium" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => {
                setViewMode("podium");
                setExpandedTeamId(null);
              }}
              type="button"
            >
              <PodiumIcon width={14} height={14} />
              <span>Podium</span>
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => {
                setViewMode("table");
                setExpandedTeamId(null);
              }}
              type="button"
            >
              <TableIcon width={14} height={14} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {processedLeaderboard.length === 0 ? (
        <EmptyState
          compact
          icon={<SearchIcon width={28} height={28} />}
          title="No matching teams found"
          description="Try adjusting your search criteria."
        />
      ) : viewMode === "podium" && !searchQuery ? (
        /* Podium View */
        <div className="space-y-8 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 pt-10 pb-6 select-none max-w-3xl mx-auto">
            {podiumTeams.map(({ rank, team }) => {
              const originalRank = leaderboard.findIndex((item) => item.id === team.id) + 1;
              const isFirst = originalRank === 1;
              const isSecond = originalRank === 2;
              const isThird = originalRank === 3;
              const isExpanded = expandedTeamId === team.id;

              const progressPercentage =
                totalGamesCount > 0 ? (team.completedGames / totalGamesCount) * 100 : 0;

              return (
                <div
                  key={team.id}
                  className={`w-full md:w-1/3 bg-white border rounded-[28px] p-6 flex flex-col justify-between transition-all cursor-pointer relative ${
                    isFirst
                      ? "border-amber-300 bg-amber-50/10 shadow-soft md:order-2 md:-translate-y-4 ring-2 ring-amber-400/20"
                      : isSecond
                      ? "border-slate-200 shadow-sm md:order-1"
                      : "border-slate-200 shadow-sm md:order-3"
                  } ${isExpanded ? "ring-2 ring-brand-primary" : ""}`}
                  onClick={() => toggleRow(team.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleRow(team.id);
                  }}
                >
                  {/* Rank Badging */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {isFirst ? "🏆 CHAMPION" : isSecond ? "🥈 2ND PLACE" : "🥉 3RD PLACE"}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      isFirst ? "bg-amber-100 text-amber-600" : isSecond ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-700"
                    }`}>
                      {originalRank}
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h4 className="font-extrabold text-slate-800 text-base md:text-lg truncate">{team.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{team.members.length} members</p>
                  </div>

                  {/* Score Pill */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs font-bold text-slate-700 mb-6">
                    <span className="text-[9px] text-slate-400 uppercase">Total Result</span>
                    <span>
                      {team.completedGames
                        ? `${team.totalScore} pts · ${team.roundWins ?? 0}W`
                        : "Not scored"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span>Progress</span>
                      <span>{team.completedGames}/{totalGamesCount} Games</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-primary h-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Drawer */}
          {expandedTeamId !== null &&
            leaderboard.some((t) => t.id === expandedTeamId && leaderboard.indexOf(t) < 3) &&
            (() => {
              const team = leaderboard.find((t) => t.id === expandedTeamId)!;
              return (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 animate-fadeIn space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Stats Details
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-800 mt-2 font-heading">
                        {team.name} Breakdown
                      </h3>
                    </div>
                    <button 
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                      onClick={() => setExpandedTeamId(null)} 
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Team Members ({team.members.length})</h5>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member, i) => (
                          <span className="inline-flex items-center gap-1.5 bg-white border border-slate-100 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-650" key={i}>
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-[10px] font-black text-center text-slate-500 flex items-center justify-center select-none uppercase">
                              {member.charAt(0)}
                            </span>
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Game-by-Game Placements</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {team.perGame.map((g) => (
                          <div
                            className={`p-3 rounded-xl border flex flex-col gap-1 ${
                              g.placement
                                ? "bg-white border-slate-100"
                                : "bg-slate-50/20 border-slate-100 opacity-60"
                            }`}
                            key={g.gameId}
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{g.gameName}</span>
                            <strong className={`text-xs font-bold ${g.placement === 1 ? "text-amber-500" : "text-slate-700"}`}>
                              {g.placement ? `${placementLabel(g.placement)} (${g.points} pts)` : "Pending"}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Non-podium flat list */}
          {nonPodiumTeams.length > 0 && (
            <div className="pt-6 border-t border-slate-50">
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Remaining Standings</h5>
              <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-3.5 w-20">Rank</th>
                        <th className="px-6 py-3.5">Team</th>
                        <th className="px-6 py-3.5">Members</th>
                        <th className="px-6 py-3.5 w-32">Completed</th>
                        <th className="px-6 py-3.5 w-40">Result</th>
                        <th className="px-6 py-3.5 w-16 text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {nonPodiumTeams.map((row) => {
                        const originalRank = leaderboard.findIndex((item) => item.id === row.id) + 1;
                        const isExpanded = expandedTeamId === row.id;
                        return (
                          <Fragment key={row.id}>
                            <tr
                              className={`hover:bg-slate-50/50 transition cursor-pointer ${isExpanded ? "bg-slate-50/70" : ""}`}
                              onClick={() => toggleRow(row.id)}
                            >
                              <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]">
                                  {originalRank}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                                {row.name}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-400 font-bold truncate max-w-[200px]">
                                {row.members.join(", ") || "Not decided yet"}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                                {row.completedGames} / {totalGamesCount}
                              </td>
                              <td className="px-6 py-4 text-xs font-extrabold text-slate-850">
                                {row.completedGames ? `${row.totalScore} pts · ${row.roundWins ?? 0}W` : "-"}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button className="text-slate-450 hover:text-slate-700 font-bold" type="button">
                                  <ChevronDownIcon className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              </td>
                            </tr>
                            
                            {isExpanded && (
                              <tr className="bg-slate-50/30">
                                <td colSpan={6} className="px-8 py-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <div>
                                      <h6 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Team Members ({row.members.length})</h6>
                                      <div className="flex flex-wrap gap-1.5">
                                        {row.members.map((member, idx) => (
                                          <span key={idx} className="bg-white border border-slate-100 text-[11px] font-bold text-slate-600 px-3 py-1 rounded-full">
                                            {member}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Placements breakdown</h6>
                                      <div className="grid grid-cols-2 gap-2">
                                        {row.perGame.map((g) => (
                                          <div key={g.gameId} className="flex justify-between items-center text-[11px] font-bold bg-white p-2 border border-slate-100 rounded-lg">
                                            <span className="text-slate-400 truncate max-w-[90px]">{g.gameName}</span>
                                            <span className={g.placement === 1 ? "text-amber-500" : "text-slate-600"}>
                                              {placementLabel(g.placement)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Grid/Matrix Table View */
        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3.5 w-16">Rank</th>
                  <th className="px-6 py-3.5">Team</th>
                  <th className="px-6 py-3.5">Members</th>
                  <th className="px-6 py-3.5 w-24">Scored</th>
                  <th className="px-6 py-3.5 w-32">Points</th>
                  {scoringGames.map((game) => (
                    <th key={game.id} className="px-6 py-3.5 w-36 text-center">{game.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {processedLeaderboard.map((row) => {
                  const originalRank = leaderboard.findIndex((item) => item.id === row.id) + 1;
                  const isFirst = originalRank === 1;
                  const isSecond = originalRank === 2;
                  const isThird = originalRank === 3;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/50 transition ${
                        isFirst ? "bg-amber-50/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        {isFirst ? (
                          <span className="flex items-center gap-1">
                            <TrophyIcon className="text-amber-500 animate-pulse" width={18} height={18} />
                            <span className="font-black text-xs text-amber-600">1</span>
                          </span>
                        ) : isSecond ? (
                          <span className="flex items-center gap-1">
                            <MedalIcon className="text-slate-400" width={16} height={16} />
                            <span className="font-black text-xs text-slate-500">2</span>
                          </span>
                        ) : isThird ? (
                          <span className="flex items-center gap-1">
                            <MedalIcon className="text-orange-700" width={16} height={16} />
                            <span className="font-black text-xs text-orange-700">3</span>
                          </span>
                        ) : (
                          <span className="font-bold text-xs text-slate-400 pl-4">{originalRank}</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 font-bold">{row.name}</strong>
                          {isFirst && <span className="bg-amber-100 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Leader</span>}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold truncate max-w-[150px]" title={row.members.join(", ")}>
                        {row.members.join(", ") || "Not decided yet"}
                      </td>
                      
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {row.completedGames} / {totalGamesCount}
                      </td>
                      
                      <td className="px-6 py-4 text-xs font-extrabold text-slate-850">
                        {row.completedGames ? `${row.totalScore} pts · ${row.roundWins ?? 0}W` : "-"}
                      </td>

                      {row.perGame.map((cell) => (
                        <td key={cell.gameId} className="px-6 py-4 text-center">
                          {cell.placement ? (
                            <span
                              className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                cell.placement === 1
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : cell.placement === 2
                                  ? "bg-slate-50 text-slate-650 border border-slate-100"
                                  : "bg-orange-50/50 text-orange-750 border border-orange-100/50"
                              }`}
                              title={`${placementLabel(cell.placement)} · ${cell.points} pts`}
                            >
                              {cell.points} pts
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
