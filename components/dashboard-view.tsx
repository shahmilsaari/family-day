import Link from "next/link";
import type { FamilyDayEvent, Game, Team, TentativeSchedule } from "@prisma/client";
import { saveEvent } from "@/app/actions";
import { AgendaTimeline } from "@/components/agenda-timeline";
import { LeaderboardInteractive } from "@/components/leaderboard-interactive";
import { LobbyConsole } from "@/components/lobby-console";
import { PlacementConsole } from "@/components/placement-console";
import { RefreshActionForm } from "@/components/refresh-action-form";

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

// SVG Icons for dashboard stats
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

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v3.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
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
  const nextAgendaItem = timetable[0] ?? null;
  const eventStatus = event ? "Live workspace" : "Setup needed";
  const eventQuery = event ? `?eventId=${event.id}` : "";
  const pdfHref = event ? `/api/tentative-pdf?eventId=${event.id}` : "#";

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

      <div className="dashboard-admin-layout">
        <aside className="dashboard-sidebar glass-panel panel-pad" aria-label="Dashboard sections">
          <div className="dashboard-sidebar-brand">
            <span className="sidebar-status-dot" />
            <div>
              <p className="eyebrow">Admin Navigation</p>
              <strong>{event ? event.title : "Family Day Setup"}</strong>
            </div>
          </div>
          <nav className="dashboard-sidebar-nav">
            <a href="#overview">Overview</a>
            <a href="#setup">Event & Agenda</a>
            <a href="#registration">Teams & Games</a>
            <a href="#arena">Placement Arena</a>
            <a href="#standings">Live Standings</a>
            <a href={`/display${eventQuery}`}>Open Display</a>
          </nav>
          <div className="dashboard-sidebar-footer">
            <span>{totals.teams} teams</span>
            <span>{totals.games} games</span>
          </div>
        </aside>

        <div className="dashboard-admin-content">
      <section id="overview" className="dashboard-overview-grid">
        <article className="glass-panel panel-pad overview-card overview-card-highlight">
          <div className="overview-card-icon"><CalendarIcon /></div>
          <div>
            <span className="overview-card-label">Workspace Status</span>
            <strong className="overview-card-value">{eventStatus}</strong>
            <p className="muted">{event ? `${event.year} event plan is active.` : "Create the event settings to unlock all controls."}</p>
          </div>
        </article>

        <article className="glass-panel panel-pad overview-card">
          <div className="overview-card-icon"><ActivityIcon /></div>
          <div>
            <span className="overview-card-label">Agenda Flow</span>
            <strong className="overview-card-value">{timetable.length} slot{timetable.length === 1 ? "" : "s"}</strong>
            <p className="muted">{nextAgendaItem ? `Next: ${nextAgendaItem.title}` : "No agenda item planned yet."}</p>
          </div>
        </article>

        <article className="glass-panel panel-pad overview-card">
          <div className="overview-card-icon"><UsersIcon /></div>
          <div>
            <span className="overview-card-label">Competition Setup</span>
            <strong className="overview-card-value">{totals.teams} teams · {totals.games} games</strong>
            <p className="muted">{totals.scores} placement entries recorded so far.</p>
          </div>
        </article>

        <article className="glass-panel panel-pad overview-card overview-card-trophy">
          <div className="overview-card-icon"><TrophyIcon /></div>
          <div>
            <span className="overview-card-label">Current Leader</span>
            <strong className="overview-card-value">{featuredTeam ? featuredTeam.name : "Waiting for results"}</strong>
            <p className="muted">{featuredTeam ? `${featuredTeam.completedGames} games completed.` : "Live standings will appear after scoring."}</p>
          </div>
        </article>
      </section>

      <section id="setup" className="section-grid main-setup dashboard-command-grid">
        <div className="dashboard-command-stack">
          <div className="glass-panel panel-pad stack config-event-panel command-card">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Command Center</p>
                <h3>Event Settings</h3>
              </div>
              <span className="dashboard-section-badge">Core setup</span>
            </div>
            <p className="muted">Configure the event title, venue, year, and date range.</p>

            <RefreshActionForm action={saveEvent} className="form-grid interactive-form" successMessage="Event settings saved">
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
            </RefreshActionForm>
          </div>

          <div className="glass-panel panel-pad stack command-card dashboard-snapshot-card">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Snapshot</p>
                <h3>Operational Notes</h3>
              </div>
              <span className="dashboard-section-badge">At a glance</span>
            </div>

            <div className="snapshot-list">
              <div className="snapshot-row">
                <span>Date range</span>
                <strong>{dateRangeLabel}</strong>
              </div>
              <div className="snapshot-row">
                <span>Venue</span>
                <strong>{event?.location || "Not set"}</strong>
              </div>
              <div className="snapshot-row">
                <span>Top team</span>
                <strong>{featuredTeam?.name || "No standings yet"}</strong>
              </div>
              <div className="snapshot-row">
                <span>Agenda readiness</span>
                <strong>{timetable.length ? "Scheduled" : "Pending"}</strong>
              </div>
            </div>

            <div className="dashboard-quick-links">
              <a
                className={`ghost-link${event ? "" : " is-disabled"}`}
                href={pdfHref}
                aria-disabled={!event}
                download={event ? "tentative-timetable.pdf" : undefined}
                target={event ? "_blank" : undefined}
                rel={event ? "noreferrer" : undefined}
              >
                Export timetable PDF
              </a>
              <Link className="ghost-link" href="/events">
                Manage events
              </Link>
            </div>
          </div>
        </div>

        <AgendaTimeline
          eventId={event?.id ?? null}
          eventStartDate={event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""}
          eventReady={Boolean(event)}
          dateRangeLabel={dateRangeLabel}
          timetable={timetable}
        />
      </section>

      <section id="registration" className="dashboard-stage">
        <div className="dashboard-stage-head">
          <div>
            <p className="eyebrow">Team Builder</p>
            <h3>Registration & Game Catalog</h3>
          </div>
          <span className="dashboard-stage-note">Keep this area for teams and games setup.</span>
        </div>
        <LobbyConsole eventId={event?.id ?? null} teams={teams} games={games} />
      </section>

      <section id="arena" className="dashboard-stage">
        <div className="dashboard-stage-head">
          <div>
            <p className="eyebrow">Arena</p>
            <h3>Game Placement Arena</h3>
          </div>
          <span className="dashboard-stage-note">Live placement area remains front and center.</span>
        </div>
        <PlacementConsole eventId={event?.id ?? null} games={games} teams={teams} />
      </section>

      <section id="standings" className="glass-panel panel-pad stack leaderboard-panel-section-wrap dashboard-stage">
        <div className="dashboard-stage-head">
          <div>
            <p className="eyebrow">Standings</p>
            <h3>Live Tournament Standings</h3>
          </div>
          <span className="dashboard-stage-note">Auto-recalculates from saved placements.</span>
        </div>
        <LeaderboardInteractive leaderboard={leaderboard} games={games} />
      </section>

        </div>
      </div>

      <div className="actions back-navigation-footer">
        <Link className="ghost-link" href="/">
          &larr; Back to landing overview
        </Link>
      </div>
    </main>
  );
}
