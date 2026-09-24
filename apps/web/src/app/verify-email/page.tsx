"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { api } from "@/services/api";
import { refreshSession } from "@/services/auth-session";

type VerificationState = "checking" | "success" | "error" | "missing";

function StatusMark({ state }: { state: VerificationState }) {
  if (state === "checking") {
    return (
      <div
        className="h-14 w-14 animate-spin rounded-full border-[3px] border-[#ececea] border-t-[var(--brand-red)] motion-reduce:animate-none"
        aria-hidden="true"
      />
    );
  }

  const success = state === "success";

  return (
    <div
      className={`grid h-14 w-14 place-items-center rounded-full border text-2xl font-bold ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-[var(--brand-red)]"
      }`}
      aria-hidden="true"
    >
      {success ? "✓" : "!"}
    </div>
  );
}

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>("checking");
  const [message, setMessage] = useState("Securely confirming your email address…");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

    if (!token) {
      setState("missing");
      setMessage("This page needs a verification link from your email. You can request a fresh link below.");
      return;
    }

    void api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((result) => {
        window.history.replaceState(null, "", "/verify-email");
        setState("success");
        setMessage(result.message);
        void refreshSession().catch(() => undefined);
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

  const title =
    state === "success"
      ? "Email verified"
      : state === "checking"
        ? "Verifying your email"
        : "Verification link needs attention";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f5] px-5 py-8 sm:py-12">
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[rgba(234,47,60,.08)] blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-4 h-72 w-72 rounded-full bg-[rgba(200,163,106,.12)] blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="M. Dadu Films home" className="inline-flex">
            <BrandLogo darkInk className="!w-[132px]" />
          </Link>
          <span className="rounded-full border border-black/7 bg-white/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#777] shadow-sm">
            Secure account
          </span>
        </header>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_30px_90px_rgba(0,0,0,.08)] lg:grid lg:min-h-[500px] lg:grid-cols-[.88fr_1.12fr]">
          <aside className="relative overflow-hidden bg-[#0b0b0b] p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(234,47,60,.2)] blur-2xl" />
            <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-[rgba(200,163,106,.15)] blur-3xl" />

            <div className="relative flex h-full flex-col">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#ea2f3c]">M. Dadu Films Community</p>
              <h2 className="font-display mt-5 max-w-sm text-4xl font-semibold leading-[1.05] sm:text-5xl">
                One quick step before your profile goes live.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                Email verification protects your account and confirms that opportunities and important account messages reach the right person.
              </p>

              <div className="mt-10 grid gap-4 text-xs text-white/65 lg:mt-auto">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-[10px] font-bold text-white">1</span>
                  Create your member account
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[rgba(234,47,60,.45)] bg-[rgba(234,47,60,.12)] text-[10px] font-bold text-[#ff7a83]">2</span>
                  Verify your email address
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-[10px] font-bold text-white">3</span>
                  Continue to your dashboard
                </div>
              </div>
            </div>
          </aside>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
            <StatusMark state={state} />

            <p className="site-kicker mt-7">Account verification</p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-.02em] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6b6b6b]">{message}</p>

            {state === "checking" && (
              <p className="mt-7 text-xs font-semibold text-[#999]">This normally takes only a moment.</p>
            )}

            {state === "success" && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/member" className="site-button site-button-primary">
                  Go to Dashboard →
                </Link>
                <Link href="/" className="site-button site-button-outline">
                  Back to Website
                </Link>
              </div>
            )}

            {(state === "error" || state === "missing") && (
              <form onSubmit={resend} className="mt-8 border-t border-black/6 pt-7">
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#555]">
                  Registered email
                  <input
                    className="field normal-case tracking-normal"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={resending} className="site-button site-button-primary">
                    {resending ? "Sending…" : "Send New Verification Link"}
                  </button>
                  <Link href="/login" className="site-button site-button-outline">
                    Back to Login
                  </Link>
                </div>

                {resendMessage && (
                  <p className="mt-4 rounded-xl border border-black/6 bg-[#fafaf8] px-4 py-3 text-xs leading-6 text-[#666]">
                    {resendMessage}
                  </p>
                )}
              </form>
            )}

            <div className="mt-9 border-t border-black/6 pt-5 text-[11px] leading-6 text-[#999]">
              Verification links are single-use. If your link has expired, request a new one using the same registered email address.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
