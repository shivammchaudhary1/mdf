import type { Metadata } from "next";

import { TalentProfileView } from "@/components/site/talent-profile-view";
import { pageMetadata } from "@/config/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return pageMetadata({
    title: "Talent Profile",
    description: "Verified public member profile on M. Dadu Films.",
    path: `/talent/${id}`,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <TalentProfileView id={id} />;
}
