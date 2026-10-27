export default function Card({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl bg-white/80 p-5 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100 backdrop-blur ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}