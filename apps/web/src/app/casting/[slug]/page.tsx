import type { Metadata } from "next";

import { StaticDetailView } from "@/components/site/static-detail-view";
import { pageMetadata } from "@/config/seo";
import { getContentItem } from "@/services/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("casting", slug).catch(() => undefined);

  if (!item) {
    return pageMetadata({
      title: "Casting Call",
      description: "Casting opportunities from M. Dadu Films.",
      path: `/casting/${slug}`,
      noindex: true,
    });
  }

  const location = item.location ? ` in ${item.location}` : "";
  return pageMetadata({
    title: item.title,
    description: item.description || `View casting details${location} and application information from M. Dadu Films.`,
    path: `/casting/${slug}`,
    image: item.image,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <StaticDetailView kind="castings" slug={slug} />;
}
