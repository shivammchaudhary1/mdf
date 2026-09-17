import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["team"].title,
  description: collectionCopy["team"].description,
};
export default function Page() {
  return <CollectionPage kind="team" />;
}
