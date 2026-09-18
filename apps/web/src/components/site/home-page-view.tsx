"use client";
import Link from "next/link";
import { usePublicData } from "./use-public-data";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteMedia } from "@/components/site/site-media";
import { OurWorkSection } from "@/components/site/our-work-section";

export function HomePageView() {
  const data=usePublicData("home");
  return (
    <>
      <SiteHeader dark />

      <main id="main-content">
        <section className="relative overflow-hidden bg-[#070707] text-white">
          <div className="site-shell relative grid min-h-[620px] items-center gap-10 pb-16 pt-28 lg:grid-cols-[1.02fr_.98fr] lg:pb-20 lg:pt-24">
            <div className="relative z-10 max-w-[650px]">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[.18em] text-white/48">
                {data.brand.eyebrow}
              </p>

              <h1 className="font-display text-[clamp(3.1rem,7vw,6.8rem)] font-semibold leading-[.91] tracking-[-.045em]">
                Real People
                <br />
                Real Stories
                <br />
                <span className="text-[var(--brand-red)]">Bigger Possibilities</span>
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-7 text-white/66 sm:text-base">
                {data.brand.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/casting" className="site-button site-button-primary">
                  Explore Opportunities
                </Link>
                <Link href="/projects" className="site-button site-button-dark-outline">
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-white/35 text-[9px]">
                    ▶
                  </span>
                  Watch Showreel
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] lg:min-h-[500px]">
              <div className="absolute inset-0 translate-x-[8%] overflow-hidden rounded-[24px] lg:translate-x-[10%]">
                <SiteMedia
                  alt="Film production placeholder"
                  kind="project"
                  className="h-full min-h-[360px] lg:min-h-[500px]"
                  imageClassName="opacity-80"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-black/28 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-transparent to-black/10" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/48">
            <div className="site-shell grid grid-cols-2 divide-x divide-white/8 py-5 sm:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="px-4 text-center sm:px-6">
                  <p className="font-display text-2xl font-semibold sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/46">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OurWorkSection />

        <section className="site-section bg-white">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">Selected work</p>
                <h2 className="site-heading mt-2">Featured Projects</h2>
              </div>
              <Link href="/projects" className="site-text-link">
                View All →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group"
                >
                  <SiteMedia
                    src={project.image}
                    alt={project.title}
                    kind="project"
                    className="aspect-[1.46/1] rounded-[14px]"
                    imageClassName="transition duration-500 group-hover:scale-[1.025]"
                  />
                  <h3 className="mt-3 font-display text-lg font-semibold">{project.title}</h3>
                  <p className="mt-1 text-xs text-[#777]">{project.category}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell pb-8 lg:pb-12">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0b0b0b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute inset-y-0 right-0 w-[48%] opacity-42">
              <SiteMedia
                alt="Creative community placeholder"
                kind="team"
                className="h-full"
                imageClassName="opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl">
              <p className="site-kicker !text-[#ff5a62]">Creative Community</p>
              <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
                Be Part of Our Creative Community
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/62">
                Create your profile, showcase your talent and discover film opportunities built around real collaboration.
              </p>
              <Link href="/signup" className="site-button site-button-primary mt-6">
                Join Now
              </Link>
            </div>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker">Journal</p>
                <h2 className="site-heading mt-2">Latest from Our Blog</h2>
              </div>
              <Link href="/blog" className="site-text-link">
                View All →
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {data.blogs.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <SiteMedia
                    src={post.image}
                    alt={post.title}
                    kind="blog"
                    className="aspect-[16/9] rounded-[14px]"
                    imageClassName="transition duration-500 group-hover:scale-[1.025]"
                  />
                  <p className="site-kicker mt-4">{post.category}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold leading-tight">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#888]">
                    {post.date} · {post.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
