"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ServiceDetailsModal } from "@/components/site/service-details-modal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { type PublicService, usePublicServices } from "@/components/site/use-public-services";
import websiteData from "@/data/website-data.json";

export function ServicesPageView() {
  const [selected, setSelected] = useState<PublicService | null>(null);
  const { services, loading, error } = usePublicServices();
  const page = websiteData.servicesPage;

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
              <span className="text-[#444]">Services</span>
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
              <Image
                src={page.hero.image}
                alt={page.hero.mediaAlt}
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
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">{page.list.eyebrow}</p>
                <h2 className="site-heading mt-2">{page.list.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{page.list.description}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
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

            {!loading && !services.length && (
              <div className="site-card mt-5 p-8 text-center sm:p-10">
                <h3 className="font-display text-2xl font-semibold">Services are being updated.</h3>
                <p className="mt-2 text-sm leading-6 text-[#777]">
                  {error || "Published services will appear here as soon as they are available."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      {selected && <ServiceDetailsModal service={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
