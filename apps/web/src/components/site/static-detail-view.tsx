import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { getContentItem } from "@/services/content";

type DetailKind = "projects" | "blogs" | "castings";
type ContentItem = NonNullable<Awaited<ReturnType<typeof getContentItem>>>;

const dateLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

export async function StaticDetailView({ kind, slug }: { kind: DetailKind; slug: string }) {
  const item = await getContentItem(kind === "blogs" ? "blog" : kind === "castings" ? "casting" : "projects", slug);
  if (!item) notFound();

  if (kind === "projects") return <ProjectDetail item={item} />;

  const title = text(item.title) || (kind === "blogs" ? "Story" : "Casting Opportunity");
  const summary = text(item.description);
  const category = text(item.category);
  const image = text(item.image);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-shell py-9 lg:py-14">
          <Link href={kind === "blogs" ? "/blog" : "/casting"} className="text-xs font-semibold text-[#777] hover:text-black">
            ← Back
          </Link>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            {category && <p className="site-kicker">{category}</p>}
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>
            {summary && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6f6f]">{summary}</p>}
          </div>

          {image && (
            <SiteMedia
              src={image}
              alt={title}
              kind={kind === "blogs" ? "blog" : "team"}
              className="mx-auto mt-10 aspect-[16/7] max-w-5xl rounded-[20px]"
            />
          )}

          {kind === "castings" && (
            <section className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {item.role && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Role</span>
                  <strong className="mt-1 block">{String(item.role)}</strong>
                </div>
              )}
              {item.location && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Location</span>
                  <strong className="mt-1 block">{String(item.location)}</strong>
                </div>
              )}
              {item.shootDate && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Shoot Date</span>
                  <strong className="mt-1 block">{dateLabel(item.shootDate)}</strong>
                </div>
              )}
              {item.deadline && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Deadline</span>
                  <strong className="mt-1 block">{dateLabel(item.deadline)}</strong>
                </div>
              )}
              {(item.ageMin !== undefined || item.ageMax !== undefined) && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Age</span>
                  <strong className="mt-1 block">{`${item.ageMin ?? 0}–${item.ageMax ?? 120}`}</strong>
                </div>
              )}
              {item.gender && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Gender</span>
                  <strong className="mt-1 block">{String(item.gender)}</strong>
                </div>
              )}
              {item.experience && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Experience</span>
                  <strong className="mt-1 block">{String(item.experience)}</strong>
                </div>
              )}
              {item.compensation && (
                <div className="site-card p-4">
                  <span className="text-xs text-[#777]">Compensation</span>
                  <strong className="mt-1 block">{String(item.compensation)}</strong>
                </div>
              )}
            </section>
          )}

          {(item.body?.length || item.description) && (
            <article className="mx-auto max-w-3xl py-10 text-[15px] leading-8 text-[#555]">
              {(item.body?.length ? item.body : [item.description ?? ""]).filter(Boolean).map((section, index) => (
                <p key={`${index}-${section.slice(0, 20)}`} className={index ? "mt-5" : ""}>
                  {section}
                </p>
              ))}
            </article>
          )}

          {kind === "castings" && (item.requirements || item.details?.length) && (
            <section className="mx-auto max-w-3xl pb-8">
              <h2 className="font-display text-2xl font-semibold">Requirements & Details</h2>
              {item.requirements && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{item.requirements}</p>}
              {item.details?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#666]">
                  {item.details.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          )}

          {kind === "castings" && (
            <div className="mx-auto max-w-3xl pb-12">
              <ApplyForm opportunityId={String(item._id)} opportunityType="CASTING" closed={item.acceptingApplications === false} />
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
