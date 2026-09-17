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
          ? "relative z-20 border-b border-black/5 bg-white"
          : "absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/10 backdrop-blur-md"
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="container-shell flex h-20 items-center justify-between gap-3">
        <Link href="/" aria-label="M. Dadu Films home">
          <BrandLogo darkInk={light} />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 lg:flex"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`text-sm font-medium transition hover:text-[var(--brand-red)] ${pathname === item.href ? "text-[var(--brand-red)]" : light ? "text-slate-700" : "text-white/85"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden text-sm font-semibold sm:block ${light ? "text-slate-800" : "text-white"}`}
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
            onClick={() => setOpen(!open)}
            className={`flex h-11 w-11 items-center justify-center rounded-lg border lg:hidden ${light ? "border-slate-200 text-slate-950" : "border-white/30 text-white"}`}
          >
            <span aria-hidden="true" className="text-2xl">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-20 grid border-b border-slate-200 bg-white p-5 text-slate-900 shadow-xl lg:hidden"
        >
          {[
            ...siteConfig.navigation,
            { label: "Gallery", href: "/gallery" },
            { label: "Team", href: "/team" },
            { label: "Login", href: "/login" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className="rounded-lg px-4 py-3 hover:bg-slate-50 aria-[current=page]:text-[var(--brand-red)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
