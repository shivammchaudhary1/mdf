import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { CastingApplyPanel } from "@/components/site/casting-apply-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
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

export async function StaticDetailView({ kind, slug }: { kind: DetailKind; slug: string }) {
  const item = await getContentItem(kind === "blogs" ? "blog" : kind === "castings" ? "casting" : "projects", slug);
  if (!item) notFound();

  if (kind === "projects") return <ProjectDetail item={item} />;
  if (kind === "castings") return <CastingDetail item={item} slug={slug} />;

  const title = text(item.title) || "Story";
  const summary = text(item.description);
  const category = text(item.category);
  const image = text(item.image);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-shell py-9 lg:py-14">
          <Link href="/blog" className="text-xs font-semibold text-[#777] hover:text-black">
            ← Back
          </Link>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            {category && <p className="site-kicker">{category}</p>}
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>
            {summary && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6f6f]">{summary}</p>}
          </div>

          {image && <SiteMedia src={image} alt={title} kind="blog" className="mx-auto mt-10 aspect-[16/7] max-w-5xl rounded-[20px]" />}

          {(item.body?.length || item.description) && (
            <article className="mx-auto max-w-3xl py-10 text-[15px] leading-8 text-[#555]">
              {(item.body?.length ? item.body : [item.description ?? ""]).filter(Boolean).map((section, index) => (
                <p key={`${index}-${section.slice(0, 20)}`} className={index ? "mt-5" : ""}>
                  {section}
                </p>
              ))}
            </article>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
