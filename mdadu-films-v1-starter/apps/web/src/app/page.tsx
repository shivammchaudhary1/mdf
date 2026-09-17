import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

const features = [
  ["Projects", "Running, upcoming and completed stories."],
  ["Casting Calls", "Real opportunities for emerging and experienced talent."],
  ["Talent Network", "Create a profile, build a portfolio and become part of the community."],
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="relative isolate min-h-[760px] overflow-hidden bg-[#0b0b0f] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(229,57,69,.25),transparent_22%),radial-gradient(circle_at_50%_0%,rgba(201,163,93,.12),transparent_28%),linear-gradient(120deg,#08090d_20%,#101621_65%,#090a0d)]" />
          <div className="absolute inset-y-0 right-0 w-[42%] opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="container-shell relative flex min-h-[760px] items-center pt-28">
            <div className="max-w-3xl py-20">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-[var(--brand-gold)]">
                Films · People · Possibilities
              </p>
              <h1 className="font-display text-6xl font-semibold leading-[.96] sm:text-7xl lg:text-8xl">
                Good People.
                <span className="block text-[var(--brand-red)]">Great Stories.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                A creative home for filmmakers, actors, storytellers and dreamers —
                where talent meets opportunity.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/projects" className="brand-button brand-button-primary">
                  Explore Projects →
                </Link>
                <Link href="/signup" className="brand-button brand-button-secondary">
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell py-20 md:py-28">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
              Platform Foundation
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold md:text-5xl">
              Built for stories and the people behind them.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(([title, description]) => (
              <article key={title} className="card p-7">
                <div className="mb-8 h-10 w-10 rounded-full bg-red-50 ring-1 ring-red-100" />
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f6f7f9] py-20">
          <div className="container-shell grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                Development Starter
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold">
                Real content and media come next.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                This starter deliberately keeps assets minimal. Add the real M. Dadu Films
                project images, team profiles, company details and content before we build
                the production modules stage-by-stage.
              </p>
            </div>
            <div className="min-h-72 rounded-[28px] bg-[linear-gradient(135deg,#111318,#232b38)] p-8 text-white">
              <p className="font-display text-3xl">More than films.</p>
              <p className="mt-2 text-white/60">A platform for real people.</p>
              <div className="mt-20 h-px w-20 bg-[var(--brand-red)]" />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
