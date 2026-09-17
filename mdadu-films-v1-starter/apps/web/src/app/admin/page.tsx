import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminStarterPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <BrandLogo darkInk />
          <Link href="/" className="text-sm font-semibold">← Public Site</Link>
        </div>
        <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-bold uppercase tracking-[.15em] text-[var(--brand-red)]">Super Admin</p>
          <h1 className="font-display mt-3 text-5xl font-semibold">Admin Dashboard Starter</h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Users, applications, projects, castings, talent search, verification, saved lists and CMS functionality will be implemented stage-by-stage.
          </p>
        </section>
      </div>
    </main>
  );
}
