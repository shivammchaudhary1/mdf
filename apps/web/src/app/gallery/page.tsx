import { GalleryPageView } from "@/components/site/gallery-page-view";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata({
  title: "Gallery | M. Dadu Films",
  description:
    "Explore featured frames, behind-the-scenes photography and public visual archives from M. Dadu Films productions and creative work.",
  path: "/gallery",
});

export default function Page() {
  return <GalleryPageView />;
}
