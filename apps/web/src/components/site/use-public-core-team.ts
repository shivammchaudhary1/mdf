"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/services/api";
import { mediaUrl, type PageMeta } from "@/services/workspace";

export type PublicCoreTeamMember = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  shortBio: string;
  details: string;
  focus: string[];
  image: string;
  imageAlt: string;
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
  description?: string;
  body?: string[];
  coverImage?: string;
  role?: string;
  data?: Record<string, string>;
};

type TeamPage = {
  items: TeamSource[];
  meta: PageMeta;
};

function mapMember(item: TeamSource): PublicCoreTeamMember {
  return {
    id: item._id,
    slug: item.slug,
    name: item.title,
    designation: item.role ?? "",
    shortBio: item.description ?? "",
    details: item.data?.details ?? "",
    focus: item.body ?? [],
    image: mediaUrl(item.coverImage ?? item.data?.image ?? ""),
    imageAlt: item.data?.imageAlt ?? item.title,
    instagram: item.data?.instagram ?? "",
    facebook: item.data?.facebook ?? "",
    x: item.data?.x ?? "",
    linkedin: item.data?.linkedin ?? "",
    youtube: item.data?.youtube ?? "",
  };
}

export function usePublicCoreTeam() {
  const [team, setTeam] = useState<PublicCoreTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api<TeamPage>("/content/team?page=1&limit=100&sort=order");
      setTeam(result.items.map(mapMember));
    } catch (loadError) {
      setTeam([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { team, loading, error, refresh };
}
