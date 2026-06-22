import Link from "next/link";
import { createEventWorkspace, duplicateEventWorkspace } from "@/app/event-actions";
import { RefreshActionForm } from "@/components/refresh-action-form";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CopyIcon,
  DisplayIcon,
  LayoutDashboardIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const user = await requireUser();
  const events = await prisma.familyDayEvent.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { teams: true, games: true, timetable: true, scores: true } } },
  });
  const latest = events[0] ?? null;

  return (
    <main className="events-shell slide-up-animation">
      <section className="glass-panel panel-pad events-hero">
        <div>
          <p className="eyebrow">My Community Events</p>
          <h2>Choose or create your Family Day workspace</h2>
          <p className="muted">
            Each year can have its own agenda, teams, games, display page, and scores.
          </p>
        </div>
        <Link className="primary-btn" href="/dashboard">
          Open Latest Dashboard
          <LayoutDashboardIcon width={18} height={18} />
        </Link>
      </section>

      <section className="events-grid">
        <div className="glass-panel panel-pad stack event-create-card">
          <div>
            <p className="eyebrow">New Event</p>
            <h3>Create workspace</h3>
            <p className="muted">Start a clean event for a new community or year.</p>
          </div>
          <RefreshActionForm
            action={createEventWorkspace}
            className="form-grid interactive-form"
            successMessage="Event created"
          >
            <div className="field">
              <label htmlFor="new-title">Event title</label>
              <input
                id="new-title"
                name="title"
                placeholder="Family Day 2027"
                defaultValue={`Family Day ${new Date().getFullYear() + 1}`}
              />
            </div>
            <div className="field">
              <label htmlFor="new-year">Year</label>
              <input
                id="new-year"
                name="year"
                type="number"
                defaultValue={new Date().getFullYear() + 1}
              />
            </div>
            <div className="field">
              <label htmlFor="new-location">Venue</label>
              <input id="new-location" name="location" placeholder="Optional" />
            </div>
            <button className="primary-btn" type="submit">
              <PlusIcon width={18} height={18} />
              Create Event
            </button>
          </RefreshActionForm>
        </div>

        <div className="glass-panel panel-pad stack event-create-card">
          <div>
            <p className="eyebrow">Reuse Setup</p>
            <h3>Duplicate latest event</h3>
            <p className="muted">Copy games, teams, and agenda template. Scores are reset.</p>
          </div>
          {latest ? (
            <RefreshActionForm
              action={duplicateEventWorkspace}
              className="form-grid interactive-form"
              successMessage="Event duplicated"
            >
              <input type="hidden" name="eventId" value={latest.id} />
              <div className="field">
                <label htmlFor="duplicate-year">Target year</label>
                <input
                  id="duplicate-year"
                  name="targetYear"
                  type="number"
                  defaultValue={latest.year + 1}
                />
              </div>
              <button className="secondary-btn" type="submit">
                <CopyIcon width={18} height={18} />
                Duplicate {latest.year} Setup
              </button>
            </RefreshActionForm>
          ) : (
            <p className="muted">Create your first event before duplicating.</p>
          )}
        </div>
      </section>

      <section className="glass-panel panel-pad stack">
        <div className="events-list-head">
          <div>
            <p className="eyebrow">Archive</p>
            <h3>Your events</h3>
          </div>
          <span>
            {events.length} workspace{events.length === 1 ? "" : "s"}
          </span>
        </div>

        {events.length ? (
          <div className="events-list">
            {events.map((event) => (
              <article className="event-row-card" key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <span className="muted">
                    {event.year}
                    {event.location ? ` · ${event.location}` : ""}
                  </span>
                </div>
                <div className="event-row-stats">
                  <span>{event._count.teams} teams</span>
                  <span>{event._count.games} games</span>
                  <span>{event._count.timetable} agenda</span>
                  <span>{event._count.scores} scores</span>
                </div>
                <div className="event-row-actions">
                  <Link
                    className="secondary-btn"
                    href={`/dashboard?eventId=${event.id}`}
                  >
                    <LayoutDashboardIcon width={16} height={16} />
                    Dashboard
                  </Link>
                  <Link className="ghost-link" href={`/display?eventId=${event.id}`}>
                    <DisplayIcon width={16} height={16} />
                    Display
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<LayoutDashboardIcon width={40} height={40} />}
            title="No events yet"
            description="Create your first Family Day workspace above."
          />
        )}
      </section>
    </main>
  );
}
