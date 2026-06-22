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
  updateGameOrder
} from "@/app/actions";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; round: number; points: number }[] };

type LobbyConsoleProps = {
  eventId: number | null;
  teams: TeamWithMembers[];
  games: GameWithScores[];
};

function DragHandleIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
      <circle cx="2" cy="3" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="2" cy="17" r="1" />
      <circle cx="10" cy="3" r="1" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="10" cy="17" r="1" />
    </svg>
  );
}

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

  return (
    <section className="glass-panel panel-pad stack lobby-console">
      <div className="console-header">
        <div>
          <p className="eyebrow">Lobby Console</p>
          <h3>Registration Setup</h3>
          <p className="muted">Manage participants and competition levels from one control panel.</p>
        </div>
        <div className="console-counts">
          <span>{teams.length} teams</span>
          <span>{games.length} games</span>
        </div>
      </div>

      <div className="console-tabs" role="tablist" aria-label="Lobby configuration tabs">
        <button
          className={`console-tab ${lobbyTab === "teams" ? "active" : ""}`}
          onClick={() => setLobbyTab("teams")}
          type="button"
        >
          <span>Lobby Teams</span>
          <b>{teams.length}</b>
        </button>
        <button
          className={`console-tab ${lobbyTab === "games" ? "active" : ""}`}
          onClick={() => setLobbyTab("games")}
          type="button"
        >
          <span>Lobby Games</span>
          <b>{games.length}</b>
        </button>
      </div>

      {lobbyTab === "teams" ? (
        <div className="lobby-pane panel-enter">
          <form action={handleTeamCreate} className="form-grid interactive-form lobby-create-form">
            <input type="hidden" name="eventId" value={eventId ?? ""} />
            <div className="field">
              <label htmlFor="team-name">Team name</label>
              <input id="team-name" name="name" placeholder="Yellow Tigers" disabled={!eventReady} />
            </div>
            <div className="field">
              <label htmlFor="members">Member names</label>
              <textarea id="members" name="members" placeholder={"Aina\nHakim\nMia"} disabled={!eventReady} />
            </div>
            <div className="actions form-save-actions">
              <button className="primary-btn" type="submit" disabled={!eventReady}>
                Register Team
              </button>
            </div>
          </form>

          <div className="record-list teams-cards-grid">
            {teams.length ? (
              teams.map((team) => (
                <article className="record-card team-workspace-card" key={team.id}>
                  <div className="record-summary team-summary-block">
                    <div>
                      <strong>{team.name}</strong>
                      <span className="members-count">{team.members.length} members registered</span>
                    </div>
                    <button
                      className="secondary-btn edit-team-btn"
                      onClick={() => setEditingTeamId(team.id)}
                      type="button"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="avatar-group-row">
                    {team.members.map((member, idx) => (
                      <span
                        className="member-avatar-circle"
                        key={`${team.id}-${member.name}`}
                        title={member.name}
                        style={{ zIndex: 10 - idx }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    ))}
                    {team.members.length === 0 ? (
                      <span className="muted no-members-alert">Not decided yet</span>
                    ) : null}
                  </div>

                  <form
                    action={handleTeamDelete}
                    className="remove-form card-remove-trigger"
                    onSubmit={(event) => {
                      if (!window.confirm(`Remove team ${team.name}? This will also remove related scores.`)) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="teamId" value={team.id} />
                    <button className="danger-btn remove-btn-small" type="submit">
                      Remove Team
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <span className="muted empty-note">No teams registered yet.</span>
            )}
          </div>
        </div>
      ) : (
        <div className="lobby-pane panel-enter">
          <form action={handleGameCreate} className="form-grid compact interactive-form lobby-create-form">
            <input type="hidden" name="eventId" value={eventId ?? ""} />
            <div className="field">
              <label htmlFor="game-name">Game Name</label>
              <input id="game-name" name="name" placeholder="Egg Relay" disabled={!eventReady} />
            </div>
            <div className="field">
              <label htmlFor="game-description">Description</label>
              <textarea id="game-description" name="description" placeholder="Rules, setup, or notes for this game" disabled={!eventReady} />
            </div>
            <div className="field">
              <label htmlFor="order">Order</label>
              <input id="order" name="order" type="number" defaultValue={games.length + 1} disabled={!eventReady} />
            </div>
            <div className="field">
              <label htmlFor="rounds">Rounds</label>
              <input id="rounds" name="rounds" type="number" min="1" defaultValue={1} disabled={!eventReady} />
            </div>
            <label className="checkbox-field">
              <input name="includeInScore" type="checkbox" defaultChecked disabled={!eventReady} />
              <span>Include in leaderboard score</span>
            </label>
            <div className="actions form-save-actions">
              <button className="primary-btn" type="submit" disabled={!eventReady}>
                Create Game
              </button>
            </div>
          </form>

          <div className="record-list compact-list games-cards-grid">
            {orderedGames.length ? (
              orderedGames.map((game) => {
                const isDragging = draggedGameId === game.id;
                return (
                  <article
                    className={`record-card game-workspace-card ${isDragging ? "is-dragging" : ""}`}
                    key={game.id}
                    draggable
                    onDragStart={() => setDraggedGameId(game.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      moveGame(game.id);
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="record-summary game-summary-block">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ cursor: "grab", display: "flex", alignItems: "center" }} title="Drag to reorder game">
                          <DragHandleIcon />
                        </div>
                        <div>
                          <strong>{game.name}</strong>
                          {game.description ? <small className="muted">{game.description}</small> : null}
                          <span className="game-order-badge">Display index {game.order} · {game.rounds || 1} round{(game.rounds || 1) === 1 ? "" : "s"} · {game.includeInScore ? "Scored" : "Fun only"}</span>
                        </div>
                      </div>
                      <button
                        className="secondary-btn edit-game-btn"
                        onClick={() => setEditingGameId(game.id)}
                        type="button"
                      >
                        Edit
                      </button>
                    </div>

                    <form
                      action={handleGameDelete}
                      className="remove-form card-remove-trigger"
                      onSubmit={(event) => {
                        if (!window.confirm(`Remove game ${game.name}? This will also remove its scores.`)) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="gameId" value={game.id} />
                      <button className="danger-btn remove-btn-small" type="submit">
                        Remove Game
                      </button>
                    </form>
                  </article>
                );
              })
            ) : (
              <span className="muted empty-note">No active games setup yet.</span>
            )}
          </div>
        </div>
      )}

      {editingTeam ? (
        <div
          aria-labelledby={`edit-team-title-${editingTeam.id}`}
          aria-modal="true"
          className="modal open"
          role="dialog"
        >
          <button
            className="modal-backdrop"
            onClick={() => setEditingTeamId(null)}
            type="button"
            aria-label="Close edit team"
          />
          <div className="modal-panel animate-modal-entrance">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Edit Team Profile</p>
                <h3 id={`edit-team-title-${editingTeam.id}`}>{editingTeam.name}</h3>
              </div>
              <button className="close-btn" onClick={() => setEditingTeamId(null)} type="button" aria-label="Close">
                x
              </button>
            </div>
            <form action={handleTeamUpdate} className="form-grid edit-form">
              <input type="hidden" name="teamId" value={editingTeam.id} />
              <div className="field">
                <label htmlFor={`edit-team-name-${editingTeam.id}`}>Team Name</label>
                <input id={`edit-team-name-${editingTeam.id}`} name="name" defaultValue={editingTeam.name} />
              </div>
              <div className="field">
                <label htmlFor={`edit-team-members-${editingTeam.id}`}>Members</label>
                <textarea
                  id={`edit-team-members-${editingTeam.id}`}
                  name="members"
                  defaultValue={editingTeam.members.map((member) => member.name).join("\n")}
                />
              </div>
              <div className="actions modal-save-btn">
                <button className="primary-btn" type="submit">
                  Save Team Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingGame ? (
        <div
          aria-labelledby={`edit-game-title-${editingGame.id}`}
          aria-modal="true"
          className="modal open"
          role="dialog"
        >
          <button
            className="modal-backdrop"
            onClick={() => setEditingGameId(null)}
            type="button"
            aria-label="Close edit game"
          />
          <div className="modal-panel animate-modal-entrance">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Edit Competition</p>
                <h3 id={`edit-game-title-${editingGame.id}`}>{editingGame.name}</h3>
              </div>
              <button className="close-btn" onClick={() => setEditingGameId(null)} type="button" aria-label="Close">
                x
              </button>
            </div>
            <form action={handleGameUpdate} className="form-grid compact edit-form">
              <input type="hidden" name="gameId" value={editingGame.id} />
              <div className="field">
                <label htmlFor={`edit-game-name-${editingGame.id}`}>Game Name</label>
                <input id={`edit-game-name-${editingGame.id}`} name="name" defaultValue={editingGame.name} />
              </div>
              <div className="field">
                <label htmlFor={`edit-game-description-${editingGame.id}`}>Description</label>
                <textarea id={`edit-game-description-${editingGame.id}`} name="description" defaultValue={editingGame.description ?? ""} />
              </div>
              <div className="field">
                <label htmlFor={`edit-game-order-${editingGame.id}`}>Order</label>
                <input id={`edit-game-order-${editingGame.id}`} name="order" type="number" defaultValue={editingGame.order} />
              </div>
              <div className="field">
                <label htmlFor={`edit-game-rounds-${editingGame.id}`}>Rounds</label>
                <input id={`edit-game-rounds-${editingGame.id}`} name="rounds" type="number" min="1" defaultValue={editingGame.rounds || 1} />
              </div>
              <label className="checkbox-field">
                <input name="includeInScore" type="checkbox" defaultChecked={editingGame.includeInScore} />
                <span>Include in leaderboard score</span>
              </label>
              <div className="actions modal-save-btn">
                <button className="primary-btn" type="submit">
                  Save Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
