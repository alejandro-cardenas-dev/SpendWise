import { secondaryButtonClass } from "@/components/FormField";

export default function ErrorState({
  message = "Could not load the data.",
  onRetry,
}) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${secondaryButtonClass} mt-3`}>
          Try again
        </button>
      )}
    </div>
  );
}