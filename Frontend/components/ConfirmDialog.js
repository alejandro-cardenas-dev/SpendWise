"use client";

import { useState } from "react";

import { dangerButtonClass, secondaryButtonClass } from "@/components/FormField";
import Modal from "@/components/Modal";
import { getErrorMessage } from "@/lib/errors";

// `onConfirm` must return a promise. If it rejects, the API's message is shown
// inside the dialog (for example the 409 "archive it instead").
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm(); // on success the parent unmounts this dialog
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onCancel} title={title} size="max-w-md">
      <p className="text-sm text-gray-600">{message}</p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className={dangerButtonClass}
        >
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}