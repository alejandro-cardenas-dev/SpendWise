import { secondaryButtonClass } from "@/components/FormField";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/format";

export default function MonthPicker({ month, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
        className={secondaryButtonClass}
      >
        ←
      </button>
      <span className="min-w-36 text-center text-sm font-semibold" aria-live="polite">
        {formatMonthLabel(month)}
      </span>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(month, 1))}
        className={secondaryButtonClass}
      >
        →
      </button>
      {month !== currentMonth() && (
        <button
          type="button"
          onClick={() => onChange(currentMonth())}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          This month
        </button>
      )}
    </div>
  );
}