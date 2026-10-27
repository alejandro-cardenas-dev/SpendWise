// The color comes from the category id, so a category always looks the same in
// the donut, badges and lists. No extra API field is needed.
const PALETTE = [
  "#f97316", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#eab308", "#14b8a6",
  "#ef4444", "#6366f1", "#84cc16", "#06b6d4", "#d946ef", "#f59e0b", "#0ea5e9",
];

export const getCategoryColor = (id) => PALETTE[Number(id) % PALETTE.length];

// "#rrggbb" + an alpha byte -> a soft tinted background ("1f" is about 12%)
export const tint = (color, alpha = "1f") => `${color}${alpha}`;