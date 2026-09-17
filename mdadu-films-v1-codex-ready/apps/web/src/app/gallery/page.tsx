import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["gallery"].title,
  description: collectionCopy["gallery"].description,
};
export default function Page() {
  return <CollectionPage kind="gallery" />;
}
