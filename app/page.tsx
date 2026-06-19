import Link from "next/link";
import { loadDashboard } from "@/lib/dashboard";
import { formatScheduleDate, formatScheduleTime, groupTimetableByDay } from "@/lib/timetable";

export const dynamic = "force-dynamic";

// Custom inline SVGs for layout aesthetics
function SparklesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
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
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="3" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default async function HomePage() {
  const state = await loadDashboard();

  const formatDate = (d: Date | null | undefined) =>
    d ? d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null;

  const startLabel = formatDate(state.event?.startDate);
  const endLabel = formatDate(state.event?.endDate);
  const dateRangeLabel = startLabel && endLabel
    ? `${startLabel} → ${endLabel}`
    : startLabel ?? endLabel ?? "Not scheduled";
  const groupedTimetable = groupTimetableByDay(state.timetable);
  const totalAgendaSlots = state.timetable.length;
  const scheduledDays = groupedTimetable.length;
  const nextAgendaItem = state.timetable[0] ?? null;

  return (
    <main className="hero-grid main-landing-shell slide-up-animation">
      {/* Welcome & Portal Card */}
      <section className="glass-panel panel-pad stack landing-card-welcome">
        <div className="card-decoration-header">
          <div className="icon-wrapper-sparkle">
            <SparklesIcon />
          </div>
          <p className="eyebrow">Event Planning Hub</p>
        </div>
        
        <h2>Seamless Family Day setups, schedules & live standings</h2>
        <p className="muted leading-description">
          Welcome to the Family Day central operations hub. Coordinate the annual schedule,
          manage team registration, set up custom events, and drag-and-drop placements
          to calculate standings in real-time.
        </p>

        <div className="portal-features-grid">
          <div className="feature-item-card">
            <div className="icon-puck calendar"><CalendarIcon /></div>
            <div>
              <h5>Schedule Timetable</h5>
              <p>Plan agenda slots, locations, and safety notes.</p>
            </div>
          </div>
          <div className="feature-item-card">
            <div className="icon-puck users"><UsersIcon /></div>
            <div>
              <h5>Team Registrations</h5>
              <p>Group family members and track participation.</p>
            </div>
          </div>
          <div className="feature-item-card">
            <div className="icon-puck gamepad"><GamepadIcon /></div>
            <div>
              <h5>Live Scoreboard</h5>
              <p>Drag placement boards to auto-rank active teams.</p>
            </div>
          </div>
        </div>

        <div className="actions landing-actions">
          <Link className="primary-btn pulse-glow-btn" href="/dashboard">
            Open Control Dashboard &rarr;
          </Link>
        </div>
      </section>

      {/* Active Setup Dashboard Card */}
      <section className="glass-panel panel-pad stack landing-card-status">
        <div className="status-header">
          <h3>Active Event Workspace</h3>
          {state.event ? (
            <span className="live-status-indicator"><span className="pulse-dot" /> Active</span>
          ) : (
            <span className="live-status-indicator warning"><span className="pulse-dot warning" /> Setup Required</span>
          )}
        </div>

        {state.event ? (
          <div className="stats-showcase">
            <div className="workspace-stat-block">
              <span className="stat-label">Current Event</span>
              <strong className="stat-val-text">{state.event.title}</strong>
              <span className="stat-sub">{state.event.year} Edition</span>
            </div>

            <div className="workspace-stat-grid-mini overview-stat-grid">
              <div className="stat-mini-pill">
                <div className="pill-icon-wrap"><CalendarIcon /></div>
                <div>
                  <span className="pill-lbl">Event Dates</span>
                  <strong className="pill-val">{dateRangeLabel}</strong>
                </div>
              </div>

              {state.event?.location && (
                <div className="stat-mini-pill">
                  <div className="pill-icon-wrap"><LocationPinIcon /></div>
                  <div>
                    <span className="pill-lbl">Venue</span>
                    <strong className="pill-val">{state.event.location}</strong>
                  </div>
                </div>
              )}

              <div className="stat-mini-pill">
                <div className="pill-icon-wrap"><UsersIcon /></div>
                <div>
                  <span className="pill-lbl">Registered Teams</span>
                  <strong className="pill-val">{state.totals.teams} Teams</strong>
                </div>
              </div>

              <div className="stat-mini-pill">
                <div className="pill-icon-wrap"><GamepadIcon /></div>
                <div>
                  <span className="pill-lbl">Active Games</span>
                  <strong className="pill-val">{state.totals.games} Games</strong>
                </div>
              </div>
            </div>

            <div className="overview-summary-table">
              <div className="overview-summary-row">
                <span>Agenda Slots</span>
                <strong>{totalAgendaSlots}</strong>
              </div>
              <div className="overview-summary-row">
                <span>Scheduled Days</span>
                <strong>{scheduledDays}</strong>
              </div>
              <div className="overview-summary-row">
                <span>Next Agenda</span>
                <strong>{nextAgendaItem ? nextAgendaItem.title : "Not added yet"}</strong>
              </div>
              <div className="overview-summary-row">
                <span>Next Slot Time</span>
                <strong>
                  {nextAgendaItem
                    ? `${formatScheduleDate(nextAgendaItem.scheduleDate)} · ${formatScheduleTime(nextAgendaItem.time)}`
                    : "No schedule yet"}
                </strong>
              </div>
            </div>

            <div className="overview-leaderboard-banner">
              <div className="banner-context">
                <span>Top Leading Team</span>
                <h4>{state.leaderboard[0] ? state.leaderboard[0].name : "No results recorded yet"}</h4>
              </div>
              <span className="trophy-badge-icon">🏆</span>
            </div>
          </div>
        ) : (
          <div className="landing-empty-state">
            <div className="empty-graphic">📅</div>
            <strong>No active Family Day found</strong>
            <p className="muted">
              Create the annual event record, register teams, and outline your tentative timetable.
            </p>
            <Link className="secondary-btn" href="/dashboard">
              Create Event Now
            </Link>
          </div>
        )}
      </section>

      <section className="glass-panel panel-pad stack landing-timetable-panel">
        <div className="landing-timetable-head">
          <div>
            <p className="eyebrow">Auto Timetable</p>
            <h3>Family Day Run Sheet</h3>
          </div>
          <div className="landing-timetable-controls">
            <div className="timetable-topline-metrics">
              <span>{totalAgendaSlots} slots</span>
              <span>{scheduledDays} day{scheduledDays === 1 ? "" : "s"}</span>
            </div>
            <a
              className={`ghost-link${state.event ? "" : " is-disabled"}`}
              href={state.event ? "/api/tentative-pdf" : "#"}
              aria-disabled={!state.event}
              download={state.event ? "tentative-timetable.pdf" : undefined}
              target={state.event ? "_blank" : undefined}
              rel={state.event ? "noreferrer" : undefined}
            >
              Export PDF
            </a>
            <Link className="ghost-link" href="/dashboard">
              Manage Agenda
            </Link>
          </div>
        </div>

        {groupedTimetable.length ? (
          <div className="root-timetable-groups">
            {groupedTimetable.map((group, groupIndex) => (
              <section key={group.key} className="root-timetable-day">
                <div className="root-timetable-day-head">
                  <div className="day-head-main">
                    <div className="day-head-leading">
                      <div className="day-head-icon">
                        <CalendarIcon />
                      </div>
                      <div className="day-head-copy">
                        <span className="day-head-kicker">Schedule Day</span>
                        <strong>{group.label}</strong>
                      </div>
                    </div>
                    <div className="day-head-trailing">
                      <span>{group.items.length} slot{group.items.length > 1 ? "s" : ""}</span>
                      <b className="day-count-badge">Day {groupIndex + 1}</b>
                    </div>
                  </div>
                </div>

                <div className="root-timetable-table-wrap">
                  <table className="root-timetable-table">
                    <colgroup>
                      <col className="col-slot" />
                      <col className="col-time" />
                      <col className="col-activity" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Slot</th>
                        <th>Time</th>
                        <th>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, itemIndex) => (
                        <tr key={item.id}>
                          <td className="slot-cell">{String(itemIndex + 1).padStart(2, "0")}</td>
                          <td className="time-cell">
                            <span><ClockIcon /></span>
                            {formatScheduleTime(item.time)}
                          </td>
                          <td className="activity-cell">
                            <strong>{item.title}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="landing-empty-state">
            <div className="empty-graphic">🗓️</div>
            <strong>No timetable generated yet</strong>
            <p className="muted">
              Add dated agenda slots in the dashboard and the homepage timetable will generate automatically.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
