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
    <main className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Hero Section */}
        <section className="lg:col-span-3 bg-white shadow-soft rounded-3xl border border-slate-100 p-8 flex flex-col justify-between" data-purpose="hero-section">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-brand-primary">
                <SparklesIcon width={24} height={24} />
              </div>
              <span className="inline-block text-[10px] font-bold text-brand-secondary bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
                EVENT PLANNING HUB
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-800 leading-tight mb-6 max-w-lg">
              Seamless Family Day setups, schedules & live standings
            </h2>
            
            <p className="text-slate-500 text-sm md:text-base max-w-xl mb-10 leading-relaxed font-medium">
              Welcome to the Family Day central operations hub. Coordinate the annual schedule, manage team registration, set up custom events, and drag-and-drop placements to calculate standings in real-time.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schedule Card */}
              <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100 transition hover:bg-white hover:shadow-soft">
                <div className="w-12 h-12 flex-shrink-0 bg-white shadow-sm rounded-xl flex items-center justify-center text-brand-primary">
                  <CalendarIcon width={22} height={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Schedule Timetable</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Plan agenda slots, locations, and safety notes.</p>
                </div>
              </div>
              
              {/* Team Registration Card */}
              <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100 transition hover:bg-white hover:shadow-soft">
                <div className="w-12 h-12 flex-shrink-0 bg-white shadow-sm rounded-xl flex items-center justify-center text-brand-secondary">
                  <UsersIcon width={22} height={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Team Registrations</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Group family members and track participation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-10">
            <Link 
              href="/dashboard" 
              className="bg-brand-secondary text-white font-bold py-3.5 px-8 rounded-full shadow-layered flex items-center gap-3 transition hover:scale-[1.02] hover:bg-rose-500"
            >
              Open Control Dashboard
              <ArrowRightIcon width={18} height={18} />
            </Link>
          </div>
        </section>

        {/* Active Workspace Status Section */}
        <section className="lg:col-span-2 bg-white shadow-soft rounded-3xl border border-slate-100 p-8 flex flex-col justify-between" data-purpose="active-workspace">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-extrabold text-slate-800">Active Event Workspace</h3>
              {state.event ? (
                <span className="text-[10px] bg-green-50 text-green-600 font-bold px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  ACTIVE WORKSPACE
                </span>
              ) : (
                <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-3 py-1.5 rounded-full border border-amber-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  SETUP REQUIRED
                </span>
              )}
            </div>

            <div className="h-[1px] bg-slate-100 mb-6"></div>

            {state.event ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Event</span>
                  <strong className="text-xl font-heading font-extrabold text-slate-800 mt-1 block">{state.event.title}</strong>
                  <span className="text-xs font-bold text-slate-400 mt-0.5 block">{state.event.year} Edition</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                      <CalendarIcon width={16} height={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Event Dates</span>
                      <strong className="text-xs font-bold text-slate-700">{dateRangeLabel}</strong>
                    </div>
                  </div>

                  {state.event.location && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                        <LocationPinIcon width={16} height={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Venue</span>
                        <strong className="text-xs font-bold text-slate-700">{state.event.location}</strong>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                        <UsersIcon width={16} height={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Teams</span>
                        <strong className="text-xs font-bold text-slate-700">{state.totals.teams} Teams</strong>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                        <GamepadIcon width={16} height={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Games</span>
                        <strong className="text-xs font-bold text-slate-700">{state.totals.games} Games</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Agenda Slots</span>
                    <strong className="text-slate-800">{totalAgendaSlots} slots</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Scheduled Days</span>
                    <strong className="text-slate-800">{scheduledDays} days</strong>
                  </div>
                  {nextAgendaItem && (
                    <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-50">
                      <span className="text-slate-400">Next Slot</span>
                      <strong className="text-brand-primary">{nextAgendaItem.title} ({formatScheduleTime(nextAgendaItem.time)})</strong>
                    </div>
                  )}
                </div>

                <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">Top Leading Team</span>
                    <h4 className="font-heading font-extrabold text-slate-800 text-sm mt-0.5">
                      {state.leaderboard[0] ? state.leaderboard[0].name : "No results recorded yet"}
                    </h4>
                  </div>
                  <TrophyIcon width={24} height={24} className="text-amber-500" />
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                  <CalendarIcon width={32} height={32} />
                </div>
                <h4 className="text-base font-heading font-bold text-slate-800">No active Family Day found</h4>
                <p className="text-slate-400 text-xs font-medium max-w-[200px] leading-relaxed">
                  Create the annual event record, register teams, and outline your tentative timetable.
                </p>
                <Link 
                  href="/dashboard" 
                  className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-full font-bold text-xs shadow-soft hover:shadow-md transition"
                >
                  Create Event Now
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Timetable / Run Sheet Section */}
        <section className="lg:col-span-5 bg-white shadow-soft rounded-3xl border border-slate-100 p-8" data-purpose="run-sheet">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="inline-block text-[10px] font-bold text-brand-primary bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
                AUTO TIMETABLE
              </span>
              <h3 className="text-2xl font-heading font-extrabold mt-2 text-slate-800">Family Day Run Sheet</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-100">
                  {totalAgendaSlots} slot{totalAgendaSlots === 1 ? "" : "s"}
                </span>
                <span className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-100">
                  {scheduledDays} day{scheduledDays === 1 ? "" : "s"}
                </span>
              </div>
              
              <a
                className={`px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 font-bold rounded-full text-xs transition shadow-sm${
                  state.event ? "" : " opacity-50 cursor-not-allowed pointer-events-none"
                }`}
                href={state.event ? `/api/tentative-pdf?eventId=${state.event.id}` : "#"}
                aria-disabled={!state.event}
                download={state.event ? "tentative-timetable.pdf" : undefined}
                target={state.event ? "_blank" : undefined}
                rel={state.event ? "noreferrer" : undefined}
              >
                Export PDF
              </a>
              
              <Link 
                className="px-5 py-2.5 bg-brand-dark text-white rounded-full font-bold text-xs shadow-md hover:bg-slate-800 transition" 
                href="/dashboard"
              >
                Manage Agenda
              </Link>
            </div>
          </div>

          {groupedTimetable.length ? (
            <div className="space-y-8">
              {groupedTimetable.map((group, groupIndex) => (
                <div key={group.key} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20 shadow-sm">
                  {/* Day Header */}
                  <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-brand-primary">
                        <CalendarIcon width={18} height={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule Day</span>
                        <strong className="text-sm font-bold text-slate-800">{group.label}</strong>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-bold">
                      <span className="text-slate-400">
                        {group.items.length} slot{group.items.length === 1 ? "" : "s"}
                      </span>
                      <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px]">
                        Day {groupIndex + 1}
                      </span>
                    </div>
                  </div>

                  {/* Day Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3 w-20">Slot</th>
                          <th className="px-6 py-3 w-40">Time</th>
                          <th className="px-6 py-3">Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {group.items.map((item, itemIndex) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                              {String(itemIndex + 1).padStart(2, "0")}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-700 flex items-center gap-2">
                              <span className="text-slate-300">
                                <ClockIcon width={14} height={14} />
                              </span>
                              {formatScheduleTime(item.time)}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <strong className="text-slate-800 text-sm block font-semibold">{item.title}</strong>
                              {(item.location || item.pic || item.notes) && (
                                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold">
                                  {item.location && <span>📍 {item.location}</span>}
                                  {item.pic && <span>👤 PIC: {item.pic}</span>}
                                  {item.notes && <span className="italic">Note: {item.notes}</span>}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/20 rounded-2xl border-2 border-dashed border-slate-100 relative overflow-hidden">
              <div className="absolute top-6 left-6 w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-extrabold text-xs shadow-sm select-none">
                N
              </div>
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-brand-secondary shadow-sm">
                <ClockIcon width={28} height={28} />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-800">No timetable generated yet</h4>
              <p className="text-slate-400 text-xs font-medium max-w-sm leading-relaxed">
                Add dated agenda slots in the dashboard and the homepage timetable will generate automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
