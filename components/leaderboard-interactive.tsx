"use client";

import { useState, useEffect, useMemo, Fragment } from "react";

type LeaderboardRow = {
  id: number;
  name: string;
  members: string[];
  perGame: { gameId: number; gameName: string; placement: number | null }[];
  completedGames: number;
  totalPlacement: number;
};

type GameWithScores = {
  id: number;
  name: string;
  order: number;
};

type LeaderboardInteractiveProps = {
  leaderboard: LeaderboardRow[];
  games: GameWithScores[];
};

// Custom SVGs to avoid package dependencies
function TrophyIcon({ className, color = "#ffb800" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v3.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" />
    </svg>
  );
}

function MedalIcon({ className, color = "#94a3b8" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PodiumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V10h4v12" />
      <path d="M10 22V6h4v16" />
      <path d="M16 22V14h4v12" />
    </svg>
  );
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 9v12" />
      <path d="M15 9v12" />
    </svg>
  );
}

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
      rotation: Math.random() * 360
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
            transform: `scale(${p.scale}) rotate(${p.rotation}deg)`
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

  // Trigger confetti when leader changes
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

  // Handle row expansion toggle
  const toggleRow = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  // Filter and sort logic
  const processedLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (row) =>
          row.name.toLowerCase().includes(query) ||
          row.members.some((m) => m.toLowerCase().includes(query))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "completed") {
        return b.completedGames - a.completedGames || a.totalPlacement - b.totalPlacement;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // Default: rank (completed desc, then totalPlacement asc)
      const aIndex = leaderboard.findIndex((item) => item.id === a.id);
      const bIndex = leaderboard.findIndex((item) => item.id === b.id);
      return aIndex - bIndex;
    });

    return list;
  }, [leaderboard, searchQuery, sortBy]);

  // Extract Podium Teams (top 3 in the original leaderboard order, matching rank)
  const podiumTeams = useMemo(() => {
    if (leaderboard.length === 0) return [];
    
    // We want the original top 3 from the database standings (without filtering/sorting interference)
    const top3 = leaderboard.slice(0, 3);
    const podium: { rank: number; team: LeaderboardRow | null }[] = [
      { rank: 2, team: top3[1] || null }, // Left
      { rank: 1, team: top3[0] || null }, // Center
      { rank: 3, team: top3[2] || null }  // Right
    ];
    
    return podium.filter(p => p.team !== null) as { rank: number; team: LeaderboardRow }[];
  }, [leaderboard]);

  const nonPodiumTeams = useMemo(() => {
    // Other teams in current processed standings
    return processedLeaderboard.filter((team) => {
      // Find its original rank
      const origIndex = leaderboard.findIndex((item) => item.id === team.id);
      return origIndex >= 3;
    });
  }, [processedLeaderboard, leaderboard]);

  const totalGamesCount = games.length;

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
      
      {/* Controls Bar */}
      <div className="leaderboard-controls">
        <div className="search-box">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search team or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              &times;
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
            >
              <PodiumIcon />
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
            >
              <TableIcon />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Area */}
      {processedLeaderboard.length === 0 ? (
        <div className="empty-state">
          <strong>No matching teams found</strong>
          <span>Try adjusting your search criteria.</span>
        </div>
      ) : viewMode === "podium" && !searchQuery ? (
        /* PODIUM VIEW */
        <div className="podium-view-wrapper">
          <div className="podium-container">
            {podiumTeams.map(({ rank, team }) => {
              const originalRank = leaderboard.findIndex((item) => item.id === team.id) + 1;
              const isFirst = originalRank === 1;
              const isSecond = originalRank === 2;
              const isThird = originalRank === 3;
              const isExpanded = expandedTeamId === team.id;
              
              const progressPercentage = totalGamesCount > 0 
                ? (team.completedGames / totalGamesCount) * 100 
                : 0;

              return (
                <div
                  key={team.id}
                  className={`podium-card podium-rank-${originalRank} ${isExpanded ? "expanded" : ""}`}
                  onClick={() => toggleRow(team.id)}
                >
                  <div className="podium-badge">
                    {isFirst ? (
                      <TrophyIcon />
                    ) : isSecond ? (
                      <MedalIcon color="#c0c0c0" />
                    ) : (
                      <MedalIcon color="#cd7f32" />
                    )}
                    <span className="rank-num">{originalRank}</span>
                  </div>

                  <div className="podium-team-info">
                    <h4>{team.name}</h4>
                    <p className="members-summary">{team.members.length} members</p>
                  </div>

                  <div className="podium-score-pill">
                    <span>{team.completedGames ? `Place: ${team.totalPlacement}` : "No score"}</span>
                  </div>

                  <div className="podium-column">
                    <span className="podium-label">
                      {isFirst ? "CHAMPION" : isSecond ? "2nd" : "3rd"}
                    </span>
                    <div className="podium-mini-progress">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      <span className="progress-txt">{team.completedGames}/{totalGamesCount} Games</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Panel for Selected Podium Team */}
          {expandedTeamId !== null && leaderboard.some((t) => t.id === expandedTeamId && leaderboard.indexOf(t) < 3) && (
            (() => {
              const team = leaderboard.find((t) => t.id === expandedTeamId)!;
              const originalRank = leaderboard.findIndex((item) => item.id === team.id) + 1;
              return (
                <div className="podium-detail-drawer slide-down-animation">
                  <div className="detail-header">
                    <h3>{team.name} Detailed Stats</h3>
                    <button className="close-btn" onClick={() => setExpandedTeamId(null)}>×</button>
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
                          <div className={`game-mini-card ${g.placement ? "completed" : "pending"}`} key={g.gameId}>
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
            })()
          )}

          {/* Remaining Teams in List View */}
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
                      <th>Total Place</th>
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
                            <span className="muted members-list-txt">{row.members.join(", ") || "No members"}</span>
                          </td>
                          <td>
                            <span className="games-pill">{row.completedGames} / {totalGamesCount}</span>
                          </td>
                          <td>
                            <strong className="total-score-txt">{row.completedGames ? row.totalPlacement : "-"}</strong>
                          </td>
                          <td>
                            <button className="expand-trigger-btn">
                              <ChevronDownIcon className={isExpanded ? "rotated" : ""} />
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
        /* TABLE VIEW (Shows all rows in tabular layout) */
        <div className="table-wrap detailed-table-wrapper slide-up-animation">
          <table className="leaderboard interactive-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Members</th>
                <th>Completed</th>
                <th>Total Place</th>
                {games.map((game) => (
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
                          <span className="badge-wrapper"><TrophyIcon className="table-badge" /><span className="rank-text gold">1</span></span>
                        ) : isSecond ? (
                          <span className="badge-wrapper"><MedalIcon color="#94a3b8" className="table-badge" /><span className="rank-text silver">2</span></span>
                        ) : isThird ? (
                          <span className="badge-wrapper"><MedalIcon color="#cd7f32" className="table-badge" /><span className="rank-text bronze">3</span></span>
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
                        {row.members.join(", ") || "No members yet"}
                      </td>
                      <td>
                        <span className="completed-fraction">{row.completedGames} / {totalGamesCount}</span>
                      </td>
                      <td>
                        <strong className="total-placement-emphasis">
                          {row.completedGames ? row.totalPlacement : "-"}
                        </strong>
                      </td>
                      {row.perGame.map((cell) => (
                        <td key={cell.gameId} className="placement-cell-val">
                          {cell.placement ? (
                            <span className={`place-indicator place-${cell.placement}`}>
                              {cell.placement}
                            </span>
                          ) : (
                            <span className="place-pending">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Inline Expandable Row Details */}
                    {isExpanded && (
                      <tr className="expansion-row">
                        <td colSpan={5 + games.length}>
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
                                  {row.members.length === 0 && <span className="muted">No members registered yet.</span>}
                                </div>
                              </div>
                              <div className="card-stats">
                                <h6>Progress & Placements</h6>
                                <div className="mini-progress-section">
                                  <div className="progress-label">
                                    <span>Games Completed</span>
                                    <span>{row.completedGames} of {totalGamesCount}</span>
                                  </div>
                                  <div className="progress-bar-wrap">
                                    <div 
                                      className="progress-bar-fill" 
                                      style={{ width: `${totalGamesCount > 0 ? (row.completedGames / totalGamesCount) * 100 : 0}%` }}
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
