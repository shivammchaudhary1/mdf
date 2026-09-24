"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/services/api";
import { mediaUrl, type PageMeta } from "@/services/workspace";

export type TeamGroup = "Core Team" | "Creative Team" | "Advisors";

export type PublicTeamMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  designation: string;
  group: TeamGroup;
  bio: string;
  shortBio: string;
  details: string;
  focus: string[];
  image: string;
  imageAlt: string;
  order: number;
  instagram: string;
  facebook: string;
  x: string;
  linkedin: string;
  youtube: string;
};

type TeamSource = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  body?: string[];
  coverImage?: string;
  role?: string;
  order?: number;
  data?: Record<string, string>;
};

type TeamPage = {
  items: TeamSource[];
  meta: PageMeta;
};

function teamGroup(value?: string): TeamGroup {
  if (value === "Creative Team" || value === "Advisors") return value;
  return "Core Team";
}

export function mapPublicTeamMember(item: TeamSource): PublicTeamMember {
  const group = teamGroup(item.data?.group?.trim() || item.category?.trim());

  return {
    id: item._id,
    slug: item.slug,
    name: item.title,
    role: item.role ?? "",
    designation: item.role ?? "",
    group,
    bio: item.description ?? "",
    shortBio: item.description ?? "",
    details: item.data?.details ?? "",
    focus: item.body ?? [],
    image: mediaUrl(item.coverImage ?? item.data?.image ?? ""),
    imageAlt: item.data?.imageAlt ?? item.title,
    order: item.order ?? 0,
    instagram: item.data?.instagram ?? "",
    facebook: item.data?.facebook ?? "",
    x: item.data?.x ?? "",
    linkedin: item.data?.linkedin ?? "",
    youtube: item.data?.youtube ?? "",
  };
}

export function usePublicTeam(group?: TeamGroup) {
  const [team, setTeam] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        sort: "order",
      });

      if (group) params.set("category", group);

      const result = await api<TeamPage>(`/content/team?${params.toString()}`);
      setTeam(result.items.map(mapPublicTeamMember));
    } catch (loadError) {
      setTeam([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load team.");
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { team, loading, error, refresh };
}
