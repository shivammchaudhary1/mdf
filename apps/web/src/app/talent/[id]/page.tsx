import type { Metadata } from "next";

import { TalentProfileView } from "@/components/site/talent-profile-view";
import { runtimeConfig } from "@/config/runtime";
import { pageMetadata } from "@/config/seo";

type Props = { params: Promise<{ id: string }> };
type TalentMeta = {
  name: string;
  profile?: {
    bio?: string;
    profession?: string;
    city?: string;
    photo?: string;
  } | null;
};

async function talent(id: string) {
  const response = await fetch(`${runtimeConfig.apiUrl}/talent/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) return undefined;
  return (await response.json()) as TalentMeta;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await talent(id).catch(() => undefined);

  if (!item?.profile) {
    return pageMetadata({
      title: "Talent Profile",
      description: "Public talent profile on M. Dadu Films.",
      path: `/talent/${id}`,
      noindex: true,
    });
  }

  const role = item.profile.profession ? ` — ${item.profile.profession}` : "";
  const location = item.profile.city ? ` in ${item.profile.city}` : "";

  return pageMetadata({
    title: `${item.name}${role}`,
    description: item.profile.bio || `Discover ${item.name}${location} on the M. Dadu Films talent network.`,
    path: `/talent/${id}`,
    image: item.profile.photo,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <TalentProfileView id={id} />;
}
