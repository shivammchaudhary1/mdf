import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { PageShell } from "@/components/page-shell";
import { SmartImage } from "@/components/ui/smart-image";
import { getContentItem } from "@/services/content";
import type { CollectionKind } from "@/types/content";
export async function ContentDetail({ kind, slug }: { kind: CollectionKind; slug: string }) {
  const item = await getContentItem(kind, slug);
  if (!item) notFound();
  return (
    <PageShell eyebrow={item.category} title={item.title} description={item.description}>
      <div className="mt-10">
        <Link href={`/${kind}`} className="text-sm font-semibold text-[var(--brand-red)]">
          ← Back to {kind}
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <article>
            {kind !== "casting" && (
              <SmartImage
                src={item.image}
                placeholderKind={kind === "blog" ? "blog" : "project"}
                alt={`${item.title} — image placeholder`}
                width={1200}
                height={800}
                className="mb-8 w-full rounded-2xl"
              />
            )}
            {item.body.map((paragraph) => (
              <p key={paragraph} className="mb-5 text-lg leading-8 text-slate-600">
                {paragraph}
              </p>
            ))}
          </article>
          <aside className="card h-fit p-7">
            <h2 className="font-display text-2xl font-semibold">{kind === "blog" ? "Stay connected" : "At a glance"}</h2>
            <dl className="mt-6 grid gap-5">
              {[
                ["Category", item.category],
                ["Status", item.status],
                ["Location", item.location],
                ["Role", item.role],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
            </dl>

            {kind === "projects" || kind === "casting" ? (
              <ApplyForm
                opportunityId={item._id}
                opportunityType={kind === "casting" ? "CASTING" : "PROJECT"}
                closed={["Closed", "Completed"].includes(item.status ?? "") || !!(item.deadline && new Date(item.deadline) <= new Date())}
              />
            ) : kind === "blog" ? (
              <Link href="/blog" className="brand-button brand-button-primary mt-8">
                More from the journal →
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
