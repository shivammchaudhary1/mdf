import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function MemberStarterPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <BrandLogo darkInk />
          <Link href="/" className="text-sm font-semibold">← Public Site</Link>
        </div>
        <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-bold uppercase tracking-[.15em] text-[var(--brand-red)]">Member Area</p>
          <h1 className="font-display mt-3 text-5xl font-semibold">Member Dashboard Starter</h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Profile, portfolio, applications, recommendations and verified-member functionality will be implemented in Stages 5–9.
          </p>
        </section>
      </div>
    </main>
  );
}
