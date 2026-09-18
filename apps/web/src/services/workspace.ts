import { api } from "./api";

export type PageMeta = { page: number; limit: number; total: number; pages: number; hasNext?: boolean; hasPrevious?: boolean };
export type Page<T> = { items: T[]; meta: PageMeta };
export type ProfileRecord = {
  bio?: string; city?: string; profession?: string; gender?: string; birthDate?: string;
  experience?: string; availability?: string; skills?: string[]; languages?: string[];
  photo?: string; photoMediaId?: string; portfolio?: string[]; portfolioMediaIds?: string[];
  showreel?: string; resume?: string; publicVisible?: boolean; emailCastingAlerts?: boolean; emailUpdates?: boolean;
  createdAt?: string; completion?: number; savedOpportunityIds?: string[];
};
export type MemberProfile = { account: { id: string; name: string; email: string; mobile: string; verified: boolean }; profile: ProfileRecord | null; completion: number };
export type ApplicationRecord = { _id: string; opportunityTitle: string; roleSnapshot?: string; opportunityType: string; opportunitySlug?: string; status: string; createdAt: string; applicant: { name: string; city?: string }; adminNotes?: string };
export type OpportunityRecord = { _id: string; title: string; slug: string; role?: string; category?: string; location?: string; deadline?: string; coverImage?: string; opportunityType: string; compensation?: string };
export type ContentRecord = { _id: string; title: string; slug: string; category?: string; coverImage?: string; createdAt: string; publishedAt?: string; published: boolean; status?: string; description?: string; role?: string; videoUrl?: string; body?: string[]; data?: Record<string,string> };
export const dateLabel = (value?: string) => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
// SmartImage resolves API-relative media URLs and bypasses the public optimizer
// so browser cookies can accompany private media requests.
export const mediaUrl = (value?: string) => value ?? "";
export const slugFor = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,130) || "entry"}-${crypto.randomUUID().slice(0,8)}`;
export async function fetchPage<T>(path: string, page = 1, limit = 20): Promise<Page<T>> {
  const separator = path.includes("?") ? "&" : "?";
  return api<Page<T>>(`${path}${separator}page=${page}&limit=${limit}`);
}
export async function allPages<T>(path: string): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const first = await api<Page<T>>(`${path}${separator}limit=100&page=1`);
  const items = [...first.items];
  for (let page = 2; page <= first.meta.pages; page++) items.push(...(await api<Page<T>>(`${path}${separator}limit=100&page=${page}`)).items);
  return items;
}
export async function uploadMedia(file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a file up to 10 MB.");
  const body = new FormData();
  body.append("file", file);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mdadu-upload-start"));
  try {
    return await api<{ id: string; urls: Record<string,string> }>("/media", { method: "POST", body });
  } finally {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("mdadu-upload-end"));
  }
}
