import Link from "next/link";
import type { FamilyDayEvent, Game, Team, TentativeSchedule } from "@prisma/client";
import {
  createTentativeSchedule,
  deleteTentativeSchedule,
  saveEvent,
  updateTentativeSchedule
} from "@/app/actions";
import { LeaderboardInteractive } from "@/components/leaderboard-interactive";
import { LobbyConsole } from "@/components/lobby-console";
import { PlacementConsole } from "@/components/placement-console";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; points: number }[] };

type LeaderboardRow = {
  id: number;
  name: string;
  members: string[];
  perGame: { gameId: number; gameName: string; placement: number | null }[];
  completedGames: number;
  totalPlacement: number;
};

type DashboardState = {
  event: (FamilyDayEvent & { teams: TeamWithMembers[]; games: GameWithScores[] }) | null;
  leaderboard: LeaderboardRow[];
  games: GameWithScores[];
  teams: TeamWithMembers[];
  timetable: TentativeSchedule[];
  totals: { teams: number; games: number; scores: number };
};

// SVG Icons for timetable events and stats
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}

function SportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="3" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Activity Icon Picker
function getTimetableIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("opening") || lower.includes("register") || lower.includes("briefing") || lower.includes("start")) {
    return <FlagIcon />;
  }
  if (lower.includes("lunch") || lower.includes("dinner") || lower.includes("eat") || lower.includes("break") || lower.includes("tea") || lower.includes("breakfast")) {
    return <CoffeeIcon />;
  }
  if (lower.includes("game") || lower.includes("race") || lower.includes("relay") || lower.includes("toss") || lower.includes("sport") || lower.includes("match")) {
    return <SportsIcon />;
  }
  if (lower.includes("closing") || lower.includes("prize") || lower.includes("award") || lower.includes("gift")) {
    return <AwardIcon />;
  }
  return <ClockIcon />;
}

