"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";
import { usePublicUiStore } from "@/store/public-ui-store";

import { usePublicData } from "./use-public-data";

const filters = ["All", "Acting", "Crew"];

export function CastingPageView() {
  const active = usePublicUiStore((s) => s.castingFilter),
    setActive = usePublicUiStore((s) => s.setCastingFilter);
  const [page, setPage] = useState(1);
  const data = usePublicData("castings", { page, limit: 12, filter: active });
  const pageContent = websiteData.castingPage;

  useEffect(() => setPage(1), [active]);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#444]">Casting</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{pageContent.hero.eyebrow}</p>
                  <span className="h-px w-12 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {pageContent.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">{pageContent.hero.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {pageContent.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/8 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#555]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <Image
                src={pageContent.hero.image}
                alt={pageContent.hero.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent lg:block"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-7 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    active === f ? "bg-[#111] text-white" : "border border-black/8 bg-white text-[#666]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {data.castings.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {data.castings.map((c) => (
                  <article key={c.slug} className="site-card p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      {c.category && <span className="site-kicker">{c.category}</span>}
                      <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[10px] font-bold text-[#2e7d46]">Open</span>
                    </div>
                    <h2 className="font-display mt-3 text-2xl font-semibold">{c.title}</h2>
                    {c.summary && <p className="mt-4 text-sm leading-6 text-[#777]">{c.summary}</p>}
                    {(c.location || c.deadline || c.age || c.gender || c.compensation) && (
                      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-black/6 py-4 text-xs">
                        {c.location && (
                          <div>
                            Location<strong className="block">{c.location}</strong>
                          </div>
                        )}
                        {c.deadline && (
                          <div>
                            Deadline<strong className="block">{c.deadline}</strong>
                          </div>
                        )}
                        {(c.age || c.gender) && (
                          <div>
                            Age / Gender
                            <strong className="block">{[c.age, c.gender].filter(Boolean).join(" · ")}</strong>
                          </div>
                        )}
                        {c.compensation && (
                          <div>
                            Compensation<strong className="block">{c.compensation}</strong>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-5 flex justify-end">
                      <Link href={`/casting/${c.slug}`} className="site-button site-button-primary">
                        View & Apply
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : !data.loading ? (
              <div className="rounded-[24px] border border-black/6 bg-white px-6 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,.035)] sm:py-16">
                <p className="site-kicker">No Open Calls</p>
                <h3 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">No casting calls found.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777]">
                  There are no published casting opportunities in this category right now.
                </p>
                {active !== "All" && (
                  <button type="button" className="site-button site-button-outline mt-6" onClick={() => setActive("All")}>
                    View all casting calls
                  </button>
                )}
              </div>
            ) : null}
            <PaginationControls meta={data.meta} onPage={setPage} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
