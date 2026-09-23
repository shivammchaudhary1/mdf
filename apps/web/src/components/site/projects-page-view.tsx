"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";

import { usePublicData } from "./use-public-data";

export function ProjectsPageView() {
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const data = usePublicData("projects", { page, limit: 20, search });
  const pageContent = websiteData.projectsPage;

  useEffect(() => {
    setPage(1);
  }, [search]);

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
              <span className="text-[#444]">Projects</span>
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
            <form
              className="mb-8 flex max-w-xl gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(draftSearch.trim());
              }}
            >
              <input
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="Search projects by title, type, location or tag"
                className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black/25"
              />
              <button type="submit" className="site-button site-button-primary">
                Search
              </button>
              {search && (
                <button
                  type="button"
                  className="site-button site-button-outline"
                  onClick={() => {
                    setDraftSearch("");
                    setSearch("");
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            {data.projects.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.projects.map((project) => (
                  <Link key={project.slug} href={`/projects/${project.slug}`} className="site-card group overflow-hidden">
                    {project.image && <SiteMedia src={project.image} alt={project.title} kind="project" className="aspect-[16/9]" />}
                    <div className="p-5 sm:p-6">
                      {(project.category || project.status) && (
                        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[.12em] text-[#888]">
                          {project.category && <span>{project.category}</span>}
                          {project.category && project.status && <span>•</span>}
                          {project.status && <span>{project.status}</span>}
                        </div>
                      )}
                      <h2 className="font-display mt-3 text-[22px] font-semibold">{project.title}</h2>
                      {project.summary && <p className="mt-3 text-sm leading-6 text-[#707070]">{project.summary}</p>}
                      <div className="mt-5 flex items-center justify-between gap-4 text-xs text-[#888]">
                        <span>{project.location || ""}</span>
                        <span className="shrink-0 font-semibold text-[var(--brand-red)]">View project →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : !data.loading ? (
              <div className="rounded-[24px] border border-black/6 bg-white px-6 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,.035)] sm:py-16">
                <p className="site-kicker">No Results</p>
                <h3 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">No projects found.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777]">
                  There are no published projects matching your search right now.
                </p>
                {search && (
                  <button
                    type="button"
                    className="site-button site-button-outline mt-6"
                    onClick={() => {
                      setDraftSearch("");
                      setSearch("");
                    }}
                  >
                    Clear search
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
