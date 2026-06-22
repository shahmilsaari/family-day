import Link from "next/link";
import { redirect } from "next/navigation";
import { loginUser } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRightIcon, TrophyIcon } from "@/components/ui/icons";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <main className="auth-shell slide-up-animation">
      <section className="glass-panel panel-pad auth-card">
        <div className="auth-card-brand">
          <div className="auth-brand-icon">
            <TrophyIcon width={28} height={28} />
          </div>
          <p className="eyebrow">Welcome Back</p>
        </div>
        <h2>Login to your workspace</h2>
        <p className="muted">
          Only registered users can manage their own community events.
        </p>

        {error && (
          <div className="auth-error-banner" role="alert">
            <strong>{error}</strong>
          </div>
        )}

        <form action={loginUser} className="form-grid interactive-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              required
            />
          </div>
          <button className="primary-btn" type="submit">
            Login
            <ArrowRightIcon width={18} height={18} />
          </button>
        </form>

        <p className="auth-switch muted">
          New here?{" "}
          <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
