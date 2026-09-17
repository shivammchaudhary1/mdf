import { PageShell } from "@/components/page-shell";
import { CollectionBrowser } from "@/components/collection-browser";
import { DemoNotice } from "@/components/ui/feedback";
import { getCollection } from "@/services/content";
import type { CollectionKind } from "@/types/content";
export async function CollectionPage({ kind }: { kind: CollectionKind }) {
  const collection = await getCollection(kind);
  return (
    <PageShell
      eyebrow={collection.eyebrow}
      title={collection.title}
      description={collection.description}
    >
      <div className="mt-12">
        {collection.isDemo && <DemoNotice />}
        <CollectionBrowser items={collection.items} kind={kind} />
      </div>
    </PageShell>
  );
}
