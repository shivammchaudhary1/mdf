import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { CastingApplyPanel } from "@/components/site/casting-apply-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { absoluteSiteUrl } from "@/config/seo";
import { getContentItem } from "@/services/content";

type DetailKind = "projects" | "blogs" | "castings";
type ContentItem = NonNullable<Awaited<ReturnType<typeof getContentItem>>>;

function dateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ageLabel(min?: number, max?: number) {
  if (min !== undefined && max !== undefined) return `${min}–${max} years`;
  if (min !== undefined) return `${min}+ years`;
  if (max !== undefined) return `Up to ${max} years`;
  return "";
}

function ProjectApply({ item, status }: { item: ContentItem; status: string }) {
  const closed = ["Completed", "Archived"].includes(status);

  if (closed) {
    return (
      <div className="rounded-[18px] border border-amber-200/70 bg-amber-50/70 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-amber-800">Applications closed</p>
        <p className="mt-1 text-sm text-amber-950/70">This project is not accepting applications right now.</p>
      </div>
    );
  }

  return (
    <details className="group rounded-[18px] border border-black/6 bg-white shadow-[0_12px_34px_rgba(0,0,0,.035)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="site-kicker">Opportunity</p>
          <strong className="font-display mt-1 block text-xl font-semibold text-[#171717]">Apply to this project</strong>
        </div>
        <span className="text-xl text-[var(--brand-red)] transition group-open:rotate-45">+</span>
      </summary>

      <div className="border-t border-black/6 px-5 pb-6">
        <ApplyForm opportunityId={String(item._id ?? "")} opportunityType="PROJECT" closed={false} />
      </div>
    </details>
  );
}

