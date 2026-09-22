"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

import { GoogleAuthButton } from "@/components/google-auth-button";
import { useToast } from "@/components/ui/toast-provider";
import { api, type CurrentAccount } from "@/services/api";
import { establishSession } from "@/services/auth-session";

type Mode = "login" | "signup" | "contact" | "forgot-password" | "reset-password";

type Field = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
};

const fields: Record<Mode, Field[]> = {
  login: [
    {
      name: "email",
      label: "Email address",
      placeholder: "Enter your email",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      autoComplete: "current-password",
    },
  ],

  signup: [
    {
      name: "name",
      label: "Full name",
      placeholder: "Enter your full name",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email address",
      placeholder: "Enter your email",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "mobile",
      label: "Mobile number",
      placeholder: "Enter your mobile number",
      type: "tel",
      autoComplete: "tel",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Create a password",
      type: "password",
      autoComplete: "new-password",
      minLength: 10,
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      placeholder: "Confirm your password",
      type: "password",
      autoComplete: "new-password",
      minLength: 10,
    },
  ],

  "forgot-password": [
    {
      name: "email",
      label: "Email address",
      placeholder: "Enter your email",
      type: "email",
      autoComplete: "email",
    },
  ],

  "reset-password": [
    {
      name: "password",
      label: "New password",
      placeholder: "Create a new password",
      type: "password",
      autoComplete: "new-password",
      minLength: 10,
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      placeholder: "Confirm your new password",
      type: "password",
      autoComplete: "new-password",
      minLength: 10,
    },
  ],

  contact: [
    {
      name: "name",
      label: "Your name",
      placeholder: "Your name",
    },
    {
      name: "email",
      label: "Email address",
      placeholder: "Your email",
      type: "email",
    },
    {
      name: "subject",
      label: "Subject",
      placeholder: "Subject",
    },
    {
      name: "message",
      label: "Message",
      placeholder: "Message",
      minLength: 10,
    },
  ],
};

const buttonLabels: Record<Mode, string> = {
  login: "Sign In",
  signup: "Create Account",
  "forgot-password": "Send Reset Link",
  "reset-password": "Update Password",
  contact: "Send Message",
};

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5h16v11H4z" />
      <path d="m5 7.5 7 5 7-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function MemberIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 3.5 10 8 7.8 10.2c1.3 2.8 3.2 4.7 6 6l2.2-2.2 4.5 2.5c.3.2.5.6.4 1-.5 2.2-2.4 3.8-4.7 3.8C8.8 21.3 2.7 15.2 2.7 7.8c0-2.3 1.6-4.2 3.8-4.7.4-.1.8.1 1 .4Z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path d="m4 4 16 16" />
          <path d="M10 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.7" />
          <path d="M6.1 7.5C3.8 9.1 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6" />
        </>
      )}
    </svg>
  );
}

function iconFor(field: string): ReactNode {
  if (field === "email") return <MailIcon />;
  if (field === "password" || field === "confirmPassword") {
    return <LockIcon />;
  }
  if (field === "mobile") return <PhoneIcon />;
  return <MemberIcon />;
}

