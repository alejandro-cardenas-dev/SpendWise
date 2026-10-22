const TONES = {
  neutral: "text-gray-900",
  positive: "text-emerald-600",
  negative: "text-red-600",
};

export default function StatCard({ label, value, tone = "neutral", icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <span aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${TONES[tone]}`}>{value}</p>
    </div>
  );
}