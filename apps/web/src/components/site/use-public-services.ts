"use client";

import { useEffect, useState } from "react";

import { cachedApi } from "@/services/api";
import { mediaUrl, type PageMeta } from "@/services/workspace";

export type PublicService = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  modal: {
    eyebrow: string;
    title: string;
    overview: string;
    highlights: string[];
    idealFor: string;
    contactSubject: string;
    contactMessage: string;
  };
};

type ServiceSource = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  body?: string[];
  coverImage?: string;
  order?: number;
  data?: Record<string, string>;
};

type ServicePage = {
  items: ServiceSource[];
  meta: PageMeta;
};

function mapService(item: ServiceSource): PublicService {
  return {
    slug: item.slug,
    title: item.title,
    category: item.category ?? "Other",
    description: item.description ?? "",
    image: mediaUrl(item.coverImage ?? item.data?.image ?? ""),
    modal: {
      eyebrow: item.data?.modalEyebrow ?? item.category ?? "Service",
      title: item.data?.modalTitle ?? item.title,
      overview: item.data?.overview ?? "",
      highlights: item.body ?? [],
      idealFor: item.data?.idealFor ?? "",
      contactSubject: item.data?.contactSubject ?? "Production",
      contactMessage: item.data?.contactMessage ?? "",
    },
  };
}

export function usePublicServices() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void cachedApi<ServicePage>("/content/services?page=1&limit=100&sort=order", { ttl: 30_000 })
      .then((result) => {
        if (!active) return;
        setServices(result.items.map(mapService));
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setServices([]);
        setError(loadError instanceof Error ? loadError.message : "Unable to load services.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { services, loading, error };
}
