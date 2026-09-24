import { api, cachedApi } from "./api";

export type PageMeta = { page: number; limit: number; total: number; pages: number; hasNext?: boolean; hasPrevious?: boolean };
export type Page<T> = { items: T[]; meta: PageMeta };
export type ProfileRecord = {
  bio?: string;
  city?: string;
  profession?: string;
  gender?: string;
  birthDate?: string;
  experience?: string;
  availability?: string;
  skills?: string[];
  languages?: string[];
  photo?: string;
  photoMediaId?: string;
  portfolio?: string[];
  portfolioMediaIds?: string[];
  videos?: string[];
  showreel?: string;
  previousWork?: string;
  socialLinks?: string[];
  resume?: string;
  resumeMediaId?: string;
  publicVisible?: boolean;
  emailCastingAlerts?: boolean;
  emailUpdates?: boolean;
  profileViews?: number;
  createdAt?: string;
  completion?: number;
  savedOpportunityIds?: string[];
};
export type MemberProfile = {
  account: { id: string; name: string; email: string; mobile: string; verified: boolean };
  profile: ProfileRecord | null;
  completion: number;
};
export type ApplicationRecord = {
  _id: string;
  opportunityTitle: string;
  roleSnapshot?: string;
  opportunityType: string;
  opportunitySlug?: string;
  status: string;
  createdAt: string;
  applicant: { name: string; email?: string; mobile?: string; city?: string };
  coverNote?: string;
  portfolioMediaIds?: string[];
  portfolioImages?: string[];
  showreelUrl?: string;
  pitch?: string;
  documentMediaId?: string;
  documentUrl?: string;
  adminNotes?: string;
};
export type OpportunityRecord = {
  _id: string;
  title: string;
  slug: string;
  role?: string;
  category?: string;
  location?: string;
  deadline?: string;
  coverImage?: string;
  opportunityType: string;
  compensation?: string;
};
export type ContentRecord = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  coverImage?: string;
  createdAt: string;
  publishedAt?: string;
  published: boolean;
  status?: string;
  description?: string;
  role?: string;
  videoUrl?: string;
  body?: string[];
  data?: Record<string, string>;
};
export type MediaPurpose =
  | "website-image"
  | "project"
  | "casting"
  | "blog"
  | "gallery"
  | "team"
  | "bts"
  | "show"
  | "member-profile"
  | "member-portfolio"
  | "member-resume";

export type UploadedMediaResult = {
  id: string;
  kind: "image" | "document";
  purpose: MediaPurpose;
  visibility: "private" | "public";
  urls: Record<string, string>;
  duplicate?: boolean;
};
export const dateLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
export const mediaUrl = (value?: string) => value ?? "";
export const slugFor = (title: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 130) || "entry"
  }-${crypto.randomUUID().slice(0, 8)}`;
export async function fetchPage<T>(path: string, page = 1, limit = 20, force = false): Promise<Page<T>> {
  const separator = path.includes("?") ? "&" : "?";
  return cachedApi<Page<T>>(`${path}${separator}page=${page}&limit=${limit}`, { ttl: 30_000, force });
}
export async function allPages<T>(path: string, force = false): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const first = await cachedApi<Page<T>>(`${path}${separator}limit=100&page=1`, { ttl: 30_000, force });
  const items = [...first.items];
  for (let page = 2; page <= first.meta.pages; page++)
    items.push(...(await cachedApi<Page<T>>(`${path}${separator}limit=100&page=${page}`, { ttl: 30_000, force })).items);
  return items;
}
export async function uploadMedia(file: File, purpose: MediaPurpose): Promise<UploadedMediaResult> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a file up to 10 MB.");
  const body = new FormData();
  body.append("file", file);
  body.append("purpose", purpose);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mdadu-upload-start"));
  try {
    return await api<UploadedMediaResult>("/media", { method: "POST", body });
  } finally {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("mdadu-upload-end"));
  }
}
