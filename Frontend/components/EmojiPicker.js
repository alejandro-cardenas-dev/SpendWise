"use client";

import { useState } from "react";

// A curated list is enough for budgeting and needs no extra dependency.
// Backend limit: emoji max_length is 16, so these all fit.
const EMOJIS = [
  "🍔", "🍕", "🍣", "🥗", "☕", "🍺", "🛒", "🥦",
  "🚌", "🚗", "⛽", "✈️", "🚲", "🚕", "🏠", "💡",
  "🔧", "🛋️", "📱", "🌐", "💊", "🏥", "🎬", "🎮",
  "🎵", "🏋️", "🎁", "🛍️", "👕", "📚", "🎓", "💼",
  "💻", "💰", "📈", "💳", "🏦", "🐶", "🐱", "✂️",
  "🧾", "🎉", "✨", "📦", "❤️", "🌴", "🧸", "🎨",
];

export default function EmojiPicker({ id, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
      >
        <span className="text-2xl leading-none">{value}</span>
        <span className="text-gray-500">{open ? "Close" : "Change"}</span>
      </button>

      {/* Inline (not a floating popover) so the modal never clips it */}
      {open && (
        <div className="mt-2 grid grid-cols-8 gap-1 rounded-lg border border-gray-200 bg-white p-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Choose ${emoji}`}
              aria-pressed={emoji === value}
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className={`rounded p-1 text-xl hover:bg-gray-100 ${
                emoji === value ? "bg-emerald-100" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}