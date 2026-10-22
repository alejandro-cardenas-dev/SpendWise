"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney, formatMonthShort } from "@/lib/format";

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

export default function TrendChart({ trend }) {
  const data = trend.map((item) => ({
    label: formatMonthShort(item.month),
    income: Number(item.income),
    expenses: Number(item.expenses),
  }));

  if (!data.some((item) => item.income || item.expenses)) {
    return (
      <p className="py-16 text-center text-sm text-gray-500">
        No activity in these 6 months yet.
      </p>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => compact.format(value)}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip formatter={(value) => formatMoney(value)} cursor={{ fill: "#f3f4f6" }} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}