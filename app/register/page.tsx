import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <main className="auth-shell slide-up-animation">
      <div className="auth-sun-glow auth-sun-glow-tl" />
      <div className="auth-sun-glow auth-sun-glow-br" />

      <div className="auth-content">
        <div className="auth-logo-area">
          <h1>Family Day</h1>
          <p>Your community event, organized.</p>
        </div>

        <div className="auth-card">
          <div className="auth-bunting" />
          <div className="auth-card-body">
            <div className="auth-card-head">
              <h2>Create Your Workspace</h2>
              <p>Register to manage events, teams, and live standings</p>
            </div>

            {error && (
              <div className="auth-error-banner" role="alert">
                <strong>{error}</strong>
              </div>
            )}

            <form action={registerUser} className="auth-form">
              <div className="auth-field">
                <label htmlFor="name">Your Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>

              <button className="auth-submit-btn" type="submit">
                Create Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>

            <div className="auth-divider">
              <p className="auth-switch">
                Already registered?{" "}
                <Link href="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
