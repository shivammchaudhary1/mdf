import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContentCard } from "@/components/ui/content-card";
import { DemoNotice, EmptyState } from "@/components/ui/feedback";
import { SmartImage } from "@/components/ui/smart-image";
import { placeholderHomeContent as hero } from "@/content/placeholders/home";
import { placeholderPages } from "@/content/placeholders/pages";
import { getCollection } from "@/services/content";
import type { CollectionKind } from "@/types/content";

const content = placeholderPages.home;

async function HomeCollection({
  kind,
  title,
  eyebrow,
  description,
  tone = "light",
  columns = "three",
}: {
  kind: CollectionKind;
  title: string;
  eyebrow: string;
  description?: string;
  tone?: "light" | "soft" | "dark";
  columns?: "two" | "three";
}) {
  const { items } = await getCollection(kind);
  const dark = tone === "dark";

  return (
    <section
      className={
        dark
          ? "bg-[var(--surface-dark)] text-white"
          : tone === "soft"
            ? "bg-[var(--surface)]"
            : "bg-white"
      }
    >
      <div className="container-shell section-pad">
        <SectionHeading
          title={title}
          eyebrow={eyebrow}
          description={description}
          href={`/${kind}`}
          inverted={dark}
        />

        {items.length ? (
          <div
            className={`grid gap-6 ${
              columns === "two"
                ? "md:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {items.slice(0, columns === "two" ? 4 : 3).map((item) => (
              <ContentCard key={item.slug} item={item} kind={kind} />
            ))}
          </div>
        ) : (
          <div className={dark ? "rounded-2xl bg-white text-slate-950" : ""}>
            <EmptyState />
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeContent() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-[var(--surface-dark)] text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(229,57,69,.20),transparent_26%),radial-gradient(circle_at_56%_5%,rgba(201,163,93,.12),transparent_22%),linear-gradient(120deg,#08090d_12%,#121722_58%,#090a0e_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-[46%] opacity-25 lg:block [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:52px_52px]"
          />

          <div className="container-shell relative grid min-h-[720px] items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-28">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm font-bold uppercase tracking-[.24em] text-[var(--brand-gold)]">
                {hero.eyebrow}
              </p>
              <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.93] tracking-[-.04em]">
                {hero.titleLineOne}
                <span className="mt-2 block text-[var(--brand-red)]">
                  {hero.titleLineTwo}
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                {hero.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="brand-button brand-button-primary"
                >
                  {hero.primaryCta} <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/signup"
                  className="brand-button brand-button-secondary"
                >
                  {hero.secondaryCta}
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-[.16em] text-white/40">
                {hero.heroMeta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[520px] lg:block">
              <div className="absolute left-[8%] top-[8%] w-[72%] rotate-[-4deg] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-2xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-slate-900">
                  <SmartImage
                    placeholderKind="project"
                    alt="Project visual placeholder"
                    fill
                    sizes="42vw"
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--brand-gold)]">
                      {hero.heroFrame.eyebrow}
                    </p>
                    <p className="font-display mt-2 text-3xl font-semibold">
                      {hero.heroFrame.title}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[3%] right-[2%] w-[42%] rotate-[5deg] rounded-[22px] border border-white/10 bg-[#161a22] p-5 shadow-2xl">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-white/40">
                  {hero.heroFrame.networkEyebrow}
                </p>
                <p className="font-display mt-3 text-2xl leading-tight">
                  {hero.heroFrame.networkTitle}
                </p>
                <div className="mt-5 h-px bg-white/10" />
                <p className="mt-4 text-sm leading-6 text-white/60">
                  {hero.heroFrame.networkDescription}
                </p>
              </div>

              <div className="absolute right-[1%] top-[7%] rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-white/60 backdrop-blur">
                {hero.heroFrame.badge}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container-shell py-7">
            <DemoNotice />
          </div>
          <div className="container-shell grid gap-8 border-y border-slate-100 py-10 md:grid-cols-[1.25fr_.75fr] md:items-end">
            <div>
              <p className="eyebrow mb-4">{hero.manifesto.eyebrow}</p>
              <h2 className="font-display max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
                {content.brandMessage}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[var(--muted)] md:justify-self-end">
              {hero.manifesto.description}
            </p>
          </div>
        </section>

        <HomeCollection
          kind="projects"
          title={hero.sections.projects.title}
          eyebrow={hero.sections.projects.eyebrow}
          description={hero.sections.projects.description}
        />

        <section className="bg-[var(--surface)]">
          <div className="container-shell section-pad">
            <div className="cinematic-panel grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[var(--brand-gold)]">
                  {hero.communityEyebrow}
                </p>
                <h2 className="font-display max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                  {content.communityTitle}
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/60">
                  {content.communityDescription}
                </p>
              </div>
              <Link
                href="/signup"
                className="brand-button brand-button-primary justify-self-start lg:justify-self-end"
              >
                {hero.secondaryCta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <HomeCollection
          kind="casting"
          title={hero.sections.casting.title}
          eyebrow={hero.sections.casting.eyebrow}
          description={hero.sections.casting.description}
          columns="two"
        />

        <HomeCollection
          kind="behind-the-scenes"
          title={hero.sections.behindTheScenes.title}
          eyebrow={hero.sections.behindTheScenes.eyebrow}
          description={hero.sections.behindTheScenes.description}
          tone="dark"
        />

        <HomeCollection
          kind="shows"
          title={hero.sections.shows.title}
          eyebrow={hero.sections.shows.eyebrow}
          tone="soft"
        />

        <HomeCollection
          kind="blog"
          title={hero.sections.blog.title}
          eyebrow={hero.sections.blog.eyebrow}
          description={hero.sections.blog.description}
        />

        <section className="bg-[var(--surface)]">
          <div className="container-shell section-pad">
            <SectionHeading
              eyebrow={hero.whyEyebrow}
              title={content.sectionTitle}
              description={hero.whyDescription}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {content.values.map((value, index) => (
                <article
                  key={value.title}
                  className="editorial-panel p-7 sm:p-8"
                >
                  <span className="text-xs font-extrabold tracking-[.16em] text-[var(--brand-red)]">
                    0{index + 1}
                  </span>
                  <h3 className="font-display mt-6 text-2xl font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <HomeCollection
          kind="team"
          title={hero.sections.team.title}
          eyebrow={hero.sections.team.eyebrow}
          description={hero.sections.team.description}
        />
      </main>
      <PublicFooter />
    </>
  );
}
