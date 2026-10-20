"use client";

import { useQuery } from "@tanstack/react-query";

import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const month = currentMonth();

  // Proves the whole chain works: token header, interceptor, backend, cache
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () =>
      api.get("/dashboard/", { params: { month } }).then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome{user?.first_name ? `, ${user.first_name}` : ""} 👋
      </h1>

      {isPending && <Spinner />}
      {isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Could not load the dashboard.
        </p>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Income", data.summary.total_income],
            ["Expenses", data.summary.total_expenses],
            ["Balance", data.summary.balance],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">{label} ({month})</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}