"use client";

import Image from "next/image";
import Link from "next/link";

import { ServicesSection } from "@/components/site/services-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import websiteData from "@/data/website-data.json";

import { usePublicData } from "./use-public-data";

export function HomePageView() {
  const data = usePublicData("home");

  return (
    <>
      <SiteHeader dark />
      <main id="main-content">
        <section className="relative isolate min-h-[620px] overflow-hidden bg-[#070707] text-white lg:min-h-[720px]">
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
                  Explore Projects
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 bg-black/55 backdrop-blur-[2px]">
            <div className="site-shell grid grid-cols-2 gap-y-5 py-5 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-white/8">
              {websiteData.aboutUs.stats.map((stat) => (
                <div key={stat.label} className="px-3 text-center sm:px-5">
                  <p className="font-display text-2xl font-semibold tracking-[-.02em] text-white sm:text-3xl">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.11em] text-white/46">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicesSection />

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

        <section className="border-y border-black/6 bg-[#fafafa] py-10 sm:py-12">
          <div className="site-shell">
            <div className="text-center">
              <p className="site-kicker">Collaborations</p>
              <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">Brands We Have Worked With</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#777]">
                Verified partner logos can replace these temporary placeholders as assets are added.
              </p>
            </div>
            <div className="brand-marquee relative mt-7 overflow-hidden">
              <div className="brand-marquee-track flex w-max items-center">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4" aria-hidden={copy === 1}>
                    {data.brands.map((brand) => (
                      <div
                        key={`${copy}-${brand.name}`}
                        className="relative flex h-24 w-[190px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_30px_rgba(0,0,0,.03)] sm:w-[220px]"
                      >
                        {brand.logo ? (
                          <Image
                            src={brand.logo}
                            alt={copy === 0 ? `${brand.name} logo` : ""}
                            fill
                            sizes="220px"
                            style={{ objectFit: "contain" }}
                            className="p-2 sm:p-2.5"
                          />
                        ) : (
                          <div className="px-4 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#aaa]">Partner Logo</span>
                            <strong className="mt-1 block text-sm text-[#444]">{brand.name}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @keyframes brandMarqueeScroll {
                from {
                  transform: translate3d(0, 0, 0);
                }
                to {
                  transform: translate3d(-50%, 0, 0);
                }
              }

              .brand-marquee-track {
                animation: brandMarqueeScroll 34s linear infinite;
                will-change: transform;
              }

              .brand-marquee:hover .brand-marquee-track {
                animation-play-state: paused;
              }

              @media (prefers-reduced-motion: reduce) {
                .brand-marquee {
                  overflow-x: auto;
                }

                .brand-marquee-track {
                  animation: none;
                  transform: none;
                }
              }
            `}</style>
          </div>
        </section>

        <section className="site-section bg-[#0b0b0b] text-white">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <p className="site-kicker !text-[#ff5a62]">{websiteData.homeTestimonials.eyebrow}</p>
                <h2 className="site-heading mt-2 !text-white">{websiteData.homeTestimonials.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{websiteData.homeTestimonials.description}</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {websiteData.homeTestimonials.items.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="flex min-h-[310px] flex-col rounded-[20px] border border-white/10 bg-white/[.045] p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl leading-none text-[var(--brand-red)]">“</span>
                    <span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/30">Client Voice</span>
                  </div>

                  <div className="mt-4 flex-1">
                    {testimonial.comment ? (
                      <p className="font-display text-xl leading-8 text-white/90">“{testimonial.comment}”</p>
                    ) : (
                      <p className="text-sm leading-7 text-white/45">
                        Approved testimonial copy can be added here directly from website-data.json.
                      </p>
                    )}
                  </div>

                  <div className="mt-7 flex items-center gap-4 border-t border-white/10 pt-5">
                    <SiteMedia
                      src={testimonial.image}
                      alt={testimonial.imageAlt}
                      kind="team"
                      className="h-14 w-14 shrink-0 rounded-full border border-white/10"
                      imageClassName="object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold leading-tight text-white">{testimonial.name}</h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.09em] text-[#ff646b]">{testimonial.designation}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-8 lg:py-12">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0b0b0b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute inset-y-0 right-0 hidden w-[48%] opacity-42 sm:block">
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
