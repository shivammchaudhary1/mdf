import { BlogPageView } from "@/components/site/blog-page-view";
import { pageMetadata } from "@/config/seo";
import { getCollection } from "@/services/content";

export const metadata = pageMetadata({
  title: "Film Production, Casting & Filmmaking Blog",
  description:
    "Practical filmmaking guides, casting advice, production insights, cinematography, post-production and industry perspectives from M. Dadu Films.",
  path: "/blog",
});

const EMPTY_META = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
  hasNext: false,
  hasPrevious: false,
};

export default async function Page() {
  const collection = await getCollection("blog", 1, 20).catch(() => ({
    items: [],
    meta: EMPTY_META,
  }));

  return <BlogPageView initialItems={collection.items} initialMeta={collection.meta} />;
}
