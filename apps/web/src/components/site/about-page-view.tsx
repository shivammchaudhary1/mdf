"use client";

import Image from "next/image";
import Link from "next/link";

import { AboutStatsCounter } from "@/components/site/about-stats-counter";
import { CoreTeamSection } from "@/components/site/core-team-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

type ValueIconName = "story" | "craft" | "collaboration" | "opportunity";

function ValueIcon({ name }: { name: ValueIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "story")
    return (
      <svg {...common}>
        <path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16V4.5Z" />
        <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
      </svg>
    );

  if (name === "craft")
    return (
      <svg {...common}>
        <path d="M14.5 4.5a4.5 4.5 0 0 0 5 5L11 18l-5 1 1-5 8.5-8.5Z" />
        <path d="m6.8 14.2 3 3" />
      </svg>
    );

  if (name === "collaboration")
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" />
      </svg>
    );

  return (
    <svg {...common}>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

export function AboutPageView() {
  const about = websiteData.aboutUs;

  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#444]">About Us</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{about.hero.eyebrow}</p>
                  <span className="h-px w-12 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {about.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">{about.hero.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {about.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/8 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#555]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <Image
                src={about.hero.image}
                alt={about.hero.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent lg:block"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="site-shell py-7">
            <AboutStatsCounter stats={about.stats} />
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <p className="site-kicker">{about.story.eyebrow}</p>
              <h2 className="site-heading mt-2 max-w-2xl">{about.story.title}</h2>

              <div className="mt-5 max-w-2xl space-y-4 text-sm leading-7 text-[#6f6f6f]">
                {about.story.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-[#10151a] p-6 text-white sm:p-8">
              <p className="site-kicker !text-[#ff646b]">{about.approach.eyebrow}</p>
              <h3 className="font-display mt-3 text-3xl font-semibold">{about.approach.title}</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/58">{about.approach.description}</p>

              <div className="mt-7 grid gap-3">
                {about.approach.steps.map((step, index) => (
                  <div key={step.title} className="grid grid-cols-[42px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-xs font-bold text-[#ff646b]">
                      0{index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-white/55">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell grid gap-5 md:grid-cols-2">
            <article className="site-card p-7 sm:p-9">
              <span className="site-icon-dot">{about.vision.symbol}</span>
              <p className="site-kicker mt-5">{about.vision.eyebrow}</p>
              <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{about.vision.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#707070]">{about.vision.description}</p>
            </article>

            <article className="rounded-[18px] bg-[#10151a] p-7 text-white sm:p-9">
              <span className="site-icon-dot !border-white/15 !bg-white/8 !text-white">{about.mission.symbol}</span>
              <p className="site-kicker mt-5 !text-[#ff646b]">{about.mission.eyebrow}</p>
              <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{about.mission.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">{about.mission.description}</p>
            </article>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <p className="site-kicker">{about.values.eyebrow}</p>
            <h2 className="site-heading mt-2">{about.values.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{about.values.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.items.map((value) => (
                <article key={value.title} className="site-card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff1f2] text-[var(--brand-red)]">
                      <ValueIcon name={(value.icon ?? "story") as ValueIconName} />
                    </span>
                    <span className="text-[10px] font-extrabold tracking-[.14em] text-[#aaa]">{value.symbol}</span>
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#777]">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section border-y border-black/6 bg-white">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">{about.recognition.eyebrow}</p>
                <h2 className="site-heading mt-2">{about.recognition.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{about.recognition.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {about.recognition.items.map((recognition) => (
                <article key={recognition.title} className="site-card overflow-hidden">
                  <div className="relative h-44 border-b border-black/10 bg-[#090909] sm:h-48">
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
            <div className="absolute inset-y-0 right-0 hidden w-[54%] sm:block">
              <SiteMedia
                src={about.quote.image}
                alt={about.quote.imageAlt}
                kind="team"
                className="h-full"
                imageClassName="object-cover object-center opacity-100"
              />
              <div
                className="absolute inset-y-0 left-0 w-[34%] bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/55 to-transparent"
                aria-hidden="true"
              />
            </div>

            <div className="relative z-10 max-w-xl">
              <p className="site-kicker !text-[#ff646b]">{about.quote.eyebrow}</p>
              <p className="font-display mt-3 text-3xl leading-tight sm:text-4xl">“{about.quote.text}”</p>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/55">{about.quote.description}</p>
              <p className="mt-5 text-sm text-white/45">— {about.quote.attribution}</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
