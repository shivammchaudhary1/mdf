import { collectionCopy } from "@/content/placeholders/catalog";
import { runtimeConfig } from "@/config/runtime";
import type { CollectionKind, ContentItem } from "@/types/content";
export type ApiContent = ContentItem & {
  _id: string;
  published: boolean;
  archived: boolean;
  data?: Record<string, string>;
  images?: string[];
  videoUrl?: string;
  requirements?: string;
  compensation?: string;
  credits?: string;
};
async function publicFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${runtimeConfig.apiUrl}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Content is temporarily unavailable.");
  return response.json();
}
export async function getCollection(kind: CollectionKind) {
  const items = await publicFetch<ApiContent[]>(`/content/${kind}`);
  return { ...collectionCopy[kind], items, isDemo: false };
}
export async function getContentItem(kind: CollectionKind, slug: string) {
  const response = await fetch(
    `${runtimeConfig.apiUrl}/content/${kind}/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error("Content is temporarily unavailable.");
  return response.json() as Promise<ApiContent>;
}
export async function getSettings(slug: string) {
  const response = await fetch(
    `${runtimeConfig.apiUrl}/content/settings/${slug}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return {};
  if (!response.ok) throw new Error("Settings are temporarily unavailable.");
  const record = (await response.json()) as ApiContent;
  return record.data ?? {};
}
