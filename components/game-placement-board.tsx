"use client";

import { useState } from "react";
import { clearGamePlacements, saveGamePlacements } from "@/app/actions";

type PlacementTeam = {
  id: number;
  name: string;
  members: string[];
  placement: number | null;
};

type GamePlacementBoardProps = {
  eventId: number;
  gameId: number;
  gameName: string;
  teams: PlacementTeam[];
};

// Custom SVGs for interactive details
function DragHandleIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="2" cy="3" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="2" cy="17" r="1" />
      <circle cx="10" cy="3" r="1" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="10" cy="17" r="1" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-3 3-3h2c2 0 3 2 3 3v2" />
    </svg>
  );
}

export function GamePlacementBoard({
  eventId,
  gameId,
  gameName,
  teams
}: GamePlacementBoardProps) {
  const [orderedTeams, setOrderedTeams] = useState(teams);
  const [draggedTeamId, setDraggedTeamId] = useState<number | null>(null);

  const moveTeam = (targetTeamId: number) => {
    if (draggedTeamId === null || draggedTeamId === targetTeamId) return;

    setOrderedTeams((currentTeams) => {
      const draggedIndex = currentTeams.findIndex((team) => team.id === draggedTeamId);
      const targetIndex = currentTeams.findIndex((team) => team.id === targetTeamId);

      if (draggedIndex < 0 || targetIndex < 0) return currentTeams;

      const nextTeams = [...currentTeams];
      const [draggedTeam] = nextTeams.splice(draggedIndex, 1);
      nextTeams.splice(targetIndex, 0, draggedTeam);
      return nextTeams;
    });
  };

  const getPlacementBadge = (index: number) => {
    if (index === 0) return <span className="placement-pill rank-1">🥇 Champ</span>;
    if (index === 1) return <span className="placement-pill rank-2">🥈 2nd</span>;
    if (index === 2) return <span className="placement-pill rank-3">🥉 3rd</span>;
    return <span className="placement-pill rank-other">{index + 1}th</span>;
  };

  return (
    <article className="placement-board board-glass-panel slide-up-animation">
      <header className="placement-board-header dashboard-board-head">
        <div>
          <p className="eyebrow">Scoring Deck</p>
          <h4>{gameName}</h4>
        </div>
        <span className="teams-count-indicator">{orderedTeams.length} Teams</span>
      </header>

      {orderedTeams.length ? (
        <ol className="drag-list sorting-deck-rail">
          {orderedTeams.map((team, index) => {
            const isDragging = draggedTeamId === team.id;
            return (
              <li
                className={`drag-row sorting-deck-row ${isDragging ? "is-dragging" : ""}`}
                draggable
                key={team.id}
                onDragStart={() => setDraggedTeamId(team.id)}
                onDragOver={(event) => {
                  event.preventDefault();
                  moveTeam(team.id);
                }}
                onDragEnd={() => setDraggedTeamId(null)}
              >
                <div className="drag-handle-wrap" title="Drag to reorder">
                  <DragHandleIcon />
                </div>
                
                {getPlacementBadge(index)}
                
                <div className="sorting-row-text">
                  <span className="team-row-name">{team.name}</span>
                  <small className="team-row-members truncate-members">{team.members.join(", ") || "No members registered"}</small>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="empty-state placements-empty">
          <strong>No teams registered</strong>
          <span>Teams must be added to list before ranking.</span>
        </div>

      )}

      <div className="placement-actions scoring-actions-bar">
        <form action={saveGamePlacements}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="gameId" value={gameId} />
          <input type="hidden" name="orderedTeamIds" value={orderedTeams.map((team) => team.id).join(",")} />
          <button className="primary-btn save-deck-btn" type="submit" disabled={orderedTeams.length === 0}>
            <SaveIcon />
            <span>Save Scores</span>
          </button>
        </form>
        
        <form action={clearGamePlacements}>
          <input type="hidden" name="gameId" value={gameId} />
          <button className="danger-btn clear-deck-btn" type="submit">
            <TrashIcon />
            <span>Clear Scores</span>
          </button>
        </form>
      </div>
    </article>
  );
}
