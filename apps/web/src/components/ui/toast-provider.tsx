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
const accents: Record<ToastVariant, string> = {
  success: "text-emerald-600 bg-emerald-50",
  error: "text-red-600 bg-red-50",
  info: "text-blue-600 bg-blue-50",
  warning: "text-amber-600 bg-amber-50",
};
const progress: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};
const symbols: Record<ToastVariant, string> = { success: "✓", error: "!", info: "i", warning: "!" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const toast = useCallback(
    ({ title, description, variant = "info", durationMs = 4200 }: ToastInput) => {
      const id = ++idRef.current;
      const safeDuration = Math.max(1200, durationMs);
      setItems((current) => [...current.slice(-3), { id, title, description, variant, durationMs: safeDuration }]);
      window.setTimeout(() => dismiss(id), safeDuration);
    },
    [dismiss],
  );
  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error: (title, description) => toast({ title, description, variant: "error", durationMs: 5200 }),
      info: (title, description) => toast({ title, description, variant: "info" }),
      warning: (title, description) => toast({ title, description, variant: "warning" }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-3 top-3 z-[120] flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:top-5 sm:w-[410px]"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_20px_60px_rgba(0,0,0,.14)]"
          >
            <div className="flex items-start gap-3.5 p-4">
              <span
                aria-hidden="true"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${accents[item.variant]}`}
              >
                {symbols[item.variant]}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-bold text-slate-950">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="grid h-8 w-8 place-items-center rounded-full text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            <span
              className={`mdadu-toast-progress absolute inset-x-0 bottom-0 h-[3px] origin-left ${progress[item.variant]}`}
              style={{ "--toast-duration": `${item.durationMs}ms` } as CSSProperties}
            />
          </div>
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
