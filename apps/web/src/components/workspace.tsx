"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type CurrentUser } from "@/services/api";
import { BrandLogo } from "@/components/brand-logo";
import { useToast } from "@/components/ui/toast-provider";
import { LoadingState } from "@/components/ui/feedback";
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
      .catch((error) => {
        if (active)
          setError(error instanceof Error ? error.message : "Unable to load.");
      });
    return () => {
      active = false;
    };
  }, [path, version]);
  return { data, error, reload: () => setVersion((value) => value + 1) };
}
export function LoadError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div role="alert" className="card p-8">
      <p className="text-red-700">{message}</p>
      <button className="brand-button mt-4 border" onClick={retry}>
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
    if (error)
      api("/auth/me").catch((error) => {
        if (error instanceof ApiError && error.status === 401)
          router.replace("/login");
      });
    if (user && admin && user.role !== "SUPER_ADMIN") router.replace("/member");
  }, [error, user, admin, router]);
  async function logout() {
    setLeaving(true);
    try {
      await api("/auth/logout", { method: "POST" });
      toast.success("Logged out.");
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
      setLeaving(false);
    }
  }
  if (error)
    return (
      <main className="container-shell py-16">
        <LoadError message={error} retry={reload} />
        <Link href="/login" className="mt-6 inline-block text-red-700">
          Sign in →
        </Link>
      </main>
    );
  if (!user || (admin && user.role !== "SUPER_ADMIN")) return <LoadingState />;
  const navigation = admin ? adminNavigation.slice(0, 1) : memberNavigation;
  const base = admin ? "/admin" : "/member";
  return (
    <div className="min-h-screen bg-[var(--surface)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Link href="/" aria-label="Home">
          <BrandLogo darkInk />
        </Link>
        <nav
          aria-label={admin ? "Admin navigation" : "Member navigation"}
          className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:grid"
        >
          {navigation.map(([key, label]) => (
            <Link
              key={key}
              href={key === "dashboard" ? base : `${base}/${key}`}
              aria-current={section === key ? "page" : undefined}
              className={`shrink-0 rounded-lg px-4 py-3 text-sm font-medium ${section === key ? "bg-[var(--brand-red)] text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/projects"
          className="mt-5 hidden text-sm text-slate-500 lg:block"
        >
          ← Public website
        </Link>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <p className="text-sm text-slate-500">
            {admin ? "Super Admin" : "Member community"}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-semibold">{user.name}</span>
            <button
              disabled={leaving}
              onClick={logout}
              className="text-sm font-semibold text-[var(--brand-red)]"
            >
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-7xl p-5 pb-24 sm:p-8 lg:p-10"
        >
          {children(user)}
        </main>
      </div>
      {!admin && (
        <nav
          aria-label="Mobile shortcuts"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {memberNavigation.slice(0, 4).map(([key, label]) => (
            <Link
              key={key}
              href={key === "dashboard" ? base : `${base}/${key}`}
              className={`px-1 py-4 text-center text-xs font-semibold ${section === key ? "text-red-600" : "text-slate-600"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
