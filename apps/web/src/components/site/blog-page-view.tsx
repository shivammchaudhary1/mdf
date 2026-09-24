"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";
import { type ApiContent, getCollection } from "@/services/content";
import type { PageMeta } from "@/services/workspace";

const PAGE_SIZE = 20;

type BlogItem = ApiContent & {
  image?: string;
  createdAt?: string;
};

type Props = {
  initialItems: BlogItem[];
  initialMeta: PageMeta;
};

function blogDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function blogReadTime(item: BlogItem) {
  return item.data?.readTime || "1 min read";
}

function blogImageAlt(item: BlogItem) {
  return item.data?.imageAlt || item.title;
}

export function BlogPageView({ initialItems, initialMeta }: Props) {
  const [items, setItems] = useState<BlogItem[]>(initialItems);
  const [meta, setMeta] = useState<PageMeta>(initialMeta);
  const [loadingPage, setLoadingPage] = useState(false);
  const pageContent = websiteData.blogPage;

  const start = (meta.page - 1) * meta.limit;
  const [featured, ...rest] = items;

  async function changePage(nextPage: number) {
    if (loadingPage || nextPage === meta.page) return;

    setLoadingPage(true);
    try {
      const result = await getCollection("blog", nextPage, PAGE_SIZE);
      setItems(result.items);
      setMeta(result.meta);

      requestAnimationFrame(() => {
        document.getElementById("blog-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setLoadingPage(false);
    }
  }

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
              <span className="text-[#444]">Blog</span>
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

        <section id="blog-list" className="site-section scroll-mt-24 bg-[#fafafa]" aria-busy={loadingPage}>
          <div className="site-shell">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="site-kicker">{pageContent.list.eyebrow}</p>
                <h2 className="font-display mt-2 text-3xl font-semibold">{pageContent.list.title}</h2>
              </div>
              <p className="text-xs text-[#888]">
                Showing {meta.total ? start + 1 : 0}–{Math.min(start + meta.limit, meta.total)} of {meta.total} articles
              </p>
            </div>

            {featured && (
              <Link href={`/blog/${featured.slug}`} className="site-card grid overflow-hidden lg:grid-cols-[1.15fr_.85fr]">
                <SiteMedia src={featured.image} alt={blogImageAlt(featured)} kind="blog" className="min-h-[310px]" />
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#999]">
                    <span className="text-[var(--brand-red)]">{featured.category || "Journal"}</span>
                    <span>•</span>
                    <span>{blogDate(featured.publishedAt || featured.createdAt)}</span>
                    <span>•</span>
                    <span>{blogReadTime(featured)}</span>
                  </div>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight">{featured.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-[#707070]">{featured.description}</p>
                  <span className="mt-6 text-xs font-bold text-[var(--brand-red)]">Read article →</span>
                </div>
              </Link>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group site-card flex h-full flex-col overflow-hidden">
                  <SiteMedia
                    src={post.image}
                    alt={blogImageAlt(post)}
                    kind="blog"
                    className="aspect-[16/10]"
                    imageClassName="transition duration-500 group-hover:scale-[1.025]"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.09em] text-[#999]">
                      <span className="text-[var(--brand-red)]">{post.category || "Journal"}</span>
                      <span>•</span>
                      <span>{blogReadTime(post)}</span>
                    </div>
                    <h3 className="font-display mt-2 text-xl font-semibold leading-snug">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#777]">{post.description}</p>
                    <div className="mt-auto pt-5 text-xs text-[#999]">{blogDate(post.publishedAt || post.createdAt)}</div>
                  </div>
                </Link>
              ))}
            </div>

            <PaginationControls meta={meta} onPage={(nextPage) => void changePage(nextPage)} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
