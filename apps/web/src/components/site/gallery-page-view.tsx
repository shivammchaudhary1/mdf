import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";
import { type GallerySectionSlug, getPublicGallerySections } from "@/services/gallery-content";

export async function GalleryPageView() {
  const page = websiteData.galleryPage;
  const recentLimit = page.pageSize;
  const dynamicSections = await getPublicGallerySections();

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
              <span className="text-[#444]">Gallery</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{page.hero.eyebrow}</p>
                  <span className="h-px w-12 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {page.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">{page.hero.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {page.hero.tags.map((tag) => (
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
              {page.hero.image ? (
                <Image
                  src={page.hero.image}
                  alt={page.hero.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <SiteMedia
                  src=""
                  alt={page.hero.imageAlt}
                  kind="gallery"
                  className="h-full min-h-[340px] sm:min-h-[430px] lg:min-h-[560px]"
                />
              )}
              <div
                className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent lg:block"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="max-w-3xl">
              <p className="site-kicker">{page.sectionIntro.eyebrow}</p>
              <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{page.sectionIntro.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#777]">{page.sectionIntro.description}</p>
            </div>

            <div className="mt-12 space-y-16">
              {page.sections.map((section) => {
                const sectionSlug = section.slug as GallerySectionSlug;
                const recent = (dynamicSections[sectionSlug] ?? []).slice(0, recentLimit);

                return (
                  <section key={section.slug} aria-labelledby={`${section.slug}-title`}>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="site-kicker">{section.eyebrow}</p>
                        <h2 id={`${section.slug}-title`} className="font-display mt-2 text-3xl font-semibold">
                          {section.title}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777]">{section.description}</p>
                      </div>

                      <Link href={`/gallery/${section.slug}`} className="site-button site-button-outline shrink-0">
                        View Public Library →
                      </Link>
                    </div>

                    {recent.length ? (
                      <Link
                        href={`/gallery/${section.slug}`}
                        className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5"
                        aria-label={`Open ${section.title} public library`}
                      >
                        {recent.map((item) => (
                          <figure key={item.id} className="group overflow-hidden rounded-[14px] bg-white">
                            <SiteMedia
                              src={item.image}
                              alt={item.imageAlt}
                              kind="gallery"
                              className="aspect-[4/3]"
                              imageClassName="transition duration-500 group-hover:scale-[1.025]"
                            />
                          </figure>
                        ))}
                      </Link>
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-black/10 bg-white px-6 py-10 text-center sm:py-12">
                        <p className="font-display text-xl font-semibold text-[#333]">No images published yet.</p>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#888]">
                          Published images for {section.title.toLowerCase()} will appear here automatically.
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