export function AccountForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const toast = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const nextErrors: Record<string, string> = {};

    for (const field of fields[mode]) {
      const value = String(data.get(field.name) ?? "").trim();

      if (!value) {
        nextErrors[field.name] = `${field.label} is required.`;
        continue;
      }

      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nextErrors[field.name] = "Enter a valid email address.";
        continue;
      }

      if (field.type === "tel" && !/^\+?[\d\s()-]{7,20}$/.test(value)) {
        nextErrors[field.name] = "Enter a valid mobile number.";
        continue;
      }

      if (field.minLength && value.length < field.minLength) {
        nextErrors[field.name] = `Use at least ${field.minLength} characters.`;
      }
    }

    if (["signup", "reset-password"].includes(mode) && data.get("password") !== data.get("confirmPassword")) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    if (mode === "signup" && data.get("acceptTerms") !== "on") {
      nextErrors.acceptTerms = "You must accept the Terms & Conditions.";
    }

    if (mode === "signup" && data.get("acceptPrivacy") !== "on") {
      nextErrors.acceptPrivacy = "You must acknowledge the Privacy Policy.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error("Please check the highlighted fields.");

      const firstInvalid = form.elements.namedItem(Object.keys(nextErrors)[0]);

      if (firstInvalid instanceof HTMLElement) {
        firstInvalid.focus();
      }

      return;
    }

    setPending(true);
    setServerError("");

    try {
      const body: Record<string, string | boolean> = Object.fromEntries(
        fields[mode].map((field) => [field.name, String(data.get(field.name) ?? "")]),
      );

      if (mode === "login") {
        body.remember = data.get("remember") === "on";
      }

      if (mode === "signup") {
        body.acceptTerms = data.get("acceptTerms") === "on";
        body.acceptPrivacy = data.get("acceptPrivacy") === "on";
      }

      if (mode === "reset-password") {
        body.token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
      }

      const path = mode === "contact" ? "/contact" : `/auth/${mode === "signup" ? "register" : mode}`;

      const result = await api<CurrentAccount & { message?: string }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (mode === "login" || mode === "signup") {
        await establishSession(result);
      }

      if (mode === "login") {
        toast.success("Login successful.");
      } else if (mode === "signup") {
        toast.success("Account created successfully.");
      } else {
        toast.success(result.message ?? "Request completed successfully.");
      }

      form.reset();

      if (mode === "login" || mode === "signup") {
        router.push(result.role === "SUPER_ADMIN" ? "/admin" : "/member");
      }

      if (mode === "reset-password") {
        window.history.replaceState(null, "", "/reset-password");

        router.push("/login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";

      setServerError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  const showGoogle = mode === "login" || mode === "signup";

  return (
    <form noValidate onSubmit={submit} className="auth-account-form">
      {serverError && (
        <div className="auth-server-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="auth-fields">
        {fields[mode].map((field) => {
          const isPassword = field.type === "password";

          return (
            <div key={field.name} className="auth-field-block">
              <label htmlFor={`${mode}-${field.name}`} className="sr-only">
                {field.label}
              </label>

              <div className={`auth-field-shell ${errors[field.name] ? "auth-field-shell-error" : ""}`}>
                <span className="auth-field-icon">{iconFor(field.name)}</span>

                {field.name === "message" ? (
                  <textarea
                    id={`${mode}-${field.name}`}
                    name={field.name}
                    placeholder={field.placeholder}
                    rows={5}
                    required
                    className="auth-field-input resize-y"
                    aria-invalid={!!errors[field.name]}
                  />
                ) : (
                  <input
                    id={`${mode}-${field.name}`}
                    name={field.name}
                    type={isPassword && showPassword ? "text" : (field.type ?? "text")}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    required
                    minLength={field.minLength}
                    className="auth-field-input"
                    aria-invalid={!!errors[field.name]}
                  />
                )}

                {isPassword && (
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                )}
              </div>

              {errors[field.name] && <p className="auth-field-error">{errors[field.name]}</p>}
            </div>
          );
        })}
      </div>

      {mode === "login" && (
        <div className="auth-login-options">
          <label className="auth-remember">
            <input type="checkbox" name="remember" defaultChecked />

            <span>Remember me</span>
          </label>

          <Link href="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>
      )}

      {mode === "signup" && (
        <div className="grid gap-3 text-xs leading-5 text-[#666]">
          <label className="flex items-start gap-2">
            <input className="mt-1" type="checkbox" name="acceptTerms" required />
            <span>
              I agree to the{" "}
              <Link className="font-semibold underline" href="/terms" target="_blank">
                Terms & Conditions
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && <p className="auth-field-error">{errors.acceptTerms}</p>}
          <label className="flex items-start gap-2">
            <input className="mt-1" type="checkbox" name="acceptPrivacy" required />
            <span>
              I acknowledge the{" "}
              <Link className="font-semibold underline" href="/privacy" target="_blank">
                Privacy Policy
              </Link>
              , including how profile, application and account information is handled.
            </span>
          </label>
          {errors.acceptPrivacy && <p className="auth-field-error">{errors.acceptPrivacy}</p>}
          <p>
            Public talent visibility is off by default for newly created profiles. You can enable it later in Member Settings; when enabled,
            approved profile fields and portfolio media may be visible to website visitors and casting teams.
          </p>
        </div>
      )}

      <button type="submit" disabled={pending} className="auth-submit">
        <span>{pending ? "Please wait..." : buttonLabels[mode]}</span>

        {!pending && (
          <span aria-hidden="true" className="auth-submit-arrow">
            →
          </span>
        )}
      </button>

      {showGoogle && (
        <>
          <div className="auth-divider">
            <span />

            <p>{mode === "login" ? "or continue with" : "or sign up with"}</p>

            <span />
          </div>

          <GoogleAuthButton mode={mode === "signup" ? "signup" : "login"} />
        </>
      )}
    </form>
  );
}
