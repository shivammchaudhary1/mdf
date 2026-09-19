"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/services/api";
import { type ContentRecord, mediaUrl, type Page } from "@/services/workspace";

import { SiteMedia } from "./site-media";
export function OurWorkSection() {
  const [items, setItems] = useState<ContentRecord[]>([]);
  useEffect(() => {
    void api<Page<ContentRecord>>("/content/our-work?page=1&limit=4")
      .then((r) => setItems(r.items))
      .catch(() => undefined);
  }, []);
  if (!items.length) return null;
  return (
    <section className="site-section bg-[#fafafa]">
      <div className="site-shell">
        <div className="site-section-heading">
          <div>
            <p className="site-kicker">What we create</p>
            <h2 className="site-heading mt-2">Our Work</h2>
          </div>
          <Link href="/our-work" className="site-text-link">
            Explore All →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <Link href="/our-work" key={i._id} className="group">
              <SiteMedia src={mediaUrl(i.coverImage)} alt={i.title} kind="project" className="aspect-[16/10] rounded-[14px]" />
              <h3 className="font-display mt-3 text-lg font-semibold">{i.title}</h3>
              <p className="mt-1 text-xs text-[#777]">{i.category || "Production"}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
