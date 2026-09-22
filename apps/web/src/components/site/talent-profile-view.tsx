import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

type Talent = (typeof websiteData.talentPage.directory.items)[number];

function linkLabel(value: string, fallback: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("imdb")) return "IMDb";
    if (host.includes("vimeo")) return "Vimeo";
    return host;
  } catch {
    return fallback;
  }
}

export function TalentProfileView({ id }: { id: string }) {
  const data = websiteData.talentPage.directory.items.find((item) => item.id === id) as Talent | undefined;

  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <Link href="/talent" className="text-xs font-semibold text-[#666]">
              ← Back to Talent Network
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
              <aside className="site-card h-fit overflow-hidden">
                <SiteMedia src={data.image} alt={data.name} kind="team" className="aspect-[4/5]" />

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-3xl font-semibold">{data.name}</h1>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        data.emailVerified ? "bg-[#edf8f0] text-[#2f7543]" : "bg-[#f2f2f0] text-[#777]"
                      }`}
                    >
                      {data.emailVerified ? "✓ Email verified" : "Not verified"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#666]">{data.role}</p>

                  <div className="mt-5 grid gap-3 text-sm">
                    <p><strong>Location:</strong> {data.location}</p>
                    <p><strong>Experience:</strong> {data.experience}</p>
                    <p><strong>Availability:</strong> {data.availability}</p>
                    <p><strong>Gender:</strong> {data.gender}</p>
                    <p><strong>Age:</strong> {data.age}</p>
                  </div>

                  {data.showreel && (
                    <a
                      href={data.showreel}
                      target="_blank"
                      rel="noreferrer"
                      className="site-button site-button-primary mt-6 w-full justify-center"
                    >
                      View Showreel ↗
                    </a>
                  )}
                </div>
              </aside>

              <div className="grid gap-6">
                <article className="site-card p-7">
                  <h2 className="font-display text-2xl font-semibold">About</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">
                    {data.bio || "No biography added yet."}
                  </p>
                </article>

                <article className="site-card p-7">
                  <h2 className="font-display text-2xl font-semibold">Skills & Languages</h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.skills.map((item) => (
                      <span key={`skill-${item}`} className="rounded-full bg-[#f4f4f2] px-3 py-1.5 text-xs">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.languages.map((item) => (
                      <span key={`language-${item}`} className="rounded-full border border-black/10 px-3 py-1.5 text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>

                {data.previousWork && (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Previous Work</h2>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{data.previousWork}</p>
                  </article>
                )}

                {!!data.portfolio?.length && (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Portfolio</h2>
                    <p className="mt-2 text-sm leading-6 text-[#777]">
                      Public photographs selected by the member.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {data.portfolio.map((src, index) => (
                        <SiteMedia
                          key={`${data.id}-portfolio-${index}`}
                          src={src}
                          alt={`${data.name} portfolio ${index + 1}`}
                          kind="gallery"
                          className="aspect-[4/5] rounded-xl"
                        />
                      ))}
                    </div>
                  </article>
                )}

                {data.showreel || data.videos?.length || data.socialLinks?.length ? (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Work Links</h2>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {data.showreel && (
                        <a
                          href={data.showreel}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-[#111] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Open Showreel ↗
                        </a>
                      )}

                      {data.videos?.map((value, index) => (
                        <a
                          key={`${value}-${index}`}
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
                        >
                          Video {index + 1} ↗
                        </a>
                      ))}

                      {data.socialLinks?.map((value, index) => (
                        <a
                          key={`${value}-${index}`}
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
                        >
                          {linkLabel(value, `Link ${index + 1}`)} ↗
                        </a>
                      ))}
                    </div>
                  </article>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
