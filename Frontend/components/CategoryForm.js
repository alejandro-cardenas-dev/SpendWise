"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import EmojiPicker from "@/components/EmojiPicker";
import FormField, {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/FormField";
import { applyFieldErrors, getErrorMessage } from "@/lib/errors";

// Create when `category` is undefined, edit otherwise.
// `onSubmit(payload)` must return a promise; if it rejects, the API errors are
// shown under the matching fields.
export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: category?.name ?? "",
      emoji: category?.emoji ?? "📦",
      type: category?.type ?? "expense",
      monthly_limit: category?.monthly_limit ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });

  const submit = async (values) => {
    setFormError("");
    try {
      await onSubmit({
        name: values.name.trim(),
        emoji: values.emoji,
        type: values.type,
        // Only expense categories may have a limit; "" means "no limit"
        monthly_limit:
          values.type === "expense" && values.monthly_limit !== ""
            ? values.monthly_limit
            : null,
      });
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          className={inputClass}
          {...register("name", {
            required: "Name is required.",
            maxLength: { value: 60, message: "Use at most 60 characters." },
            validate: (value) => value.trim() !== "" || "Name is required.",
          })}
        />
      </FormField>

      <FormField label="Emoji" htmlFor="emoji" error={errors.emoji?.message}>
        <Controller
          name="emoji"
          control={control}
          render={({ field }) => (
            <EmojiPicker id="emoji" value={field.value} onChange={field.onChange} />
          )}
        />
      </FormField>

      <FormField label="Type" htmlFor="type" error={errors.type?.message}>
        <select id="type" className={inputClass} {...register("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </FormField>

      {type === "expense" && (
        <FormField
          label="Monthly limit (optional)"
          htmlFor="monthly_limit"
          error={errors.monthly_limit?.message}
        >
          <input
            id="monthly_limit"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 300.00"
            className={inputClass}
            {...register("monthly_limit", {
              pattern: {
                value: /^\d{1,10}(\.\d{1,2})?$/,
                message: "Use a positive amount with up to 2 decimals.",
              },
            })}
          />
          <p className="text-xs text-gray-500">
            You will be notified at 80% and 100% of this amount each month.
          </p>
        </FormField>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving..." : category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}