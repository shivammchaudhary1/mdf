"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";

import { usePublicData } from "./use-public-data";

export function ProjectsPageView() {
  const [page, setPage] = useState(1);
  const data = usePublicData("projects", { page, limit: 12 });
  const pageContent = websiteData.projectsPage;

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
            <div className="grid gap-6 md:grid-cols-2">
              {data.projects.map((project) => (
                <Link key={project.slug} href={`/projects/${project.slug}`} className="site-card group overflow-hidden">
                  <SiteMedia src={project.image} alt={project.title} kind="project" className="aspect-[16/9]" />
                  <div className="p-6 sm:p-7">
                    <div className="flex gap-2 text-[11px] uppercase tracking-[.12em] text-[#888]">
                      <span>{project.category}</span>
                      <span>•</span>
                      <span>{project.status}</span>
                    </div>
                    <h2 className="font-display mt-3 text-2xl font-semibold">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#707070]">{project.summary}</p>
                    <div className="mt-5 flex items-center justify-between text-xs text-[#888]">
                      <span>{project.location}</span>
                      <span className="font-semibold text-[var(--brand-red)]">View project →</span>
                    </div>
                  </div>
                </Link>
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
