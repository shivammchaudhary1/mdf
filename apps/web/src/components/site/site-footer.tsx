"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import data from "@/data/public-site.json";
import { cachedApi } from "@/services/api";

type Socials = {
  companyName?: string;
  tagline?: string;
  description?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
};

const safe = (value?: string) => (value && /^https:\/\//i.test(value) ? value : "");

function SocialIcon({ name }: { name: "linkedin" | "instagram" | "youtube" | "facebook" }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
    "aria-hidden": true,
  };

  if (name === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17 5.6 12 5.6 12 5.6s-5 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15.4V8.6l5 3.4-5 3.4Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M6.5 8.2H3.4V21h3.1V8.2ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.7c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.2-3.9 2.1V8.2H9.1V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20l1-7.3Z" />
      </svg>
    );
  }

  return (
    <svg {...common} fill="currentColor">
      <path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8h3.4Z" />
    </svg>
  );
}

export function SiteFooter() {
  const [socials, setSocials] = useState<Socials>({});

  useEffect(() => {
    let active = true;

    void cachedApi<{ items: Array<{ slug?: string; data?: Socials }> }>("/content/settings?page=1&limit=100", { ttl: 300_000 })
      .then((page) => {
        if (!active) return;
        const company = page.items.find((item) => item.slug === "company");
        setSocials(company?.data ?? {});
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const companyName = socials.companyName || "M. Dadu Films";
  const tagline = socials.tagline || "Transforming Visions into Cinematic Reality";
  const description =
    socials.description ||
    "A film production house bringing together stories, creators, brands and emerging talent through meaningful visual work.";

  const socialEntries = (["instagram", "youtube", "linkedin", "facebook"] as const).map((name) => ({
    name,
    href: safe(socials[name]),
  }));

  const primaryLinks = data.navigation.slice(0, 5);
  const secondaryLinks = data.navigation.slice(5);

  return (
    <footer className="border-t border-black/6 bg-[#f8f7f4]">
      <div className="site-shell py-10 sm:py-12 lg:py-14">
        <div className="overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_22px_70px_rgba(0,0,0,.055)]">
          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.25fr_.78fr_.78fr_1fr] lg:px-10 lg:py-10">
            <div className="max-w-md">
              <Link href="/" aria-label="M. Dadu Films home" className="inline-flex">
                <BrandLogo darkInk className="!w-[132px] sm:!w-[146px]" />
              </Link>

              <p className="mt-5 font-display text-[1.35rem] font-semibold leading-tight text-[#171717]">{tagline}</p>

              <p className="mt-3 text-sm leading-6 text-[#747474]">{description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {socialEntries.map(({ name, href }) =>
                  href ? (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${companyName} on ${name}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-[#fafafa] text-[#343434] transition hover:border-[var(--brand-red)] hover:bg-[var(--brand-red)] hover:text-white"
                    >
                      <SocialIcon name={name} />
                    </a>
                  ) : (
                    <span
                      key={name}
                      aria-label={`${name} link not configured`}
                      title={`${name} link will appear when configured`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/7 bg-[#fafafa] text-[#b1b1b1]"
                    >
                      <SocialIcon name={name} />
                    </span>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#232323]">Explore</p>
              <nav className="mt-4 grid gap-2.5 text-sm text-[#686868]" aria-label="Footer primary">
                {primaryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="w-fit transition hover:text-[var(--brand-red)]">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#232323]">More</p>
              <nav className="mt-4 grid gap-2.5 text-sm text-[#686868]" aria-label="Footer secondary">
                {secondaryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="w-fit transition hover:text-[var(--brand-red)]">
                    {item.label}
                  </Link>
                ))}
                <Link href="/careers" className="w-fit transition hover:text-[var(--brand-red)]">
                  Careers
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#232323]">Join the Community</p>
              <h3 className="font-display mt-4 text-2xl font-semibold leading-tight text-[#171717]">
                Your next opportunity could start here.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#747474]">
                Create your member profile, manage your dashboard and apply to projects and casting opportunities.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/signup" className="site-button site-button-primary">
                  Join as a Member
                </Link>
                <Link href="/careers" className="site-button site-button-outline">
                  Careers
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-black/6 bg-[#fbfaf8] px-6 py-4 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-3 text-[11px] text-[#8a8a8a] sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} {companyName}. All rights reserved.
              </span>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/privacy" className="transition hover:text-[#222]">
                  Privacy
                </Link>
                <Link href="/terms" className="transition hover:text-[#222]">
                  Terms
                </Link>
                <Link href="/careers" className="transition hover:text-[#222]">
                  Careers
                </Link>
                <a href="/sitemap.xml" className="transition hover:text-[#222]">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
