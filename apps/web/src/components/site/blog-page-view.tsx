"use client";
import Link from "next/link";
import { usePublicData } from "./use-public-data";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { SiteMedia } from "@/components/site/site-media";

export function BlogPageView() {
  const data=usePublicData("blogs");
  const [featured, ...rest] = data.blogs;

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Journal"
          title="Notes From the Work Around the Work"
          description="Practical casting advice, production stories, creative thinking and honest notes from building films with people."
          mediaAlt="Film journal placeholder"
          mediaKind="blog"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            {featured && <Link
              href={`/blog/${featured.slug}`}
              className="site-card group grid overflow-hidden lg:grid-cols-[1.15fr_.85fr]"
            >
              <SiteMedia
                src={featured.image}
                alt={featured.title}
                kind="blog"
                className="min-h-[310px] lg:min-h-[430px]"
                imageClassName="transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="site-kicker">{featured.category}</p>
                <h2 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#707070]">{featured.summary}</p>
                <p className="mt-6 text-xs text-[#888]">
                  {featured.date} · {featured.readTime}
                </p>
                <span className="mt-7 text-sm font-semibold text-[var(--brand-red)]">
                  Read story →
                </span>
              </div>
            </Link>}

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="site-card group overflow-hidden">
                  <SiteMedia
                    src={post.image}
                    alt={post.title}
                    kind="blog"
                    className="aspect-[16/10]"
                    imageClassName="transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="p-5">
                    <p className="site-kicker">{post.category}</p>
                    <h3 className="font-display mt-2 text-xl font-semibold leading-tight">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#777]">{post.summary}</p>
                    <p className="mt-4 text-xs text-[#999]">
                      {post.date} · {post.readTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
