"use client";

import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { SiteMedia } from "@/components/site/site-media";
import { usePublicUiStore } from "@/store/public-ui-store";

const filters = ["All", "Actor", "Crew", "Writer"];

export function TalentPageView() {
  const active = usePublicUiStore((state) => state.talentFilter);
  const setActive = usePublicUiStore((state) => state.setTalentFilter);

  const visible =
    active === "All"
      ? data.talents
      : data.talents.filter((talent) => {
          if (active === "Actor") return talent.role.includes("Actor");
          if (active === "Writer") return talent.role.includes("Writer");
          return !talent.role.includes("Actor") && !talent.role.includes("Writer");
        });

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Talent Network"
          title="Discover People Ready to Create"
          description="A growing network of actors, filmmakers, writers and crew building portfolios, finding opportunities and connecting with productions."
          mediaAlt="Talent community placeholder"
          mediaKind="team"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-7 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    active === filter
                      ? "bg-[#111] text-white"
                      : "border border-black/8 bg-white text-[#666]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((talent) => (
                <article key={talent.name} className="site-card overflow-hidden">
                  <SiteMedia src={talent.image} alt={talent.name} kind="team" className="aspect-[4/4.3]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl font-semibold">{talent.name}</h2>
                        <p className="mt-1 text-sm text-[#666]">{talent.role}</p>
                      </div>
                      {talent.verified && (
                        <span className="rounded-full bg-[#eef7ff] px-2.5 py-1 text-[10px] font-bold text-[#2b6cb0]">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-[#888]">
                      <span>{talent.location}</span>
                      <span>{talent.experience}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {talent.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#f4f4f2] px-3 py-1 text-[11px] text-[#666]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-[20px] bg-[#101010] p-7 text-white sm:flex sm:items-center sm:justify-between sm:p-9">
              <div>
                <p className="site-kicker !text-[#ff626a]">For artists & crew</p>
                <h2 className="font-display mt-2 text-3xl font-semibold">Build your profile. Be discoverable.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
                  The public network is temporary demo data right now. Real profiles will connect to member accounts later.
                </p>
              </div>
              <a href="/signup" className="site-button site-button-primary mt-6 sm:mt-0">
                Join Network
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
