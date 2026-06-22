"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="page-shell" style={{ paddingTop: "48px" }}>
      <section className="glass-panel panel-pad stack" style={{ maxWidth: "540px", margin: "0 auto", textAlign: "center" }}>
        <div className="empty-state" style={{ gap: "10px" }}>
          <div className="empty-graphic" style={{ fontSize: "2.5rem" }}>⚠️</div>
          <strong style={{ fontSize: "1.3rem" }}>Something went wrong</strong>
          <span className="muted">
            {error.message || "An unexpected error occurred while loading this page."}
          </span>
          {error.digest && (
            <span className="muted" style={{ fontSize: "0.76rem" }}>Error ID: {error.digest}</span>
          )}
        </div>
        <div className="actions" style={{ justifyContent: "center", gap: "10px" }}>
          <button className="primary-btn" onClick={reset} type="button">
            Try Again
          </button>
          <Link className="ghost-link" href="/">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}