import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  PodiumIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/icons";

export const metadata = {
  title: "Family Day | Plan Your Perfect Community Event",
  description:
    "A tool for planning and running a company or community family fun day. Coordinate activities, manage teams, and track scores in real-time.",
};

const buntingColors = [
  "bg-brand-coral",
  "bg-brand-sky",
  "bg-tertiary-container",
  "bg-brand-coral",
  "bg-brand-sky",
  "bg-tertiary-container",
];

export default function HomePage() {
  return (
    <div className="bg-brand-cream text-on-surface font-body-md text-body-md min-h-screen">
      {/* Bunting Accent */}
      <div className="flex justify-center gap-1 absolute top-0 left-0 right-0 z-50 pointer-events-none">
        {buntingColors.map((color, i) => (
          <div
            key={i}
            className={`w-6 h-8 opacity-80 ${color}`}
            style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 shadow-soft">
        <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display-lg text-headline-sm font-bold text-primary">Family Day</span>
          </Link>
          <div className="hidden md:flex items-center gap-stack-xl">
            <Link href="/events" className="text-primary border-b-2 border-primary font-bold py-1">
              Events
            </Link>
            <Link href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">
              Teams
            </Link>
            <Link href="/overview" className="text-on-surface-variant hover:text-primary transition-colors">
              Overview
            </Link>
          </div>
          <div className="flex items-center gap-stack-md">
            <Link href="/login" className="hidden sm:block text-primary font-bold hover:underline px-4">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-brand-coral text-white font-bold px-6 py-2.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Sun Glow Decorative Elements */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full -z-10"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0) 70%)" }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full -z-10"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0) 70%)" }}
        />

        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-16 md:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-xl items-center">
            <div className="space-y-stack-lg text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-primary-container/10 text-primary text-label-md font-bold rounded-full mb-2">
                2024 Event Planner
              </span>
              <h1 className="font-headline-md text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
                Plan your <span className="text-primary">Family Day</span>
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
                A tool for planning and running a company/community family fun day. Coordinate activities, manage
                teams, and track scores in real-time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/events"
                  className="w-full sm:w-auto text-center bg-brand-coral text-white font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform active:scale-95"
                  style={{ boxShadow: "0px 10px 25px rgba(251,113,133,0.3)" }}
                >
                  Create your event
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold border-2 border-brand-sky text-brand-sky hover:bg-brand-sky/5 transition-colors"
                >
                  See how it works
                </a>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-6 text-on-surface-variant">
                <div className="flex -space-x-3">
                  {["#38BDF8", "#FB7185", "#e1a800"].map((c) => (
                    <div
                      key={c}
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white"
                      style={{ backgroundColor: c }}
                    >
                      <UsersIcon width={16} height={16} />
                    </div>
                  ))}
                </div>
                <span className="text-label-md">Trusted by 200+ local organizations</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-2 bg-gradient-to-br from-brand-sky/20 via-primary-container/10 to-brand-coral/20 aspect-[4/3] flex items-center justify-center">
                <div className="text-center p-8 space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-white/70 backdrop-blur flex items-center justify-center text-primary shadow-lg">
                    <TrophyIcon width={40} height={40} />
                  </div>
                  <p className="font-headline-sm text-on-surface font-bold">Organized joy, communal warmth</p>
                  <p className="text-label-md text-on-surface-variant">Games · Teams · Live Standings</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-container rounded-3xl -z-10 animate-pulse" />
              <div className="absolute -top-6 -right-6 w-48 h-48 border-4 border-brand-sky rounded-full -z-10 opacity-20" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-surface-container-lowest/50 py-24 scroll-mt-24">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Everything you need to host</h2>
              <p className="text-body-lg text-on-surface-variant">
                Designed for planners who value simplicity and families who value fun.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {[
                {
                  icon: <CalendarIcon width={28} height={28} />,
                  tint: "bg-primary-container/20 text-primary",
                  hover: "hover:border-brand-sky/20",
                  title: "Schedule Builder",
                  body: "Drag-and-drop activities into a seamless timeline. Auto-notify participants when events are about to begin.",
                },
                {
                  icon: <UsersIcon width={28} height={28} />,
                  tint: "bg-secondary-container/20 text-secondary",
                  hover: "hover:border-brand-coral/20",
                  title: "Teams & Games",
                  body: "Organize families into colorful teams. Assign them to classic games like egg races, tug-of-war, and relays with ease.",
                },
                {
                  icon: <PodiumIcon width={28} height={28} />,
                  tint: "bg-tertiary-fixed/30 text-tertiary",
                  hover: "hover:border-tertiary-container/20",
                  title: "Live Scoreboard",
                  body: "Real-time updates visible on everyone's phones. Keep the competition friendly and the energy high throughout the day.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`group p-stack-xl rounded-3xl bg-white shadow-soft hover:shadow-layered transition-all duration-300 border border-transparent ${f.hover}`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.tint}`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{f.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Live standings preview */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="rounded-3xl p-stack-xl md:p-16 flex flex-col md:flex-row items-center gap-12 relative z-10 bg-white/70 backdrop-blur border border-white/40 shadow-soft">
              <div className="flex-1 space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface leading-tight">
                  Ready to start your community tradition?
                </h2>
                <p className="text-body-lg text-on-surface-variant">
                  Join organizers who have made Family Day the highlight of their year. Our platform handles the
                  logistics so you can focus on the memories.
                </p>
                <div className="pt-4">
                  <Link
                    href="/register"
                    className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                  >
                    Get Started for Free <ArrowRightIcon width={18} height={18} />
                  </Link>
                </div>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <div className="bg-white p-4 rounded-3xl shadow-xl transform rotate-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-primary">Team Standings</span>
                    <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { rank: "01", name: "Blue Jays", pts: "450 pts", dot: "bg-brand-sky", bg: "bg-primary-container/10", pt: "text-primary" },
                      { rank: "02", name: "Red Robins", pts: "425 pts", dot: "bg-brand-coral", bg: "bg-secondary-container/10", pt: "text-secondary" },
                      { rank: "03", name: "Gold Finches", pts: "390 pts", dot: "bg-tertiary-container", bg: "bg-surface-container-low", pt: "text-on-surface" },
                    ].map((row) => (
                      <div key={row.rank} className={`flex items-center justify-between p-3 rounded-lg ${row.bg}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${row.dot}`}>
                            {row.rank}
                          </div>
                          <span className="font-bold">{row.name}</span>
                        </div>
                        <span className={`font-bold ${row.pt}`}>{row.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10 opacity-5 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(#00668a 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface pt-20 pb-10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-xl border-b border-outline/20 pb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <h4 className="font-display-lg text-headline-sm font-black text-inverse-primary">Family Day</h4>
              <p className="text-sm opacity-70 leading-relaxed">
                Making community gatherings effortless and memorable since 2024.
              </p>
            </div>
            {[
              { head: "Product", links: ["Features", "Pricing", "Templates"] },
              { head: "Resources", links: ["Game Ideas", "Checklists", "Safety Guide"] },
              { head: "Connect", links: ["Support", "Twitter", "Instagram"] },
            ].map((col) => (
              <div key={col.head}>
                <h5 className="font-bold mb-6">{col.head}</h5>
                <ul className="space-y-4 opacity-70 text-sm">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a className="hover:text-inverse-primary transition-colors" href="#">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 gap-4">
            <p className="text-sm opacity-50">© 2024 Family Day. All rights reserved.</p>
            <div className="flex gap-stack-lg text-sm opacity-50">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface shadow-[0px_-4px_20px_rgba(30,41,59,0.05)] rounded-t-xl px-4 py-3 border-t border-outline-variant/10">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1">
            <CalendarIcon width={20} height={20} />
            <span className="text-label-sm">Home</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant">
            <TrophyIcon width={20} height={20} />
            <span className="text-label-sm">Scores</span>
          </Link>
          <Link href="/events" className="flex flex-col items-center justify-center text-on-surface-variant">
            <UsersIcon width={20} height={20} />
            <span className="text-label-sm">Teams</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center justify-center text-on-surface-variant">
            <PodiumIcon width={20} height={20} />
            <span className="text-label-sm">Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
