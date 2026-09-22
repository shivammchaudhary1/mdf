"use client";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { PUBLIC_COMPANY } from "@/config/company";
import template from "@/data/website-data.json";
import { type ContentRecord, dateLabel, fetchPage, mediaUrl, type PageMeta } from "@/services/workspace";
type PublicTalentRecord = {
  id: string;
  name: string;
  verified: boolean;
  profile?: { profession?: string; city?: string; experience?: string; skills?: string[]; photo?: string } | null;
};
type PublicRecord = ContentRecord & {
  type?: string;
  status?: string;
  summary?: string;
  location?: string;
  shootDate?: string;
  deadline?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  compensation?: string;
};
type PublicBlogPreview = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  image: string;
};

const empty = {
  ...template,
  stats: [
    { value: "Films", label: "Production" },
    { value: "Ads", label: "Brand Films" },
    { value: "Music", label: "Videos" },
    { value: "Talent", label: "Community" },
  ],
  brand: {
    ...template.brand,
    name: String(PUBLIC_COMPANY.name),
    headline: String(PUBLIC_COMPANY.tagline),
    description: String(PUBLIC_COMPANY.description),
    email: String(PUBLIC_COMPANY.email),
    phone: String(PUBLIC_COMPANY.phone),
    location: String(PUBLIC_COMPANY.location),
  },
  projects: [] as typeof template.projects,
  blogs: [] as PublicBlogPreview[],
  team: template.team,
  gallery: [] as typeof template.gallery,
  castings: [] as typeof template.castings,
  talents: [] as Array<(typeof template.talents)[number] & { id: string }>,
};
type PublicData = typeof empty & { meta?: PageMeta; loading: boolean };
type Options = {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
  city?: string;
  profession?: string;
  gender?: string;
  skills?: string;
  languages?: string;
  availability?: string;
  experience?: string;
  ageMin?: string;
  ageMax?: string;
};
function query(base: string, values: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) if (v?.trim()) p.set(k, v.trim());
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}
export function usePublicData(
  domain: "brand" | "home" | "projects" | "blogs" | "team" | "gallery" | "castings" | "talents",
  options: Options = {},
) {
  const [data, setData] = useState<PublicData>({ ...empty, loading: true });
  const toast = useToast();
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) setData((current) => ({ ...current, loading: true }));
      const updates: Partial<typeof empty> = {};
      let meta: PageMeta | undefined;
      if (domain === "home") {
        const [projects, blogs] = await Promise.all([
          fetchPage<PublicRecord>("/projects", 1, 4),
          fetchPage<PublicRecord>("/content/blog", 1, 3),
        ]);
        if (projects.items.length) {
          updates.projects = projects.items.map((x) => ({
            slug: x.slug,
            title: x.title,
            category: x.type ?? "",
            status: x.status ?? "",
            summary: x.summary ?? x.description ?? "",
            year: new Date(x.createdAt).getFullYear().toString(),
            location: x.location ?? "",
            image: mediaUrl(x.coverImage),
          }));
        }
        if (blogs.items.length) {
          updates.blogs = blogs.items.map((x) => ({
            slug: x.slug,
            title: x.title,
            category: x.category ?? "",
            date: dateLabel(x.publishedAt ?? x.createdAt),
            readTime: `${Math.max(1, Math.ceil((x.body ?? []).join(" ").split(/\s+/).length / 200))} min read`,
            summary: x.description ?? "",
            image: mediaUrl(x.coverImage),
          }));
        }
      } else if (domain !== "brand") {
        const page = options.page ?? 1,
          limit = options.limit ?? (domain === "blogs" ? 9 : 12);
        if (domain === "talents") {
          const result = await fetchPage<PublicTalentRecord>(
            query("/talent", {
              group: options.filter && options.filter !== "All" ? options.filter.toLowerCase() : undefined,
              search: options.search,
              city: options.city,
              profession: options.profession,
              gender: options.gender,
              skills: options.skills,
              languages: options.languages,
              availability: options.availability,
              experience: options.experience,
              ageMin: options.ageMin,
              ageMax: options.ageMax,
            }),
            page,
            limit,
          );
          updates.talents = result.items.map((x) => ({
            id: x.id,
            name: x.name,
            role: x.profile?.profession ?? "",
            location: x.profile?.city ?? "",
            experience: x.profile?.experience ?? "",
            skills: x.profile?.skills ?? [],
            verified: x.verified,
            image: mediaUrl(x.profile?.photo),
          }));
          meta = result.meta;
        } else {
          const base =
            domain === "projects" ? "/projects" : domain === "castings" ? "/castings" : `/content/${domain === "blogs" ? "blog" : domain}`;
          const result = await fetchPage<PublicRecord>(
            query(base, { category: options.filter && options.filter !== "All" ? options.filter : undefined, search: options.search }),
            page,
            limit,
          );
          const rows = result.items;
          meta = result.meta;
          if (domain === "projects")
            updates.projects = rows.map((x) => ({
              slug: x.slug,
              title: x.title,
              category: x.type ?? "",
              status: x.status ?? "",
              summary: x.summary ?? x.description ?? "",
              year: new Date(x.createdAt).getFullYear().toString(),
              location: x.location ?? "",
              image: mediaUrl(x.coverImage),
            }));
          if (domain === "blogs")
            updates.blogs = rows.map((x) => ({
              slug: x.slug,
              title: x.title,
              category: x.category ?? "",
              date: dateLabel(x.publishedAt ?? x.createdAt),
              readTime: `${Math.max(1, Math.ceil((x.body ?? []).join(" ").split(/\s+/).length / 200))} min read`,
              summary: x.description ?? "",
              image: mediaUrl(x.coverImage),
            }));
          if (domain === "team" && rows.length)
            updates.team = rows.map((x) => ({
              name: x.title,
              role: x.role ?? "",
              group: x.data?.group ?? "Core Team",
              bio: x.description ?? "",
              image: mediaUrl(x.coverImage),
            }));
          if (domain === "gallery")
            updates.gallery = rows.map((x) => ({ title: x.title, category: x.category ?? "", image: mediaUrl(x.coverImage) }));
          if (domain === "castings")
            updates.castings = rows.map((x) => ({
              slug: x.slug,
              title: x.title,
              project: "",
              category: x.category ?? "",
              location: x.location ?? "",
              age: x.ageMin !== undefined || x.ageMax !== undefined ? `${x.ageMin ?? 0}–${x.ageMax ?? 120}` : "—",
              gender: x.gender ?? "",
              shoot: dateLabel(x.shootDate),
              deadline: dateLabel(x.deadline),
              compensation: x.compensation ?? "",
              summary: x.summary ?? x.description ?? "",
            }));
        }
      }
      const settings = await fetchPage<ContentRecord>("/content/settings", 1, 100);
      const company = settings.items.find((x) => x.slug === "company")?.data;
      if (company)
        updates.brand = {
          ...empty.brand,
          name: company.companyName || empty.brand.name,
          headline: company.tagline || empty.brand.headline,
          description: company.description || empty.brand.description,
          email: company.email || empty.brand.email,
          phone: company.phone || empty.brand.phone,
          location: company.location || empty.brand.location,
        };
      if (active) setData({ ...empty, ...updates, meta, loading: false });
    };
    void run().catch((error) => {
      if (active) {
        setData((current) => ({ ...current, loading: false }));
        toast.error(error instanceof Error ? error.message : "Unable to load content.");
      }
    });
    return () => {
      active = false;
    };
  }, [
    domain,
    options.page,
    options.limit,
    options.filter,
    options.search,
    options.city,
    options.profession,
    options.gender,
    options.skills,
    options.languages,
    options.availability,
    options.experience,
    options.ageMin,
    options.ageMax,
    toast,
  ]);
  return data;
}
