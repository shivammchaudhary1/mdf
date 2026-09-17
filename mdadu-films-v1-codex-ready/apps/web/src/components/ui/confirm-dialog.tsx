"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !loading) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-2xl font-semibold text-slate-950"
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="brand-button min-h-10 border border-slate-200 bg-white px-4 text-sm text-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`brand-button min-h-10 px-4 text-sm text-white disabled:opacity-50 ${
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "brand-button-primary"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
