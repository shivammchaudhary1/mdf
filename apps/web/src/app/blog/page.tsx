import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["blog"].title,
  description: collectionCopy["blog"].description,
};
export default function Page() {
  return <CollectionPage kind="blog" />;
}
