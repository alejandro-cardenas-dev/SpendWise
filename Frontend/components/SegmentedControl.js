export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-flow-col gap-1 rounded-xl bg-violet-50 p-1"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:text-violet-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}