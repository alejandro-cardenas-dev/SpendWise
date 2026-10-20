// Works with a full category or the compact `category_detail` the API embeds
export default function CategoryBadge({ category }) {
  const tone =
    category.type === "income"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      <span aria-hidden="true">{category.emoji}</span>
      {category.name}
    </span>
  );
}