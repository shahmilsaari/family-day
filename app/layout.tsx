import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ToastHost } from "@/components/toast-host";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Family Day",
  description: "Family day planning and scoring dashboard"
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
      <body className={plusJakartaSans.className}>
        <div className="page-shell">
          <SiteHeader user={user ? { name: user.name, email: user.email } : null} events={events} />
          {children}
        </div>
        <ToastHost />
      </body>
    </html>
  );
}
