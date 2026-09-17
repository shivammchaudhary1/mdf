import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata = {
  title: collectionCopy["behind-the-scenes"].title,
  description: collectionCopy["behind-the-scenes"].description,
};
export default function Page() {
  return <CollectionPage kind="behind-the-scenes" />;
}
