"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Wraps app pages in the constrained `.page-shell` container with the global
 * SiteHeader. The public marketing landing ("/") renders full-bleed with its
 * own header/footer, so it skips the shell entirely.
 */
export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isMarketing = pathname === "/";

  if (isMarketing) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell">
      {header}
      {children}
    </div>
  );
}
