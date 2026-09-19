"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePublicUiStore } from "@/store/public-ui-store";

import { usePublicData } from "./use-public-data";
const filters = ["All", "Acting", "Crew"];
export function CastingPageView() {
  const active = usePublicUiStore((s) => s.castingFilter),
    setActive = usePublicUiStore((s) => s.setCastingFilter);
  const [page, setPage] = useState(1);
  const data = usePublicData("castings", { page, limit: 12, filter: active });
  useEffect(() => setPage(1), [active]);
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Casting Calls"
          title="Find the Opportunity That Fits Your Craft"
          description="Open acting and crew opportunities from current and upcoming productions."
          mediaAlt="Casting placeholder"
          mediaKind="team"
        />
        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-7 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${active === f ? "bg-[#111] text-white" : "border border-black/8 bg-white text-[#666]"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.castings.map((c) => (
                <article key={c.slug} className="site-card p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="site-kicker">{c.category}</span>
                    <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[10px] font-bold text-[#2e7d46]">Open</span>
                  </div>
                  <h2 className="font-display mt-3 text-2xl font-semibold">{c.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-[#777]">{c.summary}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-black/6 py-4 text-xs">
                    <div>
                      Location<strong className="block">{c.location}</strong>
                    </div>
                    <div>
                      Deadline<strong className="block">{c.deadline}</strong>
                    </div>
                    <div>
                      Age / Gender
                      <strong className="block">
                        {c.age} · {c.gender}
                      </strong>
                    </div>
                    <div>
                      Compensation<strong className="block">{c.compensation}</strong>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Link href={`/casting/${c.slug}`} className="site-button site-button-primary">
                      View & Apply
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <PaginationControls meta={data.meta} onPage={setPage} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
