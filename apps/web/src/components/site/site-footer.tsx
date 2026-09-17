import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import data from "@/data/public-site.json";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/8 bg-white">
      <div className="site-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_.75fr_1fr] lg:py-14">
        <div>
          <BrandLogo darkInk className="!w-[116px]" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#777]">
            Stories. People. Possibilities.
          </p>
        </div>

        <div>
          <p className="site-footer-title">Quick Links</p>
          <div className="mt-4 grid gap-2.5 text-sm text-[#686868]">
            {data.navigation.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-black">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="site-footer-title">Follow Us</p>
          <div className="mt-4 flex gap-2">
            {["in", "ig", "yt", "f"].map((item) => (
              <span
                key={item}
                className="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-[11px] font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="site-footer-title">Subscribe to our updates</p>
          <div className="mt-4 flex overflow-hidden rounded-xl border border-black/10 bg-[#fafafa]">
            <input
              aria-label="Email address"
              placeholder="Your email"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Subscribe"
              className="grid w-12 place-items-center bg-[var(--brand-red)] text-white"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="site-shell flex flex-wrap items-center justify-between gap-3 border-t border-black/5 py-5 text-[11px] text-[#888]">
        <span>© {new Date().getFullYear()} M. Dadu Films. All rights reserved.</span>
        <div className="flex gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
