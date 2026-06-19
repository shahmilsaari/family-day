"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutUser } from "@/app/auth-actions";

type HeaderEvent = {
  id: number;
  title: string;
  year: number;
};

type SiteHeaderProps = {
  user: { name: string; email: string } | null;
  events: HeaderEvent[];
};

export function SiteHeader({ user, events }: SiteHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentEventId = Number.parseInt(searchParams.get("eventId") ?? "", 10);
  const activeEvent = events.find((event) => event.id === currentEventId) ?? events[0] ?? null;

  if (pathname?.startsWith("/display")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Overview" },
    { href: "/events", label: "Events" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/display", label: "Live Display" }
  ] as const;

  return (
    <header className="site-header app-topbar">
      <Link className="site-brand" href="/">
        <span className="brand-mark">FD</span>
        <span>
          <span className="eyebrow">Family Day Operations</span>
          <strong>Community Event Hub</strong>
        </span>
      </Link>

      <nav className="site-nav app-nav" aria-label="Main navigation">
        <div className="nav-segment nav-main-links">
          {navItems.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {user && (
          <details className="nav-dropdown nav-event-switcher">
            <summary>
              <span>Event</span>
              <strong>{activeEvent ? `${activeEvent.title} ${activeEvent.year}` : "No event"}</strong>
            </summary>
            <div className="nav-dropdown-menu">
              {events.length ? (
                events.map((event) => (
                  <Link
                    className={event.id === activeEvent?.id ? "active" : ""}
                    href={{ pathname: "/dashboard", query: { eventId: event.id } }}
                    key={event.id}
                  >
                    <span>{event.title}</span>
                    <small>{event.year}</small>
                  </Link>
                ))
              ) : (
                <span className="nav-dropdown-empty">No events yet</span>
              )}
              <Link href="/events">Manage all events</Link>
            </div>
          </details>
        )}

        <div className="nav-segment nav-account-links">
          {user ? (
            <details className="nav-dropdown nav-account-menu">
              <summary>
                <span className="nav-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <strong>{user.name}</strong>
              </summary>
              <div className="nav-dropdown-menu align-right">
                <span className="nav-account-email">{user.email}</span>
                <Link href="/events">My Events</Link>
                <Link href={activeEvent ? { pathname: "/display", query: { eventId: activeEvent.id } } : "/display"}>Open Display</Link>
                <form action={logoutUser}>
                  <button className="nav-logout-btn" type="submit">Logout</button>
                </form>
              </div>
            </details>
          ) : (
            <>
              <Link className={pathname === "/login" ? "active" : ""} href="/login">
                Login
              </Link>
              <Link className={pathname === "/register" ? "active" : ""} href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
