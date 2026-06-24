import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Baloo_2, Fredoka } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ToastHost } from "@/components/toast-host";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Family Day — Event Planning & Scoring",
  description: "Plan your community Family Day: teams, games, schedules, and live scoring."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();
  const events = user
    ? await prisma.familyDayEvent.findMany({
        where: { userId: user.id },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        select: { id: true, title: true, year: true }
      })
    : [];

  return (
    <html lang="en">
      <body className={`${baloo.variable} ${fredoka.variable}`} style={{ fontFamily: "var(--font-sans)" }}>
        <div className="page-shell">
          <SiteHeader user={user ? { name: user.name, email: user.email } : null} events={events} />
          {children}
        </div>
        <ToastHost />
      </body>
    </html>
  );
}
