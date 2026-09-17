import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden bg-[#0b0b0f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo />
        <div>
          <p className="font-display text-5xl leading-tight">Create.<br />Connect.<br />Get Discovered.</p>
          <p className="mt-5 max-w-sm text-white/60">Become part of the M. Dadu Films creative community.</p>
        </div>
        <span className="text-xs uppercase tracking-[.3em] text-white/40">Talent belongs here.</span>
      </section>

      <section className="flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><BrandLogo darkInk /></div>
          <p className="text-sm font-bold uppercase tracking-[.15em] text-[var(--brand-red)]">Join Community</p>
          <h1 className="font-display mt-2 text-5xl font-semibold">Create Your Account</h1>
          <p className="mt-3 text-slate-500">Mobile number is collected but will not require OTP in V1.</p>

          <form className="mt-9 grid gap-3">
            <input className="h-12 rounded-xl border border-slate-200 px-4" placeholder="Full name" />
            <input className="h-12 rounded-xl border border-slate-200 px-4" placeholder="Email address" type="email" />
            <input className="h-12 rounded-xl border border-slate-200 px-4" placeholder="Mobile number" type="tel" />
            <input className="h-12 rounded-xl border border-slate-200 px-4" placeholder="Password" type="password" />
            <button type="button" className="brand-button brand-button-primary mt-2">Create Account →</button>
          </form>

          <p className="mt-7 text-sm text-slate-500">
            Already a member? <Link href="/login" className="font-bold text-[var(--brand-red)]">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
