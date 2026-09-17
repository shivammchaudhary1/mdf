"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-white text-slate-900",
  error: "border-red-200 bg-white text-slate-900",
  info: "border-blue-200 bg-white text-slate-900",
  warning: "border-amber-200 bg-white text-slate-900",
};

const dotClasses: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      durationMs = 4000,
    }: ToastInput) => {
      const id = ++idRef.current;
      setItems((current) => [
        ...current,
        { id, title, description, variant, durationMs },
      ]);

      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) =>
        toast({ title, description, variant: "success" }),
      error: (title, description) =>
        toast({ title, description, variant: "error" }),
      info: (title, description) =>
        toast({ title, description, variant: "info" }),
      warning: (title, description) =>
        toast({ title, description, variant: "warning" }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[390px]"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className={`pointer-events-auto w-full rounded-2xl border p-4 shadow-xl shadow-black/10 ${variantClasses[item.variant]}`}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotClasses[item.variant]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
