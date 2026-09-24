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
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[470px] overflow-hidden rounded-[26px] border border-black/5 bg-white p-0 text-[#111] shadow-[0_35px_110px_rgba(0,0,0,.28)] backdrop:bg-black/50 backdrop:backdrop-blur-[4px]"
    >
      <div className="h-1 w-full bg-[var(--brand-red)]" />

      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-xl font-bold ${
              destructive
                ? "border-red-100 bg-red-50 text-[var(--brand-red)]"
                : "border-black/6 bg-[#f7f7f5] text-[#222]"
            }`}
            aria-hidden="true"
          >
            {destructive ? "↗" : "?"}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[.15em] text-[var(--brand-red)]">
              Confirmation
            </p>
            <h2 id={`${id}-title`} className="font-display mt-2 text-[28px] font-semibold leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {description && (
          <p id={`${id}-description`} className="mt-5 text-sm leading-7 text-[#666]">
            {description}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-black/6 pt-5 sm:flex-row sm:justify-end">
          <button
            autoFocus
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="site-button site-button-outline min-w-[110px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`site-button min-w-[120px] disabled:cursor-not-allowed disabled:opacity-60 ${
              destructive
                ? "border border-[#d91f2c] bg-[#d91f2c] text-white shadow-[0_10px_24px_rgba(217,31,44,.18)] hover:bg-[#bd1823]"
                : "site-button-primary"
            }`}
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none" />
                Please wait…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
