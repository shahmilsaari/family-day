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
    <div className="confetti-overlay">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
          }}
        />
      ))}
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
    <div className="leaderboard-interactive-container">
      {showConfetti && <ConfettiEffect />}

      <div className="scoring-explainer-card">
        <div>
          <p className="eyebrow">How Victory Is Calculated</p>
          <strong>Leaderboard is scored per game, not per round.</strong>
          <span>
            Rounds decide the result inside each game. Then each game awards points by placement: 1st place earns the most
            (equal to the number of teams), 2nd earns one less, and so on. Highest total points wins.
          </span>
        </div>
        <ol>
          <li>Highest total points</li>
          <li>Most game wins</li>
          <li>Most 2nd places, then 3rd places</li>
          <li>Most completed games</li>
        </ol>
      </div>

      <div className="leaderboard-controls">
        <div className="search-box">
          <SearchIcon className="search-icon" width={18} height={18} />
          <input
            type="text"
            placeholder="Search team or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ×
            </button>
          )}
        </div>

        <div className="control-groups">
          <div className="sort-group">
            <span className="control-label">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rank" | "completed" | "name")}
              className="select-dropdown"
            >
              <option value="rank">Current Rank</option>
              <option value="completed">Completed Games</option>
              <option value="name">Team Name</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "podium" ? "active" : ""}`}
              onClick={() => {
                setViewMode("podium");
                setExpandedTeamId(null);
              }}
              title="Podium View"
              aria-label="Podium View"
              type="button"
            >
              <PodiumIcon width={18} height={18} />
              <span>Podium</span>
            </button>
            <button
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => {
                setViewMode("table");
                setExpandedTeamId(null);
              }}
              title="Table View"
              aria-label="Table View"
              type="button"
            >
              <TableIcon width={18} height={18} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {processedLeaderboard.length === 0 ? (
        <EmptyState
          compact
          icon={<SearchIcon width={28} height={28} />}
          title="No matching teams found"
          description="Try adjusting your search criteria."
        />
      ) : viewMode === "podium" && !searchQuery ? (
        <div className="podium-view-wrapper">
          <div className="podium-container">
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
                  className={`podium-card podium-rank-${originalRank} ${isExpanded ? "expanded" : ""} ${
                    isFirst ? "champion-glow" : ""
                  }`}
                  onClick={() => toggleRow(team.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleRow(team.id);
                  }}
                >
                  <div className="podium-badge">
                    {isFirst ? (
                      <TrophyIcon className="trophy-animate" width={28} height={28} color="#d4a017" />
                    ) : isSecond ? (
                      <MedalIcon color="#94a3b8" width={26} height={26} />
                    ) : (
                      <MedalIcon color="#b45309" width={26} height={26} />
                    )}
                    <span className="rank-num">{originalRank}</span>
                  </div>

                  <div className="podium-team-info">
                    <h4>{team.name}</h4>
                    <p className="members-summary">{team.members.length} members</p>
                  </div>

                  <div className="podium-score-pill">
                    <span>
                      {team.completedGames
                        ? `${team.totalScore} pts · ${team.roundWins ?? 0} game wins`
                        : "No games scored yet"}
                    </span>
                  </div>

                  <div className="podium-column" data-rank={originalRank}>
                    <span className="podium-label">
                      {isFirst ? "CHAMPION" : isSecond ? "2nd" : "3rd"}
                    </span>
                    <div className="podium-mini-progress">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      <span className="progress-txt">
                        {team.completedGames}/{totalGamesCount} Games
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {expandedTeamId !== null &&
            leaderboard.some((t) => t.id === expandedTeamId && leaderboard.indexOf(t) < 3) &&
            (() => {
              const team = leaderboard.find((t) => t.id === expandedTeamId)!;
              const originalRank = leaderboard.findIndex((item) => item.id === team.id) + 1;
              return (
                <div className="podium-detail-drawer slide-down-animation">
                  <div className="detail-header">
                    <h3>
                      {team.name} Detailed Stats
                    </h3>
                    <button className="close-btn" onClick={() => setExpandedTeamId(null)} type="button">
                      ×
                    </button>
                  </div>
                  <div className="detail-body-grid">
                    <div className="detail-members-column">
                      <h5>Team Members ({team.members.length})</h5>
                      <div className="members-chips">
                        {team.members.map((member, i) => (
                          <span className="chip" key={i}>
                            <span className="avatar">{member.charAt(0).toUpperCase()}</span>
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-games-column">
                      <h5>Game Breakdown</h5>
                      <div className="games-grid">
                        {team.perGame.map((g) => (
                          <div
                            className={`game-mini-card ${g.placement ? "completed" : "pending"}`}
                            key={g.gameId}
                          >
                            <span className="game-name">{g.gameName}</span>
                            <span className={`game-place ${g.placement === 1 ? "gold-text" : ""}`}>
                              {placementLabel(g.placement)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {nonPodiumTeams.length > 0 && (
            <div className="non-podium-section">
              <h5 className="sub-heading">Standings</h5>
              <div className="table-wrap">
                <table className="leaderboard-table-flat">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team</th>
                      <th>Members</th>
                      <th>Completed</th>
                      <th>Result</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonPodiumTeams.map((row) => {
                      const originalRank = leaderboard.findIndex((item) => item.id === row.id) + 1;
                      const isExpanded = expandedTeamId === row.id;
                      return (
                        <tr
                          key={row.id}
                          className={`leaderboard-tr ${isExpanded ? "active-row" : ""}`}
                          onClick={() => toggleRow(row.id)}
                        >
                          <td>
                            <span className="flat-rank-badge">{originalRank}</span>
                          </td>
                          <td>
                            <strong className="team-cell-name">{row.name}</strong>
                          </td>
                          <td>
                            <span className="muted members-list-txt">
                              {row.members.join(", ") || "Not decided yet"}
                            </span>
                          </td>
                          <td>
                            <span className="games-pill">
                              {row.completedGames} / {totalGamesCount}
                            </span>
                          </td>
                          <td>
                            <strong className="total-score-txt">
                              {row.completedGames ? `${row.totalScore} pts · ${row.roundWins ?? 0}W` : "-"}
                            </strong>
                          </td>
                          <td>
                            <button className="expand-trigger-btn" type="button">
                              <ChevronDownIcon className={isExpanded ? "rotated" : ""} width={16} height={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="table-wrap detailed-table-wrapper slide-up-animation">
          <table className="leaderboard interactive-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Members</th>
                <th>Completed</th>
                <th>Result</th>
                {scoringGames.map((game) => (
                  <th key={game.id}>{game.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedLeaderboard.map((row) => {
                const originalRank = leaderboard.findIndex((item) => item.id === row.id) + 1;
                const isExpanded = expandedTeamId === row.id;
                const isFirst = originalRank === 1;
                const isSecond = originalRank === 2;
                const isThird = originalRank === 3;

                return (
                  <Fragment key={row.id}>
                    <tr
                      className={`leaderboard-tr clickable-row ${isExpanded ? "active-row" : ""} ${
                        isFirst ? "rank-1-row" : isSecond ? "rank-2-row" : isThird ? "rank-3-row" : ""
                      }`}
                      onClick={() => toggleRow(row.id)}
                    >
                      <td>
                        {isFirst ? (
                          <span className="badge-wrapper">
                            <TrophyIcon className="table-badge" width={24} height={24} color="#d4a017" />
                            <span className="rank-text gold">1</span>
                          </span>
                        ) : isSecond ? (
                          <span className="badge-wrapper">
                            <MedalIcon color="#94a3b8" className="table-badge" width={22} height={22} />
                            <span className="rank-text silver">2</span>
                          </span>
                        ) : isThird ? (
                          <span className="badge-wrapper">
                            <MedalIcon color="#b45309" className="table-badge" width={22} height={22} />
                            <span className="rank-text bronze">3</span>
                          </span>
                        ) : (
                          <span className="rank-number-plain">{originalRank}</span>
                        )}
                      </td>
                      <td>
                        <div className="team-col-name">
                          <strong>{row.name}</strong>
                          {isFirst && <span className="leader-pill">Leader</span>}
                        </div>
                      </td>
                      <td className="muted truncate-members">
                        {row.members.join(", ") || "Not decided yet"}
                      </td>
                      <td>
                        <span className="completed-fraction">
                          {row.completedGames} / {totalGamesCount}
                        </span>
                      </td>
                      <td>
                        <strong className="total-placement-emphasis">
                          {row.completedGames ? `${row.totalScore} pts · ${row.roundWins ?? 0}W` : "-"}
                        </strong>
                      </td>
                      {row.perGame.map((cell) => (
                        <td key={cell.gameId} className="placement-cell-val">
                          {cell.placement ? (
                            <span
                              className={`place-indicator place-${cell.placement}`}
                              title={`${cell.placement === 1 ? "1st" : cell.placement === 2 ? "2nd" : cell.placement === 3 ? "3rd" : `${cell.placement}th`} place · ${cell.points} point${cell.points === 1 ? "" : "s"}`}
                            >
                              {cell.points} pts
                            </span>
                          ) : (
                            <span className="place-pending">-</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {isExpanded && (
                      <tr className="expansion-row">
                        <td colSpan={5 + scoringGames.length}>
                          <div className="expanded-card-content slide-down-animation">
                            <div className="card-grid">
                              <div className="card-members">
                                <h6>Team Members ({row.members.length})</h6>
                                <div className="chips">
                                  {row.members.map((member, idx) => (
                                    <span key={idx} className="chip">
                                      <span className="avatar">{member.charAt(0).toUpperCase()}</span>
                                      {member}
                                    </span>
                                  ))}
                                  {row.members.length === 0 && <span className="muted">Not decided yet.</span>}
                                </div>
                              </div>
                              <div className="card-stats">
                                <h6>Progress & Placements</h6>
                                <div className="mini-progress-section">
                                  <div className="progress-label">
                                    <span>Games Completed</span>
                                    <span>
                                      {row.completedGames} of {totalGamesCount}
                                    </span>
                                  </div>
                                  <div className="progress-bar-wrap">
                                    <div
                                      className="progress-bar-fill"
                                      style={{
                                        width: `${totalGamesCount > 0 ? (row.completedGames / totalGamesCount) * 100 : 0}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="game-breakdown-list">
                                  {row.perGame.map((g) => (
                                    <div key={g.gameId} className="breakdown-item">
                                      <span className="game-label-title">{g.gameName}</span>
                                      <span className={`game-label-place ${g.placement === 1 ? "first" : ""}`}>
                                        {placementLabel(g.placement)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
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
      )}
    </div>
  );
}
