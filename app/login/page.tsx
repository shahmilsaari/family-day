import Link from "next/link";
import { redirect } from "next/navigation";
import { loginUser } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="auth-shell slide-up-animation">
      <section className="glass-panel panel-pad auth-card">
        <p className="eyebrow">Welcome Back</p>
        <h2>Login to your workspace</h2>
        <p className="muted">Only registered users can manage their own community events.</p>

        <form action={loginUser} className="form-grid interactive-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Your password" required />
          </div>
          <button className="primary-btn" type="submit">Login</button>
        </form>

        <p className="auth-switch muted">New here? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
