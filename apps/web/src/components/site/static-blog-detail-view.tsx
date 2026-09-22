import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { absoluteSiteUrl } from "@/config/seo";
import websiteData from "@/data/website-data.json";

export function StaticBlogDetailView({ slug }: { slug: string }) {
  const article = websiteData.blogs.find((item) => item.slug === slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.seoDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: websiteData.brand.name, url: absoluteSiteUrl("/") },
    mainEntityOfPage: absoluteSiteUrl(`/blog/${article.slug}`),
    keywords: article.keywords.join(", "),
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <article className="site-shell py-8 lg:py-12">
          <Link href="/blog" className="text-xs font-semibold text-[#777] transition hover:text-black">
            ← Back to Blog
          </Link>

          <header className="mx-auto mt-9 max-w-4xl text-center">
            <p className="site-kicker">{article.category}</p>
            <h1 className="font-display mt-3 text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[.98] tracking-[-.035em]">
              {article.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6f6f]">{article.summary}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[#888]">
              <span>{article.author}</span>
              <span>•</span>
              <time dateTime={article.publishedAt}>{article.date}</time>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </header>

          <SiteMedia
            src={article.image}
            alt={article.imageAlt || article.title}
            kind="blog"
            className="mx-auto mt-10 aspect-[16/7] max-w-5xl rounded-[20px]"
          />

          <div className="mx-auto max-w-3xl py-10 sm:py-12">
            <p className="text-[17px] leading-8 text-[#4f4f4f]">{article.intro}</p>

            <div className="mt-10 space-y-10">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#595959]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {"bullets" in section && section.bullets?.length ? (
                    <ul className="mt-5 space-y-2 rounded-2xl border border-black/7 bg-[#fafafa] p-5 text-sm leading-6 text-[#555]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {article.faq.length ? (
              <section className="mt-12 border-t border-black/8 pt-10">
                <p className="site-kicker">FAQ</p>
                <h2 className="font-display mt-2 text-3xl font-semibold">Common questions</h2>
                <div className="mt-6 grid gap-3">
                  {article.faq.map((item) => (
                    <div key={item.question} className="rounded-2xl border border-black/7 bg-[#fafafa] p-5">
                      <h3 className="font-display text-lg font-semibold">{item.question}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#666]">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-12 rounded-[20px] bg-[#101010] p-6 text-white sm:p-8">
              <p className="site-kicker !text-[#ff646b]">Final Take</p>
              <p className="font-display mt-3 text-2xl leading-snug sm:text-3xl">{article.conclusion}</p>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/blog" className="site-button site-button-outline">
                More Articles
              </Link>
              <Link href="/contact" className="site-button site-button-primary">
                Talk to M. Dadu Films
              </Link>
            </div>
          </div>
        </article>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <SiteFooter />
    </>
  );
}
