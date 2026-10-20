// Shared Tailwind classes so every form looks the same
export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export const buttonClass =
  "w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white " +
  "hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

// Label + input slot + error message
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}