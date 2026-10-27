import { getCategoryColor, tint } from "@/lib/categoryColors";

// Emoji in a tinted rounded square. `category` only needs `id` and `emoji`.
export default function CategoryIcon({ category, size = "h-11 w-11 text-xl" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-2xl ${size}`}
      style={{ backgroundColor: tint(getCategoryColor(category.id)) }}
    >
      {category.emoji}
    </span>
  );
}