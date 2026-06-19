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
          
          <RefreshActionForm action={saveEvent} className="form-grid interactive-form">
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

        {/* Right: Timetable Timeline */}
        <AgendaTimeline
          eventId={event?.id ?? null}
          eventStartDate={event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""}
          eventReady={Boolean(event)}
          dateRangeLabel={dateRangeLabel}
          timetable={timetable}
        />
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
