"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatMoney } from "@/lib/format";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export default function SpendingDonut({ rows, total }) {
  // Number() is only for drawing; the exact amounts are shown from the API strings
  const data = rows.map((row) => ({
    name: `${row.emoji} ${row.name}`,
    value: Number(row.total),
  }));

  return (
    <div className="grid items-center gap-4 sm:grid-cols-2">
      <div className="relative h-56">
        {/* ResponsiveContainer fills its parent, so the parent needs a fixed height */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(value)} />
          </PieChart>
        </ResponsiveContainer>

        {/* The hole of the donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">Total spent</span>
          <span className="text-lg font-semibold">{formatMoney(total)}</span>
        </div>
      </div>

      {/* A plain-HTML legend: readable by screen readers and easy to style */}
      <ul className="space-y-2 text-sm">
        {rows.map((row, index) => (
          <li key={row.category_id} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">
                {row.emoji} {row.name}
              </span>
            </span>
            <span className="shrink-0 text-gray-600">
              {formatMoney(row.total)}{" "}
              <span className="text-xs text-gray-400">({row.percentage}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}