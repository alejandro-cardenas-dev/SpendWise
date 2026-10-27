"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getCategoryColor } from "@/lib/categoryColors";
import { formatMoney } from "@/lib/format";

export default function SpendingDonut({ rows, total }) {
  // Number() is only for drawing; the exact amounts are shown from the API strings
  const data = rows.map((row) => ({
    name: `${row.emoji} ${row.name}`,
    value: Number(row.total),
    color: getCategoryColor(row.category_id),
  }));

  return (
    <div className="grid items-center gap-4 sm:grid-cols-2">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(value)}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">Total spent</span>
          <span className="text-lg font-semibold">{formatMoney(total)}</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {data.map((item, index) => (
          <li key={rows[index].category_id} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 text-gray-600">
              {formatMoney(rows[index].total)}{" "}
              <span className="text-xs text-gray-400">({rows[index].percentage}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}