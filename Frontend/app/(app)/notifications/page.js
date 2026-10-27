"use client";

import { useEffect, useState } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { secondaryButtonClass } from "@/components/FormField";
import NotificationItem from "@/components/NotificationItem";
import Pagination from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import {
  useMarkNotificationsRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/useNotifications";

const PAGE_SIZE = 20; // must match PAGE_SIZE in the backend settings
const TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const params = { page, ...(tab === "unread" && { is_read: "false" }) };
  const { data, isPending, isError, error, isPlaceholderData, refetch } =
    useNotifications(params);
  const { data: unread = 0 } = useUnreadCount();
  const { markRead, markAllRead } = useMarkNotificationsRead();

  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  // On the "Unread" tab, reading the last item of the last page leaves that page
  // empty and the API answers 404. Step back one page when that happens.
  useEffect(() => {
    if (isError && error?.response?.status === 404 && page > 1) {
      setPage((current) => current - 1);
    }
  }, [isError, error, page]);

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={unread === 0 || markAllRead.isPending}
          className={secondaryButtonClass}
        >
          Mark all as read
        </button>
      </div>

      <div role="tablist" className="flex gap-2">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => changeTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === value
                ? "bg-violet-600 text-white"
                : "bg-white text-gray-600 ring-1 ring-violet-100 hover:bg-gray-50"
            }`}
          >
            {label}
            {value === "unread" && unread > 0 && ` (${unread})`}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && error?.response?.status !== 404 && (
        <ErrorState message="Could not load your notifications." onRetry={refetch} />
      )}

      {data && results.length === 0 && (
        <EmptyState
          icon="🔔"
          title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
          description={
            tab === "unread"
              ? "You are all caught up."
              : "You will be notified when a category reaches 80% and 100% of its monthly limit."
          }
        />
      )}

      {results.length > 0 && (
        <>
          <ul
            className={`divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-violet-100 transition-opacity ${
              isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {results.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markRead.mutate(id)}
              />
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}