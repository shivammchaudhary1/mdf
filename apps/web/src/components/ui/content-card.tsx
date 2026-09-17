import Link from "next/link";
import { SmartImage, type PlaceholderKind } from "./smart-image";
import type { ContentItem, CollectionKind } from "@/types/content";
export function ContentCard({
  item,
  kind,
}: {
  item: ContentItem;
  kind: CollectionKind;
}) {
  const detail = ["projects", "casting", "blog"].includes(kind);
  const placeholderKind: PlaceholderKind =
    kind === "projects"
      ? "project"
      : kind === "team"
        ? "team"
        : kind === "blog"
          ? "blog"
          : "gallery";
  return (
    <article className="card group overflow-hidden">
      {kind !== "casting" && (
        <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
          <SmartImage
            src={item.image}
            placeholderKind={placeholderKind}
            alt={item.image ? item.title : `${item.title} — image placeholder`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">{item.category}</span>
          {item.status && <span className="badge">{item.status}</span>}
        </div>
        <h3 className="font-display text-2xl font-semibold">
          {detail ? (
            <Link
              href={`/${kind}/${item.slug}`}
              className="hover:text-[var(--brand-red)]"
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
        <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
        {item.location && (
          <p className="mt-3 text-sm text-slate-500">{item.location}</p>
        )}
        {detail && (
          <Link
            href={`/${kind}/${item.slug}`}
            className="mt-6 inline-block text-sm font-semibold text-[var(--brand-red)]"
          >
            {kind === "blog" ? "Read story" : "View details"}{" "}
            <span aria-hidden="true">→</span>
            <span className="sr-only">: {item.title}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
