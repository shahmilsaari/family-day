import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";

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
      <section className="glass-panel panel-pad auth-card">
        <div className="auth-card-brand">
          <div className="auth-brand-icon auth-brand-icon-register">
            <SparklesIcon width={28} height={28} />
          </div>
          <p className="eyebrow">Community Account</p>
        </div>
        <h2>Create your workspace</h2>
        <p className="muted">
          Register to manage your own Family Day events, teams, games, and standings.
        </p>

        {error && (
          <div className="auth-error-banner" role="alert">
            <strong>{error}</strong>
          </div>
        )}

        <form action={registerUser} className="form-grid interactive-form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <button className="primary-btn" type="submit">
            Create Account
            <ArrowRightIcon width={18} height={18} />
          </button>
        </form>

        <p className="auth-switch muted">
          Already registered? <Link href="/login">Login here</Link>
        </p>
      </section>
    </main>
  );
}
