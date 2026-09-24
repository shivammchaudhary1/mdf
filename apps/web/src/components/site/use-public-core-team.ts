"use client";

import { useEffect, useState } from "react";

import { cachedApi } from "@/services/api";
import { mediaUrl, type PageMeta } from "@/services/workspace";

export type PublicCoreTeamMember = {
  name: string;
  designation: string;
  shortBio: string;
  details: string;
  focus: string[];
  image: string;
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
  data?: Record<string, string>;
};

type TeamPage = {
  items: TeamSource[];
  meta: PageMeta;
};

function mapMember(item: TeamSource): PublicCoreTeamMember {
  return {
    name: item.title,
    designation: item.role ?? "",
    shortBio: item.description ?? "",
    details: item.data?.details ?? "",
    focus: item.body ?? [],
    image: mediaUrl(item.coverImage ?? item.data?.image ?? ""),
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

  useEffect(() => {
    let active = true;

    void cachedApi<TeamPage>("/content/team?category=Core%20Team&page=1&limit=100", { ttl: 30_000, force: true })
      .then((result) => {
        if (active) setTeam(result.items.map(mapMember));
      })
      .catch(() => {
        if (active) setTeam([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { team, loading };
}
