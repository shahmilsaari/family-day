import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
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

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <div className="page-shell">
          <header className="site-header">
            <div>
              <p className="eyebrow">Family Day Operations</p>
              <h1>Team setup, event details, and live scoring</h1>
            </div>
            <nav className="site-nav">
              <Link href="/">Overview</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
