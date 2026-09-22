import type { Metadata } from "next";

import { TalentProfileView } from "@/components/site/talent-profile-view";
import { pageMetadata } from "@/config/seo";
import websiteData from "@/data/website-data.json";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return websiteData.talentPage.directory.items.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = websiteData.talentPage.directory.items.find((talent) => talent.id === id);

  if (!item) {
    return pageMetadata({
      title: "Talent Profile",
      description: "Public talent profile on M. Dadu Films.",
      path: `/talent/${id}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: `${item.name} — ${item.role}`,
    description: item.bio,
    path: `/talent/${item.id}`,
    image: item.image || undefined,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <TalentProfileView id={id} />;
}
