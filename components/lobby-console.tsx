"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Game, Team } from "@prisma/client";
import { notify } from "@/components/toast-host";
import {
  createGame,
  createTeam,
  deleteGame,
  deleteTeam,
  updateGame,
  updateTeam,
  updateGameOrder,
} from "@/app/actions";
import { RefreshActionForm } from "@/components/refresh-action-form";
import { DragHandleIcon, EditIcon, GamepadIcon, TrophyIcon, UsersIcon, TrashIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; round: number; points: number }[] };

type LobbyConsoleProps = {
  eventId: number | null;
  teams: TeamWithMembers[];
  games: GameWithScores[];
};

export function LobbyConsole({ eventId, teams, games }: LobbyConsoleProps) {
  const router = useRouter();
  const [lobbyTab, setLobbyTab] = useState<"teams" | "games">("teams");
  const eventReady = eventId !== null;

  const [orderedGames, setOrderedGames] = useState(games);
  const [draggedGameId, setDraggedGameId] = useState<number | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingGameId, setEditingGameId] = useState<number | null>(null);

  const editingTeam = teams.find((team) => team.id === editingTeamId) ?? null;
  const editingGame = orderedGames.find((game) => game.id === editingGameId) ?? null;

  useEffect(() => {
    if (draggedGameId === null) {
      const sorted = [...games].sort((a, b) => a.order - b.order);
      setOrderedGames(sorted);
    }
  }, [games, draggedGameId]);

  const moveGame = (targetGameId: number) => {
    if (draggedGameId === null || draggedGameId === targetGameId) return;

    setOrderedGames((currentGames) => {
      const draggedIndex = currentGames.findIndex((g) => g.id === draggedGameId);
      const targetIndex = currentGames.findIndex((g) => g.id === targetGameId);

      if (draggedIndex < 0 || targetIndex < 0) return currentGames;

      const nextGames = [...currentGames];
      const [draggedGame] = nextGames.splice(draggedIndex, 1);
      nextGames.splice(targetIndex, 0, draggedGame);
      return nextGames;
    });
  };

  const handleDragEnd = async () => {
    setDraggedGameId(null);
    const orderedIds = orderedGames.map((g) => g.id);
    const result = await updateGameOrder(orderedIds);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Game order updated");
    }
    router.refresh();
  };

  const handleTeamCreate = async (formData: FormData) => {
    const result = await createTeam(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Team registered");
    }
    router.refresh();
  };

  const handleTeamUpdate = async (formData: FormData) => {
    const result = await updateTeam(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Team profile updated");
      setEditingTeamId(null);
    }
    router.refresh();
  };

  const handleTeamDelete = async (formData: FormData) => {
    const result = await deleteTeam(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Team removed", "warning");
    }
    router.refresh();
  };

  const handleGameCreate = async (formData: FormData) => {
    const result = await createGame(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Game created");
    }
    router.refresh();
  };

  const handleGameUpdate = async (formData: FormData) => {
    const result = await updateGame(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Game updated");
      setEditingGameId(null);
    }
    router.refresh();
  };

  const handleGameDelete = async (formData: FormData) => {
    const result = await deleteGame(formData);
    if (result?.error) {
      notify(result.error, "error");
    } else {
      notify("Game removed", "warning");
    }
    router.refresh();
  };

  // Color mapping cycle for teams
  const teamTextColors = ["text-brand-primary", "text-brand-success", "text-brand-secondary"];
  const teamHoverBgColors = ["hover:bg-brand-primary", "hover:bg-brand-success", "hover:bg-brand-secondary"];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-8 md:p-10">
      
      {/* Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Lobby Console
          </span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-3 font-heading">
            {lobbyTab === "teams" ? "Team Registration" : "Game Catalog"}
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Populate participant lists and assign them to competition brackets.
          </p>
        </div>
        <div className="flex space-x-2">
          <span className="px-4 py-1.5 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-full text-[10px] font-extrabold">
            {teams.length} TEAMS
          </span>
          <span className="px-4 py-1.5 bg-brand-secondary/5 text-brand-secondary border border-brand-secondary/10 rounded-full text-[10px] font-extrabold">
            {games.length} GAMES
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-2 gap-0 border border-slate-100 rounded-2xl overflow-hidden mb-10 shadow-sm">
        <button
          className={`p-6 flex items-center justify-between text-left transition-all focus:outline-none ${
            lobbyTab === "teams"
              ? "bg-brand-primary/5 border-r border-slate-150 text-brand-primary font-extrabold"
              : "bg-white border-r border-slate-100 text-slate-400 font-bold hover:bg-slate-50"
          }`}
          onClick={() => setLobbyTab("teams")}
          type="button"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">👥</span>
            <span className="uppercase tracking-widest text-[10px]">Lobby Teams</span>
          </div>
          <span className="text-2xl font-extrabold">{teams.length}</span>
        </button>
        
        <button
          className={`p-6 flex items-center justify-between text-left transition-all focus:outline-none ${
            lobbyTab === "games"
              ? "bg-brand-primary/5 text-brand-primary font-extrabold"
              : "bg-white text-slate-400 font-bold hover:bg-slate-50"
          }`}
          onClick={() => setLobbyTab("games")}
          type="button"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🏆</span>
            <span className="uppercase tracking-widest text-[10px]">Lobby Games</span>
          </div>
          <span className="text-2xl font-extrabold">{games.length}</span>
        </button>
      </div>

      {/* Teams Pane */}
      {lobbyTab === "teams" ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Quick Add Team Form */}
          <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100">
            <RefreshActionForm action={handleTeamCreate} className="grid grid-cols-12 gap-6 items-end">
              <input type="hidden" name="eventId" value={eventId ?? ""} />
              
              <div className="col-span-12 md:col-span-4">
                <label htmlFor="team-name" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                  New Team Name
                </label>
                <input
                  id="team-name"
                  name="name"
                  type="text"
                  placeholder="e.g., Yellow Tigers"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                  disabled={!eventReady}
                  required
                />
              </div>
              
              <div className="col-span-12 md:col-span-6">
                <label htmlFor="members" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                  Participant Names (One per line or comma separated)
                </label>
                <input
                  id="members"
                  name="members"
                  type="text"
                  placeholder="Aina, Hakim, Mia..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                  disabled={!eventReady}
                />
              </div>
              
              <div className="col-span-12 md:col-span-2">
                <button
                  className="w-full bg-brand-secondary text-white rounded-xl py-3 text-xs font-extrabold shadow-md hover:bg-rose-500 disabled:opacity-50 transition"
                  type="submit"
                  disabled={!eventReady}
                >
                  Register
                </button>
              </div>
            </RefreshActionForm>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teams.length ? (
              teams.map((team, index) => {
                const textCol = teamTextColors[index % teamTextColors.length];
                const hoverBg = teamHoverBgColors[index % teamHoverBgColors.length];
                return (
                  <article
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft hover:shadow-md transition-all group flex flex-col justify-between"
                    key={team.id}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className={`font-extrabold text-base md:text-lg ${textCol}`}>
                          {team.name}
                        </h4>
                        <button
                          onClick={() => setEditingTeamId(team.id)}
                          type="button"
                          aria-label={`Edit ${team.name}`}
                          style={{
                            "--tw-hover-bg": index % 3 === 0 ? "#38bdf8" : index % 3 === 1 ? "#22c55e" : "#FB7185"
                          } as React.CSSProperties}
                          className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:bg-[var(--tw-hover-bg)] hover:text-white transition-all"
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Team Composition
                        </p>
                        <p className="text-xs font-bold text-slate-500">
                          {team.members.length} member{team.members.length === 1 ? "" : "s"} registered
                        </p>
                        
                        {/* Member Names list */}
                        {team.members.length > 0 ? (
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1">
                            {team.members.map((m) => m.name).join(", ")}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-350 italic font-medium mt-1">
                            No members added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <form
                        action={handleTeamDelete}
                        onSubmit={(event) => {
                          if (!window.confirm(`Remove team ${team.name}? This will also remove related scores.`)) {
                            event.preventDefault();
                          }
                        }}
                        className="w-full text-center"
                      >
                        <input type="hidden" name="teamId" value={team.id} />
                        <button
                          className="w-full text-[10px] font-extrabold text-slate-300 uppercase tracking-widest hover:text-brand-secondary transition-colors"
                          type="submit"
                        >
                          Remove Team
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-3">
                <EmptyState
                  compact
                  icon={<UsersIcon width={28} height={28} />}
                  title="No teams registered yet"
                  description="Add a team using the registration form above to get started."
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Games Pane */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Quick Add Game Form */}
          <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100">
            <RefreshActionForm action={handleGameCreate} className="space-y-4">
              <input type="hidden" name="eventId" value={eventId ?? ""} />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="game-name" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Game Name
                  </label>
                  <input
                    id="game-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Peking Glass"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                    disabled={!eventReady}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="order" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Display Index
                  </label>
                  <input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={games.length + 1}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                    disabled={!eventReady}
                  />
                </div>
                
                <div>
                  <label htmlFor="rounds" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Rounds
                  </label>
                  <input
                    id="rounds"
                    name="rounds"
                    type="number"
                    min="1"
                    defaultValue={1}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                    disabled={!eventReady}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="game-description" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Description / Rules
                </label>
                <textarea
                  id="game-description"
                  name="description"
                  rows={2}
                  placeholder="e.g. 15-20 Cawan 1 Team. Bergilir selagi x siap xleh ganti dgn ahli lain."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                  disabled={!eventReady}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    name="includeInScore"
                    type="checkbox"
                    defaultChecked
                    className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4 border-slate-350 disabled:opacity-50"
                    disabled={!eventReady}
                  />
                  <span className="text-xs font-bold text-slate-500">Include in leaderboard score calculation</span>
                </label>
                
                <button
                  className="w-full md:w-auto bg-brand-secondary text-white rounded-xl py-3 px-8 text-xs font-extrabold shadow-md hover:bg-rose-500 disabled:opacity-50 transition"
                  type="submit"
                  disabled={!eventReady}
                >
                  Create Game
                </button>
              </div>
            </RefreshActionForm>
          </div>

          {/* Games List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderedGames.length ? (
              orderedGames.map((game) => {
                const isDragging = draggedGameId === game.id;
                return (
                  <article
                    className={`bg-white border border-slate-100 rounded-3xl p-5 shadow-soft hover:shadow-md transition-all flex flex-col justify-between group ${
                      isDragging ? "opacity-40 border-dashed border-brand-primary" : ""
                    }`}
                    key={game.id}
                    draggable
                    onDragStart={() => setDraggedGameId(game.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      moveGame(game.id);
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab text-slate-300 hover:text-slate-500 p-1 flex items-center" title="Drag to reorder game">
                            <DragHandleIcon width={12} height={20} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-2">
                              {game.name}
                            </h4>
                            <span className="text-[9px] bg-slate-50 text-slate-400 font-extrabold px-2 py-0.5 rounded border border-slate-100 inline-block mt-1">
                              Index {game.order} · {game.rounds || 1}R · {game.includeInScore ? "Scored" : "Fun only"}
                            </span>
                          </div>
                        </div>

                        <button
                          className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-primary hover:text-white transition-all focus:outline-none"
                          onClick={() => setEditingGameId(game.id)}
                          type="button"
                          aria-label={`Edit ${game.name}`}
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                      </div>

                      {game.description && (
                        <p className="text-[11px] text-slate-400 font-semibold mb-4 pl-7 leading-relaxed">
                          {game.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex justify-end">
                      <form
                        action={handleGameDelete}
                        onSubmit={(event) => {
                          if (!window.confirm(`Remove game ${game.name}? This will also remove its scores.`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="gameId" value={game.id} />
                        <button
                          className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors"
                          type="submit"
                        >
                          Remove Game
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-2">
                <EmptyState
                  compact
                  icon={<GamepadIcon width={28} height={28} />}
                  title="No active games setup yet"
                  description="Create a game above before ranking placements."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default"
            onClick={() => setEditingTeamId(null)}
            type="button"
            aria-label="Close edit team"
          />
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 border border-slate-100 z-10 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edit Team Profile</p>
                <h3 className="text-xl font-extrabold text-slate-800 mt-1">{editingTeam.name}</h3>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
                onClick={() => setEditingTeamId(null)}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <form
              action={handleTeamUpdate}
              className="space-y-4"
            >
              <input type="hidden" name="teamId" value={editingTeam.id} />
              
              <div>
                <label htmlFor={`edit-team-name-${editingTeam.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Team Name
                </label>
                <input
                  id={`edit-team-name-${editingTeam.id}`}
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                  defaultValue={editingTeam.name}
                  required
                />
              </div>
              
              <div>
                <label htmlFor={`edit-team-members-${editingTeam.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Members (one per line)
                </label>
                <textarea
                  id={`edit-team-members-${editingTeam.id}`}
                  name="members"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                  defaultValue={editingTeam.members.map((member) => member.name).join("\n")}
                  placeholder="John&#10;Jane&#10;Bob"
                />
              </div>
              
              <button className="w-full bg-brand-primary text-white rounded-xl py-2.5 text-xs font-extrabold shadow-md hover:bg-sky-400 transition" type="submit">
                Save Team Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default"
            onClick={() => setEditingGameId(null)}
            type="button"
            aria-label="Close edit game"
          />
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 border border-slate-100 z-10 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edit Game Settings</p>
                <h3 className="text-xl font-extrabold text-slate-800 mt-1">{editingGame.name}</h3>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
                onClick={() => setEditingGameId(null)}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <form
              action={handleGameUpdate}
              className="space-y-4"
            >
              <input type="hidden" name="gameId" value={editingGame.id} />
              
              <div>
                <label htmlFor={`edit-game-name-${editingGame.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Game Name
                </label>
                <input
                  id={`edit-game-name-${editingGame.id}`}
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                  defaultValue={editingGame.name}
                  required
                />
              </div>

              <div>
                <label htmlFor={`edit-game-description-${editingGame.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Description / Rules
                </label>
                <textarea
                  id={`edit-game-description-${editingGame.id}`}
                  name="description"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                  defaultValue={editingGame.description ?? ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`edit-game-order-${editingGame.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Order Index
                  </label>
                  <input
                    id={`edit-game-order-${editingGame.id}`}
                    name="order"
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                    defaultValue={editingGame.order}
                  />
                </div>
                <div>
                  <label htmlFor={`edit-game-rounds-${editingGame.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Rounds
                  </label>
                  <input
                    id={`edit-game-rounds-${editingGame.id}`}
                    name="rounds"
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                    defaultValue={editingGame.rounds || 1}
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer pt-2">
                <input
                  name="includeInScore"
                  type="checkbox"
                  defaultChecked={editingGame.includeInScore}
                  className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-500">Include in leaderboard score calculation</span>
              </label>

              <button className="w-full bg-brand-primary text-white rounded-xl py-2.5 text-xs font-extrabold shadow-md hover:bg-sky-400 transition" type="submit">
                Save Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
