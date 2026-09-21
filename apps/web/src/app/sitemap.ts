import type { MetadataRoute } from "next";

import { runtimeConfig } from "@/config/runtime";

type Page<T> = { items: T[]; meta?: { pages?: number } };
type SlugRecord = { slug?: string; updatedAt?: string; publishedAt?: string };
type TalentRecord = { id?: string; updatedAt?: string };

const base = runtimeConfig.siteUrl.replace(/\/$/, "");

async function page<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${runtimeConfig.apiUrl}${path}`, {
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    const result = (await response.json()) as Page<T>;
    return Array.isArray(result.items) ? result.items : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    ["", "daily", 1],
    ["/about", "monthly", 0.8],
    ["/services", "monthly", 0.8],
    ["/projects", "weekly", 0.9],
    ["/casting", "daily", 0.9],
    ["/talent", "daily", 0.9],
    ["/blog", "weekly", 0.8],
    ["/gallery", "weekly", 0.7],
    ["/behind-the-scenes", "weekly", 0.7],
    ["/shows", "weekly", 0.7],
    ["/contact", "monthly", 0.5],
    ["/careers", "weekly", 0.7],
    ["/privacy", "yearly", 0.3],
    ["/terms", "yearly", 0.3],
  ] as const;

  const [projects, blogs, castings, talents] = await Promise.all([
    page<SlugRecord>("/projects?page=1&limit=100"),
    page<SlugRecord>("/content/blog?page=1&limit=100"),
    page<SlugRecord>("/castings?page=1&limit=100"),
    page<TalentRecord>("/talent?page=1&limit=100"),
  ]);

  const result: MetadataRoute.Sitemap = staticRoutes.map(([route, changeFrequency, priority]) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const item of projects) {
    if (!item.slug) continue;
    result.push({
      url: `${base}/projects/${encodeURIComponent(item.slug)}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const item of blogs) {
    if (!item.slug) continue;
    result.push({
      url: `${base}/blog/${encodeURIComponent(item.slug)}`,
      lastModified: item.updatedAt || item.publishedAt ? new Date(item.updatedAt ?? item.publishedAt ?? now) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const item of castings) {
    if (!item.slug) continue;
    result.push({
      url: `${base}/casting/${encodeURIComponent(item.slug)}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const item of talents) {
    if (!item.id) continue;
    result.push({
      url: `${base}/talent/${encodeURIComponent(item.id)}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return result;
}
