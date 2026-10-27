import { formatRelativeTime } from "@/lib/format";

const ICONS = { warning: "⚠️", limit_reached: "🚨" };

// Clicking an unread notification marks it as read
export default function NotificationItem({ notification, onRead }) {
  const { id, type, message, is_read, created_at } = notification;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (!is_read) onRead(id);
        }}
        className={`flex w-full items-start gap-3 p-3 text-left hover:bg-gray-50 ${
          is_read ? "cursor-default" : "bg-violet-50/60"
        }`}
      >
        <span className="text-xl" aria-hidden="true">
          {ICONS[type] ?? "🔔"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm ${is_read ? "text-gray-600" : "text-gray-900"}`}>
            {message}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {formatRelativeTime(created_at)}
          </span>
        </span>
        {!is_read && (
          <span
            role="img"
            aria-label="Unread"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"
          />
        )}
      </button>
    </li>
  );
}