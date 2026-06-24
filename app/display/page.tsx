import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { LiveClock } from "@/components/live-clock";
import { loadDashboard } from "@/lib/dashboard";
import { formatScheduleDate, formatScheduleTime } from "@/lib/timetable";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarIcon, GamepadIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

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
  const totalGames = games.filter((game) => game.includeInScore).length;

  const now = new Date();
  
  // Parse start times of schedule
  const agendaWithDateTime = timetable.map((item) => {
    const dateTime = getScheduleDateTime(item.scheduleDate, item.time);
    return { item, dateTime };
  });

  // Find current active schedule slot
  let activeIndex = -1;
  for (let i = 0; i < agendaWithDateTime.length; i++) {
    const dt = agendaWithDateTime[i].dateTime;
    if (dt && dt <= now) {
      activeIndex = i;
    }
  }
  // Default to first item as "active/up next" if event hasn't started yet
  if (activeIndex === -1 && agendaWithDateTime.length > 0) {
    activeIndex = 0;
  }

  // Define news feed strings
  const newsTickerAlerts = [
    event ? `${event.title.toUpperCase()} ${event.year} IS NOW LIVE!` : "WELCOME TO FAMILY DAY!",
    leader ? `LEADERBOARD UPDATE: ${leader.name.toUpperCase()} IS LEADING WITH ${leader.totalScore} POINTS!` : "STAY TUNED FOR FIRST GAME SCORES!",
    `${totals.teams} TEAMS REGISTERED · ${totals.games} GAMES SCHEDULED`,
    "ANNOUNCEMENT: BBQ LUNCH STARTS SOON! STAY HYDRATED & PLAY FAIR!",
  ];

  return (
    <div className="bg-[#f5faff] text-[#171c20] min-h-screen relative overflow-hidden font-sans p-4 md:p-10">
      <AutoRefresh intervalMs={15000} />
      
      {/* Google Material Symbols Font Head Link */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      {/* Atmospheric Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-400/10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-400/10 blur-3xl rounded-full"></div>
      </div>

      {/* Bunting/Banner Row */}
      <div className="absolute top-0 left-0 w-full h-12 flex justify-center gap-2 overflow-hidden pointer-events-none select-none">
        {Array.from({ length: 35 }).map((_, i) => {
          const colors = ['bg-[#a93349]', 'bg-[#38bdf8]', 'bg-[#f9bd22]', 'bg-[#fe7488]'];
          const color = colors[i % colors.length];
          return (
            <div 
              key={i} 
              className={`w-8 h-10 ${color} opacity-80`} 
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
            />
          );
        })}
      </div>

      {event ? (
        <div className="max-w-[1920px] mx-auto pt-6 flex flex-col justify-between gap-8 min-h-[calc(100vh-80px)]">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#ba1a1a] text-white font-semibold text-[10px] px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  LIVE SCOREBOARD
                </span>
                <h2 className="font-bold text-xs text-slate-400 tracking-widest uppercase">
                  {event.year} EDITION
                </h2>
              </div>
              <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-[#00668a] leading-tight">
                {event.title} <span className="text-[#f9bd22]">Scoreboard</span>
              </h1>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
              <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1">Last Update</div>
              <div className="text-xl md:text-2xl font-extrabold text-[#00668a] flex items-center gap-2 font-heading">
                <span className="material-symbols-outlined text-[#00668a] text-xl">schedule</span>
                <LiveClock />
              </div>
            </div>
          </header>

          {/* Main Scoreboard Grid */}
          <main className="flex-grow grid grid-cols-12 gap-6">
            
            {/* Left Panel: Ranked Leaderboard */}
            <div className="col-span-12 lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/50 flex-grow">
                <h3 className="font-heading font-extrabold text-base text-[#171c20] mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
                  <span className="material-symbols-outlined text-[#00668a]">leaderboard</span>
                  <span>Leaderboard</span>
                </h3>
                
                <div className="space-y-3">
                  {leaderboard.slice(0, 7).map((team, idx) => {
                    const rank = idx + 1;
                    const isFirst = rank === 1;
                    return (
                      <div 
                        key={team.id}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                          isFirst 
                            ? "bg-slate-50 border-l-4 border-[#f9bd22] shadow-sm" 
                            : "bg-white border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`font-heading font-extrabold text-lg ${
                            isFirst ? "text-[#f9bd22]" : "text-slate-350"
                          }`}>
                            {rank}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">{team.name}</span>
                        </div>
                        <span className="font-heading font-extrabold text-lg text-[#00668a]">
                          {team.totalScore}
                        </span>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <p className="text-slate-405 italic text-xs font-semibold py-8 text-center">No scores recorded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Center Hero Card: Current Champion */}
            <div className="col-span-12 lg:col-span-6 flex flex-col">
              <div className="relative bg-white rounded-[32px] p-8 md:p-10 shadow-soft border-2 border-[#38bdf8]/30 overflow-hidden flex flex-col items-center justify-center text-center flex-grow">
                
                {/* Decorative gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#f9bd22]/10 blur-3xl rounded-full pointer-events-none" />
                
                <span className="bg-[#f9bd22]/20 text-[#795900] font-bold text-xs px-6 py-2 rounded-full mb-8 flex items-center gap-2 shadow-sm border border-[#f9bd22]/10">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span>LEADING THE PACK</span>
                </span>
                
                <div className="mb-8 relative" id="champion-score-val">
                  <div className="absolute inset-0 bg-[#38bdf8]/10 blur-3xl rounded-full scale-150 pointer-events-none" />
                  <span className="material-symbols-outlined text-[120px] md:text-[140px] text-[#f9bd22] relative z-10 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emoji_events
                  </span>
                </div>
                
                <h2 className="font-heading font-extrabold text-4xl md:text-6xl text-slate-800 mb-4 tracking-tight">
                  {leader ? leader.name : "Waiting for Scores"}
                </h2>
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-[2px] w-12 bg-slate-100" />
                  <div className="font-heading font-black text-4xl md:text-5xl text-[#00668a]">
                    {leader ? leader.totalScore : 0} <span className="text-xs font-bold text-slate-400">PTS</span>
                  </div>
                  <div className="h-[2px] w-12 bg-slate-100" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Game Wins</div>
                    <div className="text-lg md:text-xl font-heading font-extrabold text-[#00668a]">
                      {leader ? leader.roundWins : 0}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Games Played</div>
                    <div className="text-lg md:text-xl font-heading font-extrabold text-[#00668a]">
                      {leader ? `${leader.completedGames}/${totalGames}` : `0/${totalGames}`}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-[#fe7488]/10">
                    <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">2nds / 3rds</div>
                    <div className="text-lg md:text-xl font-heading font-extrabold text-[#00668a]">
                      {leader ? `${leader.secondPlaces}/${leader.thirdPlaces}` : "0/0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Schedule Timeline */}
            <div className="col-span-12 lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/50 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#171c20] mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
                    <span className="material-symbols-outlined text-[#00668a]">calendar_month</span>
                    <span>Schedule Run Sheet</span>
                  </h3>
                  
                  <div className="relative pl-6">
                    {/* Vertical Timeline Bar */}
                    <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-slate-100" />
                    
                    {agendaWithDateTime.length ? (
                      <div className="space-y-6 relative z-10">
                        {agendaWithDateTime.slice(0, 4).map((entry, idx) => {
                          const isPast = idx < activeIndex;
                          const isActive = idx === activeIndex;
                          const isFuture = idx > activeIndex;

                          if (isPast) {
                            return (
                              <div key={entry.item.id} className="flex gap-4 opacity-40">
                                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 -ml-[22px] bg-white">
                                  <span className="material-symbols-outlined text-[10px] text-green-600 font-bold">check</span>
                                </div>
                                <div>
                                  <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">{formatScheduleTime(entry.item.time)}</div>
                                  <div className="text-xs font-semibold text-slate-500 line-through truncate max-w-[150px]">{entry.item.title}</div>
                                </div>
                              </div>
                            );
                          }

                          if (isActive) {
                            return (
                              <div key={entry.item.id} className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#38bdf8] flex items-center justify-center shrink-0 -ml-[22px] shadow shadow-[#38bdf8]/40 animate-pulse text-white">
                                  <span className="material-symbols-outlined text-[10px]">play_arrow</span>
                                </div>
                                <div className="bg-[#38bdf8]/5 p-3.5 rounded-2xl border border-[#38bdf8]/20 w-full">
                                  <div className="text-[#00668a] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                    CURRENT / UP NEXT
                                  </div>
                                  <div className="text-sm font-extrabold text-[#004965] mt-1">{entry.item.title}</div>
                                  {entry.item.location && (
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">📍 {entry.item.location}</p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // Future item
                          return (
                            <div key={entry.item.id} className="flex gap-4">
                              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 -ml-[19px] mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              </div>
                              <div>
                                <div className="text-slate-450 font-bold text-[9px] uppercase tracking-wider">{formatScheduleTime(entry.item.time)}</div>
                                <div className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{entry.item.title}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-xs py-8 text-center select-none">No slots scheduled yet</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6">
                  <div className="bg-[#fe7488]/5 rounded-xl p-3.5 border border-[#fe7488]/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a93349] text-2xl">info</span>
                    <div className="text-[10px] text-[#a93349] font-bold uppercase tracking-wider">
                      Bonus points awarded for team spirit!
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </main>

          {/* Footer News Marquee Update */}
          <footer className="bg-[#2c3135] text-[#edf1f6] rounded-full py-4 px-8 flex items-center overflow-hidden h-14 shadow-md select-none">
            <div className="whitespace-nowrap flex items-center gap-16 animate-marquee">
              {newsTickerAlerts.map((alert, idx) => (
                <div className="flex items-center gap-4" key={idx}>
                  <span className="bg-[#00668a] text-white font-bold text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                    UPDATE
                  </span>
                  <span className="font-bold text-xs md:text-sm tracking-wider">{alert}</span>
                </div>
              ))}
            </div>
          </footer>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
              0% { transform: translateX(40%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
            }
          `}} />
          
        </div>
      ) : (
        <div className="h-[90vh] flex items-center justify-center">
          <EmptyState
            icon={<GamepadIcon width={48} height={48} />}
            title="No active event found"
            description="Create an event in the dashboard and assign teams to activate the scoreboard display."
            action={
              <Link className="px-6 py-2.5 bg-[#00668a] text-white rounded-full font-bold text-xs shadow-md" href="/dashboard">
                Go to Dashboard
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
