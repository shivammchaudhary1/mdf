"use client";
import { useEffect, useId, useRef } from "react";
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
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    else if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-3xl border-0 bg-white p-6 text-slate-950 shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <h2 id={`${id}-title`} className="font-display text-2xl font-semibold">
        {title}
      </h2>
      {description && (
        <p id={`${id}-description`} className="mt-3 leading-7 text-slate-600">
          {description}
        </p>
      )}
      <div className="mt-7 flex justify-end gap-3">
        <button
          autoFocus
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="brand-button border border-slate-200"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`brand-button text-white ${destructive ? "bg-red-700" : "brand-button-primary"}`}
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
