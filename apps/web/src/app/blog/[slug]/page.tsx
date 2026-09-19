import type { Metadata } from "next";

import { StaticDetailView } from "@/components/site/static-detail-view";
import { pageMetadata } from "@/config/seo";
import { getContentItem } from "@/services/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("blog", slug).catch(() => undefined);

  if (!item) {
    return pageMetadata({
      title: "Blog",
      description: "Stories, production insights and updates from M. Dadu Films.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.description || "Read the latest from M. Dadu Films.",
    path: `/blog/${slug}`,
    image: item.image,
    type: "article",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <StaticDetailView kind="blogs" slug={slug} />;
}
