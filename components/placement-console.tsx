"use client";

import { useEffect, useMemo, useState } from "react";
import type { Game, Team } from "@prisma/client";
import { GamePlacementBoard } from "@/components/game-placement-board";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; points: number }[] };

type PlacementConsoleProps = {
  eventId: number | null;
  games: GameWithScores[];
  teams: TeamWithMembers[];
};

type GameSortBy = "order" | "status" | "name";

function isGameComplete(game: GameWithScores, teamCount: number) {
  return teamCount > 0 && game.scores.length >= teamCount;
}

export function PlacementConsole({ eventId, games, teams }: PlacementConsoleProps) {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(games[0]?.id ?? null);
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

  const getPlacementTeams = (game: GameWithScores) => {
    const placementMap = new Map(game.scores.map((score) => [score.teamId, score.points]));

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
          <p className="muted">Choose a game level, drag teams in the arena, then save the order.</p>
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
                  onClick={() => setSelectedGameId(game.id)}
                  type="button"
                >
                  <span className="level-status" aria-hidden="true">
                    {complete ? "✓" : "▶"}
                  </span>
                  <span className="level-name">{game.name}</span>
                  <small>
                    {game.scores.length}/{teams.length}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="arena-panel panel-enter" key={activeGame?.id}>
            {activeGame ? (
              <GamePlacementBoard
                eventId={eventId}
                gameId={activeGame.id}
                gameName={activeGame.name}
                teams={getPlacementTeams(activeGame)}
              />
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

