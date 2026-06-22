"use client";

import { useEffect, useMemo, useState } from "react";
import type { Game, Team } from "@prisma/client";
import { GamePlacementBoard } from "@/components/game-placement-board";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; round: number; points: number }[] };

type PlacementConsoleProps = {
  eventId: number | null;
  games: GameWithScores[];
  teams: TeamWithMembers[];
};

type GameSortBy = "order" | "status" | "name";

function getGameRounds(game: GameWithScores) {
  return Number.isFinite(game.rounds) && game.rounds > 0 ? game.rounds : 1;
}

function isGameComplete(game: GameWithScores, teamCount: number) {
  return teamCount > 0 && game.scores.length >= teamCount * getGameRounds(game);
}

export function PlacementConsole({ eventId, games, teams }: PlacementConsoleProps) {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(games[0]?.id ?? null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [gameSortBy, setGameSortBy] = useState<GameSortBy>("order");

  useEffect(() => {
    if (!games.length) {
      setSelectedGameId(null);
      return;
    }

    if (!selectedGameId || !games.some((game) => game.id === selectedGameId)) {
      setSelectedGameId(games[0].id);
    }
  }, [games, selectedGameId]);

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      if (gameSortBy === "status") {
        return (
          Number(isGameComplete(b, teams.length)) -
            Number(isGameComplete(a, teams.length)) ||
          a.order - b.order ||
          a.name.localeCompare(b.name)
        );
      }

      if (gameSortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return a.order - b.order || a.name.localeCompare(b.name);
    });
  }, [games, gameSortBy, teams.length]);

  const activeGame = sortedGames.find((game) => game.id === selectedGameId) ?? sortedGames[0];
  const activeGameRounds = activeGame ? getGameRounds(activeGame) : 1;
  const activeRound = Math.min(selectedRound, activeGameRounds);

  useEffect(() => {
    if (activeGame && selectedRound > activeGameRounds) {
      setSelectedRound(activeGameRounds);
    }
  }, [activeGame, activeGameRounds, selectedRound]);

  const getRoundScoreCount = (game: GameWithScores, round: number) =>
    game.scores.filter((score) => score.round === round).length;

  const isRoundComplete = (game: GameWithScores, round: number) =>
    teams.length > 0 && getRoundScoreCount(game, round) >= teams.length;

  const getNextIncompleteRound = (game: GameWithScores) => {
    const rounds = getGameRounds(game);
    return Array.from({ length: rounds }, (_, index) => index + 1).find((round) => !isRoundComplete(game, round)) ?? rounds;
  };

  const roundNumbers = activeGame ? Array.from({ length: activeGameRounds }, (_, index) => index + 1) : [];
  const completedRounds = activeGame ? roundNumbers.filter((round) => isRoundComplete(activeGame, round)).length : 0;
  const canGoPreviousRound = activeRound > 1;
  const canGoNextRound = activeRound < activeGameRounds;

  const getPlacementTeams = (game: GameWithScores, round: number) => {
    const placementMap = new Map(
      game.scores
        .filter((score) => score.round === round)
        .map((score) => [score.teamId, score.points])
    );

    return teams
      .map((team) => ({
        id: team.id,
        name: team.name,
        members: team.members.map((member) => member.name),
        placement: placementMap.get(team.id) ?? null
      }))
      .sort(
        (a, b) =>
          (a.placement ?? Number.MAX_SAFE_INTEGER) -
            (b.placement ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name)
      );
  };

  return (
    <section className="glass-panel panel-pad stack game-console-section">
      <div className="console-header">
        <div>
          <p className="eyebrow">Level Selector</p>
          <h3>Game Placements Arena</h3>
          <p className="muted">Rank each round here. The leaderboard converts all rounds into one final score per game.</p>
        </div>
        <label className="sort-control">
          <span>Sort by</span>
          <select value={gameSortBy} onChange={(event) => setGameSortBy(event.target.value as GameSortBy)}>
            <option value="order">Default Order</option>
            <option value="status">Completed First</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {eventId && games.length && teams.length ? (
        <>
          <div className="level-selector-bar" role="listbox" aria-label="Game level selector">
            {sortedGames.map((game) => {
              const complete = isGameComplete(game, teams.length);
              const active = activeGame?.id === game.id;

              return (
                <button
                  className={`level-button ${active ? "active" : ""} ${complete ? "complete" : "pending"}`}
                  key={game.id}
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setSelectedRound(getNextIncompleteRound(game));
                  }}
                  type="button"
                >
                  <span className="level-status" aria-hidden="true">
                    {complete ? "✓" : "▶"}
                  </span>
                  <span className="level-name" title={game.description ?? game.name}>{game.name}</span>
                  <small>
                    {game.scores.length}/{teams.length * getGameRounds(game)} · {getGameRounds(game)}R · {game.includeInScore ? "Scored" : "Fun only"}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="arena-panel panel-enter" key={`${activeGame?.id}-${activeRound}`}>
            {activeGame ? (
              <>
                <div className="round-command-center">
                  <div>
                    <p className="eyebrow">Round Control</p>
                    <strong>{completedRounds}/{activeGameRounds} rounds complete</strong>
                    <span className="muted">Rounds decide this game only. Live standings count this as one game score.</span>
                  </div>
                  <div className="round-step-actions">
                    <button type="button" className="secondary-btn" disabled={!canGoPreviousRound} onClick={() => setSelectedRound(activeRound - 1)}>
                      ← Previous
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => setSelectedRound(getNextIncompleteRound(activeGame))}>
                      Next Open
                    </button>
                    <button type="button" className="secondary-btn" disabled={!canGoNextRound} onClick={() => setSelectedRound(activeRound + 1)}>
                      Next →
                    </button>
                  </div>
                </div>

                {activeGameRounds > 1 ? (
                  <div className="round-chip-grid" role="tablist" aria-label={`${activeGame.name} rounds`}>
                    {roundNumbers.map((round) => {
                      const savedCount = getRoundScoreCount(activeGame, round);
                      const complete = isRoundComplete(activeGame, round);
                      const current = activeRound === round;

                      return (
                        <button
                          key={round}
                          type="button"
                          role="tab"
                          aria-selected={current}
                          className={`round-chip ${current ? "active" : ""} ${complete ? "complete" : savedCount > 0 ? "started" : "pending"}`}
                          onClick={() => setSelectedRound(round)}
                        >
                          <span>{complete ? "✓" : savedCount > 0 ? "•" : round}</span>
                          <strong>Round {round}</strong>
                          <small>{savedCount}/{teams.length}</small>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <GamePlacementBoard
                  eventId={eventId}
                  gameId={activeGame.id}
                  gameName={activeGame.name}
                  gameDescription={activeGame.description}
                  round={activeRound}
                  totalRounds={activeGameRounds}
                  teams={getPlacementTeams(activeGame, activeRound)}
                />
              </>
            ) : null}
          </div>
        </>
      ) : (
        <div className="empty-state placements-empty-state">
          <div className="empty-icon">🎮</div>
          <strong>Placements require active teams and games</strong>
          <span>Create at least one team and setup one competition before ranking standings.</span>
        </div>
      )}
    </section>
  );
}

