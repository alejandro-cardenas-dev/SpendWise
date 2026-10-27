"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { linkButtonClass } from "@/components/FormField";
import NotificationItem from "@/components/NotificationItem";
import { Spinner } from "@/components/Spinner";
import {
  useMarkNotificationsRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/useNotifications";

const PREVIEW_COUNT = 8;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: unread = 0 } = useUnreadCount(); // polls every 30 s
  // The list is only fetched while the dropdown is open
  const { data, isPending, isError } = useNotifications({}, { enabled: open });
  const { markRead, markAllRead } = useMarkNotificationsRead();

  // Close on outside click and on Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const items = (data?.results ?? []).slice(0, PREVIEW_COUNT);

  return (
    // On phones the wrapper is NOT positioned, so the dropdown stretches across the
    // navbar (see the header's `relative`); from `sm` up it anchors under the bell.
    <div ref={containerRef} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications, ${unread} unread`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-4 z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-violet-100 sm:inset-x-auto sm:right-0 sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className={linkButtonClass}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isPending && (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            )}
            {isError && (
              <p className="p-4 text-center text-sm text-red-600">
                Could not load notifications.
              </p>
            )}
            {data && items.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">
                You are all caught up 🎉
              </p>
            )}
            {items.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={(id) => markRead.mutate(id)}
                  />
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-gray-100 px-4 py-2.5 text-center text-sm font-medium text-violet-700 hover:bg-gray-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}