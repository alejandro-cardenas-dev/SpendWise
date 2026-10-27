// Shared Tailwind classes so every form looks the same
export const inputClass =
  "w-full rounded-xl border border-violet-100 bg-white/90 px-3.5 py-2.5 text-sm shadow-sm " +
  "placeholder:text-gray-400 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100";

export const buttonClass =
  "w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md " +
  "shadow-violet-300/50 transition hover:bg-violet-700 active:scale-[0.99] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Label + input slot + error message
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
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

// Non-full-width buttons for modal footers and row actions
const buttonBase =
  "rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClass = `${buttonBase} bg-violet-600 text-white shadow-sm hover:bg-violet-700`;
export const dangerButtonClass = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;
export const secondaryButtonClass = `${buttonBase} border border-violet-200 bg-white font-medium text-violet-700 hover:bg-violet-50`;

// Small text-style button for actions inside a list row
export const linkButtonClass =
  "text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline disabled:opacity-50";