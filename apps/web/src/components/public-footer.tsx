import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/config/site";

function realValue(value: string) {
  return Boolean(value && !value.startsWith("ADD_"));
}

export function PublicFooter() {
  const legal = [
    realValue(siteConfig.legal.gst) ? `GST: ${siteConfig.legal.gst}` : "",
    realValue(siteConfig.legal.registration) ? `Registration: ${siteConfig.legal.registration}` : "",
  ].filter(Boolean);

  return (
    <footer className="bg-[var(--surface-dark)] py-14 text-white sm:py-16">
      <div className="container-shell grid gap-12 lg:grid-cols-[1.4fr_.8fr_.8fr]">
        <div>
          <BrandLogo className="mb-5" />
          <p className="max-w-md text-sm leading-7 text-white/60">{siteConfig.description}</p>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">
            Start a conversation <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-white/50">Explore</h3>
          <div className="grid gap-3 text-sm text-white/70">
            {[
              ...siteConfig.navigation,
              { label: "Gallery", href: "/gallery" },
              { label: "Behind the Scenes", href: "/behind-the-scenes" },
              { label: "Shows & Media", href: "/shows" },
              { label: "Team", href: "/team" },
            ].map((item) => (
              <Link key={`${item.label}-${item.href}`} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-white/50">Company</h3>
          {legal.length ? (
            <div className="grid gap-2 text-sm leading-6 text-white/65">
              {legal.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-white/50">Verified company details will be published here once supplied.</p>
          )}
        </div>
      </div>

      <div className="container-shell mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/40">
        <span>© {new Date().getFullYear()} M. Dadu Films. All rights reserved.</span>
        <span>People · Stories · Cinema</span>
      </div>
    </footer>
  );
}
