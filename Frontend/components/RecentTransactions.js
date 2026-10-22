import CategoryBadge from "@/components/CategoryBadge";
import { formatDate, formatMoney } from "@/lib/format";

export default function RecentTransactions({ transactions }) {
  return (
    <ul className="divide-y divide-gray-100">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-medium">
              {t.description || t.category_detail.name}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <CategoryBadge category={t.category_detail} />
              <span>{formatDate(t.date)}</span>
            </div>
          </div>
          <p
            className={`shrink-0 text-sm font-semibold ${
              t.type === "income" ? "text-emerald-600" : "text-gray-900"
            }`}
          >
            {t.type === "income" ? "+" : "−"}
            {formatMoney(t.amount)}
          </p>
        </li>
      ))}
    </ul>
  );
}