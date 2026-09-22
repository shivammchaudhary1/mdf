import { BlogPageView } from "@/components/site/blog-page-view";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata({
  title: "Film Production, Casting & Filmmaking Blog",
  description:
    "Practical filmmaking guides, casting advice, production insights, cinematography, post-production and industry perspectives from M. Dadu Films.",
  path: "/blog",
});

export default function Page() {
  return <BlogPageView />;
}
