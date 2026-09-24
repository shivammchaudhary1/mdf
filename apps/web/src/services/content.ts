import { runtimeConfig } from "@/config/runtime";
import { collectionCopy } from "@/content/placeholders/catalog";
import type { CollectionKind, ContentItem } from "@/types/content";

import { mediaUrl, type PageMeta } from "./workspace";

export type ApiContent = ContentItem & {
  _id: string;
  published: boolean;
  archived: boolean;
  data?: Record<string, string>;
  images?: string[];
  videoUrl?: string;
  requirements?: string;
  compensation?: string;
  details?: string[];
  credits?: Array<{ name: string; role: string }> | string;
  creditsText?: string;
  links?: Array<{ title: string; url: string }>;
  acceptingApplications?: boolean;
  galleryImages?: string[];
  trailerUrl?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  status?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  shootDate?: string;
  deadline?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  experience?: string;
  role?: string;
  projectTitle?: string;
};

async function publicFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${runtimeConfig.apiUrl}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Content is temporarily unavailable.");
  return response.json();
}

export async function getCollection(kind: CollectionKind, page = 1, limit = 20) {
  const result = await publicFetch<{ items: (ApiContent & { coverImage?: string })[]; meta: PageMeta }>(
    `/content/${kind}?page=${page}&limit=${limit}`,
  );
  const items = result.items.map((item) => ({ ...item, image: mediaUrl(item.coverImage ?? item.image) }));
  return { ...collectionCopy[kind], items, meta: result.meta };
}

export async function getContentItem(kind: CollectionKind, slug: string) {
  const response = await fetch(`${runtimeConfig.apiUrl}/content/${kind}/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error("Content is temporarily unavailable.");
  const item = (await response.json()) as ApiContent & { coverImage?: string; summary?: string; type?: string };
  return {
    ...item,
    image: mediaUrl(item.coverImage ?? item.image),
    category: item.category ?? item.type ?? "",
    description: item.description ?? item.summary ?? "",
  };
}

export async function getSettings(slug: string) {
  const response = await fetch(`${runtimeConfig.apiUrl}/content/settings/${slug}`, { cache: "no-store" });
  if (response.status === 404) return {};
  if (!response.ok) throw new Error("Settings are temporarily unavailable.");
  const record = (await response.json()) as ApiContent;
  return record.data ?? {};
}
