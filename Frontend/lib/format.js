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