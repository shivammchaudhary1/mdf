"use client";
import Link from "next/link";

import { OurWorkSection } from "@/components/site/our-work-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";

import { usePublicData } from "./use-public-data";

export function HomePageView() {
  const data = usePublicData("home");
  return (
    <>
      <SiteHeader dark />

      <main id="main-content">
        <section className="relative isolate min-h-[620px] overflow-hidden bg-[#070707] text-white lg:min-h-[720px]">
          {/* Full hero background video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/video/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Video overlays for text readability */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          <div className="site-shell relative z-10 flex min-h-[620px] items-center pb-16 pt-28 lg:min-h-[720px] lg:pb-20 lg:pt-24">
            <div className="max-w-[680px]">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[.18em] text-white/60">{data.brand.eyebrow}</p>

              <h1 className="font-display text-[clamp(3.1rem,7vw,6.8rem)] font-semibold leading-[.91] tracking-[-.045em]">
                Real People
                <br />
                Real Stories
                <br />
                <span className="text-[var(--brand-red)]">Bigger Possibilities</span>
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-7 text-white/75 sm:text-base">{data.brand.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/casting" className="site-button site-button-primary">
                  Explore Opportunities
                </Link>

                <Link href="/projects" className="site-button site-button-dark-outline">
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-white/35 text-[9px]">▶</span>
                  Watch Showreel
                </Link>
              </div>
            </div>
          </div>

          {/* Existing stats */}
          <div className="relative z-10 border-t border-white/10 bg-black/45 backdrop-blur-[2px]">
            <div className="site-shell grid grid-cols-2 divide-x divide-white/8 py-5 sm:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="px-4 text-center sm:px-6">
                  <p className="font-display text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/46">{stat.label}</p>
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
                <Link key={project.slug} href={`/projects/${project.slug}`} className="group">
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
              <SiteMedia alt="M. Dadu Films creative community" kind="team" className="h-full" imageClassName="opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl">
              <p className="site-kicker !text-[#ff5a62]">Creative Community</p>
              <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Be Part of Our Creative Community</h2>
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
                  <h3 className="font-display mt-2 text-xl font-semibold leading-tight">{post.title}</h3>
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
