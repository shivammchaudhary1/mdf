"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

export function AdminDialog({
  open,
  title,
  eyebrow,
  description,
  children,
  onClose,
  width = "normal",
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  width?: "normal" | "wide";
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ad-dialog-layer" role="presentation">
      <button type="button" className="ad-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <section className={`ad-dialog ${width === "wide" ? "ad-dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="ad-dialog-header">
          <div>
            {eyebrow && <p className="ad-kicker">{eyebrow}</p>}
            <h2>{title}</h2>
            {description && <span>{description}</span>}
          </div>
          <button type="button" className="ad-dialog-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="ad-dialog-body">{children}</div>
      </section>
    </div>
  );
}

export function AdminDialogForm({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}) {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    pending.current = true;
    setBusy(true);
    const buttons = Array.from(form.querySelectorAll("button"));
    const disabled = buttons.map((button) => button.disabled);
    try {
      const result = onSubmit(event);
      buttons.forEach((button) => {
        button.disabled = true;
      });
      await result;
    } finally {
      buttons.forEach((button, index) => {
        button.disabled = disabled[index];
      });
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="ad-dialog-form" onSubmit={submit} aria-busy={busy}>
      {children}
    </form>
  );
}

export function AdminDialogGrid({ children }: { children: ReactNode }) {
  return <div className="ad-dialog-grid">{children}</div>;
}

export function AdminFormField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`ad-dialog-field ${wide ? "ad-dialog-field-wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function AdminDialogActions({
  onCancel,
  primaryLabel,
  secondaryLabel,
  primaryType = "submit",
  onSecondary,
  onPrimary,
}: {
  onCancel: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryType?: "button" | "submit";
  onSecondary?: () => void;
  onPrimary?: () => void;
}) {
  return (
    <div className="ad-dialog-actions">
      <button type="button" className="ad-dialog-cancel" onClick={onCancel}>
        Cancel
      </button>
      {secondaryLabel && (
        <button type="button" className="ad-dialog-secondary" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
      <button type={primaryType} className="ad-dialog-primary" onClick={onPrimary}>
        {primaryLabel}
      </button>
    </div>
  );
}
