const TONES = {
  income: "bg-emerald-100 text-emerald-600",
  expense: "bg-rose-100 text-rose-600",
  neutral: "bg-violet-100 text-violet-600",
};

// `icon` is a React node, for example <FiArrowDownLeft />
export default function StatCard({ label, value, tone = "neutral", icon }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white/80 p-4 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100 backdrop-blur">
      <span
        aria-hidden="true"
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${TONES[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="truncate text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}