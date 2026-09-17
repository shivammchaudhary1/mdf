import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";

const values = [
  ["Creativity", "In everything we do"],
  ["People", "Before projects"],
  ["Collaboration", "Over competition"],
  ["Impact", "Through stories"]
];

export function AboutPageView() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Story"
          title="Stories That Create Opportunities"
          description="M. Dadu Films is more than a production house. It is a creative platform built to discover, support and collaborate with real talent. We believe stories thrive when people are seen, trusted and given room to grow."
          mediaAlt="M. Dadu Films team placeholder"
          mediaKind="team"
        />

        <section className="site-shell border-y border-black/6 py-7">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#8a8a8a]">
                  {stat.label}
                </p>
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

        <section className="site-shell pb-8 lg:pb-12">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0b0b0b] px-7 py-14 text-white sm:px-10 lg:px-12">
            <div className="max-w-2xl">
              <p className="font-display text-3xl leading-tight sm:text-4xl">
                “Good Stories Create a Better Tomorrow”
              </p>
              <p className="mt-5 text-sm text-white/55">— M. Dadu Films</p>
            </div>
          </div>
        </section>

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <p className="site-kicker">What guides us</p>
            <h2 className="site-heading mt-2">Our Values</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(([title, description]) => (
                <article key={title} className="site-card p-6 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-black/8 bg-white">
                    ◇
                  </span>
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
