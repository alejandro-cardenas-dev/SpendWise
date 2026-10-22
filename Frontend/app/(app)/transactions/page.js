"use client";

import { useMemo, useState } from "react";

import CategoryBadge from "@/components/CategoryBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import {
  inputClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/FormField";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import TransactionForm from "@/components/TransactionForm";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTransactionMutations, useTransactions } from "@/hooks/useTransactions";
import { formatDate, formatMoney } from "@/lib/format";

const PAGE_SIZE = 20; // must match PAGE_SIZE in the backend settings
const EMPTY_FILTERS = {
  search: "",
  type: "",
  category: "",
  date_from: "",
  date_to: "",
  ordering: "-date",
};

function Filter({ label, htmlFor, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { transaction: null | Transaction }
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const { data: categories = [], isPending: categoriesPending } = useCategories();
  const { create, update, remove } = useTransactionMutations();

  // Only send the filters that have a value; this object is also the cache key
  const params = useMemo(() => {
    const all = { ...filters, search: debouncedSearch, page };
    return Object.fromEntries(Object.entries(all).filter(([, value]) => value !== ""));
  }, [filters, debouncedSearch, page]);

  const { data, isPending, isError, isPlaceholderData, refetch } = useTransactions(params);
  const transactions = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasFilters = Object.entries(filters).some(
    ([key, value]) => value !== EMPTY_FILTERS[key]
  );

  // Any filter change goes back to page 1; otherwise page 4 of a 1-page result is a 404
  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleSave = async (payload) => {
    if (modal.transaction) {
      await update.mutateAsync({ id: modal.transaction.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    setModal(null);
  };

  const confirmDelete = async () => {
    await remove.mutateAsync(deleting.id);
    // Deleted the only row on the last page: step back instead of showing an invalid page
    if (transactions.length === 1 && page > 1) setPage(page - 1);
    setDeleting(null);
  };

  const addButton = (
    <button
      type="button"
      disabled={categoriesPending}
      onClick={() => setModal({ transaction: null })}
      className={primaryButtonClass}
    >
      + Add transaction
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          {data && (
            <p className="text-sm text-gray-500">
              {total} {total === 1 ? "transaction" : "transactions"}
            </p>
          )}
        </div>
        {addButton}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Search" htmlFor="f-search" className="lg:col-span-2">
          <input
            id="f-search"
            type="search"
            placeholder="Description or category..."
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            className={inputClass}
          />
        </Filter>
        <Filter label="Type" htmlFor="f-type">
          <select
            id="f-type"
            value={filters.type}
            onChange={(event) => setFilter("type", event.target.value)}
            className={inputClass}
          >
            <option value="">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </Filter>
        <Filter label="Category" htmlFor="f-category">
          <select
            id="f-category"
            value={filters.category}
            onChange={(event) => setFilter("category", event.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </Filter>
        <Filter label="From" htmlFor="f-from">
          <input
            id="f-from"
            type="date"
            value={filters.date_from}
            onChange={(event) => setFilter("date_from", event.target.value)}
            className={inputClass}
          />
        </Filter>
        <Filter label="To" htmlFor="f-to">
          <input
            id="f-to"
            type="date"
            value={filters.date_to}
            onChange={(event) => setFilter("date_to", event.target.value)}
            className={inputClass}
          />
        </Filter>
        <Filter label="Sort by" htmlFor="f-ordering">
          <select
            id="f-ordering"
            value={filters.ordering}
            onChange={(event) => setFilter("ordering", event.target.value)}
            className={inputClass}
          >
            <option value="-date">Newest first</option>
            <option value="date">Oldest first</option>
            <option value="-amount">Highest amount</option>
            <option value="amount">Lowest amount</option>
          </select>
        </Filter>
        {hasFilters && (
          <div className="flex items-end">
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {isPending && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="Could not load your transactions." onRetry={refetch} />}

      {data && transactions.length === 0 && (
        <EmptyState
          icon={hasFilters ? "🔍" : "🧾"}
          title={hasFilters ? "No matching transactions" : "No transactions yet"}
          description={
            hasFilters
              ? "Try changing or clearing the filters."
              : "Add your first income or expense to get started."
          }
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                Clear filters
              </button>
            ) : (
              addButton
            )
          }
        />
      )}

      {transactions.length > 0 && (
        <>
          <ul
            className={`divide-y divide-gray-100 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-opacity ${
              isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">
                    {t.description || t.category_detail.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <CategoryBadge category={t.category_detail} />
                    <span>{formatDate(t.date)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p
                    className={`font-semibold ${
                      t.type === "income" ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatMoney(t.amount)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModal({ transaction: t })}
                      className={linkButtonClass}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(t)}
                      className={`${linkButtonClass} text-red-600`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.transaction ? "Edit transaction" : "Add transaction"}
      >
        {modal && (
          <TransactionForm
            transaction={modal.transaction ?? undefined}
            categories={categories}
            onSubmit={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {deleting && (
        <ConfirmDialog
          title="Delete transaction"
          message={`Delete the ${formatMoney(deleting.amount)} transaction from ${formatDate(
            deleting.date
          )}? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}