export function DashboardView({ state }: { state: DashboardState }) {
  const { event, leaderboard, games, teams, timetable, totals } = state;
  const featuredTeam = leaderboard[0];

  // Format date range helper
  const formatDate = (d: Date | null | undefined) =>
    d ? d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null;

  const startLabel = formatDate(event?.startDate);
  const endLabel = formatDate(event?.endDate);
  const dateRangeLabel = startLabel && endLabel
    ? `${startLabel} → ${endLabel}`
    : startLabel ?? endLabel ?? "Date not scheduled";

  return (
    <main className="dashboard-grid dashboard-workspace-shell slide-up-animation">
      {/* Event Hero Banner Header */}
      <section className="event-hero glass-panel dashboard-hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Operations Dashboard</p>
          <h2>{event ? event.title : "Assemble your Family Event"}</h2>
          <div className="hero-date-indicator">
            <CalendarIcon />
            <span className="muted">
              {event ? `${dateRangeLabel} — ${event.year} Edition` : "Define your event details to start."}
            </span>
          </div>
          {event?.location && (
            <div className="hero-location-indicator">
              <LocationPinIcon />
              <span className="muted">{event.location}</span>
            </div>
          )}
        </div>
        
        <div className="hero-metrics">
          <div className="metric-stat-card">
            <span className="metric-label">Teams</span>
            <strong className="metric-value">{totals.teams}</strong>
            <div className="metric-glow-dot green" />
          </div>
          <div className="metric-stat-card">
            <span className="metric-label">Games</span>
            <strong className="metric-value">{totals.games}</strong>
            <div className="metric-glow-dot blue" />
          </div>
          <div className="metric-stat-card spotlight">
            <span className="metric-label">Leader Spot</span>
            <strong className="metric-value leader-name">{featuredTeam ? featuredTeam.name : "None"}</strong>
            {featuredTeam && <div className="metric-glow-dot gold pulsing" />}
          </div>
        </div>
      </section>

      {/* Timetable and Config details */}
      <section className="section-grid main-setup">
        {/* Left: Event form */}
        <div className="glass-panel panel-pad stack config-event-panel">
          <div>
            <h3>Event Settings</h3>
            <p className="muted">Configure the event title, venue, year, and date range.</p>
          </div>
          
          <form action={saveEvent} className="form-grid interactive-form">
            <input type="hidden" name="eventId" value={event?.id ?? ""} />

            <div className="field">
              <label htmlFor="title">Event Title</label>
              <input id="title" name="title" defaultValue={event?.title ?? ""} placeholder="Family Day 2026" />
            </div>

            <div className="field">
              <label htmlFor="location">Venue / Location</label>
              <input id="location" name="location" defaultValue={event?.location ?? ""} placeholder="e.g. Nilai Springs Resort" />
            </div>

            <div className="event-date-range-row">
              <div className="field event-year-field">
                <label htmlFor="year">Year</label>
                <input id="year" name="year" type="number" defaultValue={event?.year ?? new Date().getFullYear()} />
              </div>
              <div className="field event-date-field">
                <label htmlFor="startDate">Start Date</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""}
                />
              </div>
              <div className="field event-date-field">
                <label htmlFor="endDate">End Date</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={event?.endDate ? event.endDate.toISOString().slice(0, 10) : ""}
                />
              </div>
            </div>

            <div className="actions form-save-actions">
              <button className="primary-btn pulse-glow-btn" type="submit">
                Save Event Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right: Timetable Timeline */}
        <div className="glass-panel panel-pad stack timetable-panel timeline-vertical-panel">
          <div className="timeline-header">
            <p className="eyebrow">Scheduled Plan</p>
            <h3>Daily Agenda</h3>
            <span className="timetable-sub-label">{dateRangeLabel}</span>
          </div>

          {timetable.length ? (
            <ol className="timeline-rail">
              {timetable.map((item) => (
                <li key={item.id} className="timeline-rail-node">
                  <div className="timeline-marker">
                    <div className="marker-icon-wrapper">
                      {getTimetableIcon(item.title)}
                    </div>
                  </div>
                  
                  <div className="timeline-card-content">
                    <div className="timeline-card-head">
                      <div className="time-indicator">
                        <ClockIcon />
                        <time>{item.time}</time>
                      </div>
                      <a className="secondary-edit-trigger" href={`#edit-schedule-${item.id}`}>
                        Edit
                      </a>
                    </div>
                    
                    <div className="timeline-card-body">
                      <strong>{item.title}</strong>
                      {item.location && <span className="location-tag">📍 {item.location}</span>}
                      {item.notes && <p className="notes-para">{item.notes}</p>}
                    </div>

                    {/* Edit Timetable Modal */}
                    <div className="modal" id={`edit-schedule-${item.id}`}>
                      <a className="modal-backdrop" href="#" aria-label="Close edit schedule" />
                      <div className="modal-panel animate-modal-entrance">
                        <div className="modal-header">
                          <div>
                            <p className="eyebrow">Edit Agenda Item</p>
                            <h3>{item.title}</h3>
                          </div>
                          <a className="close-btn" href="#" aria-label="Close">x</a>
                        </div>
                        
                        <form action={updateTentativeSchedule} className="form-grid edit-form">
                          <input type="hidden" name="scheduleId" value={item.id} />
                          <div className="form-grid compact">
                            <div className="field">
                              <label htmlFor={`edit-schedule-time-${item.id}`}>Time</label>
                              <input id={`edit-schedule-time-${item.id}`} name="time" defaultValue={item.time} />
                            </div>
                            <div className="field">
                              <label htmlFor={`edit-schedule-title-${item.id}`}>Activity</label>
                              <input id={`edit-schedule-title-${item.id}`} name="title" defaultValue={item.title} />
                            </div>
                            <div className="field">
                              <label htmlFor={`edit-schedule-order-${item.id}`}>Display Order</label>
                              <input
                                id={`edit-schedule-order-${item.id}`}
                                name="order"
                                type="number"
                                defaultValue={item.order}
                              />
                            </div>
                          </div>
                          <div className="form-grid compact">
                            <div className="field">
                              <label htmlFor={`edit-schedule-location-${item.id}`}>Location</label>
                              <input
                                id={`edit-schedule-location-${item.id}`}
                                name="location"
                                defaultValue={item.location ?? ""}
                              />
                            </div>
                            <div className="field wide-field">
                              <label htmlFor={`edit-schedule-notes-${item.id}`}>Notes</label>
                              <input id={`edit-schedule-notes-${item.id}`} name="notes" defaultValue={item.notes ?? ""} />
                            </div>
                          </div>
                          <div className="actions modal-save-btn">
                            <button className="primary-btn" type="submit">
                              Save Changes
                            </button>
                          </div>
                        </form>
                        
                        <form action={deleteTentativeSchedule} className="remove-form modal-remove">
                          <input type="hidden" name="scheduleId" value={item.id} />
                          <button className="danger-btn" type="submit">
                            Remove Slot
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <strong>No agenda slots scheduled</strong>
              <span>Add the opening session below to build the day.</span>
            </div>
          )}

          {/* Add Agenda Slot Form */}
          <form action={createTentativeSchedule} className="form-grid schedule-form agenda-add-form">
            <input type="hidden" name="eventId" value={event?.id ?? ""} />
            <div className="form-grid compact">
              <div className="field">
                <label htmlFor="schedule-time">Time</label>
                <input id="schedule-time" name="time" placeholder="8:30 AM" disabled={!event} />
              </div>
              <div className="field">
                <label htmlFor="schedule-title">Activity</label>
                <input id="schedule-title" name="title" placeholder="Opening Ceremony" disabled={!event} />
              </div>
              <div className="field">
                <label htmlFor="schedule-order">Order</label>
                <input
                  id="schedule-order"
                  name="order"
                  type="number"
                  defaultValue={timetable.length + 1}
                  disabled={!event}
                />
              </div>
            </div>
            <div className="form-grid compact">
              <div className="field">
                <label htmlFor="schedule-location">Location</label>
                <input id="schedule-location" name="location" placeholder="Main Hall" disabled={!event} />
              </div>
              <div className="field wide-field">
                <label htmlFor="schedule-notes">Notes</label>
                <input id="schedule-notes" name="notes" placeholder="Briefing, safety notes, or PIC" disabled={!event} />
              </div>
            </div>
            <div className="actions form-save-actions">
              <button className="primary-btn" type="submit" disabled={!event}>
                Add Agenda Slot
              </button>
            </div>
          </form>
        </div>
      </section>

      <LobbyConsole eventId={event?.id ?? null} teams={teams} games={games} />

      <PlacementConsole eventId={event?.id ?? null} games={games} teams={teams} />

      {/* Leaderboard Section (Client Interactive) */}
      <section className="glass-panel panel-pad stack leaderboard-panel-section-wrap">
        <div>
          <h3>Live Tournament Standings</h3>
          <p className="muted">Standings recalculate automatically based on completed games and placement averages.</p>
        </div>
        <LeaderboardInteractive leaderboard={leaderboard} games={games} />
      </section>

      <div className="actions back-navigation-footer">
        <Link className="ghost-link" href="/">
          &larr; Back to landing overview
        </Link>
      </div>
    </main>
  );
}
