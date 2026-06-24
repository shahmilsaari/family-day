import Link from "next/link";
import type { FamilyDayEvent, Game, Team, TentativeSchedule } from "@prisma/client";
import { saveEvent } from "@/app/actions";
import { AgendaTimeline } from "@/components/agenda-timeline";
import { LeaderboardInteractive } from "@/components/leaderboard-interactive";
import { LobbyConsole } from "@/components/lobby-console";
import { PlacementConsole } from "@/components/placement-console";
import { RefreshActionForm } from "@/components/refresh-action-form";
import {
  ActivityIcon,
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  LiveDisplayIcon,
  LocationPinIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/icons";

type TeamWithMembers = Team & { members: { name: string }[] };
type GameWithScores = Game & { scores: { teamId: number; round: number; points: number }[] };

type LeaderboardRow = {
  id: number;
  name: string;
  members: string[];
  perGame: { gameId: number; gameName: string; placement: number | null; points?: number | null; completedRounds?: number; totalRounds?: number }[];
  completedGames: number;
  roundWins?: number;
  secondPlaces?: number;
  thirdPlaces?: number;
  totalScore: number;
  totalPlacement: number;
};

type DashboardState = {
  event: (FamilyDayEvent & { teams: TeamWithMembers[]; games: GameWithScores[] }) | null;
  leaderboard: LeaderboardRow[];
  games: GameWithScores[];
  teams: TeamWithMembers[];
  timetable: TentativeSchedule[];
  totals: { teams: number; games: number; scores: number; rounds?: number };
};

export function DashboardView({ state }: { state: DashboardState }) {
  const { event, leaderboard, games, teams, timetable, totals } = state;
  const featuredTeam = leaderboard[0];

  const formatDate = (d: Date | null | undefined) =>
    d
      ? d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const startLabel = formatDate(event?.startDate);
  const endLabel = formatDate(event?.endDate);
  const dateRangeLabel =
    startLabel && endLabel
      ? `${startLabel} → ${endLabel}`
      : startLabel ?? endLabel ?? "Date not scheduled";
  const nextAgendaItem = timetable[0] ?? null;
  const eventStatus = event ? "Live workspace" : "Setup needed";
  const eventQuery = event ? `?eventId=${event.id}` : "";
  const pdfHref = event ? `/api/tentative-pdf?eventId=${event.id}` : "#";

  return (
    <main className="dashboard-grid dashboard-workspace-shell slide-up-animation">
      <section className="event-hero glass-panel dashboard-hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Operations Dashboard</p>
          <h2>{event ? event.title : "Assemble your Family Event"}</h2>
          <div className="hero-date-indicator">
            <CalendarIcon width={20} height={20} />
            <span className="muted">
              {event
                ? `${dateRangeLabel} — ${event.year} Edition`
                : "Define your event details to start."}
            </span>
          </div>
          {event?.location && (
            <div className="hero-location-indicator">
              <LocationPinIcon width={16} height={16} />
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
            <strong className="metric-value leader-name">
              {featuredTeam ? featuredTeam.name : "None"}
            </strong>
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
            <a href="#overview">
              <ActivityIcon width={16} height={16} />
              Overview
            </a>
            <a href="#setup">
              <CalendarIcon width={16} height={16} />
              Event & Agenda
            </a>
            <a href="#registration">
              <UsersIcon width={16} height={16} />
              Teams & Games
            </a>
            <a href="#arena">
              <TrophyIcon width={16} height={16} />
              Placement Arena
            </a>
            <a href="#standings">
              <ActivityIcon width={16} height={16} />
              Live Standings
            </a>
            <a href={`/display${eventQuery}`}>
              <LiveDisplayIcon width={16} height={16} />
              Open Display
            </a>
          </nav>
          <div className="dashboard-sidebar-footer">
            <span>{totals.teams} teams</span>
            <span>{totals.games} games</span>
          </div>
        </aside>

        <div className="dashboard-admin-content">
          <section id="overview" className="dashboard-overview-grid">
            <article className="glass-panel panel-pad overview-card overview-card-highlight">
              <div className="overview-card-icon">
                <CalendarIcon width={20} height={20} />
              </div>
              <div>
                <span className="overview-card-label">Workspace Status</span>
                <strong className="overview-card-value">{eventStatus}</strong>
                <p className="muted">
                  {event
                    ? `${event.year} event plan is active.`
                    : "Create the event settings to unlock all controls."}
                </p>
              </div>
            </article>

            <article className="glass-panel panel-pad overview-card">
              <div className="overview-card-icon">
                <ActivityIcon width={20} height={20} />
              </div>
              <div>
                <span className="overview-card-label">Agenda Flow</span>
                <strong className="overview-card-value">
                  {timetable.length} slot{timetable.length === 1 ? "" : "s"}
                </strong>
                <p className="muted">
                  {nextAgendaItem
                    ? `Next: ${nextAgendaItem.title}`
                    : "No agenda item planned yet."}
                </p>
              </div>
            </article>

            <article className="glass-panel panel-pad overview-card">
              <div className="overview-card-icon">
                <UsersIcon width={22} height={22} />
              </div>
              <div>
                <span className="overview-card-label">Competition Setup</span>
                <strong className="overview-card-value">
                  {totals.teams} teams · {totals.games} games
                </strong>
                <p className="muted">
                  {totals.scores} round placements recorded. Leaderboard score is standardized per game.
                </p>
              </div>
            </article>

            <article className="glass-panel panel-pad overview-card overview-card-trophy">
              <div className="overview-card-icon">
                <TrophyIcon width={20} height={20} />
              </div>
              <div>
                <span className="overview-card-label">Current Leader</span>
                <strong className="overview-card-value">
                  {featuredTeam ? featuredTeam.name : "Waiting for results"}
                </strong>
                <p className="muted">
                  {featuredTeam
                    ? `${featuredTeam.completedGames} games scored · ${featuredTeam.roundWins ?? 0} game wins.`
                    : "Live standings will appear after scoring."}
                </p>
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
                <p className="muted">
                  Configure the event title, venue, year, and date range.
                </p>

                <RefreshActionForm
                  action={saveEvent}
                  className="form-grid interactive-form"
                  successMessage="Event settings saved"
                >
                  <input type="hidden" name="eventId" value={event?.id ?? ""} />

                  <div className="field">
                    <label htmlFor="title">Event Title</label>
                    <input
                      id="title"
                      name="title"
                      defaultValue={event?.title ?? ""}
                      placeholder="Family Day 2026"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="location">Venue / Location</label>
                    <input
                      id="location"
                      name="location"
                      defaultValue={event?.location ?? ""}
                      placeholder="e.g. Nilai Springs Resort"
                    />
                  </div>

                  <div className="event-date-range-row">
                    <div className="field event-year-field">
                      <label htmlFor="year">Year</label>
                      <input
                        id="year"
                        name="year"
                        type="number"
                        defaultValue={event?.year ?? new Date().getFullYear()}
                      />
                    </div>
                    <div className="field event-date-field">
                      <label htmlFor="startDate">Start Date</label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={
                          event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""
                        }
                      />
                    </div>
                    <div className="field event-date-field">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        defaultValue={
                          event?.endDate ? event.endDate.toISOString().slice(0, 10) : ""
                        }
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
                    <FileTextIcon width={16} height={16} />
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
              <span className="dashboard-stage-note">Teams and games setup area.</span>
            </div>
            <LobbyConsole eventId={event?.id ?? null} teams={teams} games={games} />
          </section>

          <section id="arena" className="dashboard-stage">
            <div className="dashboard-stage-head">
              <div>
                <p className="eyebrow">Arena</p>
                <h3>Game Placement Arena</h3>
              </div>
              <span className="dashboard-stage-note">Live placement area.</span>
            </div>
            <PlacementConsole eventId={event?.id ?? null} games={games} teams={teams} />
          </section>

          <section
            id="standings"
            className="glass-panel panel-pad stack leaderboard-panel-section-wrap dashboard-stage"
          >
            <div className="dashboard-stage-head">
              <div>
                <p className="eyebrow">Standings</p>
                <h3>Live Tournament Standings</h3>
              </div>
              <span className="dashboard-stage-note">
                Auto-recalculates per game: most game wins, then lowest game points.
              </span>
            </div>
            <LeaderboardInteractive leaderboard={leaderboard} games={games} />
          </section>
        </div>
      </div>

      <div className="actions back-navigation-footer">
        <Link className="ghost-link" href="/">
          <ArrowLeftIcon width={16} height={16} />
          Back to landing overview
        </Link>
      </div>
    </main>
  );
}
