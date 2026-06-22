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
  FileTextIcon,
  FlagIcon,
  SportsIcon,
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
    lower.includes("breakfast")
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
  if (!value) return "No date";
  return value.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
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
          <div
            aria-labelledby={`edit-schedule-title-${editingSchedule.id}`}
            aria-modal="true"
            className="modal open agenda-modal"
            role="dialog"
          >
            <button
              className="modal-backdrop"
              onClick={() => setEditingScheduleId(null)}
              type="button"
              aria-label="Close edit agenda item"
            />
            <div className="modal-panel agenda-modal-panel animate-modal-entrance">
              <div className="modal-header">
                <div>
                  <p className="eyebrow">Edit Agenda Item</p>
                  <h3 id={`edit-schedule-title-${editingSchedule.id}`}>{editingSchedule.title}</h3>
                </div>
                <button
                  className="close-btn"
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
                className="edit-form"
                successMessage="Agenda item updated"
              >
                <input type="hidden" name="scheduleId" value={editingSchedule.id} />
                <div className="form-grid compact modal-form-grid">
                  <div className="field">
                    <label htmlFor={`edit-schedule-date-${editingSchedule.id}`}>Date</label>
                    <input
                      id={`edit-schedule-date-${editingSchedule.id}`}
                      name="scheduleDate"
                      type="date"
                      defaultValue={
                        editingSchedule.scheduleDate
                          ? editingSchedule.scheduleDate.toISOString().slice(0, 10)
                          : ""
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-schedule-time-${editingSchedule.id}`}>Time</label>
                    <input
                      id={`edit-schedule-time-${editingSchedule.id}`}
                      name="time"
                      type="time"
                      defaultValue={formatTimeInputValue(editingSchedule.time)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-schedule-name-${editingSchedule.id}`}>Activity</label>
                    <input
                      id={`edit-schedule-name-${editingSchedule.id}`}
                      name="title"
                      defaultValue={editingSchedule.title}
                    />
                  </div>
                </div>
                <div className="form-grid compact modal-form-grid">
                  <div className="field">
                    <label htmlFor={`edit-schedule-location-${editingSchedule.id}`}>Location</label>
                    <input
                      id={`edit-schedule-location-${editingSchedule.id}`}
                      name="location"
                      defaultValue={editingSchedule.location ?? ""}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-schedule-pic-${editingSchedule.id}`}>PIC</label>
                    <input
                      id={`edit-schedule-pic-${editingSchedule.id}`}
                      name="pic"
                      defaultValue={editingSchedule.pic ?? ""}
                    />
                  </div>
                  <div className="field wide-field">
                    <label htmlFor={`edit-schedule-notes-${editingSchedule.id}`}>Notes</label>
                    <textarea
                      id={`edit-schedule-notes-${editingSchedule.id}`}
                      name="notes"
                      defaultValue={editingSchedule.notes ?? ""}
                    />
                  </div>
                </div>
                <div className="actions modal-save-btn">
                  <button className="primary-btn" type="submit">
                    Save Changes
                  </button>
                </div>
              </RefreshActionForm>

              <RefreshActionForm
                action={async (formData) => {
                  await deleteTentativeSchedule(formData);
                  setEditingScheduleId(null);
                }}
                className="agenda-editor-remove"
                onSubmit={(event) => {
                  if (!window.confirm("Remove this agenda slot? This cannot be undone.")) {
                    event.preventDefault();
                  }
                }}
                successMessage="Agenda slot removed"
              >
                <input type="hidden" name="scheduleId" value={editingSchedule.id} />
                <button className="danger-btn" type="submit">
                  Remove Slot
                </button>
              </RefreshActionForm>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="glass-panel panel-pad stack timetable-panel timeline-vertical-panel">
      <div className="timeline-header">
        <div>
          <p className="eyebrow">Scheduled Plan</p>
          <h3>Daily Agenda</h3>
          <span className="timetable-sub-label">{dateRangeLabel}</span>
        </div>
        <a
          className={`ghost-link${eventReady ? "" : " is-disabled"}`}
          href={eventReady && eventId ? `/api/tentative-pdf?eventId=${eventId}` : "#"}
          aria-disabled={!eventReady}
          download={eventReady ? "tentative-timetable.pdf" : undefined}
          target={eventReady ? "_blank" : undefined}
          rel={eventReady ? "noreferrer" : undefined}
        >
          <FileTextIcon width={16} height={16} />
          Export PDF
        </a>
      </div>

      {timetable.length ? (
        <ol className="timeline-rail">
          {timetable.map((item) => (
            <li key={item.id} className="timeline-rail-node">
              <div className="timeline-marker">
                <div className="marker-icon-wrapper">{getTimetableIcon(item.title)}</div>
              </div>

              <div className="timeline-card-content">
                <div className="timeline-card-head">
                  <div className="time-indicator">
                    <ClockIcon width={16} height={16} />
                    <time>{formatScheduleTime(item.time)}</time>
                  </div>
                  <button
                    className="secondary-edit-trigger"
                    onClick={() => setEditingScheduleId(item.id)}
                    type="button"
                  >
                    <EditIcon width={14} height={14} />
                    Edit
                  </button>
                </div>

                <div className="timeline-card-body">
                  <strong>{item.title}</strong>
                  <span className="location-tag schedule-date-tag">{formatScheduleDate(item.scheduleDate)}</span>
                  {item.pic && <span className="location-tag">PIC: {item.pic}</span>}
                  {item.location && <span className="location-tag">📍 {item.location}</span>}
                  {item.notes && <p className="notes-para">{item.notes}</p>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          compact
          icon={<ClockIcon width={28} height={28} />}
          title="No agenda slots scheduled"
          description="Add the opening session below to build the day."
        />
      )}

      <RefreshActionForm
        action={createTentativeSchedule}
        className="form-grid schedule-form agenda-add-form"
        successMessage="Agenda slot added"
      >
        <input type="hidden" name="eventId" value={eventId ?? ""} />
        <div className="form-grid compact">
          <div className="field">
            <label htmlFor="schedule-date">Date</label>
            <input
              id="schedule-date"
              name="scheduleDate"
              type="date"
              defaultValue={eventStartDate}
              disabled={!eventReady}
            />
          </div>
          <div className="field">
            <label htmlFor="schedule-time">Time</label>
            <input id="schedule-time" name="time" type="time" disabled={!eventReady} />
          </div>
          <div className="field">
            <label htmlFor="schedule-title">Activity</label>
            <input
              id="schedule-title"
              name="title"
              placeholder="Opening Ceremony"
              disabled={!eventReady}
            />
          </div>
          <div className="field">
            <label htmlFor="schedule-location">Location</label>
            <input
              id="schedule-location"
              name="location"
              placeholder="Main Hall"
              disabled={!eventReady}
            />
          </div>
        </div>
        <div className="form-grid compact">
          <div className="field">
            <label htmlFor="schedule-pic">PIC</label>
            <input
              id="schedule-pic"
              name="pic"
              placeholder="Pak Long / Committee Lead"
              disabled={!eventReady}
            />
          </div>
          <div className="field wide-field">
            <label htmlFor="schedule-notes">Notes</label>
            <input
              id="schedule-notes"
              name="notes"
              placeholder="Briefing, safety notes, or PIC"
              disabled={!eventReady}
            />
          </div>
        </div>
        <div className="actions form-save-actions">
          <button className="primary-btn" type="submit" disabled={!eventReady}>
            Add Agenda Slot
          </button>
        </div>
      </RefreshActionForm>

      {editScheduleModal}
    </div>
  );
}
