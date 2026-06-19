import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="auth-shell slide-up-animation">
      <section className="glass-panel panel-pad auth-card">
        <p className="eyebrow">Community Account</p>
        <h2>Create your workspace</h2>
        <p className="muted">Register to manage your own Family Day events, teams, games, and standings.</p>

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
            <input id="password" name="password" type="password" minLength={6} placeholder="Minimum 6 characters" required />
          </div>
          <button className="primary-btn" type="submit">Create Account</button>
        </form>

        <p className="auth-switch muted">Already registered? <Link href="/login">Login here</Link></p>
      </section>
    </main>
  );
}
