export default function Card({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}