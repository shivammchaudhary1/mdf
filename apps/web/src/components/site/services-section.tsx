"use client";

import Link from "next/link";

import { SiteMedia } from "@/components/site/site-media";
import { usePublicServices } from "@/components/site/use-public-services";
import websiteData from "@/data/website-data.json";

export function ServicesSection() {
  const { services } = usePublicServices();
  const page = websiteData.servicesPage;

  return (
    <section className="site-section bg-[#fafafa]">
      <div className="site-shell">
        <div className="site-section-heading">
          <div>
            <p className="site-kicker">{page.homeSection.eyebrow}</p>
            <h2 className="site-heading mt-2">{page.homeSection.title}</h2>
          </div>

          <Link href="/services" className="site-text-link">
            {page.homeSection.linkLabel} →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <Link href="/services" key={service.slug} className="group site-card overflow-hidden">
              <SiteMedia
                src={service.image}
                alt={service.title}
                kind="project"
                className="aspect-[16/9]"
                imageClassName="transition duration-500 group-hover:scale-[1.025]"
              />

              <div className="p-5">
                <p className="site-kicker">{service.category}</p>
                <h3 className="font-display mt-2 text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#777]">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
