"use client";

import { useState } from "react";
import type { Game, Team } from "@prisma/client";
import {
  createGame,
  createTeam,
  deleteGame,
  deleteTeam,
  updateGame,
  updateTeam
} from "@/app/actions";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; points: number }[] };

type LobbyConsoleProps = {
  eventId: number | null;
  teams: TeamWithMembers[];
  games: GameWithScores[];
};

export function LobbyConsole({ eventId, teams, games }: LobbyConsoleProps) {
  const [lobbyTab, setLobbyTab] = useState<"teams" | "games">("teams");
  const eventReady = eventId !== null;

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
          <form action={createTeam} className="form-grid interactive-form lobby-create-form">
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
                    <a className="secondary-btn edit-team-btn" href={`#edit-team-${team.id}`}>
                      Edit
                    </a>
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
                      <span className="muted no-members-alert">No members registered</span>
                    ) : null}
                  </div>

                  <form action={deleteTeam} className="remove-form card-remove-trigger">
                    <input type="hidden" name="teamId" value={team.id} />
                    <button className="danger-btn remove-btn-small" type="submit">
                      Remove Team
                    </button>
                  </form>

                  <div className="modal" id={`edit-team-${team.id}`}>
                    <a className="modal-backdrop" href="#" aria-label="Close edit team" />
                    <div className="modal-panel animate-modal-entrance">
                      <div className="modal-header">
                        <div>
                          <p className="eyebrow">Edit Team Profile</p>
                          <h3>{team.name}</h3>
                        </div>
                        <a className="close-btn" href="#" aria-label="Close">
                          x
                        </a>
                      </div>
                      <form action={updateTeam} className="form-grid edit-form">
                        <input type="hidden" name="teamId" value={team.id} />
                        <div className="field">
                          <label htmlFor={`edit-team-name-${team.id}`}>Team Name</label>
                          <input id={`edit-team-name-${team.id}`} name="name" defaultValue={team.name} />
                        </div>
                        <div className="field">
                          <label htmlFor={`edit-team-members-${team.id}`}>Members</label>
                          <textarea
                            id={`edit-team-members-${team.id}`}
                            name="members"
                            defaultValue={team.members.map((member) => member.name).join("\n")}
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
                </article>
              ))
            ) : (
              <span className="muted empty-note">No teams registered yet.</span>
            )}
          </div>
        </div>
      ) : (
        <div className="lobby-pane panel-enter">
          <form action={createGame} className="form-grid compact interactive-form lobby-create-form">
            <input type="hidden" name="eventId" value={eventId ?? ""} />
            <div className="field">
              <label htmlFor="game-name">Game Name</label>
              <input id="game-name" name="name" placeholder="Egg Relay" disabled={!eventReady} />
            </div>
            <div className="field">
              <label htmlFor="order">Order</label>
              <input id="order" name="order" type="number" defaultValue={games.length + 1} disabled={!eventReady} />
            </div>
            <div className="actions form-save-actions">
              <button className="primary-btn" type="submit" disabled={!eventReady}>
                Create Game
              </button>
            </div>
          </form>

          <div className="record-list compact-list games-cards-grid">
            {games.length ? (
              games.map((game) => (
                <article className="record-card game-workspace-card" key={game.id}>
                  <div className="record-summary game-summary-block">
                    <div>
                      <strong>{game.name}</strong>
                      <span className="game-order-badge">Display index {game.order}</span>
                    </div>
                    <a className="secondary-btn edit-game-btn" href={`#edit-game-${game.id}`}>
                      Edit
                    </a>
                  </div>

                  <form action={deleteGame} className="remove-form card-remove-trigger">
                    <input type="hidden" name="gameId" value={game.id} />
                    <button className="danger-btn remove-btn-small" type="submit">
                      Remove Game
                    </button>
                  </form>

                  <div className="modal" id={`edit-game-${game.id}`}>
                    <a className="modal-backdrop" href="#" aria-label="Close edit game" />
                    <div className="modal-panel animate-modal-entrance">
                      <div className="modal-header">
                        <div>
                          <p className="eyebrow">Edit Competition</p>
                          <h3>{game.name}</h3>
                        </div>
                        <a className="close-btn" href="#" aria-label="Close">
                          x
                        </a>
                      </div>
                      <form action={updateGame} className="form-grid compact edit-form">
                        <input type="hidden" name="gameId" value={game.id} />
                        <div className="field">
                          <label htmlFor={`edit-game-name-${game.id}`}>Game Name</label>
                          <input id={`edit-game-name-${game.id}`} name="name" defaultValue={game.name} />
                        </div>
                        <div className="field">
                          <label htmlFor={`edit-game-order-${game.id}`}>Order</label>
                          <input id={`edit-game-order-${game.id}`} name="order" type="number" defaultValue={game.order} />
                        </div>
                        <div className="actions modal-save-btn">
                          <button className="primary-btn" type="submit">
                            Save Competition
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <span className="muted empty-note">No active games setup yet.</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

