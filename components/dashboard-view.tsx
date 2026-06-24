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
  const eventStatus = event ? "Live workspace" : "Setup needed";
  const eventQuery = event ? `?eventId=${event.id}` : "";
  const pdfHref = event ? `/api/tentative-pdf?eventId=${event.id}` : "#";

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-0 space-y-8">
      {/* Dashboard Header & Stats */}
      <section data-purpose="hero-stats">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Operations Dashboard
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight font-heading">
              {event ? event.title : "Family Day Setup"}
            </h2>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">
              {event
                ? `${dateRangeLabel} • ${event.year} Edition`
                : "Define your event details to start."}
            </p>
          </div>
          
          <div className="flex space-x-4 w-full md:w-auto">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 flex items-center space-x-4 min-w-[120px] flex-1 md:flex-initial">
              <span className="text-3xl font-extrabold text-slate-800">{totals.teams}</span>
              <span className="text-[10px] font-bold uppercase leading-tight text-slate-400">
                Teams<br />
                <span className="w-2 h-2 bg-brand-primary inline-block rounded-full mt-1"></span>
              </span>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 flex items-center space-x-4 min-w-[120px] flex-1 md:flex-initial">
              <span className="text-3xl font-extrabold text-slate-800">{totals.games}</span>
              <span className="text-[10px] font-bold uppercase leading-tight text-slate-400">
                Games<br />
                <span className="w-2 h-2 bg-brand-secondary inline-block rounded-full mt-1"></span>
              </span>
            </div>
            
            <div className="bg-brand-secondary_dark text-white rounded-3xl shadow-lg shadow-brand-secondary/20 p-5 min-w-[160px] flex-1 md:flex-initial">
              <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Leader Spot</p>
              <p className="text-lg font-extrabold truncate max-w-[120px]">
                {featuredTeam ? featuredTeam.name : "None yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Workspace Status</p>
            <p className="font-extrabold text-sm text-slate-800">{eventStatus}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              {event ? `${event.year} event plan is active.` : "Create event settings to unlock."}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agenda Flow</p>
            <p className="font-extrabold text-sm text-slate-800">
              {timetable.length} slot{timetable.length === 1 ? "" : "s"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">
              {timetable[0] ? `Next: ${timetable[0].title}` : "No slots added."}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Competition Setup</p>
            <p className="font-extrabold text-sm text-slate-800">{totals.teams} teams • {totals.games} games</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              {totals.scores} placements. Standard score active.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Leader</p>
            <p className="font-extrabold text-sm text-brand-primary">
              {featuredTeam ? featuredTeam.name : "Waiting for scores"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              {featuredTeam ? `${featuredTeam.completedGames} scored · ${featuredTeam.roundWins ?? 0} wins.` : "Live standings inactive."}
            </p>
          </div>
        </div>
      </section>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5 lg:sticky lg:top-24">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Admin Navigation</p>
            <nav className="space-y-1">
              <a className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href="#overview">
                Overview
              </a>
              <a className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href="#setup">
                Event &amp; Agenda
              </a>
              <a className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href="#registration">
                Teams &amp; Games
              </a>
              <a className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href="#arena">
                Placement Arena
              </a>
              <a className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href="#standings">
                Live Standings
              </a>
              <Link className="block px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all" href={`/display${eventQuery}`}>
                Open Display
              </Link>
            </nav>
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-400">
              <span>{totals.teams} teams</span>
              <span>{totals.games} games</span>
            </div>
          </div>
        </aside>

        {/* Right Dashboard Content */}
        <div className="col-span-12 lg:col-span-10 space-y-12">
          
          {/* Section: Setup (Event Settings & Operational Notes) */}
          <section id="setup" className="scroll-mt-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Event Settings Form */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Command Center
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800 mt-3 font-heading">Event Settings</h3>
                  </div>
                  <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-3 py-1 rounded-full border border-brand-primary/20">
                    Core Setup
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 font-bold mb-6">Configure the event title, venue, and date range.</p>
                
                <RefreshActionForm
                  action={saveEvent}
                  className="space-y-4"
                  successMessage="Event settings saved"
                >
                  <input type="hidden" name="eventId" value={event?.id ?? ""} />
                  
                  <div>
                    <label htmlFor="title" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                      defaultValue={event?.title ?? ""}
                      placeholder="Family Day"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Venue / Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                      defaultValue={event?.location ?? ""}
                      placeholder="Pandan Dua D'Penarik Roomstay"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="year" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                      <input
                        id="year"
                        name="year"
                        type="number"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-center focus:outline-none focus:border-brand-primary bg-white text-slate-800"
                        defaultValue={event?.year ?? new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Start</label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="w-full rounded-xl border border-slate-200 px-2 py-2.5 text-[10px] font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800"
                        defaultValue={event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">End</label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className="w-full rounded-xl border border-slate-200 px-2 py-2.5 text-[10px] font-bold focus:outline-none focus:border-brand-primary bg-white text-slate-800"
                        defaultValue={event?.endDate ? event.endDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                  </div>

                  <button className="w-full bg-brand-primary text-white rounded-xl py-3 text-xs font-extrabold shadow-lg shadow-brand-primary/20 hover:bg-sky-400 transition-all mt-4" type="submit">
                    Save Configuration
                  </button>
                </RefreshActionForm>
              </div>

              {/* Operational Notes */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-soft p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Snapshot
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-800 mt-3 font-heading">Operational Notes</h3>
                    </div>
                    <span className="bg-green-50 text-green-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-green-100">
                      Active
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-bold text-slate-700">
                    <div className="flex justify-between py-2.5 border-b border-slate-50">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Date range</span>
                      <span>{dateRangeLabel}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-50">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Venue</span>
                      <span className="truncate max-w-[200px]">{event?.location || "Not set"}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-50">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Top leading team</span>
                      <span className="text-brand-primary font-extrabold">{featuredTeam?.name || "No scores"}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-50">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Agenda readiness</span>
                      <span>{timetable.length ? "Scheduled & Ready" : "Pending slots"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex space-x-3">
                  <a
                    className={`flex-1 text-center bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 transition-colors${
                      event ? "" : " opacity-50 cursor-not-allowed pointer-events-none"
                    }`}
                    href={pdfHref}
                    aria-disabled={!event}
                    download={event ? "tentative-timetable.pdf" : undefined}
                    target={event ? "_blank" : undefined}
                    rel={event ? "noreferrer" : undefined}
                  >
                    Export Timetable PDF
                  </a>
                  
                  <Link href="/events" className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 transition-colors">
                    Manage Workspaces
                  </Link>
                </div>
              </div>
              
            </div>
          </section>

          {/* Section: Daily Agenda Component */}
          <section id="agenda" className="scroll-mt-6">
            <AgendaTimeline
              eventId={event?.id ?? null}
              eventStartDate={event?.startDate ? event.startDate.toISOString().slice(0, 10) : ""}
              eventReady={Boolean(event)}
              dateRangeLabel={dateRangeLabel}
              timetable={timetable}
            />
          </section>

          {/* Section: Lobby Console Component */}
          <section id="registration" className="scroll-mt-6">
            <LobbyConsole eventId={event?.id ?? null} teams={teams} games={games} />
          </section>

          {/* Section: Placement Console Component */}
          <section id="arena" className="scroll-mt-6">
            <PlacementConsole eventId={event?.id ?? null} games={games} teams={teams} />
          </section>

          {/* Section: Leaderboard interactive component */}
          <section id="standings" className="scroll-mt-6 bg-white border border-slate-100 rounded-3xl shadow-soft p-8">
            <div className="mb-8">
              <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Standings
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-3 font-heading">Tournament Leaderboard</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Updated in real-time
              </p>
            </div>
            
            <LeaderboardInteractive leaderboard={leaderboard} games={games} />
          </section>
          
        </div>
      </div>

      {/* Footer Back navigation link */}
      <div className="pt-8 mt-12 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
        <Link className="flex items-center gap-2 hover:text-brand-primary transition-colors" href="/overview">
          <ArrowLeftIcon width={14} height={14} />
          Back to overview
        </Link>
        <span>Family Day Operations © {new Date().getFullYear()}</span>
      </div>
    </main>
  );
}
