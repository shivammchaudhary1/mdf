"use client";

import Link from "next/link";
import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { usePublicUiStore } from "@/store/public-ui-store";

const filters = ["All", "Acting", "Crew"];

export function CastingPageView() {
  const active = usePublicUiStore((state) => state.castingFilter);
  const setActive = usePublicUiStore((state) => state.setCastingFilter);

  const visible =
    active === "All"
      ? data.castings
      : data.castings.filter((item) => item.category === active);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Casting Calls"
          title="Find the Opportunity That Fits Your Craft"
          description="Open acting and crew opportunities from current and upcoming productions. Clear details, real deadlines and a simple path to apply."
          mediaAlt="Casting placeholder"
          mediaKind="team"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-7 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    active === filter
                      ? "bg-[#111] text-white"
                      : "border border-black/8 bg-white text-[#666]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {visible.map((casting) => (
                <article key={casting.slug} className="site-card p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="site-kicker">{casting.category}</span>
                    <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#2e7d46]">
                      Open
                    </span>
                  </div>
                  <h2 className="font-display mt-3 text-2xl font-semibold">{casting.title}</h2>
                  <p className="mt-1 text-sm font-medium text-[#555]">{casting.project}</p>
                  <p className="mt-4 text-sm leading-6 text-[#777]">{casting.summary}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-black/6 py-4 text-xs text-[#666]">
                    <div>
                      <span className="block text-[#999]">Location</span>
                      <strong className="mt-1 block font-semibold text-[#333]">{casting.location}</strong>
                    </div>
                    <div>
                      <span className="block text-[#999]">Shoot</span>
                      <strong className="mt-1 block font-semibold text-[#333]">{casting.shoot}</strong>
                    </div>
                    <div>
                      <span className="block text-[#999]">Age / Gender</span>
                      <strong className="mt-1 block font-semibold text-[#333]">
                        {casting.age} · {casting.gender}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[#999]">Compensation</span>
                      <strong className="mt-1 block font-semibold text-[#333]">{casting.compensation}</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#8a8a8a]">Deadline: {casting.deadline}</p>
                    <Link href={`/casting/${casting.slug}`} className="site-button site-button-primary">
                      View & Apply
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
