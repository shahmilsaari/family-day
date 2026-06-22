import Link from "next/link";
import { loadDashboard } from "@/lib/dashboard";
import {
  formatScheduleDate,
  formatScheduleTime,
  groupTimetableByDay,
} from "@/lib/timetable";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  GamepadIcon,
  LocationPinIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await loadDashboard();

  const formatDate = (d: Date | null | undefined) =>
    d
      ? d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const startLabel = formatDate(state.event?.startDate);
  const endLabel = formatDate(state.event?.endDate);
  const dateRangeLabel =
    startLabel && endLabel
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
            <SparklesIcon width={24} height={24} />
          </div>
          <p className="eyebrow">Event Planning Hub</p>
        </div>

        <h2>Seamless Family Day setups, schedules & live standings</h2>
        <p className="muted leading-description">
          Welcome to the Family Day central operations hub. Coordinate the annual
          schedule, manage team registration, set up custom events, and
          drag-and-drop placements to calculate standings in real-time.
        </p>

        <div className="portal-features-grid">
          <div className="feature-item-card">
            <div className="icon-puck calendar">
              <CalendarIcon width={20} height={20} />
            </div>
            <div>
              <h5>Schedule Timetable</h5>
              <p>Plan agenda slots, locations, and safety notes.</p>
            </div>
          </div>
          <div className="feature-item-card">
            <div className="icon-puck users">
              <UsersIcon width={20} height={20} />
            </div>
            <div>
              <h5>Team Registrations</h5>
              <p>Group family members and track participation.</p>
            </div>
          </div>
          <div className="feature-item-card">
            <div className="icon-puck gamepad">
              <GamepadIcon width={20} height={20} />
            </div>
            <div>
              <h5>Live Scoreboard</h5>
              <p>Drag placement boards to auto-rank active teams.</p>
            </div>
          </div>
        </div>

        <div className="actions landing-actions">
          <Link className="primary-btn pulse-glow-btn" href="/dashboard">
            Open Control Dashboard
            <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
      </section>

      {/* Active Setup Dashboard Card */}
      <section className="glass-panel panel-pad stack landing-card-status">
        <div className="status-header">
          <h3>Active Event Workspace</h3>
          {state.event ? (
            <span className="live-status-indicator">
              <span className="pulse-dot" /> Active
            </span>
          ) : (
            <span className="live-status-indicator warning">
              <span className="pulse-dot warning" /> Setup Required
            </span>
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
                <div className="pill-icon-wrap">
                  <CalendarIcon width={18} height={18} />
                </div>
                <div>
                  <span className="pill-lbl">Event Dates</span>
                  <strong className="pill-val">{dateRangeLabel}</strong>
                </div>
              </div>

              {state.event?.location && (
                <div className="stat-mini-pill">
                  <div className="pill-icon-wrap">
                    <LocationPinIcon width={18} height={18} />
                  </div>
                  <div>
                    <span className="pill-lbl">Venue</span>
                    <strong className="pill-val">{state.event.location}</strong>
                  </div>
                </div>
              )}

              <div className="stat-mini-pill">
                <div className="pill-icon-wrap">
                  <UsersIcon width={18} height={18} />
                </div>
                <div>
                  <span className="pill-lbl">Registered Teams</span>
                  <strong className="pill-val">{state.totals.teams} Teams</strong>
                </div>
              </div>

              <div className="stat-mini-pill">
                <div className="pill-icon-wrap">
                  <GamepadIcon width={18} height={18} />
                </div>
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
                <strong>
                  {nextAgendaItem ? nextAgendaItem.title : "Not added yet"}
                </strong>
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
                <h4>
                  {state.leaderboard[0]
                    ? state.leaderboard[0].name
                    : "No results recorded yet"}
                </h4>
              </div>
              <TrophyIcon width={32} height={32} className="trophy-badge-icon" />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarIcon width={48} height={48} />}
            title="No active Family Day found"
            description="Create the annual event record, register teams, and outline your tentative timetable."
            action={
              <Link className="secondary-btn" href="/dashboard">
                Create Event Now
              </Link>
            }
          />
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
              <span>
                {scheduledDays} day{scheduledDays === 1 ? "" : "s"}
              </span>
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
                        <CalendarIcon width={20} height={20} />
                      </div>
                      <div className="day-head-copy">
                        <span className="day-head-kicker">Schedule Day</span>
                        <strong>{group.label}</strong>
                      </div>
                    </div>
                    <div className="day-head-trailing">
                      <span>
                        {group.items.length} slot
                        {group.items.length > 1 ? "s" : ""}
                      </span>
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
                          <td className="slot-cell">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </td>
                          <td className="time-cell">
                            <span>
                              <ClockIcon width={18} height={18} />
                            </span>
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
          <EmptyState
            icon={<ClockIcon width={48} height={48} />}
            title="No timetable generated yet"
            description="Add dated agenda slots in the dashboard and the homepage timetable will generate automatically."
          />
        )}
      </section>
    </main>
  );
}
