import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden bg-[#0b0b0f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo />
        <div>
          <p className="font-display text-5xl leading-tight">Good People.<br />Great Stories.</p>
          <p className="mt-5 max-w-sm text-white/60">Continue your creative journey with M. Dadu Films.</p>
        </div>
        <span className="text-xs uppercase tracking-[.3em] text-white/40">Films · People · Possibilities</span>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><BrandLogo darkInk /></div>
          <p className="text-sm font-bold uppercase tracking-[.15em] text-[var(--brand-red)]">Member Access</p>
          <h1 className="font-display mt-2 text-5xl font-semibold">Welcome Back</h1>
          <p className="mt-3 text-slate-500">Authentication logic comes in Stage 4.</p>

          <form className="mt-10 grid gap-4">
            <input className="h-13 rounded-xl border border-slate-200 px-4 outline-none focus:border-red-400" placeholder="Email address" type="email" />
            <input className="h-13 rounded-xl border border-slate-200 px-4 outline-none focus:border-red-400" placeholder="Password" type="password" />
            <button type="button" className="brand-button brand-button-primary mt-2">Sign In →</button>
          </form>

          <p className="mt-7 text-sm text-slate-500">
            Don&apos;t have an account? <Link href="/signup" className="font-bold text-[var(--brand-red)]">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
