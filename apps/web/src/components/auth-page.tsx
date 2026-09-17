import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AccountForm } from "@/components/account-form";
import { SiteMedia } from "@/components/site/site-media";

export function AuthPage({
  mode
}: {
  mode: "login" | "signup" | "forgot-password" | "reset-password";
}) {
  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "login"
        ? "Welcome back"
        : "Reset your password";

  const eyebrow =
    mode === "signup" ? "Join our creative community" : "Member access";

  return (
    <main id="main-content" className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-[.92fr_1.08fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#080808] text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <SiteMedia
          alt="M. Dadu Films authentication placeholder"
          kind="project"
          className="absolute inset-0 h-full w-full"
          imageClassName="opacity-48"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/58 to-black/20" />

        <Link href="/" className="relative z-10">
          <BrandLogo />
        </Link>

        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-white/45">
            Stories · People · Cinema
          </p>
          <p className="font-display mt-4 text-5xl font-semibold leading-[.98] xl:text-6xl">
            Real People.
            <br />
            Real Stories.
            <br />
            <span className="text-[var(--brand-red)]">Bigger Possibilities.</span>
          </p>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/58">
            Build your profile, discover opportunities and stay connected to the creative community.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/38">M. Dadu Films · Creative Network</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[470px] rounded-[24px] bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,.06)] sm:p-9">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/">
              <BrandLogo darkInk className="!w-[106px]" />
            </Link>
            <Link href="/" className="text-xs font-semibold text-[#777]">Back home</Link>
          </div>

          <p className="site-kicker">{eyebrow}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#777]">
            {mode === "login"
              ? "Sign in to manage your profile, applications and creative opportunities."
              : mode === "signup"
                ? "Create a profile and start building your place in the network."
                : "Use your account email to continue."}
          </p>

          <div className="mt-7">
            <AccountForm mode={mode} />
          </div>

          <p className="mt-7 text-sm text-[#777]">
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
