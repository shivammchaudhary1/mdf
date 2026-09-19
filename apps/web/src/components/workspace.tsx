"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { LoadingState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { api, ApiError, type CurrentUser } from "@/services/api";

export const memberNavigation = [
  ["dashboard", "Dashboard"],
  ["profile", "My profile"],
  ["portfolio", "My portfolio"],
  ["applications", "My applications"],
  ["opportunities", "Opportunities"],
  ["settings", "Settings"],
];

export const adminNavigation = [
  ["dashboard", "Dashboard"],
  ["users", "Members & talent"],
  ["applications", "Applications"],
  ["projects", "Projects"],
  ["casting", "Casting calls"],
  ["blog", "Blog & news"],
  ["gallery", "Gallery"],
  ["behind-the-scenes", "Behind the scenes"],
  ["shows", "Shows & media"],
  ["team", "Team"],
  ["lists", "Saved talent lists"],
  ["contacts", "Contact queries"],
  ["settings", "Company settings"],
  ["legal", "Legal content"],
];

export function useApiData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    api<T>(path)
      .then((value) => {
        if (active) {
          setData(value);
          setError("");
        }
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load.");
        }
      });

    return () => {
      active = false;
    };
  }, [path, version]);

  return {
    data,
    error,
    reload: () => setVersion((value) => value + 1),
  };
}

export function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="card p-8">
      <p className="text-red-700">{message}</p>
      <button className="brand-button brand-button-quiet mt-5" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function Workspace({
  admin = false,
  section,
  children,
}: {
  admin?: boolean;
  section: string;
  children: (user: CurrentUser) => ReactNode;
}) {
  const { data: user, error, reload } = useApiData<CurrentUser>("/auth/me");
  const router = useRouter();
  const toast = useToast();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (error) {
      api("/auth/me").catch((caught) => {
        if (caught instanceof ApiError && caught.status === 401) {
          router.replace("/login");
        }
      });
    }

    if (user && admin && user.role !== "SUPER_ADMIN") {
      router.replace("/member");
    }
  }, [error, user, admin, router]);

  async function logout() {
    setLeaving(true);

    try {
      await api("/auth/logout", { method: "POST" });
      toast.success("Logged out.");
      router.replace("/login");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to sign out.");
      setLeaving(false);
    }
  }

  if (error) {
    return (
      <main className="container-shell py-16">
        <LoadError message={error} retry={reload} />
        <Link href="/login" className="mt-6 inline-block font-semibold text-[var(--brand-red)]">
          Sign in →
        </Link>
      </main>
    );
  }

  if (!user || (admin && user.role !== "SUPER_ADMIN")) {
    return <LoadingState />;
  }

  // Only expose admin routes once their Stage 10 screens exist.
  const navigation = admin ? adminNavigation.slice(0, 1) : memberNavigation;
  const base = admin ? "/admin" : "/member";

  return (
    <div className="min-h-screen bg-[#f7f7f8] lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="border-r border-slate-200/80 bg-white px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-5">
        <div className="flex items-center justify-between lg:block">
          <Link href="/" aria-label="Home" className="inline-flex">
            <BrandLogo darkInk />
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-slate-500 lg:mt-7 lg:inline-flex">
            {admin ? "Super Admin" : "Member"}
          </span>
        </div>

        <nav
          aria-label={admin ? "Admin navigation" : "Member navigation"}
          className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:mt-7 lg:grid lg:overflow-visible"
        >
          {navigation.map(([key, label]) => {
            const active = section === key;

            return (
              <Link
                key={key}
                href={key === "dashboard" ? base : `${base}/${key}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--brand-red)] text-white shadow-[0_8px_24px_rgba(229,57,69,.18)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 hidden border-t border-slate-100 pt-5 lg:block">
          <Link href="/projects" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
            ← Public website
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-slate-200/75 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{admin ? "Administration" : "Creative community"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {admin ? "Manage the platform from one place." : "Profile, portfolio and opportunities."}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.verified ? "Verified member" : "Member"}</p>
            </div>
            <div
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white"
            >
              {user.name.trim().charAt(0).toUpperCase() || "M"}
            </div>
            <button disabled={leaving} onClick={logout} className="text-sm font-bold text-[var(--brand-red)]">
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl p-5 pb-28 sm:p-8 sm:pb-28 lg:p-10 lg:pb-12 xl:p-12">
          {children(user)}
        </main>
      </div>

      {!admin && (
        <nav
          aria-label="Mobile shortcuts"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(17,19,24,.06)] backdrop-blur-xl lg:hidden"
        >
          {memberNavigation.slice(0, 4).map(([key, label]) => (
            <Link
              key={key}
              href={key === "dashboard" ? base : `${base}/${key}`}
              aria-current={section === key ? "page" : undefined}
              className={`px-1 py-4 text-center text-[11px] font-bold ${section === key ? "text-[var(--brand-red)]" : "text-slate-500"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
