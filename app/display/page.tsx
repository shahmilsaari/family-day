import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { loadDashboard } from "@/lib/dashboard";
import { formatScheduleDate, formatScheduleTime } from "@/lib/timetable";

export const dynamic = "force-dynamic";

function placementLabel(value: number | null) {
  if (value === null) return "Pending";
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}

function getScheduleDateTime(scheduleDate: Date | null, time: string) {
  if (!scheduleDate) return null;

  const normalizedTime = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!normalizedTime) return null;

  let hours = Number.parseInt(normalizedTime[1], 10);
  const minutes = Number.parseInt(normalizedTime[2], 10);
  const meridiem = normalizedTime[3]?.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;

  const date = new Date(scheduleDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

type DisplayPageProps = {
  searchParams: Promise<{ eventId?: string }>;
};

export default async function DisplayPage({ searchParams }: DisplayPageProps) {
  const params = await searchParams;
  const eventId = params.eventId ? Number.parseInt(params.eventId, 10) : undefined;
  const state = await loadDashboard(Number.isFinite(eventId) ? eventId : undefined);
  const { event, leaderboard, games, teams, timetable, totals } = state;
  const leader = leaderboard[0] ?? null;
  const runnerUp = leaderboard[1] ?? null;
  const third = leaderboard[2] ?? null;
  const now = new Date();
  const agendaWithDateTime = timetable
    .map((item) => ({ item, dateTime: getScheduleDateTime(item.scheduleDate, item.time) }))
    .filter((entry): entry is { item: typeof timetable[number]; dateTime: Date } => Boolean(entry.dateTime));
  const upcomingAgenda = agendaWithDateTime.find((entry) => entry.dateTime >= now)?.item ?? null;
  const currentAgenda = [...agendaWithDateTime].reverse().find((entry) => entry.dateTime <= now)?.item ?? null;
  const fallbackAgenda = timetable[0] ?? null;
  const displayAgenda = upcomingAgenda ?? currentAgenda ?? fallbackAgenda;
  const scoringGames = games.filter((game) => game.includeInScore);
  const latestGame = games.find((game) => game.scores.length > 0) ?? games[0] ?? null;
  const totalGames = scoringGames.length;

  const dateLabel = event?.startDate
    ? event.startDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date to be announced";

  return (
    <main className="display-shell slide-up-animation">
      <AutoRefresh intervalMs={15000} />

      <section className="display-hero glass-panel">
        <div>
          <p className="eyebrow">Game Day Live Display</p>
          <h2>{event ? event.title : "Family Day Live"}</h2>
          <p className="display-subtitle">
            {dateLabel}{event?.location ? ` · ${event.location}` : ""}
          </p>
        </div>
        <div className="display-live-pill">
          <span /> Live
        </div>
      </section>

      <section className="display-scoreboard-grid">
        <article className="display-champion-card glass-panel">
          <p className="eyebrow">Current Champion</p>
          <div className="champion-medal">🏆</div>
          <h3>{leader ? leader.name : "Waiting for Scores"}</h3>
          <p>{leader ? `${leader.completedGames}/${totalGames} games completed` : "Rank teams in the placement arena to start standings."}</p>
          <strong>{leader?.completedGames ? `${leader.roundWins ?? 0} game wins · ${leader.totalPlacement} pts` : "No games scored yet"}</strong>
        </article>

        <div className="display-side-stack">
          <article className="display-mini-stat glass-panel">
            <span>Teams</span>
            <strong>{totals.teams}</strong>
          </article>
          <article className="display-mini-stat glass-panel">
            <span>Games</span>
            <strong>{totals.games}</strong>
          </article>
          <article className="display-mini-stat glass-panel">
            <span>Placements</span>
            <strong>{totals.scores}</strong>
          </article>
        </div>
      </section>

      <section className="display-main-grid">
        <article className="display-panel glass-panel">
          <div className="display-panel-head">
            <div>
              <p className="eyebrow">Live Standings</p>
              <h3>Leaderboard</h3>
            </div>
            <span>{leaderboard.length} teams</span>
          </div>

          {leaderboard.length ? (
            <ol className="display-leaderboard-list">
              {leaderboard.slice(0, 8).map((team, index) => (
                <li className={`display-leader-row rank-${index + 1}`} key={team.id}>
                  <span className="display-rank">{index + 1}</span>
                  <div>
                    <strong>{team.name}</strong>
                    <small>{team.members.join(", ") || "Not decided yet"}</small>
                  </div>
                  <b>{team.completedGames ? `${team.roundWins ?? 0}W · ${team.totalPlacement} pts` : "-"}</b>
                </li>
              ))}
            </ol>
          ) : (
            <div className="display-empty">No teams registered yet.</div>
          )}
        </article>

        <aside className="display-panel glass-panel">
          <div className="display-panel-head">
            <div>
              <p className="eyebrow">Now / Next</p>
              <h3>Agenda</h3>
            </div>
          </div>

          <div className="display-next-agenda">
            <small>{upcomingAgenda ? "Coming Up" : currentAgenda ? "Current / Latest" : "Schedule"}</small>
            <span>{displayAgenda ? formatScheduleTime(displayAgenda.time) : "--:--"}</span>
            <strong>{displayAgenda ? displayAgenda.title : "No agenda planned"}</strong>
            <p>{displayAgenda ? formatScheduleDate(displayAgenda.scheduleDate) : "Add agenda items in the dashboard."}</p>
            {displayAgenda?.location && <em>📍 {displayAgenda.location}</em>}
          </div>

          <div className="display-podium-mini">
            <div>
              <span>🥇</span>
              <strong>{leader?.name ?? "-"}</strong>
            </div>
            <div>
              <span>🥈</span>
              <strong>{runnerUp?.name ?? "-"}</strong>
            </div>
            <div>
              <span>🥉</span>
              <strong>{third?.name ?? "-"}</strong>
            </div>
          </div>

          {latestGame && (
            <div className="display-latest-game">
              <span>Latest Game</span>
              <strong>{latestGame.name}</strong>
              <p>{latestGame.scores.length}/{teams.length * (Number.isFinite(latestGame.rounds) && latestGame.rounds > 0 ? latestGame.rounds : 1)} placements saved</p>
            </div>
          )}
        </aside>
      </section>

      {leader && (
        <section className="display-panel glass-panel display-game-breakdown">
          <div className="display-panel-head">
            <div>
              <p className="eyebrow">Champion Breakdown</p>
              <h3>{leader.name}</h3>
            </div>
            <Link className="ghost-link" href="/dashboard#arena">Update Scores</Link>
          </div>
          <div className="display-breakdown-grid">
            {leader.perGame.map((game) => (
              <div className="display-breakdown-card" key={game.gameId}>
                <span>{game.gameName}</span>
                <strong>{placementLabel(game.placement)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
