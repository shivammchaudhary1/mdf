"use client";

import { useEffect, useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import template from "@/data/website-data.json";
import { api } from "@/services/api";
import { type ContentRecord, mediaUrl, type Page } from "@/services/workspace";

type ServiceCard = {
  key: string;
  title: string;
  category: string;
  description: string;
  image: string;
};

const fallback: ServiceCard[] = template.services.map((service) => ({
  key: service.slug,
  title: service.title,
  category: service.category,
  description: service.description,
  image: service.image,
}));

export function ServicesPageView() {
  const [services, setServices] = useState<ServiceCard[]>(fallback);

  useEffect(() => {
    let active = true;

    void api<Page<ContentRecord>>("/content/services?page=1&limit=24")
      .then((response) => {
        if (!active || !response.items.length) return;
        setServices(
          response.items.map((item) => ({
            key: item._id,
            title: item.title,
            category: item.category ?? "Production",
            description: item.description ?? "",
            image: mediaUrl(item.coverImage),
          })),
        );
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Services"
          title="From Idea to Final Delivery"
          description="Film production, short films, advertisements, brand films, music videos, corporate shoots and creative content support built around the needs of each story."
          mediaAlt="M. Dadu Films production services"
          mediaKind="project"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.key} className="site-card overflow-hidden">
                  <SiteMedia src={service.image} alt={service.title} kind="project" className="aspect-[16/9]" />
                  <div className="p-6">
                    <p className="site-kicker">{service.category}</p>
                    <h2 className="font-display mt-2 text-2xl font-semibold">{service.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#707070]">{service.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
