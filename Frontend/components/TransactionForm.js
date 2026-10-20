"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import FormField, {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/FormField";
import { applyFieldErrors, getErrorMessage } from "@/lib/errors";
import { todayISO } from "@/lib/format";

// `categories` is the user's full category list (the page already has it).
export default function TransactionForm({ transaction, categories, onSubmit, onCancel }) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: transaction?.amount ?? "",
      category: transaction ? String(transaction.category) : "",
      date: transaction?.date ?? todayISO(),
      description: transaction?.description ?? "",
    },
  });

  // Active categories only, plus the current one when editing: the API lets you
  // edit an old transaction that lives in an archived category, but not add new ones.
  const options = categories.filter(
    (c) => !c.is_archived || c.id === transaction?.category
  );
  const expenseOptions = options.filter((c) => c.type === "expense");
  const incomeOptions = options.filter((c) => c.type === "income");

  const submit = async (values) => {
    setFormError("");
    try {
      await onSubmit({
        amount: values.amount, // stays a string: never float-convert money
        category: Number(values.category),
        date: values.date,
        description: values.description.trim(),
      });
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  const renderOptions = (list) =>
    list.map((c) => (
      <option key={c.id} value={c.id}>
        {c.emoji} {c.name}
      </option>
    ));

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      {options.length === 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          You have no active categories. Create one on the Categories page first.
        </p>
      )}

      <FormField label="Amount" htmlFor="amount" error={errors.amount?.message}>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          placeholder="0.00"
          className={inputClass}
          {...register("amount", {
            required: "Amount is required.",
            pattern: {
              value: /^\d{1,10}(\.\d{1,2})?$/,
              message: "Use a positive amount with up to 2 decimals.",
            },
            validate: (value) => Number(value) > 0 || "Amount must be greater than zero.",
          })}
        />
      </FormField>

      {/* The type (income/expense) comes from the category, so there is no type field */}
      <FormField label="Category" htmlFor="category" error={errors.category?.message}>
        <select
          id="category"
          className={inputClass}
          {...register("category", { required: "Choose a category." })}
        >
          <option value="">Select a category</option>
          {expenseOptions.length > 0 && (
            <optgroup label="Expenses">{renderOptions(expenseOptions)}</optgroup>
          )}
          {incomeOptions.length > 0 && (
            <optgroup label="Income">{renderOptions(incomeOptions)}</optgroup>
          )}
        </select>
      </FormField>

      <FormField label="Date" htmlFor="date" error={errors.date?.message}>
        <input
          id="date"
          type="date"
          className={inputClass}
          {...register("date", { required: "Date is required." })}
        />
      </FormField>

      <FormField
        label="Description (optional)"
        htmlFor="description"
        error={errors.description?.message}
      >
        <input
          id="description"
          className={inputClass}
          {...register("description", {
            maxLength: { value: 255, message: "Use at most 255 characters." },
          })}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving..." : transaction ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}