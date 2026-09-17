import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/config/site";

type PublicHeaderProps = {
  light?: boolean;
};

export function PublicHeader({ light = false }: PublicHeaderProps) {
  return (
    <header
      className={
        light
          ? "border-b border-black/5 bg-white"
          : "absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/10 backdrop-blur-md"
      }
    >
      <div className="container-shell flex h-20 items-center justify-between gap-5">
        <Link href="/" aria-label="M. Dadu Films home">
          <BrandLogo darkInk={light} />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition hover:text-[var(--brand-red)] ${
                light ? "text-slate-700" : "text-white/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden text-sm font-semibold sm:block ${
              light ? "text-slate-800" : "text-white"
            }`}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="brand-button brand-button-primary min-h-10 px-4 text-sm"
          >
            Join Now
          </Link>
        </div>
      </div>
    </header>
  );
}
