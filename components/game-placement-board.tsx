"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearGamePlacements, saveGamePlacements } from "@/app/actions";
import { confirmDialog } from "@/components/confirm-dialog";
import { notify } from "@/components/toast-host";
import { DragHandleIcon, SaveIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

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
  gameDescription?: string | null;
  round: number;
  totalRounds: number;
  teams: PlacementTeam[];
};

export function GamePlacementBoard({
  eventId,
  gameId,
  gameName,
  gameDescription,
  round,
  totalRounds,
  teams,
}: GamePlacementBoardProps) {
  const router = useRouter();
  const [orderedTeams, setOrderedTeams] = useState(teams);
  const [draggedTeamId, setDraggedTeamId] = useState<number | null>(null);
  const teamSignature = useMemo(
    () => teams.map((team) => `${team.id}:${team.placement ?? "pending"}`).join("|"),
    [teams]
  );
  const lastTeamSignature = useRef(teamSignature);

  useEffect(() => {
    if (lastTeamSignature.current !== teamSignature) {
      lastTeamSignature.current = teamSignature;
      setOrderedTeams(teams);
    }
  }, [teams, teamSignature]);

  const [pendingAction, setPendingAction] = useState<"save" | "clear" | null>(null);

  const handleSavePlacements = async (formData: FormData) => {
    setPendingAction("save");
    try {
      const result = await saveGamePlacements(formData);
      if (result?.error) {
        notify(result.error, "error");
      } else {
        notify("Placements saved");
        router.refresh();
      }
    } catch {
      notify("An unexpected error occurred.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const handleClearPlacements = async (formData: FormData) => {
    setPendingAction("clear");
    try {
      const result = await clearGamePlacements(formData);
      if (result?.error) {
        notify(result.error, "error");
      } else {
        notify("Placements cleared", "warning");
        router.refresh();
      }
    } catch {
      notify("An unexpected error occurred.", "error");
    } finally {
      setPendingAction(null);
    }
  };

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

  const moveTeamByStep = (teamId: number, direction: -1 | 1) => {
    setOrderedTeams((currentTeams) => {
      const currentIndex = currentTeams.findIndex((team) => team.id === teamId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentTeams.length) {
        return currentTeams;
      }

      const nextTeams = [...currentTeams];
      [nextTeams[currentIndex], nextTeams[nextIndex]] = [nextTeams[nextIndex], nextTeams[currentIndex]];
      return nextTeams;
    });
  };

  const getPlacementBadge = (index: number) => {
    if (index === 0) return <span className="bg-brand-secondary text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Champ</span>;
    if (index === 1) return <span className="bg-slate-100 text-slate-650 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">2nd</span>;
    if (index === 2) return <span className="bg-slate-50 text-slate-500 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">3rd</span>;
    return <span className="bg-slate-50 text-slate-400 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">{index + 1}th</span>;
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-8 shadow-soft">
      {/* Deck Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-brand-secondary/15 text-brand-secondary text-[9px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          Placement Deck
        </span>
        <span className="text-[10px] font-extrabold text-slate-350 uppercase tracking-widest">
          {orderedTeams.length} Participating Teams
        </span>
      </div>

      <h4 className="text-2xl font-extrabold mb-1 tracking-tight text-slate-800 font-heading">
        {gameName}
      </h4>
      
      {gameDescription ? (
        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
          {gameDescription}
        </p>
      ) : (
        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
          Rank placements to distribute leaderboard scores.
        </p>
      )}

      {/* Point Scoring Info Card */}
      {orderedTeams.length ? (
        <>
          <div className="bg-brand-primary/5 p-4 rounded-2xl mb-8 border border-brand-primary/10">
            <p className="text-xs leading-relaxed text-slate-600 font-bold">
              <span className="font-extrabold text-brand-primary uppercase tracking-widest text-[10px] mr-2">
                Rule:
              </span>
              Drag teams into finishing order. 
              {orderedTeams.length >= 3 ? (
                ` 1st place = ${orderedTeams.length}pts, 2nd = ${orderedTeams.length - 1}pts, 3rd = ${orderedTeams.length - 2}pts, etc.`
              ) : (
                " 1st place earns the highest score based on team count."
              )}
            </p>
          </div>

          {/* Rankings List */}
          <ol className="space-y-4">
            {orderedTeams.map((team, index) => {
              const isDragging = draggedTeamId === team.id;
              // Team opacity and focus styles based on placement
              const opacityClass = index === 0 ? "opacity-100" : index === 1 ? "opacity-90" : "opacity-75";
              
              return (
                <li
                  className={`flex items-center justify-between border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:border-brand-primary transition-all group ${
                    isDragging ? "opacity-30 border-dashed border-brand-primary" : ""
                  } ${opacityClass}`}
                  draggable
                  key={team.id}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(team.id));
                    setDraggedTeamId(team.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    moveTeam(team.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDraggedTeamId(null);
                  }}
                  onDragEnd={() => setDraggedTeamId(null)}
                >
                  <div className="flex items-center space-x-6">
                    {/* Drag Handle */}
                    <div 
                      className="w-8 h-8 flex items-center justify-center text-slate-200 group-hover:text-brand-primary transition-colors cursor-grab"
                      title="Drag to reorder"
                    >
                      <DragHandleIcon width={12} height={20} />
                    </div>

                    {/* Medal / Placement Badge */}
                    {getPlacementBadge(index)}

                    <div>
                      <p className="font-extrabold text-slate-800 text-base">{team.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Current Rank: {index + 1}
                      </p>
                    </div>
                  </div>

                  {/* Stepper controls */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-350 hover:text-brand-primary hover:border-brand-primary transition-all disabled:opacity-30 disabled:hover:text-slate-350 disabled:hover:border-slate-100"
                      onClick={() => moveTeamByStep(team.id, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-350 hover:text-brand-primary hover:border-brand-primary transition-all disabled:opacity-30 disabled:hover:text-slate-350 disabled:hover:border-slate-100"
                      onClick={() => moveTeamByStep(team.id, 1)}
                      disabled={index === orderedTeams.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className="my-10">
          <EmptyState
            compact
            icon={<UsersIcon width={28} height={28} />}
            title="No teams registered"
            description="Teams must be added to lobby list before scoring."
          />
        </div>
      )}

      {/* Scoring Action Buttons */}
      <div className="mt-10 flex justify-end space-x-4">
        <form
          action={handleClearPlacements}
          onSubmit={async (event) => {
            const form = event.currentTarget;
            if (form.dataset.confirmed === "1") {
              delete form.dataset.confirmed;
              return;
            }
            event.preventDefault();
            const ok = await confirmDialog({
              title: "Clear round placements",
              message: `Clear placements for ${gameName} round ${round}?`,
              confirmLabel: "Clear Round",
              tone: "danger",
            });
            if (ok) {
              form.dataset.confirmed = "1";
              form.requestSubmit();
            }
          }}
        >
          <input type="hidden" name="gameId" value={gameId} />
          <input type="hidden" name="round" value={round} />
          <button 
            className="bg-white border border-slate-200 px-8 py-3 rounded-xl font-extrabold text-slate-400 hover:text-rose-500 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            type="submit" 
            disabled={pendingAction !== null}
          >
            {pendingAction === "clear" ? "Clearing..." : "Clear Round"}
          </button>
        </form>

        <form action={handleSavePlacements}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="gameId" value={gameId} />
          <input type="hidden" name="round" value={round} />
          <input type="hidden" name="orderedTeamIds" value={orderedTeams.map((team) => team.id).join(",")} />
          <button
            className="bg-brand-primary text-white px-8 py-3 rounded-xl font-extrabold shadow-lg shadow-brand-primary/20 text-xs uppercase tracking-wider hover:bg-sky-400 transition-all disabled:opacity-50"
            type="submit"
            disabled={orderedTeams.length === 0 || pendingAction !== null}
          >
            {pendingAction === "save" ? "Saving..." : "Save Placements"}
          </button>
        </form>
      </div>
    </div>
  );
}
