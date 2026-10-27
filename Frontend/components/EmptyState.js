export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">
        {icon}
      </p>
      <h3 className="mt-3 font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}