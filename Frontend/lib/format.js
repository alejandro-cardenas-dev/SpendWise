const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// The API sends money as strings ("25.50"). Number() is used ONLY to display it,
// never to calculate with it and never to send it back.
export const formatMoney = (value) => money.format(Number(value));

const pad = (n) => String(n).padStart(2, "0");

// "2026-01-15" -> a Date at LOCAL midnight.
// new Date("2026-01-15") would be UTC midnight, which is still Jan 14 in Colombia.
export function parseISODate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const formatDate = (iso) =>
  parseISODate(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Today's date in the user's LOCAL timezone, as "YYYY-MM-DD"
// (toISOString() would give the UTC date, which is tomorrow after 7 pm in Cali).
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const currentMonth = () => todayISO().slice(0, 7); // "YYYY-MM"

// "2026-10" -> "October 2026"
export const formatMonthLabel = (month) =>
  parseISODate(`${month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

// "2026-10" -> "Oct 26" (short label for chart axes)
export const formatMonthShort = (month) =>
  parseISODate(`${month}-01`).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

// shiftMonth("2026-01", -1) -> "2025-12"
export function shiftMonth(month, delta) {
  const [year, number] = month.split("-").map(Number);
  const index = year * 12 + (number - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

// ISO datetime from the API -> "5 minutes ago", "yesterday", or a date after a week
export function formatRelativeTime(isoDateTime) {
  const date = new Date(isoDateTime);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const days = Math.abs(seconds) / 86400;
  if (days >= 7) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}