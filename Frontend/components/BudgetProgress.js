import { formatMoney } from "@/lib/format";

// Keep full class names in the source so Tailwind can detect them
const STYLES = {
  ok: { bar: "bg-emerald-500", text: "text-emerald-700" },
  warning: { bar: "bg-amber-400", text: "text-amber-700" },
  over: { bar: "bg-red-500", text: "text-red-700" },
};

export default function BudgetProgress({ budget }) {
  const percentage = Number(budget.percentage); // can be above 100
  const style = STYLES[budget.status];

  return (
    <li>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">
          {budget.emoji} {budget.name}
        </span>
        <span className={`shrink-0 text-xs font-semibold ${style.text}`}>
          {budget.percentage}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`${budget.name} budget`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.round(percentage), 100)}
        className="h-2.5 overflow-hidden rounded-full bg-gray-100"
      >
        {/* The bar stops at 100%, the text keeps showing the real number */}
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {formatMoney(budget.spent)} of {formatMoney(budget.limit)}
        {budget.status === "over" && " · over budget"}
      </p>
    </li>
  );
}