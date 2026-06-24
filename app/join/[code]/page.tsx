import Link from "next/link";
import { joinTeam } from "@/app/join-actions";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode } from "@/lib/team-code";
import { CheckIcon, UsersIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

type JoinPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ joined?: string; name?: string; error?: string }>;
};

const buntingColors = ["bg-brand-coral", "bg-brand-sky", "bg-tertiary-container"];

export default async function JoinTeamPage({ params, searchParams }: JoinPageProps) {
  const { code: rawCode } = await params;
  const sp = await searchParams;
  const code = normalizeJoinCode(rawCode);

  const team = await prisma.team.findUnique({
    where: { joinCode: code },
    include: {
      event: { select: { title: true, year: true } },
      _count: { select: { members: true } },
    },
  });

  const accent = team?.color ?? "#38BDF8";
  const joined = sp.joined === "1";
  const joinedName = sp.name ? decodeURIComponent(sp.name) : null;
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  return (
    <main className="auth-shell slide-up-animation">
      <div className="auth-sun-glow auth-sun-glow-tl" />
      <div className="auth-sun-glow auth-sun-glow-br" />

      <div className="auth-content">
        <div className="auth-logo-area">
          <h1>Family Day</h1>
          <p>Join your team and get in the game.</p>
        </div>

        <div className="auth-card">
          <div className="flex justify-center gap-1.5 pt-4">
            {buntingColors.concat(buntingColors).map((c, i) => (
              <div key={i} className={`w-5 h-6 opacity-80 ${c}`} style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }} />
            ))}
          </div>

          {!team ? (
            <div className="auth-card-body text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <UsersIcon width={26} height={26} />
              </div>
              <div className="auth-card-head">
                <h2>Code not found</h2>
                <p>We couldn&apos;t find a team for <strong>{code || "that code"}</strong>.</p>
              </div>
              <Link href="/join" className="auth-submit-btn">Try another code</Link>
            </div>
          ) : joined ? (
            <div className="auth-card-body text-center">
              <div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accent }}
              >
                <CheckIcon width={32} height={32} />
              </div>
              <div className="auth-card-head">
                <h2>You&apos;re in! 🎉</h2>
                <p>
                  {joinedName ? <strong>{joinedName}</strong> : "You"} joined{" "}
                  <strong style={{ color: accent }}>{team.name}</strong>
                  {team.event ? ` · ${team.event.title} ${team.event.year}` : ""}.
                </p>
              </div>
              <p className="text-xs font-bold text-slate-400">
                {team._count.members} member{team._count.members === 1 ? "" : "s"} on this team
              </p>
              <Link href={`/join/${code}`} className="auth-submit-btn" style={{ backgroundColor: accent }}>
                Add another player
              </Link>
            </div>
          ) : (
            <div className="auth-card-body">
              <div className="auth-card-head">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                  style={{ backgroundColor: accent }}
                >
                  <span className="w-2 h-2 rounded-full bg-white/80" />
                  {team.name}
                </span>
                <h2>Join the team</h2>
                <p>
                  {team.event ? `${team.event.title} ${team.event.year} · ` : ""}
                  {team._count.members} player{team._count.members === 1 ? "" : "s"} so far
                </p>
              </div>

              {error && (
                <div className="auth-error-banner" role="alert">
                  <strong>{error}</strong>
                </div>
              )}

              <form action={joinTeam} className="auth-form">
                <input type="hidden" name="code" value={code} />
                <div className="auth-field">
                  <label htmlFor="name">Your name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <UsersIcon width={18} height={18} />
                    </span>
                    <input id="name" name="name" placeholder="e.g. Aisyah" maxLength={40} required autoFocus />
                  </div>
                </div>
                <button className="auth-submit-btn" type="submit" style={{ backgroundColor: accent }}>
                  Join {team.name}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
