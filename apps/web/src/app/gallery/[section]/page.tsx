import type { Metadata } from "next";

import { GalleryLibraryView } from "@/components/site/gallery-library-view";
import { pageMetadata } from "@/config/seo";
import websiteData from "@/data/website-data.json";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
};

export function generateStaticParams() {
  return websiteData.galleryPage.sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const record = websiteData.galleryPage.sections.find((item) => item.slug === section);

  if (!record) {
    return pageMetadata({
      title: "Gallery",
      description: "M. Dadu Films public image library.",
      path: `/gallery/${section}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: `${record.title} Gallery | M. Dadu Films`,
    description: record.description,
    path: `/gallery/${record.slug}`,
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { section } = await params;
  const query = await searchParams;
  const parsed = Number(query.page ?? 1);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

  return <GalleryLibraryView sectionSlug={section} pageNumber={page} />;
}
