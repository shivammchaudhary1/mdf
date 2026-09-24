"use client";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { usePublicUiStore } from "@/store/public-ui-store";

import { usePublicTeam } from "./use-public-team";

const tabs = ["Core Team", "Creative Team", "Advisors"];

export function TeamPageView() {
  const { team, loading, error, refresh } = usePublicTeam();
  const active = usePublicUiStore((state) => state.teamFilter);
  const setActive = usePublicUiStore((state) => state.setTeamFilter);

  const visible = team.filter((member) => member.group === active);

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
                    active === tab ? "border-[var(--brand-red)] text-[#111]" : "border-transparent text-[#888]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="site-card p-10 text-center">
                <p className="font-display text-2xl font-semibold">Loading team…</p>
              </div>
            ) : error ? (
              <div className="site-card p-10 text-center">
                <p className="font-display text-2xl font-semibold">Unable to load team.</p>
                <p className="mt-2 text-sm text-[#777]">{error}</p>
                <button type="button" onClick={() => void refresh()} className="site-button site-button-outline mt-5">
                  Try Again
                </button>
              </div>
            ) : visible.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((member) => (
                  <article key={member.name} className="site-card overflow-hidden">
                    <SiteMedia src={member.image} alt={member.name} kind="team" className="aspect-[4/4.5]" />
                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--brand-red)]">{member.role}</p>
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
                <p className="font-display text-2xl font-semibold">No {active.toLowerCase()} members yet.</p>
                <p className="mt-2 text-sm text-[#777]">Published members in this group will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
