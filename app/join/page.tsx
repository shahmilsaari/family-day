import { enterJoinCode } from "@/app/join-actions";

export const dynamic = "force-dynamic";

type JoinLandingProps = {
  searchParams: Promise<{ error?: string }>;
};

const buntingColors = ["bg-brand-coral", "bg-brand-sky", "bg-tertiary-container"];

export default async function JoinLandingPage({ searchParams }: JoinLandingProps) {
  const sp = await searchParams;
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  return (
    <main className="auth-shell slide-up-animation">
      <div className="auth-sun-glow auth-sun-glow-tl" />
      <div className="auth-sun-glow auth-sun-glow-br" />

      <div className="auth-content">
        <div className="auth-logo-area">
          <h1>Family Day</h1>
          <p>Got a team code? Pop it in below.</p>
        </div>

        <div className="auth-card">
          <div className="flex justify-center gap-1.5 pt-4">
            {buntingColors.concat(buntingColors).map((c, i) => (
              <div key={i} className={`w-5 h-6 opacity-80 ${c}`} style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }} />
            ))}
          </div>

          <div className="auth-card-body">
            <div className="auth-card-head">
              <h2>Join a team</h2>
              <p>Enter the 6-character code from the poster or QR.</p>
            </div>

            {error && (
              <div className="auth-error-banner" role="alert">
                <strong>{error}</strong>
              </div>
            )}

            <form action={enterJoinCode} className="auth-form">
              <div className="auth-field">
                <label htmlFor="code">Team code</label>
                <div className="auth-input-wrap">
                  <input
                    id="code"
                    name="code"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                    autoFocus
                    autoCapitalize="characters"
                    className="!pl-4 tracking-[0.4em] text-center uppercase font-extrabold"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
              <button className="auth-submit-btn" type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
