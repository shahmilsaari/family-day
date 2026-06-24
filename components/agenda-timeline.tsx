"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TentativeSchedule } from "@prisma/client";
import {
  createTentativeSchedule,
  deleteTentativeSchedule,
  updateTentativeSchedule,
} from "@/app/actions";
import { RefreshActionForm } from "@/components/refresh-action-form";
import {
  AwardIcon,
  ClockIcon,
  CoffeeIcon,
  EditIcon,
  FlagIcon,
  SportsIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

type AgendaTimelineProps = {
  eventId: number | null;
  eventStartDate: string;
  eventReady: boolean;
  dateRangeLabel: string;
  timetable: TentativeSchedule[];
};

function getTimetableIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("opening") || lower.includes("register") || lower.includes("briefing") || lower.includes("start")) {
    return <FlagIcon width={18} height={18} />;
  }
  if (
    lower.includes("lunch") ||
    lower.includes("dinner") ||
    lower.includes("eat") ||
    lower.includes("break") ||
    lower.includes("tea") ||
    lower.includes("breakfast") ||
    lower.includes("celup")
  ) {
    return <CoffeeIcon width={18} height={18} />;
  }
  if (
    lower.includes("game") ||
    lower.includes("race") ||
    lower.includes("relay") ||
    lower.includes("toss") ||
    lower.includes("sport") ||
    lower.includes("match")
  ) {
    return <SportsIcon width={18} height={18} />;
  }
  if (lower.includes("closing") || lower.includes("prize") || lower.includes("award") || lower.includes("gift")) {
    return <AwardIcon width={18} height={18} />;
  }
  return <ClockIcon width={16} height={16} />;
}

