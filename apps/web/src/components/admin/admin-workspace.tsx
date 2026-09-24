import { AdminApplicationsView } from "@/components/admin/admin-applications-view";
import { AdminCareersView } from "@/components/admin/admin-careers-view";
import { AdminCastingView } from "@/components/admin/admin-casting-view";
import { AdminContactsView } from "@/components/admin/admin-contacts-view";
import { AdminContentView } from "@/components/admin/admin-content-view";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { AdminGalleryView } from "@/components/admin/admin-gallery-view";
import { AdminListsView } from "@/components/admin/admin-lists-view";
import { AdminMembersView } from "@/components/admin/admin-members-view";
import { AdminProjectsView } from "@/components/admin/admin-projects-view";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";
import { AdminShell } from "@/components/admin/admin-shell";
const valid = [
  "dashboard",
  "members",
  "applications",
  "projects",
  "casting",
  "services",
  "work",
  "blog",
  "gallery",
  "behind-the-scenes",
  "shows",
  "team",
  "lists",
  "contacts",
  "careers",
  "settings",
  "legal",
] as const;
export function AdminWorkspace({ section = "dashboard" }: { section?: string }) {
  const safe = valid.includes(section as (typeof valid)[number]) ? section : "dashboard";
  return (
    <AdminShell section={safe === "behind-the-scenes" ? "bts" : safe}>
      {safe === "members" ? (
        <AdminMembersView />
      ) : safe === "applications" ? (
        <AdminApplicationsView />
      ) : safe === "projects" ? (
        <AdminProjectsView />
      ) : safe === "casting" ? (
        <AdminCastingView />
      ) : safe === "services" || safe === "work" ? (
        <AdminContentView kind="services" />
      ) : safe === "blog" ? (
        <AdminContentView kind="blog" />
      ) : safe === "gallery" ? (
        <AdminGalleryView />
      ) : safe === "behind-the-scenes" ? (
        <AdminContentView kind="bts" />
      ) : safe === "shows" ? (
        <AdminContentView kind="shows" />
      ) : safe === "team" ? (
        <AdminContentView kind="team" />
      ) : safe === "lists" ? (
        <AdminListsView />
      ) : safe === "contacts" ? (
        <AdminContactsView />
      ) : safe === "careers" ? (
        <AdminCareersView />
      ) : safe === "settings" ? (
        <AdminSettingsView />
      ) : safe === "legal" ? (
        <AdminSettingsView legal />
      ) : (
        <AdminDashboardView />
      )}
    </AdminShell>
  );
}
