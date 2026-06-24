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

  if (
    pathname?.startsWith("/display") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
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

  const activeEventQuery = activeEvent ? `?eventId=${activeEvent.id}` : "";

  return (
    <header className="max-w-7xl mx-auto mb-8 bg-white/90 backdrop-blur-md shadow-soft rounded-3xl border border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between sticky top-3 z-50">
      {/* Brand Logo */}
      <Link className="flex items-center gap-4 hover:opacity-95 transition" href="/" onClick={handleLinkClick}>
        <div className="bg-brand-secondary text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
          FD
        </div>
        <div>
          <span className="inline-block text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            FAMILY DAY OPERATIONS
          </span>
          <h1 className="font-heading font-bold text-base tracking-tight text-slate-800">
            Community Event Hub
          </h1>
        </div>
      </Link>

      {/* Mobile Menu Button */}
      <button
        aria-controls="main-nav-panel"
        aria-expanded={mobileNavOpen}
        aria-label="Toggle navigation"
        className="lg:hidden p-2 text-slate-500 hover:text-brand-primary transition"
        onClick={() => setMobileNavOpen((open) => !open)}
        type="button"
      >
        {mobileNavOpen ? <XIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
      </button>

      {/* Navigation Menu */}
      <nav
        aria-label="Main navigation"
        className={`w-full lg:w-auto lg:flex items-center gap-6 mt-4 lg:mt-0 ${
          mobileNavOpen ? "block" : "hidden lg:flex"
        }`}
        id="main-nav-panel"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-4 mb-4 lg:mb-0">
          {navItems.map((item) => {
            const isLinkActive = pathname === item.href;
            const linkHref =
              item.href === "/dashboard" || item.href === "/display"
                ? `${item.href}${activeEventQuery}`
                : item.href;
            return (
              <Link
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  isLinkActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "text-slate-600 hover:text-brand-primary hover:bg-slate-50"
                }`}
                href={linkHref}
                key={item.href}
                onClick={handleLinkClick}
              >
                <item.icon width={16} height={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Separator on Desktop */}
        {user && <div className="hidden lg:block w-[1px] h-6 bg-slate-100 mx-2" />}

        {/* Event Selector Dropdown */}
        {user && (
          <div className="relative mb-4 lg:mb-0">
            <details
              className="group cursor-pointer select-none"
              open={eventOpen}
              onToggle={(e) => setEventOpen(e.currentTarget.open)}
            >
              <summary className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition list-none">
                <span>
                  EVENT:{" "}
                  <span className="text-brand-primary">
                    {activeEvent
                      ? `${activeEvent.title} ${activeEvent.year}`
                      : "No event"}
                  </span>
                </span>
                <ChevronDownIcon width={12} height={12} className="text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-soft rounded-2xl p-2 flex flex-col gap-1 z-50">
                {events.length ? (
                  events.map((event) => (
                    <Link
                      className={`flex items-between justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        event.id === activeEvent?.id
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      href={{ pathname: pathname === "/" ? "/dashboard" : pathname, query: { eventId: event.id } }}
                      key={event.id}
                      onClick={handleLinkClick}
                    >
                      <span className="font-bold">{event.title}</span>
                      <small className="opacity-75">{event.year}</small>
                    </Link>
                  ))
                ) : (
                  <span className="px-3.5 py-2 text-xs text-slate-400 italic">No events yet</span>
                )}
                <div className="h-[1px] bg-slate-100 my-1" />
                <Link
                  className="px-3.5 py-2 text-xs font-bold text-brand-secondary hover:bg-slate-50 rounded-xl transition text-center"
                  href="/events"
                  onClick={handleLinkClick}
                >
                  Manage all events
                </Link>
              </div>
            </details>
          </div>
        )}

        {/* User Account Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {user ? (
            <div className="relative">
              <details
                className="group cursor-pointer select-none"
                open={accountOpen}
                onToggle={(e) => setAccountOpen(e.currentTarget.open)}
              >
                <summary className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-2 rounded-full font-bold text-xs hover:bg-brand-primary/20 transition list-none">
                  <div className="w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                  <ChevronDownIcon width={12} height={12} className="text-brand-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-soft rounded-2xl p-2 flex flex-col gap-1 z-50">
                  <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    {user.email}
                  </span>
                  <Link
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    href="/events"
                    onClick={handleLinkClick}
                  >
                    My Workspaces
                  </Link>
                  <Link
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    href={activeEvent ? `/display?eventId=${activeEvent.id}` : "/display"}
                    onClick={handleLinkClick}
                  >
                    Open Live Display
                  </Link>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <form action={logoutUser} className="w-full">
                    <button
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      type="submit"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className={`px-4 py-2 text-sm font-bold text-slate-700 hover:text-brand-primary transition`}
                href="/login"
                onClick={handleLinkClick}
              >
                Login
              </Link>
              <Link
                className="px-6 py-2 bg-brand-dark text-white rounded-full font-bold text-sm shadow-md hover:bg-slate-800 transition"
                href="/register"
                onClick={handleLinkClick}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
