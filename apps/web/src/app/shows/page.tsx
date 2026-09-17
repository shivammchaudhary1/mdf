import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["shows"].title,
  description: collectionCopy["shows"].description,
};
export default function Page() {
  return <CollectionPage kind="shows" />;
}
