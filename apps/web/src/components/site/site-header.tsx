"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { SiteMedia } from "@/components/site/site-media";
import { useToast } from "@/components/ui/toast-provider";
import data from "@/data/website-data.json";
import { signOut } from "@/services/auth-session";
import { useAppStore } from "@/store/app-store";
import { usePublicUiStore } from "@/store/public-ui-store";

function initials(name?: string) {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const open = usePublicUiStore((state) => state.mobileMenuOpen);
  const toggle = usePublicUiStore((state) => state.toggleMobileMenu);
  const close = usePublicUiStore((state) => state.closeMobileMenu);
  const status = useAppStore((state) => state.authStatus);
  const user = useAppStore((state) => state.user);
  const profilePhoto = useAppStore((state) => state.profilePhoto);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const dashboardHref = user?.role === "SUPER_ADMIN" ? "/admin" : "/member";

  useEffect(() => {
    if (!accountOpen) return;

    function dismiss(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false);
    }

    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", keydown);

    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", keydown);
    };
  }, [accountOpen]);

  async function logout() {
    try {
      await signOut();
      setAccountOpen(false);
      close();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }

  const profileControl =
    status === "authenticated" && user ? (
      <div ref={accountRef} className="relative">
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((value) => !value)}
          className={`grid h-10 w-10 overflow-hidden rounded-full border text-xs font-bold ${
            dark ? "border-white/25 bg-white/10 text-white" : "border-black/10 bg-[#f6f6f4] text-[#111]"
          }`}
        >
          {profilePhoto ? (
            <SiteMedia src={profilePhoto} alt={`${user.name} profile`} kind="team" className="h-full w-full rounded-full" />
          ) : (
            <span className="grid h-full w-full place-items-center">{initials(user.name) || "ME"}</span>
          )}
        </button>

        {accountOpen && (
          <div className="absolute right-0 top-12 z-[70] w-56 rounded-2xl border border-black/10 bg-white p-2 text-[#111] shadow-2xl">
            <div className="border-b border-black/6 px-3 py-2">
              <strong className="block truncate text-sm">{user.name}</strong>
              <span className="block truncate text-xs text-[#777]">{user.email}</span>
            </div>
            <Link
              href={dashboardHref}
              onClick={() => setAccountOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#f6f6f4]"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#f6f6f4]"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    ) : status === "anonymous" ? (
      <>
        <Link href="/login" className={`hidden px-2 py-2 text-sm font-semibold sm:block ${dark ? "text-white/78" : "text-[#333]"}`}>
          Login
        </Link>
        <Link href="/signup" className="site-button site-button-primary hidden sm:inline-flex">
          Join Now
        </Link>
      </>
    ) : (
      <div className="hidden items-center gap-2 sm:flex" role="status" aria-live="polite" aria-label="Checking account session">
        <span className={`h-4 w-11 animate-pulse rounded-full ${dark ? "bg-white/16" : "bg-black/8"}`} />
        <span
          className={`h-10 w-[88px] animate-pulse rounded-full border ${
            dark ? "border-white/15 bg-white/10" : "border-black/8 bg-[#f6f6f4]"
          }`}
        />
        <span className="sr-only">Checking account…</span>
      </div>
    );

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

        <div className="flex items-center justify-end gap-2 sm:min-w-[168px]">
          {profileControl}
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
          <nav className="grid gap-1" aria-label="Mobile primary">
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
            <div className="mt-2 border-t border-black/5 pt-3">
              {status === "authenticated" && user ? (
                <div className="grid gap-2">
                  <Link href={dashboardHref} onClick={close} className="site-button site-button-outline justify-center">
                    Dashboard
                  </Link>
                  <button type="button" onClick={() => void logout()} className="site-button site-button-primary justify-center">
                    Logout
                  </button>
                </div>
              ) : status === "anonymous" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={close} className="site-button site-button-outline">
                    Login
                  </Link>
                  <Link href="/signup" onClick={close} className="site-button site-button-primary">
                    Join Now
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-[#f6f6f4] px-4 py-3" role="status" aria-live="polite">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-[#999]" />
                  <span className="text-sm font-semibold text-[#666]">Checking account…</span>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
