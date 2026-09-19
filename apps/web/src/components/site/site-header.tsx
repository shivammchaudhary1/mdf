"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import data from "@/data/public-site.json";
import { usePublicUiStore } from "@/store/public-ui-store";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();
  const open = usePublicUiStore((state) => state.mobileMenuOpen);
  const toggle = usePublicUiStore((state) => state.toggleMobileMenu);
  const close = usePublicUiStore((state) => state.closeMobileMenu);

  return (
    <header
      className={`z-50 w-full ${
        dark
          ? "absolute inset-x-0 top-0 border-b border-white/10 bg-black/10 text-white backdrop-blur-md"
          : "sticky top-0 border-b border-black/5 bg-white/95 text-[#111] backdrop-blur-xl"
      }`}
    >
      <div className="site-shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" aria-label="M. Dadu Films home" onClick={close}>
          <BrandLogo darkInk={!dark} className="!w-[108px] sm:!w-[118px]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {data.navigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-[13px] font-semibold transition ${
                  active
                    ? dark
                      ? "bg-white/10 text-white"
                      : "bg-[#f6f6f4] text-[#111]"
                    : dark
                      ? "text-white/72 hover:text-white"
                      : "text-[#555] hover:text-[#111]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={`hidden px-2 py-2 text-sm font-semibold sm:block ${dark ? "text-white/78" : "text-[#333]"}`}>
            Login
          </Link>
          <Link href="/signup" className="site-button site-button-primary hidden sm:inline-flex">
            Join Now
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className={`grid h-10 w-10 place-items-center rounded-full border lg:hidden ${
              dark ? "border-white/20 bg-white/5 text-white" : "border-black/10 bg-white text-[#111]"
            }`}
          >
            <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-3 top-[80px] rounded-[20px] border border-black/10 bg-white p-3 text-[#111] shadow-2xl lg:hidden">
          <nav className="grid gap-1">
            {data.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#f6f6f4]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-black/5 pt-3">
              <Link href="/login" onClick={close} className="site-button site-button-outline">
                Login
              </Link>
              <Link href="/signup" onClick={close} className="site-button site-button-primary">
                Join Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
