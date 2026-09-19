"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(focusableSelector);
    window.setTimeout(() => first?.focus(), 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
      );

      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstItem = focusable[0];
      const lastItem = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ad-dialog-layer" role="presentation">
      <button type="button" className="ad-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <section
        ref={dialogRef}
        className={`ad-dialog ${width === "wide" ? "ad-dialog-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="ad-dialog-header">
          <div>
            {eyebrow && <p className="ad-kicker">{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
            {description && <span id={descriptionId}>{description}</span>}
          </div>
          <button type="button" className="ad-dialog-close" onClick={onClose} aria-label="Close dialog">
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
