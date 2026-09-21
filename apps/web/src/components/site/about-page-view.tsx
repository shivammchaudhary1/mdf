"use client";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";

import { usePublicData } from "./use-public-data";

const values = [
  ["Creativity", "In everything we do"],
  ["People", "Before projects"],
  ["Collaboration", "Over competition"],
  ["Impact", "Through stories"],
];

export function AboutPageView() {
  const brandData = usePublicData("brand");
  const teamData = usePublicData("team");
  const coreTeam = teamData.team.filter((member) => member.group === "Core Team").slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="About Us"
          title="Stories That Create Opportunities"
          description="M. Dadu Films is a film production house based in Lucknow and Noida, working across films, short films, music videos, advertisement and brand films, corporate shoots and creative content development. We support projects from planning and production through post-production and final delivery."
          mediaAlt="M. Dadu Films production team"
          mediaKind="team"
        />

        <section className="site-shell border-y border-black/6 py-7">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {brandData.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#8a8a8a]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="site-section">
          <div className="site-shell grid gap-6 md:grid-cols-2">
            <article className="site-card p-7 sm:p-9">
              <span className="site-icon-dot">◎</span>
              <h2 className="font-display mt-5 text-2xl font-semibold">Our Vision</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#707070]">
                To build a creative ecosystem where talent meets opportunity and authentic stories reach the world.
              </p>
            </article>
            <article className="rounded-[18px] bg-[#10151a] p-7 text-white sm:p-9">
              <span className="site-icon-dot !border-white/15 !bg-white/8 !text-white">◎</span>
              <h2 className="font-display mt-5 text-2xl font-semibold">Our Mission</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/62">
                To create meaningful content, support emerging talent and contribute to a stronger, more diverse media industry.
              </p>
            </article>
          </div>
        </section>

        <section id="core-team" className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">Our People</p>
                <h2 className="site-heading mt-2">Core Team</h2>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coreTeam.map((member) => (
                <article key={member.name} className="site-card overflow-hidden">
                  <SiteMedia src={member.image} alt={member.name} kind="team" className="aspect-[4/4.5]" />
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--brand-red)]">{member.role}</p>
                    <h3 className="font-display mt-2 text-xl font-semibold">{member.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#777]">{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-8 lg:py-12">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0b0b0b] px-7 py-14 text-white sm:px-10 lg:px-12">
            <div className="max-w-2xl">
              <p className="font-display text-3xl leading-tight sm:text-4xl">“Good Stories Create a Better Tomorrow”</p>
              <p className="mt-5 text-sm text-white/55">— M. Dadu Films</p>
            </div>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <p className="site-kicker">What guides us</p>
            <h2 className="site-heading mt-2">Our Values</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(([title, description]) => (
                <article key={title} className="site-card p-6 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-black/8 bg-white">◇</span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-[#777]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
