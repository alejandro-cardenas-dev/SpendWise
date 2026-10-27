"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBell,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiRepeat,
  FiX,
} from "react-icons/fi";

import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: FiHome },
  { href: "/transactions", label: "Transactions", Icon: FiRepeat },
  { href: "/categories", label: "Categories", Icon: FiGrid },
];

// The side menu also lists Notifications, since the phone header only has the bell
const MENU_LINKS = [
  ...LINKS,
  { href: "/notifications", label: "Notifications", Icon: FiBell },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => pathname.startsWith(href);
  const close = () => setOpen(false);

  // While the menu is open: Escape closes it and the page behind can't scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* `relative z-30`: the bell dropdown is positioned against the header on phones */}
      <header className="relative z-30 border-b border-violet-100 bg-white/70 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3 md:gap-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-ml-2 rounded-full p-2 text-gray-700 hover:bg-violet-50 hover:text-violet-700 md:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-violet-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-500 text-base">
                💸
              </span>
              SpendWise
            </Link>

            {/* Desktop links */}
            <ul className="hidden gap-1 md:flex">
              {LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive(href)
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <NotificationBell />
            <span className="hidden text-gray-500 lg:inline">{user?.email}</span>
            {/* On phones, Log out lives inside the side menu */}
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="hidden rounded-full p-2 text-gray-600 hover:bg-violet-50 hover:text-violet-700 md:inline-flex"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Side menu. It is a SIBLING of the header, not a child: the header's
          backdrop-blur would otherwise make `fixed` position against the header
          instead of the screen. `invisible` keeps the closed menu out of the tab order. */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${
          open ? "visible" : "invisible"
        }`}
      >
        <div
          onClick={close}
          aria-hidden="true"
          className={`absolute inset-0 bg-violet-950/40 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between bg-linear-to-br from-violet-700 via-violet-600 to-fuchsia-500 p-5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold uppercase">
                {(user?.first_name || user?.email || "?")[0]}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.first_name || "Welcome"}</p>
                <p className="truncate text-xs text-violet-100">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="shrink-0 rounded-full p-2 hover:bg-white/20"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <ul className="flex-1 space-y-1 overflow-y-auto p-3">
            {MENU_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(href)
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-violet-100 p-3">
            <button
              type="button"
              onClick={() => {
                close();
                logout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="h-5 w-5" aria-hidden="true" />
              Log out
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}