"use client";

import Image from "next/image";

import { CoreTeamSection } from "@/components/site/core-team-section";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

import { usePublicData } from "./use-public-data";

const values = [
  {
    title: "Story First",
    description: "Every decision starts with the story, the audience and the emotion the work needs to carry.",
    symbol: "01",
  },
  {
    title: "Craft & Discipline",
    description: "Strong creative work needs thoughtful preparation, dependable execution and attention to the final frame.",
    symbol: "02",
  },
  {
    title: "Collaboration",
    description:
      "Directors, technicians, artists, brands and emerging talent do their best work when the process stays open and respectful.",
    symbol: "03",
  },
  {
    title: "Opportunity",
    description: "We want productions to create space for people to contribute, learn, perform and build meaningful creative work.",
    symbol: "04",
  },
];

const approach = [
  ["Develop", "Clarify the idea, story, treatment and production path."],
  ["Produce", "Bring the right people, planning and execution together on set."],
  ["Finish", "Shape the final experience through edit, sound, colour and delivery."],
];

const recognitions = [
  {
    title: "Black Cat Award International Film Festival",
    year: "2022",
    note: "Official Selection",
    image: "/awards/OFFICIAL-SELECTION-Black-Cat-Award-International-Film-Festival-2022-1.webp",
  },
  {
    title: "CMS International Children's Film Festival (ICFF)",
    year: "2023",
    note: "Official Selection",
    image: "/awards/OFFICIAL-SELECTION-CMSINTERNATIONAL-CHILDRENS-FILM-FESTIVAL-ICFF-2023-1.webp",
  },
  {
    title: "Radiance International Kids Art & Film Festival",
    year: "2022",
    note: "Official Selection",
    image: "/awards/OFFICIAL-SELECTION-RADIANCE-INTERNATIONAL-KIDS-ART-FILM-FESTIVAL-2022-1.webp",
  },
  {
    title: "Student World Impact Film Festival",
    year: "2023",
    note: "Official Selection",
    image: "/awards/OFFICIAL-SELECTION-Student-World-Impact-Film-Festival-2023.webp",
  },
];

export function AboutPageView() {
  const brandData = usePublicData("brand");

  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <PageIntro
          eyebrow="About Us"
          title="Stories, People and the Craft Between Them"
          description="Founded in 2017, M. Dadu Films is a creative film production house working across feature films, short films, advertisements, brand films, music videos and original creative content. From India, we collaborate with brands, artists, creators and production partners to take ideas from development to final frame."
          mediaAlt="M. Dadu Films creative production team"
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

        <section className="site-section bg-white">
          <div className="site-shell grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <p className="site-kicker">Who We Are</p>
              <h2 className="site-heading mt-2 max-w-2xl">A production house built around storytelling and collaboration.</h2>

              <div className="mt-5 max-w-2xl space-y-4 text-sm leading-7 text-[#6f6f6f]">
                <p>
                  M. Dadu Films brings together filmmakers, technicians, performers and creative collaborators to build visual stories with
                  purpose. Our work spans narrative and commercial formats, but the approach stays consistent: understand the idea, prepare
                  properly and give every department enough clarity to do its best work.
                </p>
                <p>
                  We believe good production is not only about what happens in front of the camera. It is the result of writing, planning,
                  casting, cinematography, art, music, lighting, post-production and people working toward the same creative direction.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Founded 2017", "India-based", "Story-led production", "Creative collaboration"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/8 bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#555]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-[#10151a] p-6 text-white sm:p-8">
              <p className="site-kicker !text-[#ff646b]">How We Work</p>
              <h3 className="font-display mt-3 text-3xl font-semibold">From idea to final frame.</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/58">
                A clear process keeps the creative conversation strong while production stays practical.
              </p>

              <div className="mt-7 grid gap-3">
                {approach.map(([title, description], index) => (
                  <div key={title} className="grid grid-cols-[42px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-xs font-bold text-[#ff646b]">
                      0{index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{title}</h4>
                      <p className="mt-1 text-xs leading-5 text-white/55">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="grid gap-5 md:grid-cols-2">
              <article className="site-card p-7 sm:p-9">
                <span className="site-icon-dot">V</span>
                <p className="site-kicker mt-5">Our Vision</p>
                <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
                  A creative ecosystem where stories and people can grow.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#707070]">
                  To build a trusted creative ecosystem where original stories, skilled crews and emerging talent meet meaningful
                  opportunities and can reach audiences beyond geography.
                </p>
              </article>

              <article className="rounded-[18px] bg-[#10151a] p-7 text-white sm:p-9">
                <span className="site-icon-dot !border-white/15 !bg-white/8 !text-white">M</span>
                <p className="site-kicker mt-5 !text-[#ff646b]">Our Mission</p>
                <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
                  Make strong ideas possible through thoughtful production.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">
                  To develop and produce story-led films and branded content with strong planning, honest collaboration and disciplined
                  execution — from the first conversation through post-production and delivery.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <p className="site-kicker">What Guides Us</p>
            <h2 className="site-heading mt-2">The values behind the work.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">
              The format may change from project to project, but these principles stay constant.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <article key={value.title} className="site-card p-6">
                  <span className="text-[10px] font-extrabold tracking-[.14em] text-[var(--brand-red)]">{value.symbol}</span>
                  <h3 className="font-display mt-5 text-xl font-semibold">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#777]">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section border-y border-black/6 bg-[#f8f7f4]">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">Recognition</p>
                <h2 className="site-heading mt-2">Festival Selections & Recognition</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">Official selection laurels from the M. Dadu Films archive.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recognitions.map((recognition) => (
                <article key={recognition.title} className="site-card overflow-hidden">
                  <div className="relative h-44 border-b border-black/6 bg-black sm:h-48">
                    <Image
                      src={recognition.image}
                      alt={`${recognition.note} — ${recognition.title} ${recognition.year}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-5"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="site-kicker">{recognition.note}</span>
                      <span className="text-[11px] font-semibold text-[#999]">{recognition.year}</span>
                    </div>
                    <h3 className="font-display mt-3 text-lg font-semibold leading-snug">{recognition.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      

        <CoreTeamSection />

        <section className="site-shell py-8 lg:py-12">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0b0b0b] px-7 py-12 text-white sm:px-10 lg:px-12 lg:py-14">
            <div className="max-w-3xl">
              <p className="site-kicker !text-[#ff646b]">Our Belief</p>
              <p className="font-display mt-3 text-3xl leading-tight sm:text-4xl">“Good Stories Create a Better Tomorrow”</p>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/55">
                The best work happens when a clear story, a prepared crew and the right collaborators move in the same direction.
              </p>
              <p className="mt-5 text-sm text-white/45">— M. Dadu Films</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
