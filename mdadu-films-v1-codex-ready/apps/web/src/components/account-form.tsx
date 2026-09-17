"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type CurrentUser } from "@/services/api";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui/toast-provider";
type Mode =
  | "login"
  | "signup"
  | "contact"
  | "forgot-password"
  | "reset-password";
type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
};
const fields: Record<Mode, Field[]> = {
  "reset-password": [
    {
      name: "password",
      label: "New password",
      type: "password",
      autoComplete: "new-password",
      minLength: 8,
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: "password",
      autoComplete: "new-password",
      minLength: 8,
    },
  ],
  login: [
    {
      name: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "current-password",
    },
  ],
  signup: [
    { name: "name", label: "Full name", autoComplete: "name" },
    {
      name: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "mobile",
      label: "Mobile number",
      type: "tel",
      autoComplete: "tel",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      minLength: 8,
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: "password",
      autoComplete: "new-password",
      minLength: 8,
    },
  ],
  contact: [
    { name: "name", label: "Your name", autoComplete: "name" },
    {
      name: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
    },
    { name: "subject", label: "Subject" },
    { name: "message", label: "Message", minLength: 10 },
  ],
  "forgot-password": [
    {
      name: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
    },
  ],
};
const labels: Record<Mode, string> = {
  "reset-password": "Reset password",
  login: "Sign in",
  signup: "Create account",
  contact: "Send message",
  "forgot-password": "Request reset link",
};
export function AccountForm({ mode }: { mode: Mode }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (pending) return;
    const next: Record<string, string> = {};
    for (const field of fields[mode]) {
      const value = String(data.get(field.name) ?? "").trim();
      if (!value) next[field.name] = `${field.label} is required.`;
      else if (
        field.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      )
        next[field.name] = "Enter a valid email address.";
      else if (field.type === "tel" && !/^\+?[\d\s()-]{7,20}$/.test(value))
        next[field.name] = "Enter a valid mobile number.";
      else if (field.minLength && value.length < field.minLength)
        next[field.name] = `Use at least ${field.minLength} characters.`;
    }
    if (
      ["signup", "reset-password"].includes(mode) &&
      data.get("password") !== data.get("confirmPassword")
    )
      next.confirmPassword = "Passwords must match.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please check the highlighted fields.");
      const first = event.currentTarget.elements.namedItem(
        Object.keys(next)[0],
      );
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setPending(true);
    setServerError("");
    try {
      const body: Record<string, string | boolean> = Object.fromEntries(
        fields[mode].map((field) => [
          field.name,
          String(data.get(field.name) ?? ""),
        ]),
      );
      if (mode === "login") body.remember = data.get("remember") === "on";
      if (mode === "reset-password")
        body.token =
          new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
      const path =
        mode === "contact"
          ? "/contact"
          : `/auth/${mode === "signup" ? "register" : mode}`;
      const result = await api<CurrentUser & { message?: string }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success(
        mode === "login"
          ? "Login successful."
          : mode === "signup"
            ? "Account created successfully."
            : (result.message ?? "Message sent successfully."),
      );
      form.reset();
      if (["signup", "login"].includes(mode))
        router.push(result.role === "SUPER_ADMIN" ? "/admin" : "/member");
      if (mode === "reset-password") {
        window.history.replaceState(null, "", "/reset-password");
        router.push("/login");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }
  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      {serverError && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
        >
          {serverError}
        </p>
      )}
      {fields[mode].map((field) => (
        <div key={field.name}>
          <label
            htmlFor={`${mode}-${field.name}`}
            className="mb-2 block text-sm font-semibold"
          >
            {field.label}
          </label>
          {field.name === "message" ? (
            <textarea
              id={`${mode}-${field.name}`}
              name={field.name}
              rows={5}
              required
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${mode}-${field.name}-error` : undefined
              }
              className="field resize-y"
            />
          ) : (
            <input
              id={`${mode}-${field.name}`}
              name={field.name}
              type={
                field.type === "password" && showPassword
                  ? "text"
                  : (field.type ?? "text")
              }
              autoComplete={field.autoComplete}
              required
              minLength={field.minLength}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${mode}-${field.name}-error` : undefined
              }
              className="field"
            />
          )}
          {errors[field.name] && (
            <p
              id={`${mode}-${field.name}-error`}
              className="mt-2 text-sm text-red-700"
            >
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      {["login", "signup"].includes(mode) && (
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          Show password
        </label>
      )}
      {mode === "login" && (
        <div className="flex flex-wrap justify-between gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              name="remember"
              type="checkbox"
              className="h-4 w-4 accent-red-600"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-semibold text-[var(--brand-red)]"
          >
            Forgot password?
          </Link>
        </div>
      )}
      <button
        disabled={pending}
        type="submit"
        className="brand-button brand-button-primary mt-2"
      >
        {pending ? "Please wait…" : `${labels[mode]} →`}
      </button>
    </form>
  );
}
