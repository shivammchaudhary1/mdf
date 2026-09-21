"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import template from "@/data/website-data.json";
import { api } from "@/services/api";
import { type ContentRecord, mediaUrl, type Page } from "@/services/workspace";

import { SiteMedia } from "./site-media";

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

export function ServicesSection() {
  const [items, setItems] = useState<ServiceCard[]>(fallback);

  useEffect(() => {
    let active = true;

    void api<Page<ContentRecord>>("/content/services?page=1&limit=6")
      .then((response) => {
        if (!active || !response.items.length) return;
        setItems(
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
    <section className="site-section bg-[#fafafa]">
      <div className="site-shell">
        <div className="site-section-heading">
          <div>
            <p className="site-kicker">What we offer</p>
            <h2 className="site-heading mt-2">Services</h2>
          </div>
          <Link href="/services" className="site-text-link">
            Explore Services →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link href="/services" key={item.key} className="group site-card overflow-hidden">
              <SiteMedia
                src={item.image}
                alt={item.title}
                kind="project"
                className="aspect-[16/9]"
                imageClassName="transition duration-500 group-hover:scale-[1.025]"
              />
              <div className="p-5">
                <p className="site-kicker">{item.category}</p>
                <h3 className="font-display mt-2 text-xl font-semibold">{item.title}</h3>
                {item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#777]">{item.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
