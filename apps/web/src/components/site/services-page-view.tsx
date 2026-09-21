"use client";

import { useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { ServiceDetailsModal } from "@/components/site/service-details-modal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

type Service = (typeof websiteData.services)[number];

export function ServicesPageView() {
  const [selected, setSelected] = useState<Service | null>(null);
  const page = websiteData.servicesPage;

  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <PageIntro
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          description={page.hero.description}
          mediaAlt={page.hero.mediaAlt}
          mediaKind="project"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">{page.list.eyebrow}</p>
                <h2 className="site-heading mt-2">{page.list.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{page.list.description}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {websiteData.services.map((service) => (
                <article key={service.slug} className="group site-card flex h-full flex-col overflow-hidden">
                  <SiteMedia
                    src={service.image}
                    alt={service.title}
                    kind="project"
                    className="aspect-[16/9]"
                    imageClassName="transition duration-500 group-hover:scale-[1.025]"
                  />

                  <div className="flex flex-1 flex-col p-6">
                    <p className="site-kicker">{service.category}</p>
                    <h2 className="font-display mt-2 text-2xl font-semibold">{service.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#707070]">{service.description}</p>

                    <button
                      type="button"
                      onClick={() => setSelected(service)}
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-bold text-[#333] transition hover:text-[var(--brand-red)]"
                      aria-label={`Know more about ${service.title}`}
                    >
                      {page.list.buttonLabel}
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {selected && <ServiceDetailsModal service={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
