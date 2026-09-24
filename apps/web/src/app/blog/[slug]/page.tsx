import type { Metadata } from "next";

import { StaticBlogDetailView } from "@/components/site/static-blog-detail-view";
import { StaticDetailView } from "@/components/site/static-detail-view";
import { pageMetadata } from "@/config/seo";
import websiteData from "@/data/website-data.json";
import { getContentItem } from "@/services/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return websiteData.blogs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dynamicItem = await getContentItem("blog", slug).catch(() => undefined);

  if (dynamicItem) {
    return {
      ...pageMetadata({
        title: dynamicItem.seoTitle || dynamicItem.title,
        description: dynamicItem.seoDescription || dynamicItem.description || "Read the latest from M. Dadu Films.",
        path: `/blog/${slug}`,
        image: dynamicItem.image,
        type: "article",
      }),
      keywords: dynamicItem.tags,
      authors: [{ name: dynamicItem.data?.author || "M. Dadu Films" }],
    };
  }

  const staticItem = websiteData.blogs.find((item) => item.slug === slug);

  if (staticItem) {
    return {
      ...pageMetadata({
        title: staticItem.seoTitle || staticItem.title,
        description: staticItem.seoDescription || staticItem.summary,
        path: `/blog/${slug}`,
        image: staticItem.image,
        type: "article",
      }),
      keywords: staticItem.keywords,
      authors: [{ name: staticItem.author }],
    };
  }

  return pageMetadata({
    title: "Blog",
    description: "Stories, production insights and updates from M. Dadu Films.",
    path: `/blog/${slug}`,
    noindex: true,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const dynamicItem = await getContentItem("blog", slug).catch(() => undefined);

  if (dynamicItem) return <StaticDetailView kind="blogs" slug={slug} />;

  const staticItem = websiteData.blogs.find((item) => item.slug === slug);
  if (staticItem) return <StaticBlogDetailView slug={slug} />;

  return <StaticDetailView kind="blogs" slug={slug} />;
}
