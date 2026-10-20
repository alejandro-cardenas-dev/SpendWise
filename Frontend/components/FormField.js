// Shared Tailwind classes so every form looks the same
export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export const buttonClass =
  "w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white " +
  "hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

// Non-full-width buttons for modal footers and row actions
const buttonBase =
  "rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClass = `${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700`;
export const dangerButtonClass = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;
export const secondaryButtonClass = `${buttonBase} border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50`;

// Small text-style button for actions inside a list row
export const linkButtonClass =
  "text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline disabled:opacity-50";

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