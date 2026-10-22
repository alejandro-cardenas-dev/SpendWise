"use client";

import { useState } from "react";
import Link from "next/link";

import BudgetProgress from "@/components/BudgetProgress";
import Card from "@/components/Card";
import ErrorState from "@/components/ErrorState";
import MonthPicker from "@/components/MonthPicker";
import RecentTransactions from "@/components/RecentTransactions";
import { Spinner } from "@/components/Spinner";
import SpendingDonut from "@/components/SpendingDonut";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { currentMonth, formatMoney } from "@/lib/format";

const linkClass = "text-sm font-medium text-emerald-700 hover:underline";

const Empty = ({ children }) => (
  <p className="py-10 text-center text-sm text-gray-500">{children}</p>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth);
  const { data, isPending, isError, isPlaceholderData, refetch } = useDashboard(month);

  const balance = data ? Number(data.summary.balance) : 0;
  const balanceTone = balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {user?.first_name ? `Hi ${user.first_name}, here` : "Here"} is your month at a glance.
          </p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {isPending && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <ErrorState message="Could not load the dashboard." onRetry={refetch} />
      )}

      {data && (
        <div
          className={`space-y-6 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon="📥"
              label="Income"
              value={formatMoney(data.summary.total_income)}
              tone="positive"
            />
            <StatCard
              icon="📤"
              label="Expenses"
              value={formatMoney(data.summary.total_expenses)}
            />
            <StatCard
              icon="⚖️"
              label="Balance"
              value={formatMoney(data.summary.balance)}
              tone={balanceTone}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Spending by category">
              {data.spending_by_category.length === 0 ? (
                <Empty>No expenses in this month.</Empty>
              ) : (
                <SpendingDonut
                  rows={data.spending_by_category}
                  total={data.summary.total_expenses}
                />
              )}
            </Card>

            <Card title="Last 6 months">
              <TrendChart trend={data.monthly_trend} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Budgets"
              action={
                <Link href="/categories" className={linkClass}>
                  Manage
                </Link>
              }
            >
              {data.budgets.length === 0 ? (
                <Empty>
                  No budgets yet. Set a monthly limit on an expense category to track it here.
                </Empty>
              ) : (
                <ul className="space-y-5">
                  {data.budgets.map((budget) => (
                    <BudgetProgress key={budget.category_id} budget={budget} />
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Latest transactions"
              action={
                <Link href="/transactions" className={linkClass}>
                  View all
                </Link>
              }
            >
              {data.recent_transactions.length === 0 ? (
                <Empty>No transactions in this month.</Empty>
              ) : (
                <RecentTransactions transactions={data.recent_transactions} />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}