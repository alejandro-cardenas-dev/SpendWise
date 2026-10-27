"use client";

import { FiEye, FiEyeOff, FiPlus } from "react-icons/fi";

import { formatMonthLabel } from "@/lib/format";

export default function BalanceCard({ month, balanceText, hidden, onToggleHidden, onAdd }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-700 via-violet-600 to-fuchsia-500 p-6 text-white shadow-xl shadow-violet-300/50">
      {/* Decorative circles */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-violet-100">Balance for {formatMonthLabel(month)}</p>
          <p className="mt-2 truncate text-4xl font-bold tracking-tight">{balanceText}</p>
        </div>
        <button
          type="button"
          onClick={onToggleHidden}
          aria-label={hidden ? "Show amounts" : "Hide amounts"}
          className="shrink-0 rounded-full bg-white/15 p-2 hover:bg-white/25"
        >
          {hidden ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-50"
      >
        <FiPlus className="h-4 w-4" /> Add transaction
      </button>
    </section>
  );
}