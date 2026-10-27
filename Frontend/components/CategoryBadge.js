import { getCategoryColor, tint } from "@/lib/categoryColors";

// Works with a full category or the compact `category_detail` the API embeds.
// `showEmoji={false}` is for rows that already show a CategoryIcon.
export default function CategoryBadge({ category, showEmoji = true }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-slate-700"
      style={{ backgroundColor: tint(getCategoryColor(category.id), "26") }}
    >
      {showEmoji && <span aria-hidden="true">{category.emoji}</span>}
      {category.name}
    </span>
  );
}