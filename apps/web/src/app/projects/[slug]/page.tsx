import type { Metadata } from "next";

import { StaticDetailView } from "@/components/site/static-detail-view";
import { pageMetadata } from "@/config/seo";
import { getContentItem } from "@/services/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("projects", slug).catch(() => undefined);

  if (!item) {
    return pageMetadata({
      title: "Project",
      description: "Film and production work from M. Dadu Films.",
      path: `/projects/${slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: item.title,
    description: item.description || "Explore this M. Dadu Films production.",
    path: `/projects/${slug}`,
    image: item.image,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <StaticDetailView kind="projects" slug={slug} />;
}
