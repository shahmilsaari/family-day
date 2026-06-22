"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/app/auth-actions";
import {
  ChevronDownIcon,
  DashboardIcon,
  EventsIcon,
  LiveDisplayIcon,
  MenuIcon,
  OverviewIcon,
  XIcon,
} from "@/components/ui/icons";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const currentEventId = Number.parseInt(searchParams.get("eventId") ?? "", 10);
  const activeEvent =
    events.find((event) => event.id === currentEventId) ?? events[0] ?? null;

  if (pathname?.startsWith("/display")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Overview", icon: OverviewIcon },
    { href: "/events", label: "Events", icon: EventsIcon },
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/display", label: "Live Display", icon: LiveDisplayIcon },
  ] as const;

  const handleLinkClick = () => {
    setMobileNavOpen(false);
    setEventOpen(false);
    setAccountOpen(false);
  };

  return (
    <header className="site-header app-topbar">
      <Link className="site-brand" href="/" onClick={handleLinkClick}>
        <span className="brand-mark">FD</span>
        <span className="site-brand-text">
          <span className="eyebrow">Family Day Operations</span>
          <strong>Community Event Hub</strong>
        </span>
      </Link>

      <button
        aria-controls="main-nav-panel"
        aria-expanded={mobileNavOpen}
        aria-label="Toggle navigation"
        className="mobile-nav-toggle"
        onClick={() => setMobileNavOpen((open) => !open)}
        type="button"
      >
        {mobileNavOpen ? <XIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
      </button>

      <nav
        aria-label="Main navigation"
        className={`site-nav app-nav ${mobileNavOpen ? "is-open" : ""}`}
        id="main-nav-panel"
      >
        <div className="nav-segment nav-main-links">
          {navItems.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
              onClick={handleLinkClick}
            >
              <item.icon width={18} height={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {user && (
          <details
            className="nav-dropdown nav-event-switcher"
            open={eventOpen}
            onToggle={(e) => setEventOpen(e.currentTarget.open)}
          >
            <summary>
              <span>
                <span className="nav-event-label">Event</span>
                <strong className="nav-event-value">
                  {activeEvent
                    ? `${activeEvent.title} ${activeEvent.year}`
                    : "No event"}
                </strong>
              </span>
              <ChevronDownIcon width={14} height={14} />
            </summary>
            <div className="nav-dropdown-menu">
              {events.length ? (
                events.map((event) => (
                  <Link
                    className={event.id === activeEvent?.id ? "active" : ""}
                    href={{ pathname: "/dashboard", query: { eventId: event.id } }}
                    key={event.id}
                    onClick={handleLinkClick}
                  >
                    <span>{event.title}</span>
                    <small>{event.year}</small>
                  </Link>
                ))
              ) : (
                <span className="nav-dropdown-empty">No events yet</span>
              )}
              <Link href="/events" onClick={handleLinkClick}>
                Manage all events
              </Link>
            </div>
          </details>
        )}

        <div className="nav-segment nav-account-links">
          {user ? (
            <details
              className="nav-dropdown nav-account-menu"
              open={accountOpen}
              onToggle={(e) => setAccountOpen(e.currentTarget.open)}
            >
              <summary>
                <span className="nav-account-summary">
                  <span className="nav-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <strong className="nav-account-name">{user.name}</strong>
                </span>
                <ChevronDownIcon width={14} height={14} />
              </summary>
              <div className="nav-dropdown-menu align-right">
                <span className="nav-account-email">{user.email}</span>
                <Link href="/events" onClick={handleLinkClick}>
                  My Events
                </Link>
                <Link
                  href={
                    activeEvent
                      ? { pathname: "/display", query: { eventId: activeEvent.id } }
                      : "/display"
                  }
                  onClick={handleLinkClick}
                >
                  Open Display
                </Link>
                <form action={logoutUser}>
                  <button className="nav-logout-btn" type="submit">
                    Logout
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <>
              <Link
                className={pathname === "/login" ? "active" : ""}
                href="/login"
                onClick={handleLinkClick}
              >
                Login
              </Link>
              <Link
                className={pathname === "/register" ? "active" : ""}
                href="/register"
                onClick={handleLinkClick}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
