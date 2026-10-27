export default function IconButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-full p-2 text-gray-400 transition ${
        danger
          ? "hover:bg-red-50 hover:text-red-600"
          : "hover:bg-violet-50 hover:text-violet-700"
      }`}
    >
      {children}
    </button>
  );
}