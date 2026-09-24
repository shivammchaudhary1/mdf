"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { AdminIcon } from "@/components/admin/admin-icons";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { BrandLogo } from "@/components/brand-logo";
import { LoadingState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { ensureSession, signOut } from "@/services/auth-session";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useAppStore } from "@/store/app-store";

type AdminNavItem = readonly [key: string, label: string, href: string];

export const adminNavGroups = [
  { label: "Overview", items: [["dashboard", "Overview", "/admin"]] },
  {
    label: "Operations",
    items: [
      ["projects", "Projects", "/admin/projects"],
      ["casting", "Casting Calls", "/admin/casting"],
      ["members", "Members", "/admin/members"],
      ["applications", "Applications", "/admin/applications"],
      ["lists", "Saved Talent Lists", "/admin/lists"],
    ],
  },
  {
    label: "Inbox",
    items: [
      ["contacts", "Contact Queries", "/admin/contacts"],
      ["careers", "Career Applications", "/admin/careers"],
    ],
  },
  {
    label: "Content",
    items: [
      ["gallery", "Gallery", "/admin/gallery"],
      ["blog", "Blog & News", "/admin/blog"],
      ["services", "Services", "/admin/services"],
      ["team", "Team", "/admin/team"],
    ],
  },
  {
    label: "System",
    items: [
      ["settings", "Company Settings", "/admin/settings"],
      ["legal", "Legal Content", "/admin/legal"],
    ],
  },
] as const;

export const adminNav: AdminNavItem[] = adminNavGroups.flatMap<AdminNavItem>((group) => [...group.items]);

export function AdminShell({ section, children }: { section: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const open = useAdminDashboardStore((state) => state.mobileOpen);
  const setOpen = useAdminDashboardStore((state) => state.setMobileOpen);
  const status = useAppStore((state) => state.authStatus);
  const account = useAppStore((state) => state.account);

  const admin = {
    name: account?.name ?? "",
    initials: (account?.name ?? "")
      .split(" ")
      .map((value) => value[0])
      .join("")
      .slice(0, 2),
  };

  useEffect(() => {
    void ensureSession().then((account) => {
      if (!account) {
        router.replace("/login");
        return;
      }

      if (account.role !== "SUPER_ADMIN") router.replace("/member");
    });
  }, [router]);

  async function logout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }

  if (status === "unknown" || status === "loading" || !account) {
    return <LoadingState label="Verifying administrator access…" />;
  }

  if (account.role !== "SUPER_ADMIN") {
    return <LoadingState label="Redirecting to your workspace…" />;
  }

  return (
    <div className="ad-shell">
      <aside className={`ad-sidebar ${open ? "is-open" : ""}`}>
        <div className="ad-sidebar-brand">
          <Link href="/" onClick={() => setOpen(false)}>
            <BrandLogo className="!w-[108px]" />
          </Link>
          <button className="ad-close" onClick={() => setOpen(false)} aria-label="Close admin navigation">
            ×
          </button>
        </div>

        <div className="ad-admin-chip">
          <div className="ad-avatar">{admin.initials}</div>
          <div>
            <strong>{admin.name}</strong>
            <span>Super Admin</span>
          </div>
        </div>

        <nav className="ad-nav" aria-label="Administrator">
          {adminNavGroups.map((group) => (
            <div className="ad-nav-group" key={group.label}>
              <p className="ad-nav-group-label">{group.label}</p>
              <div className="ad-nav-group-items">
                {group.items.map(([key, label, href]) => {
                  const active = key === "dashboard" ? pathname === "/admin" : pathname.startsWith(href);
                  return (
                    <Link key={key} href={href} onClick={() => setOpen(false)} className={active ? "active" : ""}>
                      <AdminIcon name={key} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="ad-sidebar-bottom">
          <Link href="/">← Public Website</Link>
          <Link href="/member">Member Dashboard</Link>
          <button onClick={() => void logout()}>
            <AdminIcon name="logout" />
            Sign Out
          </button>
        </div>
      </aside>

      {open && <button className="ad-backdrop" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}

      <div className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu" onClick={() => setOpen(true)} aria-label="Open admin navigation">
              ☰
            </button>
            <div>
              <span>SUPER ADMIN</span>
              <strong>{adminNav.find(([key]) => key === section)?.[1] ?? "Overview"}</strong>
            </div>
          </div>
          <div className="ad-topbar-right">
            <AdminNotifications />
            <div className="ad-avatar ad-avatar-top" aria-label={`${admin.name} account`}>
              {admin.initials}
            </div>
          </div>
        </header>
        <main className="ad-content">{children}</main>
      </div>
    </div>
  );
}
