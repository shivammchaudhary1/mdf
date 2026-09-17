"use client";

import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { SiteMedia } from "@/components/site/site-media";
import { usePublicUiStore } from "@/store/public-ui-store";

const filters = ["All", "BTS", "Projects", "Events", "Talent"];

export function GalleryPageView() {
  const active = usePublicUiStore((state) => state.galleryFilter);
  const setActive = usePublicUiStore((state) => state.setGalleryFilter);

  const visible =
    active === "All"
      ? data.gallery
      : data.gallery.filter((item) => item.category === active);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Gallery"
          title="Moments From Our Journey"
          description="A glimpse into our projects, people and the stories we bring to life."
          mediaAlt="Production gallery placeholder"
          mediaKind="gallery"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-7 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active === filter
                      ? "bg-[#111] text-white"
                      : "border border-black/8 bg-white text-[#666] hover:text-black"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              {visible.map((item, index) => (
                <figure
                  key={`${item.title}-${index}`}
                  className={`group overflow-hidden rounded-[14px] ${
                    index % 5 === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <SiteMedia
                    src={item.image}
                    alt={item.title}
                    kind="gallery"
                    className={index % 5 === 0 ? "h-full min-h-[320px]" : "aspect-[4/3]"}
                    imageClassName="transition duration-500 group-hover:scale-[1.03]"
                  />
                </figure>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-5 rounded-[18px] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,.04)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="font-display text-2xl font-semibold">Have a Project in Mind?</h2>
                <p className="mt-1 text-sm text-[#777]">Let’s create something amazing together.</p>
              </div>
              <a href="/contact" className="site-button site-button-primary">
                Get In Touch
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
