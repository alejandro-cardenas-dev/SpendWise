"use client";

import { useState } from "react";

import CategoryForm from "@/components/CategoryForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { linkButtonClass, primaryButtonClass } from "@/components/FormField";
import Modal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { useCategories, useCategoryMutations } from "@/hooks/useCategories";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";

const SECTIONS = [
  { type: "expense", title: "Expenses" },
  { type: "income", title: "Income" },
];

function CategoryCard({ category, onEdit, onToggleArchive, onDelete }) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 ${
        category.is_archived ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {category.emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {category.name}
            {category.is_archived && (
              <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-normal text-gray-600">
                Archived
              </span>
            )}
          </p>
          {category.type === "expense" && (
            <p className="text-xs text-gray-500">
              {category.monthly_limit !== null
                ? `Limit ${formatMoney(category.monthly_limit)} / month`
                : "No monthly limit"}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        <button type="button" onClick={onEdit} className={linkButtonClass}>
          Edit
        </button>
        <button type="button" onClick={onToggleArchive} className={linkButtonClass}>
          {category.is_archived ? "Restore" : "Archive"}
        </button>
        <button type="button" onClick={onDelete} className={`${linkButtonClass} text-red-600`}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default function CategoriesPage() {
  const { data: categories = [], isPending, isError, refetch } = useCategories();
  const { create, update, remove } = useCategoryMutations();

  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState(null); // null | { category: null | Category }
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState("");

  // Categories are never paginated, so filtering here is instant (no request)
  const visible = categories.filter((c) => showArchived || !c.is_archived);

  const handleSave = async (payload) => {
    if (modal.category) {
      await update.mutateAsync({ id: modal.category.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    setModal(null);
  };

  const toggleArchive = (category) => {
    setActionError("");
    update.mutate(
      { id: category.id, payload: { is_archived: !category.is_archived } },
      { onError: (error) => setActionError(getErrorMessage(error)) }
    );
  };

  const confirmDelete = async () => {
    await remove.mutateAsync(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />
            Show archived
          </label>
          <button
            type="button"
            onClick={() => setModal({ category: null })}
            className={primaryButtonClass}
          >
            + New category
          </button>
        </div>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {isPending && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="Could not load your categories." onRetry={refetch} />}

      {!isPending && !isError && visible.length === 0 && (
        <EmptyState
          icon="🗂️"
          title="No categories yet"
          description="Create one to start organizing your transactions."
          action={
            <button
              type="button"
              onClick={() => setModal({ category: null })}
              className={primaryButtonClass}
            >
              + New category
            </button>
          }
        />
      )}

      {!isPending &&
        !isError &&
        visible.length > 0 &&
        SECTIONS.map(({ type, title }) => {
          const items = visible.filter((c) => c.type === type);
          return (
            <section key={type} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {title}
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">No {title.toLowerCase()} categories.</p>
              ) : (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {items.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => setModal({ category })}
                      onToggleArchive={() => toggleArchive(category)}
                      onDelete={() => setDeleting(category)}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.category ? "Edit category" : "New category"}
      >
        {modal && (
          <CategoryForm
            category={modal.category ?? undefined}
            onSubmit={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {deleting && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete "${deleting.name}"? This cannot be undone. If it has transactions, archive it instead.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}