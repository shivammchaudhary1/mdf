import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["projects"].title,
  description: collectionCopy["projects"].description,
};
export default function Page() {
  return <CollectionPage kind="projects" />;
}
