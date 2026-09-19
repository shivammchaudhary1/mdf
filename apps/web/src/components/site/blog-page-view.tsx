"use client";
import Link from "next/link";
import { useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";

import { usePublicData } from "./use-public-data";
export function BlogPageView() {
  const [page, setPage] = useState(1);
  const data = usePublicData("blogs", { page, limit: 9 });
  const [featured, ...rest] = data.blogs;
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Journal"
          title="Notes From the Work Around the Work"
          description="Practical casting advice, production stories and creative thinking."
          mediaAlt="Film journal placeholder"
          mediaKind="blog"
        />
        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="site-card grid overflow-hidden lg:grid-cols-[1.15fr_.85fr]">
                <SiteMedia src={featured.image} alt={featured.title} kind="blog" className="min-h-[310px]" />
                <div className="p-7 sm:p-10">
                  <p className="site-kicker">{featured.category}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold">{featured.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-[#707070]">{featured.summary}</p>
                </div>
              </Link>
            )}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="site-card overflow-hidden">
                  <SiteMedia src={post.image} alt={post.title} kind="blog" className="aspect-[16/10]" />
                  <div className="p-5">
                    <p className="site-kicker">{post.category}</p>
                    <h3 className="font-display mt-2 text-xl font-semibold">{post.title}</h3>
                    <p className="mt-3 text-sm text-[#777]">{post.summary}</p>
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
