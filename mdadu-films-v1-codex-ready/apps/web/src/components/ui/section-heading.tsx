import Link from "next/link";
export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          className="text-sm font-semibold text-[var(--brand-red)]"
          href={href}
        >
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