function ProjectDetail({ item }: { item: ContentItem }) {
  const title = text(item.title) || "Project";
  const category = text(item.category) || "Project";
  const summary = text(item.summary) || text(item.description);
  const image = text(item.image);
  const status = text(item.status);
  const location = text(item.location);
  const creditsText = text(item.creditsText);

  const tags = Array.isArray(item.tags)
    ? [...new Set(item.tags.map((value) => text(value)).filter(Boolean))].slice(0, 20)
    : [];

  const credits = Array.isArray(item.credits)
    ? item.credits
        .map((credit) => ({
          name: text(credit?.name),
          role: text(credit?.role),
        }))
        .filter((credit) => credit.name || credit.role)
    : [];

  const gallery = Array.isArray(item.galleryImages)
    ? item.galleryImages.map((value) => text(value)).filter(Boolean).slice(0, 4)
    : [];

  const links = Array.isArray(item.links)
    ? item.links
        .map((link) => ({
          title: text(link?.title) || "View Link",
          url: text(link?.url),
        }))
        .filter((link) => link.url)
    : item.trailerUrl
      ? [{ title: "Trailer", url: text(item.trailerUrl) }]
      : [];

  const body = Array.isArray(item.body) ? item.body.map((value) => text(value)).filter(Boolean) : [];
  const description = text(item.description);
  const about = body.length ? body : description && description !== summary ? [description] : [];

  const hasSidebar = credits.length > 0 || !!creditsText || links.length > 0;
  const hasGallery = gallery.length > 0;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#f7f6f3]">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/projects" className="transition hover:text-black">
                Projects
              </Link>
              <span aria-hidden="true">/</span>
              <span className="max-w-[190px] truncate text-[#444] sm:max-w-sm">{title}</span>
            </nav>
          </div>

          <div className="site-shell pb-6 pt-4 sm:pb-8 sm:pt-6">
            <div className="grid overflow-hidden rounded-[24px] border border-black/6 bg-[#111] shadow-[0_22px_70px_rgba(0,0,0,.12)] lg:grid-cols-[.92fr_1.08fr]">
              <div className="flex min-h-[360px] flex-col justify-between p-6 text-white sm:p-8 lg:min-h-[430px] lg:p-10">
                <div>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-white/55 transition hover:text-white"
                  >
                    ← Back to Projects
                  </Link>

                  <div className="mt-8 flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff5e67]">{category}</p>
                    <span className="h-px w-10 bg-[#ff5e67]" aria-hidden="true" />
                  </div>

                  <h1 className="font-display mt-4 max-w-xl text-[clamp(2.8rem,4.8vw,4.8rem)] font-semibold leading-[.92] tracking-[-.045em]">
                    {title}
                  </h1>

                  {summary && <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-[15px]">{summary}</p>}
                </div>

                <div className="mt-8">
                  {(status || location) && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {status && (
                        <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[10px] font-bold text-white/80">
                          {status}
                        </span>
                      )}
                      {location && (
                        <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[10px] font-bold text-white/80">
                          {location}
                        </span>
                      )}
                    </div>
                  )}

                  {!!tags.length && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/7 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.07em] text-white/55"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <SiteMedia
                src={image || undefined}
                alt={image ? `${title} cover` : `${title} project artwork`}
                kind="project"
                priority
                className="min-h-[300px] sm:min-h-[360px] lg:min-h-[430px]"
                imageClassName="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="site-section !py-9 sm:!py-11">
          <div className="site-shell">
            {(about.length > 0 || hasSidebar) && (
              <div className={`grid gap-5 ${hasSidebar ? "lg:grid-cols-[1.55fr_.85fr]" : ""}`}>
                {about.length > 0 && (
                  <article className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,.025)] sm:p-7">
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="site-kicker">Project Overview</p>
                        <h2 className="font-display mt-1 text-2xl font-semibold">About the work</h2>
                      </div>
                    </div>

                    <div className={`text-[14px] leading-7 text-[#616161] ${about.length > 1 ? "lg:columns-2 lg:gap-8" : ""}`}>
                      {about.map((paragraph, index) => (
                        <p key={`${index}-${paragraph.slice(0, 32)}`} className={`${index ? "mt-4 lg:mt-0" : ""} break-inside-avoid`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                )}

                {hasSidebar && (
                  <aside className="grid content-start gap-4">
                    {(credits.length > 0 || creditsText) && (
                      <section className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)]">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="site-kicker">People</p>
                            <h2 className="font-display mt-1 text-xl font-semibold">Credits</h2>
                          </div>
                          {!!credits.length && <span className="text-[10px] font-semibold text-[#aaa]">{credits.length}</span>}
                        </div>

                        {!!credits.length && (
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {credits.map((credit, index) => (
                              <div key={`${credit.name}-${credit.role}-${index}`} className="rounded-xl bg-[#f7f6f3] px-3.5 py-3">
                                {credit.name && <strong className="block truncate text-[12px] text-[#222]">{credit.name}</strong>}
                                {credit.role && <span className="mt-0.5 block truncate text-[10px] text-[#888]">{credit.role}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {creditsText && <p className={`${credits.length ? "mt-4" : ""} text-xs leading-6 text-[#777]`}>{creditsText}</p>}
                      </section>
                    )}

                    {!!links.length && (
                      <section className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)]">
                        <p className="site-kicker">Watch & Explore</p>
                        <h2 className="font-display mt-1 text-xl font-semibold">Project links</h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {links.map((link, index) => (
                            <a
                              key={`${link.title}-${link.url}-${index}`}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-black/8 bg-[#fafafa] px-3 py-1.5 text-[10px] font-bold text-[#444] transition hover:border-black/20 hover:bg-white"
                            >
                              {link.title} <span aria-hidden="true">↗</span>
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </aside>
                )}
              </div>
            )}

            {hasGallery && (
              <section className="mt-5 rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="site-kicker">Visuals</p>
                    <h2 className="font-display mt-1 text-xl font-semibold">Gallery</h2>
                  </div>
                  <span className="text-[10px] font-semibold text-[#aaa]">{gallery.length} image{gallery.length === 1 ? "" : "s"}</span>
                </div>

                <div
                  className={`grid gap-3 ${
                    gallery.length === 1
                      ? "max-w-md"
                      : gallery.length === 2
                        ? "sm:grid-cols-2"
                        : gallery.length === 3
                          ? "sm:grid-cols-3"
                          : "grid-cols-2 lg:grid-cols-4"
                  }`}
                >
                  {gallery.map((src, index) => (
                    <SiteMedia
                      key={`${src}-${index}`}
                      src={src}
                      alt={`${title} gallery ${index + 1}`}
                      kind="project"
                      className="aspect-[4/3] rounded-[14px]"
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-5">
              <ProjectApply item={item} status={status} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function CastingDetail({ item, slug }: { item: ContentItem; slug: string }) {
  const title = text(item.title) || "Casting Opportunity";
  const category = text(item.category) || "Casting Call";
  const role = text(item.role);
  const summary = text(item.summary) || text(item.description);
  const description = text(item.description);
  const image = text(item.image);
  const location = text(item.location);
  const experience = text(item.experience);
  const compensation = text(item.compensation);
  const requirements = text(item.requirements);
  const deadline = dateLabel(item.deadline);
  const shootDate = dateLabel(item.shootDate);
  const age = ageLabel(item.ageMin, item.ageMax);
  const gender = text(item.gender);
  const closed = item.acceptingApplications === false;

  const tags = Array.isArray(item.tags)
    ? [...new Set(item.tags.map((value) => text(value)).filter(Boolean))].slice(0, 20)
    : [];

  const details = Array.isArray(item.details) ? item.details.map((value) => text(value)).filter(Boolean) : [];
  const showDescription = !!description && description !== summary;
  const hasContent = showDescription || !!requirements || details.length > 0;

  const facts = [
    role ? { label: "Role", value: role } : null,
    location ? { label: "Location", value: location } : null,
    deadline ? { label: "Apply By", value: deadline } : null,
    shootDate ? { label: "Shoot Date", value: shootDate } : null,
    age ? { label: "Age", value: age } : null,
    gender ? { label: "Gender", value: gender } : null,
    experience ? { label: "Experience", value: experience } : null,
    compensation ? { label: "Compensation", value: compensation } : null,
  ].filter((value): value is { label: string; value: string } => Boolean(value));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#f7f6f3]">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/casting" className="transition hover:text-black">
                Casting
              </Link>
              <span aria-hidden="true">/</span>
              <span className="max-w-[190px] truncate text-[#444] sm:max-w-sm">{title}</span>
            </nav>
          </div>

          <div className="site-shell pb-6 pt-4 sm:pb-8 sm:pt-6">
            <div className="grid overflow-hidden rounded-[24px] border border-black/6 bg-[#111] shadow-[0_22px_70px_rgba(0,0,0,.12)] lg:grid-cols-[.95fr_1.05fr]">
              <div className="flex min-h-[360px] flex-col justify-between p-6 text-white sm:p-8 lg:min-h-[430px] lg:p-10">
                <div>
                  <Link
                    href="/casting"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-white/55 transition hover:text-white"
                  >
                    ← Back to Casting
                  </Link>

                  <div className="mt-8 flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff5e67]">{category}</p>
                    <span className="h-px w-10 bg-[#ff5e67]" aria-hidden="true" />
                  </div>

                  <h1 className="font-display mt-4 max-w-xl text-[clamp(2.65rem,4.6vw,4.7rem)] font-semibold leading-[.93] tracking-[-.045em]">
                    {title}
                  </h1>

                  {summary && <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-[15px]">{summary}</p>}
                </div>

                <div className="mt-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-2 text-[10px] font-bold ${
                        closed ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      }`}
                    >
                      {closed ? "Applications Closed" : "Applications Open"}
                    </span>

                    {role && (
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[10px] font-bold text-white/80">{role}</span>
                    )}
                  </div>

                  {!!tags.length && (
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/7 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.07em] text-white/55">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {!closed && (
                    <a href="#casting-application" className="site-button site-button-primary mt-6">
                      View & Apply
                    </a>
                  )}
                </div>
              </div>

              <SiteMedia
                src={image || undefined}
                alt={image ? `${title} casting cover` : `${title} casting artwork`}
                kind="team"
                priority
                className="min-h-[300px] sm:min-h-[360px] lg:min-h-[430px]"
                imageClassName="object-cover"
              />
            </div>

            {!!facts.length && (
              <section className="mt-4 grid overflow-hidden rounded-[18px] border border-black/6 bg-white shadow-[0_10px_32px_rgba(0,0,0,.025)] sm:grid-cols-2 lg:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="border-black/6 px-4 py-3.5 sm:border-r sm:last:border-r-0 lg:[&:nth-child(4n)]:border-r-0">
                    <span className="block text-[8px] font-black uppercase tracking-[.1em] text-[#aaa]">{fact.label}</span>
                    <strong className="mt-1 block text-[12px] font-semibold text-[#333]">{fact.value}</strong>
                  </div>
                ))}
              </section>
            )}
          </div>
        </section>

        <section className="site-section !py-8 sm:!py-10">
          <div className="site-shell">
            <div className={`grid gap-5 ${hasContent ? "lg:grid-cols-[1.4fr_.72fr]" : "lg:grid-cols-[minmax(0,760px)] lg:justify-center"}`}>
              {hasContent && (
                <article className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,.025)] sm:p-7">
                  {showDescription && (
                    <section>
                      <p className="site-kicker">Role Brief</p>
                      <h2 className="font-display mt-1 text-2xl font-semibold">About this opportunity</h2>
                      <p className="mt-4 text-[14px] leading-7 text-[#626262]">{description}</p>
                    </section>
                  )}

                  {(requirements || details.length > 0) && (
                    <section className={showDescription ? "mt-7 border-t border-black/6 pt-7" : ""}>
                      <p className="site-kicker">What we need</p>
                      <h2 className="font-display mt-1 text-2xl font-semibold">Requirements & details</h2>

                      {requirements && <p className="mt-4 whitespace-pre-line text-[14px] leading-7 text-[#626262]">{requirements}</p>}

                      {!!details.length && (
                        <ul className="mt-5 grid gap-2.5">
                          {details.map((detail, index) => (
                            <li key={`${detail}-${index}`} className="flex gap-3 rounded-xl bg-[#f7f6f3] px-4 py-3 text-[13px] leading-6 text-[#5f5f5f]">
                              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )}
                </article>
              )}

              <aside id="casting-application" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
                <CastingApplyPanel opportunityId={String(item._id ?? "")} closed={closed} returnPath={`/casting/${slug}`} />
              </aside>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function blogHtmlText(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:p|h2|h3|li|blockquote|div)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function blogAnchor(value: string, fallback: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || fallback
  );
}

function blogArticleBlocks(body: string[]) {
  const seen = new Map<string, number>();

  return body.map((source, index) => {
    let html = source.trim();
    let level: 2 | 3 | undefined;
    let label = "";

    const heading = html.match(/^\s*<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i);
    const legacyHeading = html.match(/^\s*<p>\s*H([23]):\s*([\s\S]*?)<\/p>\s*$/i);
    const legacyQuote = html.match(/^\s*<p>\s*Quote:\s*([\s\S]*?)<\/p>\s*$/i);

    if (heading) {
      level = Number(heading[1]) as 2 | 3;
      label = blogHtmlText(heading[2]);
    } else if (legacyHeading) {
      level = Number(legacyHeading[1]) as 2 | 3;
      label = blogHtmlText(legacyHeading[2]);
      html = `<h${level}>${legacyHeading[2]}</h${level}>`;
    } else if (legacyQuote) {
      html = `<blockquote><p>${legacyQuote[1]}</p></blockquote>`;
    }

    if (!level || !label) return { html, id: "", label: "", level: undefined };

    const base = blogAnchor(label, `section-${index + 1}`);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;

    if (!/\sid\s*=/i.test(html)) {
      html = html.replace(new RegExp(`<h${level}([^>]*)>`, "i"), `<h${level}$1 id="${id}">`);
    }

    return { html, id, label, level };
  });
}

function DynamicBlogDetail({ item, slug }: { item: ContentItem; slug: string }) {
  const title = text(item.title) || "Story";
  const summary = text(item.description);
  const category = text(item.category) || "Journal";
  const image = text(item.image);
  const author = text(item.data?.author) || "M. Dadu Films";
  const publishedBy = text(item.data?.publishedBy) || "M. Dadu Films Editorial";
  const readTime = text(item.data?.readTime) || "1 min read";
  const imageAlt = text(item.data?.imageAlt) || title;
  const publishedAt = text(item.publishedAt) || text(item.createdAt);
  const updatedAt = text(item.updatedAt);
  const body = Array.isArray(item.body) ? item.body.filter((value) => typeof value === "string" && value.trim()) : [];
  const tags = Array.isArray(item.tags)
    ? [...new Set(item.tags.map((value) => text(value)).filter(Boolean))].slice(0, 12)
    : [];

  const blocks = blogArticleBlocks(body);
  const outline = blocks
    .filter((block): block is { html: string; id: string; label: string; level: 2 | 3 } => Boolean(block.id && block.label && block.level))
    .slice(0, 12);

  const words = blogHtmlText(body.join(" ")).split(/\\s+/).filter(Boolean).length;
  const sectionCount = outline.length || body.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: summary,
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: publishedBy },
    mainEntityOfPage: absoluteSiteUrl(`/blog/${slug}`),
    image: image || undefined,
    keywords: tags.join(", ") || undefined,
  };

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="bg-[#f7f6f3]">
        <section className="border-b border-black/6 bg-[#fffdf9]">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="transition hover:text-black">
                Blog
              </Link>
              <span aria-hidden="true">/</span>
              <span className="max-w-[190px] truncate text-[#444] sm:max-w-sm">{title}</span>
            </nav>
          </div>

          <div className="site-shell pb-7 pt-4 sm:pb-9 sm:pt-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,.5fr)] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#111] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-white">
                    M. Dadu Journal
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--brand-red)]">{category}</span>
                  <span className="h-px w-10 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-5xl text-[clamp(3rem,6vw,6.7rem)] font-semibold leading-[.88] tracking-[-.055em] text-[#171717]">
                  {title}
                </h1>

                {summary && (
                  <p className="mt-6 max-w-3xl text-[15px] leading-7 text-[#686868] sm:text-base sm:leading-8">
                    {summary}
                  </p>
                )}

                {!!tags.length && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tags.slice(0, 7).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/7 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.07em] text-[#6d6d6d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <aside className="overflow-hidden rounded-[18px] border border-black/7 bg-white shadow-[0_12px_32px_rgba(0,0,0,.035)]">
                <div className="border-b border-black/6 px-4 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[.13em] text-[var(--brand-red)]">Article Brief</p>
                </div>

                <dl className="grid grid-cols-2">
                  <div className="border-b border-r border-black/6 p-4">
                    <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Written by</dt>
                    <dd className="mt-1.5 text-[11px] font-semibold leading-4 text-[#333]">{author}</dd>
                  </div>
                  <div className="border-b border-black/6 p-4">
                    <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Published by</dt>
                    <dd className="mt-1.5 text-[11px] font-semibold leading-4 text-[#333]">{publishedBy}</dd>
                  </div>
                  <div className="border-r border-black/6 p-4">
                    <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Published</dt>
                    <dd className="mt-1.5 text-[11px] font-semibold text-[#333]">
                      {publishedAt ? dateLabel(publishedAt) : "—"}
                    </dd>
                  </div>
                  <div className="p-4">
                    <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Read</dt>
                    <dd className="mt-1.5 text-[11px] font-semibold text-[#333]">{readTime}</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[24px] bg-[#ece9e2] shadow-[0_20px_54px_rgba(0,0,0,.09)] sm:mt-10">
              <SiteMedia
                src={image || undefined}
                alt={imageAlt}
                kind="blog"
                priority
                className="aspect-[16/7] min-h-[280px] rounded-none sm:min-h-[360px]"
                imageClassName="object-cover"
              />

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent"
                aria-hidden="true"
              />

              <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 p-4 text-white sm:p-5">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[.12em] text-white/60">Journal Feature</span>
                  <p className="mt-1 max-w-2xl text-[11px] font-semibold text-white/90">{imageAlt}</p>
                </div>
                <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[9px] font-bold backdrop-blur-sm">
                  {words.toLocaleString("en-IN")} words
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="site-section !py-8 sm:!py-10">
          <div className="site-shell">
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,.55fr)]">
              <article className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,.025)] sm:p-7 lg:p-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-black/6 pb-5">
                  <div>
                    <p className="site-kicker">Article</p>
                    <h2 className="font-display mt-1 text-2xl font-semibold">The full story</h2>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[9px] font-bold text-[#888]">
                    <span className="rounded-full bg-[#f7f6f3] px-3 py-1.5">{words.toLocaleString("en-IN")} words</span>
                    <span className="rounded-full bg-[#f7f6f3] px-3 py-1.5">{sectionCount} section{sectionCount === 1 ? "" : "s"}</span>
                  </div>
                </div>

                {blocks.length ? (
                  <div
                    className="text-[14px] leading-7 text-[#595959] sm:text-[15px] sm:leading-8
                      [&_p]:mb-4
                      [&_h2]:font-display [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-[#202020] sm:[&_h2]:text-3xl
                      [&_h3]:font-display [&_h3]:mb-2.5 [&_h3]:mt-7 [&_h3]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#2a2a2a]
                      [&_ul]:my-5 [&_ul]:grid [&_ul]:gap-2 [&_ul]:rounded-2xl [&_ul]:bg-[#fafafa] [&_ul]:px-5 [&_ul]:py-4 [&_ul]:pl-9
                      [&_ul]:list-disc
                      [&_ol]:my-5 [&_ol]:grid [&_ol]:gap-2 [&_ol]:rounded-2xl [&_ol]:bg-[#fafafa] [&_ol]:px-5 [&_ol]:py-4 [&_ol]:pl-9
                      [&_ol]:list-decimal
                      [&_li]:pl-1
                      [&_blockquote]:my-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--brand-red)] [&_blockquote]:bg-[#fff7f7] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:font-display [&_blockquote]:text-lg [&_blockquote]:leading-7 [&_blockquote]:text-[#383838]
                      [&_blockquote_p]:mb-0
                      [&_a]:font-semibold [&_a]:text-[var(--brand-red)] [&_a]:underline"
                  >
                    {blocks.map((block, index) => (
                      <div key={`${index}-${block.id || block.html.slice(0, 24)}`} dangerouslySetInnerHTML={{ __html: block.html }} />
                    ))}
                  </div>
                ) : summary ? (
                  <p className="text-[16px] leading-8 text-[#4f4f4f]">{summary}</p>
                ) : (
                  <p className="text-sm text-[#888]">Article content is not available yet.</p>
                )}
              </article>

              <aside className="grid content-start gap-4 lg:sticky lg:top-24">
                <section className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)]">
                  <p className="site-kicker">At a glance</p>
                  <h2 className="font-display mt-1 text-xl font-semibold">Article details</h2>

                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#f7f6f3] p-3">
                      <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Author</dt>
                      <dd className="mt-1 text-[11px] font-semibold leading-4 text-[#333]">{author}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f7f6f3] p-3">
                      <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Publisher</dt>
                      <dd className="mt-1 text-[11px] font-semibold leading-4 text-[#333]">{publishedBy}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f7f6f3] p-3">
                      <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Read</dt>
                      <dd className="mt-1 text-[11px] font-semibold text-[#333]">{readTime}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f7f6f3] p-3">
                      <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Words</dt>
                      <dd className="mt-1 text-[11px] font-semibold text-[#333]">{words.toLocaleString("en-IN")}</dd>
                    </div>
                    {publishedAt && (
                      <div className="col-span-2 rounded-xl bg-[#f7f6f3] p-3">
                        <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Published</dt>
                        <dd className="mt-1 text-[11px] font-semibold text-[#333]">{dateLabel(publishedAt)}</dd>
                      </div>
                    )}
                    {updatedAt && updatedAt !== publishedAt && (
                      <div className="col-span-2 rounded-xl bg-[#f7f6f3] p-3">
                        <dt className="text-[8px] font-black uppercase tracking-[.08em] text-[#aaa]">Last updated</dt>
                        <dd className="mt-1 text-[11px] font-semibold text-[#333]">{dateLabel(updatedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                {!!outline.length && (
                  <nav
                    className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)]"
                    aria-label="Article sections"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="site-kicker">Navigate</p>
                        <h2 className="font-display mt-1 text-xl font-semibold">On this page</h2>
                      </div>
                      <span className="text-[10px] font-semibold text-[#aaa]">{outline.length}</span>
                    </div>

                    <div className="mt-4 grid gap-1.5">
                      {outline.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`rounded-xl px-3 py-2 text-[11px] leading-4 text-[#666] transition hover:bg-[#f7f6f3] hover:text-[#111] ${
                            heading.level === 3 ? "ml-3 border-l border-black/8" : "font-semibold"
                          }`}
                        >
                          {heading.label}
                        </a>
                      ))}
                    </div>
                  </nav>
                )}

                {!!tags.length && (
                  <section className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,.025)]">
                    <p className="site-kicker">Topics</p>
                    <h2 className="font-display mt-1 text-xl font-semibold">Explore the themes</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-black/7 bg-[#fafafa] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.06em] text-[#666]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded-[20px] bg-[#111] p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,.14)]">
                  <p className="text-[9px] font-black uppercase tracking-[.14em] text-[#ff5e67]">Keep exploring</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold leading-tight">More stories from M. Dadu Films.</h2>
                  <p className="mt-3 text-xs leading-6 text-white/55">
                    Browse more filmmaking insights or talk to the team about your next production.
                  </p>
                  <div className="mt-5 grid gap-2">
                    <Link href="/blog" className="site-button site-button-primary">
                      More Articles
                    </Link>
                    <Link href="/contact" className="site-button site-button-dark-outline">
                      Talk to M. Dadu Films
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>

      <SiteFooter />
    </>
  );
}

export async function StaticDetailView({ kind, slug }: { kind: DetailKind; slug: string }) {
  const item = await getContentItem(kind === "blogs" ? "blog" : kind === "castings" ? "casting" : "projects", slug);
  if (!item) notFound();

  if (kind === "projects") return <ProjectDetail item={item} />;
  if (kind === "castings") return <CastingDetail item={item} slug={slug} />;

  return <DynamicBlogDetail item={item} slug={slug} />;
}
