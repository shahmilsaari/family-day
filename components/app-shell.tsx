"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Wraps app pages in the constrained `.page-shell` container with the global
 * SiteHeader. The public marketing landing ("/") renders full-bleed with its
 * own header/footer, so it skips the shell entirely.
 */
const FULL_BLEED_EXACT = new Set(["/", "/login", "/register"]);

export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isFullBleed =
    (pathname && FULL_BLEED_EXACT.has(pathname)) || pathname?.startsWith("/join");

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell">
      {header}
      {children}
    </div>
  );
}
