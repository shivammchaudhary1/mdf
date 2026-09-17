import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["casting"].title,
  description: collectionCopy["casting"].description,
};
export default function Page() {
  return <CollectionPage kind="casting" />;
}
