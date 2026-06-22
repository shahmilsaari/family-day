"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoIcon } from "@/components/ui/icons";

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
      <section className="glass-panel panel-pad stack error-page-card">
        <EmptyState
          icon={<InfoIcon width={48} height={48} />}
          title="Something went wrong"
          description={error.message || "An unexpected error occurred while loading this page."}
        />
        {error.digest && (
          <span className="muted error-digest">Error ID: {error.digest}</span>
        )}
        <div className="actions error-actions">
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