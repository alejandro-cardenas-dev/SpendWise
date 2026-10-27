"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";

import BalanceCard from "@/components/BalanceCard";
import BudgetProgress from "@/components/BudgetProgress";
import Card from "@/components/Card";
import ErrorState from "@/components/ErrorState";
import Modal from "@/components/Modal";
import MonthPicker from "@/components/MonthPicker";
import RecentTransactions from "@/components/RecentTransactions";
import { Spinner } from "@/components/Spinner";
import SpendingDonut from "@/components/SpendingDonut";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TrendChart from "@/components/TrendChart";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useDashboard } from "@/hooks/useDashboard";
import { useTransactionMutations } from "@/hooks/useTransactions";
import { currentMonth, formatMoney } from "@/lib/format";

const linkClass = "text-sm font-medium text-violet-700 hover:underline";

const Empty = ({ children }) => (
  <p className="py-10 text-center text-sm text-gray-500">{children}</p>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth);
  const [hidden, setHidden] = useState(false); // privacy: mask all amounts
  const [adding, setAdding] = useState(false);

  const { data, isPending, isError, isPlaceholderData, refetch } = useDashboard(month);
  const { data: categories = [] } = useCategories();
  const { create } = useTransactionMutations(); // also refreshes the dashboard

  const name = user?.first_name || user?.email?.split("@")[0] || "there";
  const show = (value) => (hidden ? "••••••" : formatMoney(value));

  const handleAdd = async (payload) => {
    await create.mutateAsync(payload);
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-lg font-bold uppercase text-white">
            {name[0]}
          </span>
          <div>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h1 className="text-xl font-bold">{name}</h1>
          </div>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {isPending && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="Could not load the dashboard." onRetry={refetch} />}

      {data && (
        <div className={`space-y-6 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          <BalanceCard
            month={month}
            balanceText={show(data.summary.balance)}
            hidden={hidden}
            onToggleHidden={() => setHidden((current) => !current)}
            onAdd={() => setAdding(true)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Income"
              value={show(data.summary.total_income)}
              tone="income"
              icon={<FiArrowDownLeft />}
            />
            <StatCard
              label="Expenses"
              value={show(data.summary.total_expenses)}
              tone="expense"
              icon={<FiArrowUpRight />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Spending by category">
              {data.spending_by_category.length === 0 ? (
                <Empty>No expenses in this month.</Empty>
              ) : (
                <SpendingDonut
                  rows={data.spending_by_category}
                  total={hidden ? 0 : data.summary.total_expenses}
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

      <Modal open={adding} onClose={() => setAdding(false)} title="Add transaction">
        {adding && (
          <TransactionForm
            categories={categories}
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
          />
        )}
      </Modal>
    </div>
  );
}