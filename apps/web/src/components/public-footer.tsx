import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="bg-[#0b0b0f] py-12 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo className="mb-4" />
          <p className="max-w-sm text-sm leading-6 text-white/60">
            {siteConfig.description}
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Quick Links</h3>
          <div className="grid gap-2 text-sm text-white/65">
            {[
              ...siteConfig.navigation,
              { label: "Gallery", href: "/gallery" },
              { label: "Behind the Scenes", href: "/behind-the-scenes" },
              { label: "Shows & Media", href: "/shows" },
              { label: "Team", href: "/team" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Company</h3>
          <p className="text-sm leading-6 text-white/65">
            GST: {siteConfig.legal.gst}
            <br />
            Registration: {siteConfig.legal.registration}
          </p>
        </div>
      </div>
      <div className="container-shell mt-10 border-t border-white/10 pt-6 text-xs text-white/45">
        © {new Date().getFullYear()} M. Dadu Films. All rights reserved.
      </div>
    </footer>
  );
}
