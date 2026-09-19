"use client";
import { type FormEvent, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import type data from "@/data/admin-dashboard.json";
import { projectView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";
type Project = (typeof data.projects)[number] & { location?: string; summary?: string; published?: boolean };
export function AdminProjectsView() {
  const toast = useToast();
  const active = useAdminDashboardStore((s) => s.projectFilter),
    setActive = useAdminDashboardStore((s) => s.setProjectFilter);
  const [projects, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/projects${active !== "All" ? `?status=${encodeURIComponent(active)}` : ""}`,
    projectView,
    true,
    1,
    20,
  );
  const [creating, setCreating] = useState(false),
    [editing, setEditing] = useState<Project | null>(null);
  async function persist(e: FormEvent<HTMLFormElement>, id?: string) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      title = String(f.get("title") ?? "").trim(),
      cover = f.get("cover");
    let coverMediaId: string | undefined;
    if (cover instanceof File && cover.size > 0) coverMediaId = (await uploadMedia(cover)).id;
    const galleryFiles = f.getAll("gallery").filter((value): value is File => value instanceof File && value.size > 0);
    let galleryMediaIds: string[] | undefined;
    if (galleryFiles.length) {
      galleryMediaIds = [];
      for (const file of galleryFiles) galleryMediaIds.push((await uploadMedia(file)).id);
    }
    const body = {
      title,
      type: String(f.get("type") ?? ""),
      status: String(f.get("status") ?? "Development"),
      location: String(f.get("location") ?? ""),
      summary: String(f.get("summary") ?? ""),
      published: f.get("published") === "on",
      ...(coverMediaId ? { coverMediaId } : {}),
      ...(galleryMediaIds ? { galleryMediaIds } : {}),
      ...(f.get("startDate") ? { startDate: String(f.get("startDate")) } : {}),
      ...(!id ? { slug: slugFor(title) } : {}),
    };
    try {
      await api(id ? `/admin/projects/${id}` : "/admin/projects", { method: id ? "PATCH" : "POST", body: JSON.stringify(body) });
      await refresh();
      setCreating(false);
      setEditing(null);
      toast.success("Project saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save project.");
    }
  }
  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Production management"
        title="Projects"
        description="Manage productions, media and public visibility."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Project</AdminPrimaryButton>}
      />
      <AdminFilters values={["All", "Development", "Pre-production", "In Production", "Completed"]} active={active} onChange={setActive} />
      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!projects.length}
        emptyText="No projects match this filter."
        onRetry={() => void refresh()}
      />
      <section className="ad-project-grid">
        {projects.map((p) => (
          <article className="ad-project-card" key={p.id}>
            <SiteMedia src={p.image} alt={p.title} kind="project" className="aspect-[16/8]" />
            <div className="ad-project-body">
              <div className="ad-project-meta">
                <span>{p.type}</span>
                <AdminStatus value={p.status} />
              </div>
              <h2>{p.title}</h2>
              <div className="ad-project-numbers">
                <div>
                  <strong>{p.applications}</strong>
                  <span>Applications</span>
                </div>
                <div>
                  <strong>{p.team}</strong>
                  <span>Team</span>
                </div>
              </div>
              <div className="ad-project-footer">
                <span>Updated {p.updated}</span>
                <div className="ad-row-actions">
                  <button onClick={() => setEditing(p)}>Manage →</button>
                  <AdminMoreButton
                    onEdit={() => setEditing(p)}
                    onArchive={async () => {
                      await api(`/admin/projects/${p.id}`, { method: "DELETE" });
                      await refresh();
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
      <PaginationControls meta={meta} onPage={setPage} />
      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow="Create"
        title="New Project"
        description="Create a project and publish it whenever it is ready."
        width="wide"
      >
        <AdminDialogForm onSubmit={(e) => persist(e)}>
          <AdminDialogGrid>
            <AdminFormField label="Project Title" wide>
              <input name="title" autoFocus required />
            </AdminFormField>
            <AdminFormField label="Project Type">
              <select name="type">
                <option>Short Film</option>
                <option>Feature Film</option>
                <option>Web Series</option>
                <option>Music Video</option>
                <option>Brand Film</option>
                <option>Documentary</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Status">
              <select name="status">
                <option>Development</option>
                <option>Pre-production</option>
                <option>In Production</option>
                <option>Completed</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Location">
              <input name="location" />
            </AdminFormField>
            <AdminFormField label="Start Date">
              <input name="startDate" type="date" />
            </AdminFormField>
            <AdminFormField label="Cover Image">
              <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
            </AdminFormField>
            <AdminFormField label="Gallery Images" wide>
              <input name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp" />
            </AdminFormField>
            <AdminFormField label="Summary" wide>
              <textarea name="summary" rows={4} />
            </AdminFormField>
          </AdminDialogGrid>
          <label className="ad-dialog-check">
            <input name="published" type="checkbox" />
            <span>Publish on public website</span>
          </label>
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel="Create Project" />
        </AdminDialogForm>
      </AdminDialog>
      <AdminDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Manage"
        title={editing?.title ?? "Project"}
        description="Update metadata, cover and public visibility."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={(e) => persist(e, editing.id)}>
            <AdminDialogGrid>
              <AdminFormField label="Project Title" wide>
                <input name="title" defaultValue={editing.title} required />
              </AdminFormField>
              <AdminFormField label="Project Type">
                <input name="type" defaultValue={editing.type} />
              </AdminFormField>
              <AdminFormField label="Status">
                <select name="status" defaultValue={editing.status}>
                  <option>Development</option>
                  <option>Pre-production</option>
                  <option>In Production</option>
                  <option>Completed</option>
                </select>
              </AdminFormField>
              <AdminFormField label="Location">
                <input name="location" defaultValue={editing.location ?? ""} />
              </AdminFormField>
              <AdminFormField label="Replace Cover">
                <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
              </AdminFormField>
              <AdminFormField label="Replace Gallery" wide>
                <input name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp" />
              </AdminFormField>
              <AdminFormField label="Summary" wide>
                <textarea name="summary" rows={4} defaultValue={editing.summary ?? ""} />
              </AdminFormField>
            </AdminDialogGrid>
            <label className="ad-dialog-check">
              <input name="published" type="checkbox" defaultChecked={editing.published ?? false} />
              <span>Publish on public website</span>
            </label>
            <AdminDialogActions onCancel={() => setEditing(null)} primaryLabel="Save Changes" />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
