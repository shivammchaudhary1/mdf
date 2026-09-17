import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContentCard } from "@/components/ui/content-card";
import { DemoNotice, EmptyState } from "@/components/ui/feedback";
import { placeholderHomeContent as hero } from "@/content/placeholders/home";
import { placeholderPages } from "@/content/placeholders/pages";
import { getCollection } from "@/services/content";
import type { CollectionKind } from "@/types/content";
const content = placeholderPages.home;
async function HomeCollection({
  kind,
  title,
  eyebrow,
}: {
  kind: CollectionKind;
  title: string;
  eyebrow: string;
}) {
  const { items } = await getCollection(kind);
  return (
    <section className="container-shell py-12 md:py-16">
      <SectionHeading title={title} eyebrow={eyebrow} href={`/${kind}`} />
      {items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <ContentCard key={item.slug} item={item} kind={kind} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}
export function HomeContent() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0b0b0f] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(229,57,69,.25),transparent_22%),radial-gradient(circle_at_50%_0%,rgba(201,163,93,.12),transparent_28%),linear-gradient(120deg,#08090d_20%,#101621_65%,#090a0d)]" />
          <div className="absolute inset-y-0 right-0 w-[42%] opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="container-shell relative flex min-h-[680px] items-center pt-20">
            <div className="max-w-3xl py-20">
              <p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-[var(--brand-gold)]">
                {hero.eyebrow}
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-7xl lg:text-8xl">
                {hero.titleLineOne}
                <span className="block text-[var(--brand-red)]">
                  {hero.titleLineTwo}
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/75">
                {hero.description}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="brand-button brand-button-primary"
                >
                  {hero.primaryCta} →
                </Link>
                <Link
                  href="/signup"
                  className="brand-button brand-button-secondary"
                >
                  {hero.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>
        <div className="container-shell pt-8">
          <DemoNotice />
        </div>
        <HomeCollection
          kind="projects"
          title="Stories in the making."
          eyebrow="Featured projects"
        />
        <section className="bg-[var(--surface)] py-14">
          <div className="container-shell grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-4">Join our creative community</p>
              <h2 className="font-display text-4xl font-semibold">
                {content.communityTitle}
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                {content.communityDescription}
              </p>
            </div>
            <Link href="/signup" className="brand-button brand-button-primary">
              Join Community →
            </Link>
          </div>
        </section>
        <HomeCollection
          kind="casting"
          title="Find your next opportunity."
          eyebrow="Casting & crew"
        />
        <HomeCollection
          kind="behind-the-scenes"
          title="Before the final frame."
          eyebrow="Behind the scenes"
        />
        <HomeCollection
          kind="shows"
          title="Watch our stories unfold."
          eyebrow="Shows & media"
        />
        <HomeCollection
          kind="blog"
          title="From the journal."
          eyebrow="Ideas & perspectives"
        />
        <section className="bg-[var(--surface)] py-16">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Why M. Dadu Films"
              title={content.sectionTitle}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {content.values.map((value, index) => (
                <article key={value.title} className="card p-7">
                  <span className="eyebrow">0{index + 1}</span>
                  <h3 className="font-display mt-5 text-2xl font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <HomeCollection
          kind="team"
          title="The people behind the stories."
          eyebrow="Our team"
        />
      </main>
      <PublicFooter />
    </>
  );
}
