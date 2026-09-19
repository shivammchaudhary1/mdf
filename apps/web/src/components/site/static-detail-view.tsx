import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { getContentItem } from "@/services/content";

type DetailKind = "projects" | "blogs" | "castings";

const dateLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export async function StaticDetailView({ kind, slug }: { kind: DetailKind; slug: string }) {
  const item = await getContentItem(kind === "blogs" ? "blog" : kind === "castings" ? "casting" : "projects", slug);
  if (!item) notFound();

  const title = String(item.title ?? "");
  const summary = String(item.description ?? "");
  const category = String(item.category ?? "");
  const image = String(item.image ?? "");
  const projectCredits = Array.isArray(item.credits) ? item.credits : [];
  const projectGallery = item.galleryImages ?? [];

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-shell py-9 lg:py-14">
          <Link
            href={kind === "blogs" ? "/blog" : `/${kind === "castings" ? "casting" : kind}`}
            className="text-xs font-semibold text-[#777] hover:text-black"
          >
            ← Back
          </Link>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="site-kicker">{category}</p>
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6f6f]">{summary}</p>
          </div>

          <SiteMedia
            src={image}
            alt={title}
            kind={kind === "blogs" ? "blog" : kind === "castings" ? "team" : "project"}
            className="mx-auto mt-10 aspect-[16/7] max-w-5xl rounded-[20px]"
          />

          {kind === "projects" && (
            <section className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Status</span>
                <strong className="mt-1 block">{String(item.status ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Location</span>
                <strong className="mt-1 block">{String(item.location ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Start</span>
                <strong className="mt-1 block">{dateLabel(item.startDate)}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">End</span>
                <strong className="mt-1 block">{dateLabel(item.endDate)}</strong>
              </div>
            </section>
          )}

          {kind === "castings" && (
            <section className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Role</span>
                <strong className="mt-1 block">{String(item.role ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Location</span>
                <strong className="mt-1 block">{String(item.location ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Shoot Date</span>
                <strong className="mt-1 block">{dateLabel(item.shootDate)}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Deadline</span>
                <strong className="mt-1 block">{dateLabel(item.deadline)}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Age</span>
                <strong className="mt-1 block">
                  {item.ageMin !== undefined || item.ageMax !== undefined ? `${item.ageMin ?? 0}–${item.ageMax ?? 120}` : "—"}
                </strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Gender</span>
                <strong className="mt-1 block">{String(item.gender ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Experience</span>
                <strong className="mt-1 block">{String(item.experience ?? "—")}</strong>
              </div>
              <div className="site-card p-4">
                <span className="text-xs text-[#777]">Compensation</span>
                <strong className="mt-1 block">{String(item.compensation ?? "—")}</strong>
              </div>
            </section>
          )}

          <article className="mx-auto max-w-3xl py-10 text-[15px] leading-8 text-[#555]">
            {(item.body?.length ? item.body : [item.description ?? ""]).filter(Boolean).map((section, index) => (
              <p key={`${index}-${section.slice(0, 20)}`} className={index ? "mt-5" : ""}>
                {section}
              </p>
            ))}
          </article>

          {kind === "projects" && !!projectCredits.length && (
            <section className="mx-auto max-w-3xl pb-8">
              <h2 className="font-display text-2xl font-semibold">Credits</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {projectCredits.map((credit) => (
                  <div key={`${credit.name}-${credit.role}`} className="site-card p-4">
                    <strong>{credit.name}</strong>
                    <span className="mt-1 block text-sm text-[#777]">{credit.role}</span>
                  </div>
                ))}
              </div>
              {item.creditsText && <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#666]">{item.creditsText}</p>}
            </section>
          )}

          {kind === "projects" && !!projectGallery.length && (
            <section className="mx-auto max-w-5xl pb-10">
              <h2 className="font-display text-2xl font-semibold">Gallery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectGallery.map((src, index) => (
                  <SiteMedia
                    key={src}
                    src={src}
                    alt={`${title} gallery ${index + 1}`}
                    kind="project"
                    className="aspect-[4/3] rounded-[16px]"
                  />
                ))}
              </div>
            </section>
          )}

          {kind === "projects" && item.trailerUrl && (
            <div className="mx-auto max-w-3xl pb-10">
              <a href={item.trailerUrl} target="_blank" rel="noreferrer" className="site-button site-button-primary">
                Watch Trailer
              </a>
            </div>
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

          {kind !== "blogs" && (
            <div className="mx-auto max-w-3xl pb-12">
              <ApplyForm
                opportunityId={String(item._id)}
                opportunityType={kind === "castings" ? "CASTING" : "PROJECT"}
                closed={
                  kind === "castings" ? item.acceptingApplications === false : ["Completed", "Archived"].includes(String(item.status ?? ""))
                }
              />
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
