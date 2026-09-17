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
  const visual = ["gallery", "behind-the-scenes"].includes(kind);
  const portrait = kind === "team";
  const casting = kind === "casting";

  const placeholderKind: PlaceholderKind =
    kind === "projects"
      ? "project"
      : kind === "team"
        ? "team"
        : kind === "blog"
          ? "blog"
          : "gallery";

  if (casting) {
    return (
      <article className="card interactive-card relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-[var(--brand-red)]"
        />
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {item.category && (
            <span className="text-sm font-semibold text-[var(--muted)]">
              {item.category}
            </span>
          )}
          {item.status && <span className="badge">{item.status}</span>}
        </div>
        <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
          <Link
            href={`/${kind}/${item.slug}`}
            className="transition-colors hover:text-[var(--brand-red)]"
          >
            {item.title}
          </Link>
        </h3>
        {item.description && (
          <p className="mt-4 leading-7 text-[var(--muted)]">
            {item.description}
          </p>
        )}
        {item.location && (
          <p className="mt-5 text-sm font-semibold text-[var(--muted-strong)]">
            {item.location}
          </p>
        )}
        <Link
          href={`/${kind}/${item.slug}`}
          className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-red)]"
        >
          View opportunity <span aria-hidden="true">→</span>
          <span className="sr-only">: {item.title}</span>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`card interactive-card group overflow-hidden ${
        visual ? "bg-[#0f1116] text-white" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          portrait
            ? "aspect-[4/5]"
            : visual
              ? "aspect-[4/3]"
              : kind === "blog"
                ? "aspect-[16/10]"
                : "aspect-[3/2]"
        }`}
      >
        <SmartImage
          src={item.image}
          placeholderKind={placeholderKind}
          alt={item.image ? item.title : `${item.title} — image placeholder`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
        />
        {visual && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        )}
      </div>

      <div className={visual ? "p-5 sm:p-6" : "p-6 sm:p-7"}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {item.category && (
            <span
              className={`text-sm ${
                visual ? "text-white/60" : "text-[var(--muted)]"
              }`}
            >
              {item.category}
            </span>
          )}
          {item.status && <span className="badge">{item.status}</span>}
        </div>

        <h3
          className={`font-display font-semibold leading-tight ${
            portrait ? "text-2xl" : "text-2xl sm:text-[1.7rem]"
          }`}
        >
          {detail ? (
            <Link
              href={`/${kind}/${item.slug}`}
              className="transition-colors hover:text-[var(--brand-red)]"
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>

        {item.description && (
          <p
            className={`mt-3 leading-7 ${
              visual ? "text-white/70" : "text-[var(--muted)]"
            }`}
          >
            {item.description}
          </p>
        )}

        {item.location && (
          <p
            className={`mt-4 text-sm font-medium ${
              visual ? "text-white/60" : "text-[var(--muted)]"
            }`}
          >
            {item.location}
          </p>
        )}

        {detail && (
          <Link
            href={`/${kind}/${item.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-red)]"
          >
            {kind === "blog" ? "Read story" : "View details"}
            <span aria-hidden="true">→</span>
            <span className="sr-only">: {item.title}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