function formatScheduleDate(value: Date | null | undefined) {
  if (!value) return "";
  return value.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatScheduleTime(value: string) {
  const normalized = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!normalized) return value;

  let hours = Number.parseInt(normalized[1], 10);
  const minutes = Number.parseInt(normalized[2], 10);
  const meridiem = normalized[3]?.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatTimeInputValue(value: string) {
  const normalized = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!normalized) return "";

  let hours = Number.parseInt(normalized[1], 10);
  const minutes = Number.parseInt(normalized[2], 10);
  const meridiem = normalized[3]?.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function AgendaTimeline({
  eventId,
  eventStartDate,
  eventReady,
  dateRangeLabel,
  timetable,
}: AgendaTimelineProps) {
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const editingSchedule = timetable.find((item) => item.id === editingScheduleId) ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editingScheduleId) return;
    if (!timetable.some((item) => item.id === editingScheduleId)) {
      setEditingScheduleId(null);
    }
  }, [editingScheduleId, timetable]);

  useEffect(() => {
    if (!editingSchedule) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditingScheduleId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [editingSchedule]);

  const editScheduleModal =
    mounted && editingSchedule
      ? createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default"
              onClick={() => setEditingScheduleId(null)}
              type="button"
              aria-label="Close edit agenda item"
            />
            <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 border border-slate-100 z-10 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edit Agenda Item</p>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-1">{editingSchedule.title}</h3>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
                  onClick={() => setEditingScheduleId(null)}
                  type="button"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <RefreshActionForm
                action={async (formData) => {
                  await updateTentativeSchedule(formData);
                  setEditingScheduleId(null);
                }}
                className="space-y-4"
                successMessage="Agenda item updated"
              >
                <input type="hidden" name="scheduleId" value={editingSchedule.id} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`edit-schedule-date-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                    <input
                      id={`edit-schedule-date-${editingSchedule.id}`}
                      name="scheduleDate"
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                      defaultValue={
                        editingSchedule.scheduleDate
                          ? editingSchedule.scheduleDate.toISOString().slice(0, 10)
                          : ""
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-schedule-time-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Time</label>
                    <input
                      id={`edit-schedule-time-${editingSchedule.id}`}
                      name="time"
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                      defaultValue={formatTimeInputValue(editingSchedule.time)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor={`edit-schedule-name-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Activity</label>
                    <input
                      id={`edit-schedule-name-${editingSchedule.id}`}
                      name="title"
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                      defaultValue={editingSchedule.title}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`edit-schedule-location-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                    <input
                      id={`edit-schedule-location-${editingSchedule.id}`}
                      name="location"
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                      defaultValue={editingSchedule.location ?? ""}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`edit-schedule-pic-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PIC</label>
                    <input
                      id={`edit-schedule-pic-${editingSchedule.id}`}
                      name="pic"
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                      defaultValue={editingSchedule.pic ?? ""}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`edit-schedule-notes-${editingSchedule.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</label>
                  <textarea
                    id={`edit-schedule-notes-${editingSchedule.id}`}
                    name="notes"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-primary"
                    defaultValue={editingSchedule.notes ?? ""}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-brand-primary text-white rounded-xl py-2.5 text-xs font-extrabold shadow-md hover:bg-sky-400 transition" type="submit">
                    Save Changes
                  </button>
                </div>
              </RefreshActionForm>

              <RefreshActionForm
                action={async (formData) => {
                  await deleteTentativeSchedule(formData);
                  setEditingScheduleId(null);
                }}
                className="pt-2 border-t border-slate-100"
                onSubmit={(event) => {
                  if (!window.confirm("Remove this agenda slot? This cannot be undone.")) {
                    event.preventDefault();
                  }
                }}
                successMessage="Agenda slot removed"
              >
                <input type="hidden" name="scheduleId" value={editingSchedule.id} />
                <button className="w-full bg-rose-50 text-rose-600 rounded-xl py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-rose-100 transition" type="submit">
                  <TrashIcon width={14} height={14} />
                  <span>Remove Slot</span>
                </button>
              </RefreshActionForm>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Scheduled Plan
          </span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-3 font-heading">Daily Agenda</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {dateRangeLabel}
          </p>
        </div>
        
        <a
          className={`flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-all${
            eventReady ? "" : " opacity-50 cursor-not-allowed pointer-events-none"
          }`}
          href={eventReady && eventId ? `/api/tentative-pdf?eventId=${eventId}` : "#"}
          aria-disabled={!eventReady}
          download={eventReady ? "tentative-timetable.pdf" : undefined}
          target={eventReady ? "_blank" : undefined}
          rel={eventReady ? "noreferrer" : undefined}
        >
          <span>Export PDF</span>
        </a>
      </div>

      {/* Timeline Layout */}
      {timetable.length ? (
        <div className="space-y-6 relative border-l-2 border-slate-100 ml-2 pl-8 pb-10">
          {timetable.map((item) => (
            <div key={item.id} className="relative group">
              
              {/* Timeline Dot */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-primary bg-white absolute -left-[39px] top-6 group-hover:bg-brand-primary transition-all flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:bg-white transition-all" />
              </div>

              {/* Card Container */}
              <div className="flex items-center justify-between bg-slate-50/50 border border-transparent rounded-2xl p-5 group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-soft transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1">
                  
                  {/* Time and Day info */}
                  <div className="text-left md:text-center md:w-24 flex-shrink-0">
                    <p className="text-base font-extrabold text-brand-secondary">
                      {formatScheduleTime(item.time)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {formatScheduleDate(item.scheduleDate)}
                    </p>
                  </div>
                  
                  {/* Details Block */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-2">
                      <span className="text-slate-400 inline-block md:hidden">
                        {getTimetableIcon(item.title)}
                      </span>
                      {item.title}
                    </h4>
                    
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.pic && <span>👤 PIC: {item.pic}</span>}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic font-medium mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Trigger */}
                <button
                  className="p-2 text-slate-300 hover:text-brand-primary hover:bg-slate-50 rounded-xl transition"
                  onClick={() => setEditingScheduleId(item.id)}
                  type="button"
                  aria-label="Edit item"
                >
                  <EditIcon width={18} height={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-10">
          <EmptyState
            compact
            icon={<ClockIcon width={28} height={28} />}
            title="No agenda slots scheduled"
            description="Add your first activity below to build the day."
          />
        </div>
      )}

      {/* Add Agenda Slot Form */}
      <div className="pt-10 mt-4 border-t border-slate-100">
        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">
          Quick Add New Slot
        </h5>
        
        <RefreshActionForm
          action={createTentativeSchedule}
          className="space-y-4"
          successMessage="Agenda slot added"
        >
          <input type="hidden" name="eventId" value={eventId ?? ""} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="schedule-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Date</label>
              <input
                id="schedule-date"
                name="scheduleDate"
                type="date"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                defaultValue={eventStartDate}
                disabled={!eventReady}
              />
            </div>
            
            <div>
              <label htmlFor="schedule-time" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Time</label>
              <input 
                id="schedule-time" 
                name="time" 
                type="time" 
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                disabled={!eventReady} 
              />
            </div>
            
            <div>
              <label htmlFor="schedule-title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Activity</label>
              <input
                id="schedule-title"
                name="title"
                type="text"
                placeholder="Opening Ceremony"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                disabled={!eventReady}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="schedule-location" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Location</label>
              <input
                id="schedule-location"
                name="location"
                type="text"
                placeholder="Main Hall"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                disabled={!eventReady}
              />
            </div>

            <div>
              <label htmlFor="schedule-pic" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">PIC</label>
              <input
                id="schedule-pic"
                name="pic"
                type="text"
                placeholder="Pak Long / Committee I"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                disabled={!eventReady}
              />
            </div>

            <div>
              <label htmlFor="schedule-notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Notes</label>
              <input
                id="schedule-notes"
                name="notes"
                type="text"
                placeholder="Briefing, safety notes, or PIC"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800 disabled:opacity-50"
                disabled={!eventReady}
              />
            </div>
          </div>

          <button
            className="w-full bg-brand-secondary text-white rounded-xl font-bold py-3.5 text-xs uppercase tracking-wider shadow-lg shadow-brand-secondary/20 hover:opacity-90 disabled:opacity-50 transition"
            type="submit"
            disabled={!eventReady}
          >
            Add Agenda Slot
          </button>
        </RefreshActionForm>
      </div>

      {editScheduleModal}
    </div>
  );
}
