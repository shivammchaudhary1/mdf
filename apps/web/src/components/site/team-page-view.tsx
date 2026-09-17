"use client";

import { usePublicData } from "./use-public-data";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { SiteMedia } from "@/components/site/site-media";
import { usePublicUiStore } from "@/store/public-ui-store";

const tabs = ["Core Team", "Creative Team", "Advisors"];

export function TeamPageView() {
  const data=usePublicData("team");
  const active = usePublicUiStore((state) => state.teamFilter);
  const setActive = usePublicUiStore((state) => state.setTeamFilter);

  const visible =
    data.team.filter((member) => member.group === active);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Team"
          title="The People Behind the Stories"
          description="A passionate team of creators, dreamers and doers working together to bring powerful stories to life."
          mediaAlt="Film crew placeholder"
          mediaKind="team"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="mb-8 flex flex-wrap gap-2 border-b border-black/8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActive(tab)}
                  className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
                    active === tab
                      ? "border-[var(--brand-red)] text-[#111]"
                      : "border-transparent text-[#888]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {visible.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((member) => (
                  <article key={member.name} className="site-card overflow-hidden">
                    <SiteMedia
                      src={member.image}
                      alt={member.name}
                      kind="team"
                      className="aspect-[4/4.5]"
                    />
                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--brand-red)]">
                        {member.role}
                      </p>
                      <h2 className="font-display mt-2 text-xl font-semibold">{member.name}</h2>
                      <p className="mt-3 text-sm leading-6 text-[#777]">{member.bio}</p>
                      <div className="mt-4 flex gap-2">
                        <span className="site-social-dot">in</span>
                        <span className="site-social-dot">ig</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="site-card p-10 text-center">
                <p className="font-display text-2xl font-semibold">Advisors will be announced soon.</p>
                <p className="mt-2 text-sm text-[#777]">
                  This section is intentionally ready for real team data.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
