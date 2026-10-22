"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    // `relative z-30`: the bell dropdown is positioned against the header on phones
    // and must paint above the page content
    <header className="relative z-30 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
            💸 SpendWise
          </Link>
          <ul className="flex gap-4 text-sm">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    pathname.startsWith(href)
                      ? "font-semibold text-emerald-700"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <NotificationBell />
          <span className="hidden text-gray-500 sm:inline">{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}