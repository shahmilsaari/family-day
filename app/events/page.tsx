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
    <main className="max-w-7xl mx-auto px-4 md:px-0 space-y-8 slide-up-animation">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            My Community Events
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight font-heading">
            Choose or create your Family Day workspace
          </h2>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">
            Each year can have its own agenda, teams, games, display page, and scores.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 bg-brand-dark text-white rounded-full px-6 py-3 font-bold text-sm shadow-md hover:bg-slate-800 transition-all whitespace-nowrap"
          href="/dashboard"
        >
          <LayoutDashboardIcon width={18} height={18} />
          Open Latest Dashboard
        </Link>
      </section>

      {/* Create + Duplicate */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
          <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            New Event
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 mt-3 font-heading">Create workspace</h3>
          <p className="text-xs text-slate-400 font-bold mt-1 mb-6">
            Start a clean event for a new community or year.
          </p>
          <RefreshActionForm
            action={createEventWorkspace}
            className="space-y-4"
            successMessage="Event created"
          >
            <div>
              <label htmlFor="new-title" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Event title
              </label>
              <input
                id="new-title"
                name="title"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                placeholder="Family Day 2027"
                defaultValue={`Family Day ${new Date().getFullYear() + 1}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-year" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Year
                </label>
                <input
                  id="new-year"
                  name="year"
                  type="number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                  defaultValue={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label htmlFor="new-location" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Venue
                </label>
                <input
                  id="new-location"
                  name="location"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                  placeholder="Optional"
                />
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 w-full bg-brand-primary text-white rounded-xl py-3 text-xs font-extrabold shadow-lg shadow-brand-primary/20 hover:bg-sky-400 transition-all mt-2"
              type="submit"
            >
              <PlusIcon width={18} height={18} />
              Create Event
            </button>
          </RefreshActionForm>
        </div>

        {/* Duplicate */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
          <span className="bg-brand-secondary/10 text-brand-secondary text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Reuse Setup
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 mt-3 font-heading">Duplicate latest event</h3>
          <p className="text-xs text-slate-400 font-bold mt-1 mb-6">
            Copy games, teams, and agenda template. Scores are reset.
          </p>
          {latest ? (
            <RefreshActionForm
              action={duplicateEventWorkspace}
              className="space-y-4"
              successMessage="Event duplicated"
            >
              <input type="hidden" name="eventId" value={latest.id} />
              <div>
                <label htmlFor="duplicate-year" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Target year
                </label>
                <input
                  id="duplicate-year"
                  name="targetYear"
                  type="number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                  defaultValue={latest.year + 1}
                />
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 rounded-xl py-3 text-xs font-extrabold hover:bg-slate-200 transition-all mt-2"
                type="submit"
              >
                <CopyIcon width={18} height={18} />
                Duplicate {latest.year} Setup
              </button>
            </RefreshActionForm>
          ) : (
            <p className="text-xs text-slate-400 font-bold">Create your first event before duplicating.</p>
          )}
        </div>
      </section>

      {/* Archive list */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Archive
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-3 font-heading">Your events</h3>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {events.length} workspace{events.length === 1 ? "" : "s"}
          </span>
        </div>

        {events.length ? (
          <div className="space-y-3">
            {events.map((event) => (
              <article
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 hover:border-brand-primary/30 hover:bg-white transition-all"
                key={event.id}
              >
                <div className="min-w-0">
                  <strong className="block text-sm font-extrabold text-slate-800 truncate">{event.title}</strong>
                  <span className="text-[11px] font-bold text-slate-400">
                    {event.year}
                    {event.location ? ` · ${event.location}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "teams", value: event._count.teams },
                    { label: "games", value: event._count.games },
                    { label: "agenda", value: event._count.timetable },
                    { label: "scores", value: event._count.scores },
                  ].map((stat) => (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-1 bg-white border border-slate-100 rounded-full px-3 py-1 text-[10px] font-bold text-slate-500"
                    >
                      <span className="text-slate-800 font-extrabold">{stat.value}</span>
                      {stat.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary rounded-full px-4 py-2 text-xs font-bold hover:bg-brand-primary/20 transition"
                    href={`/dashboard?eventId=${event.id}`}
                  >
                    <LayoutDashboardIcon width={16} height={16} />
                    Dashboard
                  </Link>
                  <Link
                    className="inline-flex items-center gap-2 text-slate-500 rounded-full px-4 py-2 text-xs font-bold hover:text-brand-primary hover:bg-slate-100 transition"
                    href={`/display?eventId=${event.id}`}
                  >
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
