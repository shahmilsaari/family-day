"use client";

import { useEffect, useMemo, useState } from "react";
import type { Game, Team } from "@prisma/client";
import { GamePlacementBoard } from "@/components/game-placement-board";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, GamepadIcon, PlayIcon, TargetIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

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
          Number(isGameComplete(b, teams.length)) - Number(isGameComplete(a, teams.length)) ||
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
    return (
      Array.from({ length: rounds }, (_, index) => index + 1).find(
        (round) => !isRoundComplete(game, round)
      ) ?? rounds
    );
  };

  const roundNumbers = activeGame
    ? Array.from({ length: activeGameRounds }, (_, index) => index + 1)
    : [];
  const completedRounds = activeGame
    ? roundNumbers.filter((round) => isRoundComplete(activeGame, round)).length
    : 0;
  const nextOpenRound = activeGame ? getNextIncompleteRound(activeGame) : 1;
  const isAllRoundsComplete = completedRounds === activeGameRounds;
  const isOnNextOpenRound = activeRound === nextOpenRound && !isAllRoundsComplete;
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
        placement: placementMap.get(team.id) ?? null,
      }))
      .sort(
        (a, b) =>
          (a.placement ?? Number.MAX_SAFE_INTEGER) -
            (b.placement ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name)
      );
  };

  const activeProgressPercent = activeGameRounds > 0 ? Math.round((completedRounds / activeGameRounds) * 100) : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-8 md:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Level Selector
          </span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-3 font-heading">
            Active Game Scoring
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Rank each round here. The system handles all standardization calculations.
          </p>
        </div>
        <div>
          <label htmlFor="sort-game-list" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
            Sort Game List
          </label>
          <select
            id="sort-game-list"
            value={gameSortBy}
            onChange={(event) => setGameSortBy(event.target.value as GameSortBy)}
            className="bg-white border border-slate-200 text-xs font-bold py-1.5 px-4 rounded-xl min-w-[160px] text-slate-650 focus:outline-none focus:border-brand-primary"
          >
            <option value="order">Default Order</option>
            <option value="status">Completed First</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {eventId && games.length && teams.length ? (
        <div className="space-y-8">
          
          {/* Horizontal Scrollable Tabs */}
          <div className="flex space-x-3 overflow-x-auto pb-4 mb-4 select-none">
            {sortedGames.map((game) => {
              const complete = isGameComplete(game, teams.length);
              const active = activeGame?.id === game.id;

              return (
                <button
                  key={game.id}
                  className={`flex-shrink-0 flex items-center space-x-3 rounded-2xl px-6 py-3.5 transition-all text-left focus:outline-none ${
                    active
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                      : "bg-white border border-slate-100 hover:bg-slate-50 text-slate-500"
                  }`}
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setSelectedRound(getNextIncompleteRound(game));
                  }}
                  type="button"
                >
                  <span className={`p-1 rounded-full flex items-center justify-center ${active ? "bg-white/20 text-white" : complete ? "text-brand-success bg-brand-success/10" : "text-brand-secondary bg-rose-50"}`}>
                    {complete ? (
                      <CheckIcon width={12} height={12} />
                    ) : (
                      <span className="text-[10px] font-black">▶</span>
                    )}
                  </span>
                  
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    {game.name}{" "}
                    <span className={`ml-2 text-[10px] ${active ? "text-white/70" : "text-slate-350"}`}>
                      {game.scores.length}/{teams.length * getGameRounds(game)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Arena Details */}
          {activeGame && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-6 md:p-8 space-y-8 animate-fadeIn">
              
              {/* Progress & Navigation Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-brand-secondary/10 text-brand-secondary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <TargetIcon width={12} height={12} />
                      Round {activeRound} of {activeGameRounds}
                    </span>
                    <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border border-slate-100 relative">
                      <div
                        className="bg-brand-secondary h-full transition-all duration-300"
                        style={{ width: `${activeProgressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-brand-secondary">
                      {activeProgressPercent}%
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status: {isAllRoundsComplete ? "Finalizing Game Results" : `Scoring Round ${activeRound}`}
                  </p>
                </div>

                <div className="flex space-x-3 ml-0 md:ml-6 items-center justify-end">
                  <button
                    className={`px-5 py-2 border rounded-xl text-xs font-extrabold transition shadow-sm ${
                      canGoPreviousRound && activeGameRounds > 1
                        ? "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                        : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                    type="button"
                    disabled={!canGoPreviousRound || activeGameRounds === 1}
                    onClick={() => setSelectedRound(activeRound - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className={`px-5 py-2 border rounded-xl text-xs font-extrabold transition shadow-sm ${
                      canGoNextRound && activeGameRounds > 1
                        ? "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                        : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                    type="button"
                    disabled={!canGoNextRound || activeGameRounds === 1}
                    onClick={() => setSelectedRound(activeRound + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Multiple Rounds Tabs (Chips) */}
              {activeGameRounds > 1 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100" role="tablist" aria-label="Game rounds">
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
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center space-x-2 ${
                          current
                            ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                            : complete
                            ? "bg-green-50 border-green-150 text-green-600"
                            : savedCount > 0
                            ? "bg-amber-50 border-amber-150 text-amber-600"
                            : "bg-white border-slate-150 text-slate-400 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedRound(round)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>Round {round}</span>
                        <small className="opacity-75 font-semibold">({savedCount}/{teams.length})</small>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Draggable Placement Board */}
              <GamePlacementBoard
                eventId={eventId}
                gameId={activeGame.id}
                gameName={activeGame.name}
                gameDescription={activeGame.description}
                round={activeRound}
                totalRounds={activeGameRounds}
                teams={getPlacementTeams(activeGame, activeRound)}
              />

            </div>
          )}
        </div>
      ) : (
        <div className="my-10">
          <EmptyState
            icon={<GamepadIcon width={48} height={48} />}
            title="Placements require active teams and games"
            description="Create at least one team and setup one competition before ranking standings."
          />
        </div>
      )}
    </div>
  );
}
