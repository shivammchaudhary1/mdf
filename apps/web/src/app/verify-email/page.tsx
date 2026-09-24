"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { api } from "@/services/api";
import { refreshSession } from "@/services/auth-session";

type VerificationState = "checking" | "success" | "error" | "missing";

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>("checking");
  const [message, setMessage] = useState("Verifying your email address…");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

    if (!token) {
      setState("missing");
      setMessage("Open the verification link from your email, or request a new link below.");
      return;
    }

    void api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(async (result) => {
        window.history.replaceState(null, "", "/verify-email");
        await refreshSession().catch(() => undefined);
        setState("success");
        setMessage(result.message);
      })
      .catch((error) => {
        window.history.replaceState(null, "", "/verify-email");
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to verify this email.");
      });
  }, []);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resending) return;

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) return;

    setResending(true);
    setResendMessage("");

    try {
      const result = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendMessage(result.message);
      form.reset();
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Unable to request a new verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] px-5 py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/" aria-label="M. Dadu Films home" className="inline-flex">
          <BrandLogo darkInk className="!w-[132px]" />
        </Link>

        <section className="site-card mt-8 p-7 sm:p-10">
          <p className="site-kicker">Account verification</p>
          <h1 className="font-display mt-3 text-4xl font-semibold">
            {state === "success" ? "Email verified" : "Verify your email"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#666]">{message}</p>

          {state === "success" ? (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/member" className="site-button site-button-primary">
                Go to Dashboard
              </Link>
              <Link href="/" className="site-button site-button-outline">
                Back to Website
              </Link>
            </div>
          ) : (
            <form onSubmit={resend} className="mt-8 border-t border-black/6 pt-7">
              <label className="grid gap-2 text-sm font-semibold">
                Need a new verification link?
                <input
                  className="field"
                  name="email"
                  type="email"
                  placeholder="Enter your registered email"
                  required
                />
              </label>

              <button type="submit" disabled={resending} className="site-button site-button-primary mt-4">
                {resending ? "Sending…" : "Resend Verification Email"}
              </button>

              {resendMessage && <p className="mt-4 text-sm leading-6 text-[#666]">{resendMessage}</p>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
