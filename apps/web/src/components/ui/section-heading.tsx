import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  inverted = false,
  description,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  inverted?: boolean;
  description?: string;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-6 md:mb-12">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2
          className={`font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl ${
            inverted ? "text-white" : "text-[var(--foreground)]"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 max-w-2xl leading-7 ${
              inverted ? "text-white/60" : "text-[var(--muted)]"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          className={`group inline-flex items-center gap-2 text-sm font-bold ${
            inverted ? "text-white" : "text-[var(--brand-red)]"
          }`}
          href={href}
        >
          {linkLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </div>
  );
}
