"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/config/site";

export function PublicHeader({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <header
      className={
        light
          ? "sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl"
          : "absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-black/10 backdrop-blur-xl"
      }
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="container-shell flex h-[84px] items-center justify-between gap-4">
        <Link href="/" aria-label="M. Dadu Films home" className="shrink-0">
          <BrandLogo darkInk={light} />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {siteConfig.navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? light
                      ? "bg-[var(--brand-red-soft)] text-[var(--brand-red)]"
                      : "bg-white/10 text-white"
                    : light
                      ? "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={`hidden rounded-lg px-2 py-2 text-sm font-semibold sm:block ${
              light ? "text-slate-700" : "text-white/85"
            }`}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="brand-button brand-button-primary min-h-11 px-4 text-sm"
          >
            Join Now
          </Link>
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden ${
              light
                ? "border-slate-200 bg-white text-slate-950"
                : "border-white/25 bg-white/5 text-white"
            }`}
          >
            <span aria-hidden="true" className="text-xl">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[84px] px-4 pb-4 lg:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mx-auto grid max-w-xl gap-1 rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl"
          >
            {[
              ...siteConfig.navigation,
              { label: "Gallery", href: "/gallery" },
              { label: "Team", href: "/team" },
              { label: "Login", href: "/login" },
            ].map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className="rounded-xl px-4 py-3 font-medium hover:bg-slate-50 aria-[current=page]:bg-red-50 aria-[current=page]:text-[var(--brand-red)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
