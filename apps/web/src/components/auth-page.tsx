import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AccountForm } from "@/components/account-form";
import { placeholderHomeContent } from "@/content/placeholders/home";
export function AuthPage({
  mode,
}: {
  mode: "login" | "signup" | "forgot-password" | "reset-password";
}) {
  return (
    <main
      id="main-content"
      className="grid min-h-screen bg-white lg:grid-cols-2"
    >
      <section className="hidden bg-[#0b0b0f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="Home">
          <BrandLogo />
        </Link>
        <div>
          <p className="font-display text-6xl leading-tight">
            {placeholderHomeContent.titleLineOne}
            <br />
            {placeholderHomeContent.titleLineTwo}
          </p>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
            {placeholderHomeContent.description}
          </p>
        </div>
        <span className="text-sm uppercase tracking-[.2em] text-white/60">
          {placeholderHomeContent.eyebrow}
        </span>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            aria-label="Home"
            className="mb-8 inline-block lg:hidden"
          >
            <BrandLogo darkInk />
          </Link>
          <Link href="/" className="mb-8 block text-sm text-slate-500">
            ← Back to home
          </Link>
          <p className="eyebrow">
            {mode === "signup" ? "Join our community" : "Member access"}
          </p>
          <h1 className="font-display mb-8 mt-3 text-4xl font-semibold sm:text-5xl">
            {mode === "signup"
              ? "Create your account."
              : mode === "login"
                ? "Welcome back."
                : "Reset your password."}
          </h1>
          <AccountForm mode={mode} />
          <p className="mt-7 text-sm text-slate-600">
            {mode === "signup" ? "Already a member?" : "New to our community?"}{" "}
            <Link
              href={mode === "signup" ? "/login" : "/signup"}
              className="font-semibold text-[var(--brand-red)]"
            >
              {mode === "signup" ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
