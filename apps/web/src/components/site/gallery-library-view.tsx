import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

export function GalleryLibraryView({ sectionSlug, pageNumber }: { sectionSlug: string; pageNumber: number }) {
  const gallery = websiteData.galleryPage;
  const section = gallery.sections.find((item) => item.slug === sectionSlug);
  if (!section) notFound();

  const pageSize = gallery.pageSize;
  const pages = Math.max(1, Math.ceil(section.items.length / pageSize));
  const page = Math.min(Math.max(pageNumber, 1), pages);
  const start = (page - 1) * pageSize;
  const items = section.items.slice(start, start + pageSize);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="border-b border-black/6 bg-[#f7f6f3]">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/gallery" className="transition hover:text-black">
                Gallery
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#444]">{section.title}</span>
            </nav>
          </div>

          <div className="site-shell py-10 sm:py-14 lg:py-16">
            <p className="site-kicker">{section.eyebrow}</p>
            <h1 className="font-display mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">{section.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#707070]">{section.description}</p>
            <p className="mt-4 text-xs font-semibold text-[#999]">
              Showing {section.items.length ? start + 1 : 0}–{Math.min(start + pageSize, section.items.length)} of {section.items.length}{" "}
              images
            </p>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-[14px] border border-black/6 bg-[#fafafa]">
                  <SiteMedia src={item.image} alt={item.imageAlt} kind="gallery" className="aspect-[4/3]" />
                  <figcaption className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#444]">{item.title}</p>
                    <p className="mt-1 text-[11px] text-[#999]">{item.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>

            {pages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={`${section.title} pagination`}>
                <Link
                  href={`/gallery/${section.slug}?page=${Math.max(1, page - 1)}`}
                  aria-disabled={page <= 1}
                  className={`site-button site-button-outline ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
                >
                  ← Previous
                </Link>

                {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                  <Link
                    key={number}
                    href={`/gallery/${section.slug}?page=${number}`}
                    aria-current={number === page ? "page" : undefined}
                    className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold ${
                      number === page ? "border-[#111] bg-[#111] text-white" : "border-black/10 bg-white text-[#555]"
                    }`}
                  >
                    {number}
                  </Link>
                ))}

                <Link
                  href={`/gallery/${section.slug}?page=${Math.min(pages, page + 1)}`}
                  aria-disabled={page >= pages}
                  className={`site-button site-button-outline ${page >= pages ? "pointer-events-none opacity-40" : ""}`}
                >
                  Next →
                </Link>
              </nav>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
