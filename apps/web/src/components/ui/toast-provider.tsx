"use client";

import { createContext, type CSSProperties, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";
type ToastInput = { title: string; description?: string; variant?: ToastVariant; durationMs?: number };
type ToastItem = ToastInput & { id: number; variant: ToastVariant; durationMs: number };
type ToastContextValue = {
  toast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const copy: Record<ToastVariant, { label: string; symbol: string }> = {
  success: { label: "Success", symbol: "✓" },
  error: { label: "Action failed", symbol: "!" },
  info: { label: "Update", symbol: "i" },
  warning: { label: "Attention", symbol: "!" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", durationMs = 4400 }: ToastInput) => {
      const id = ++idRef.current;
      const safeDuration = Math.max(1400, durationMs);
      setItems((current) => [...current.slice(-3), { id, title, description, variant, durationMs: safeDuration }]);
      const timer = window.setTimeout(() => dismiss(id), safeDuration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error: (title, description) => toast({ title, description, variant: "error", durationMs: 5600 }),
      info: (title, description) => toast({ title, description, variant: "info" }),
      warning: (title, description) => toast({ title, description, variant: "warning", durationMs: 5000 }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="mdadu-toast-region">
        {items.map((item) => (
          <article key={item.id} role={item.variant === "error" ? "alert" : "status"} className={`mdadu-toast mdadu-toast-${item.variant}`}>
            <div className="mdadu-toast-accent" />
            <div className="mdadu-toast-icon" aria-hidden="true">
              {copy[item.variant].symbol}
            </div>
            <div className="mdadu-toast-copy">
              <span>{copy[item.variant].label}</span>
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
              ×
            </button>
            <div
              className="mdadu-toast-progress"
              style={{ "--toast-duration": `${item.durationMs}ms` } as CSSProperties}
              aria-hidden="true"
            />
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
