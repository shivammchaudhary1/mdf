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
import { type ProjectView, projectView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

const splitLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitCsv = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function parseCredits(value: FormDataEntryValue | null) {
  return splitLines(value)
    .map((line) => {
      const [name, ...roleParts] = line.split("|");
      return { name: name.trim(), role: roleParts.join("|").trim() };
    })
    .filter((item) => item.name && item.role);
}

export function AdminProjectsView() {
  const toast = useToast();
  const active = useAdminDashboardStore((s) => s.projectFilter);
  const setActive = useAdminDashboardStore((s) => s.setProjectFilter);
  const [projects, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/projects${active !== "All" ? `?status=${encodeURIComponent(active)}` : ""}`,
    projectView,
    true,
    1,
    20,
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProjectView | null>(null);

  async function persist(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const cover = form.get("cover");
    const galleryFiles = form.getAll("gallery").filter((value): value is File => value instanceof File && value.size > 0);

    let coverMediaId: string | null | undefined;
    if (cover instanceof File && cover.size > 0) coverMediaId = (await uploadMedia(cover, "project")).id;
    else if (id && form.get("removeCover") === "on") coverMediaId = null;

    let galleryMediaIds: string[] | undefined;
    if (galleryFiles.length) {
      galleryMediaIds = [];
      for (const file of galleryFiles) galleryMediaIds.push((await uploadMedia(file, "project")).id);
    } else if (id && form.get("clearGallery") === "on") {
      galleryMediaIds = [];
    }

    const startDate = String(form.get("startDate") ?? "").trim();
    const endDate = String(form.get("endDate") ?? "").trim();
    const trailerUrl = String(form.get("trailerUrl") ?? "").trim();
    const order = Number(form.get("order") ?? 0);

    const body = {
      title,
      ...(!id ? { slug: slugFor(title) } : {}),
      type: String(form.get("type") ?? "").trim(),
      summary: String(form.get("summary") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      body: splitLines(form.get("body")),
      creditsText: String(form.get("creditsText") ?? "").trim(),
      status: String(form.get("status") ?? "Development"),
      location: String(form.get("location") ?? "").trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      ...(coverMediaId !== undefined ? { coverMediaId } : {}),
      ...(galleryMediaIds !== undefined ? { galleryMediaIds } : {}),
      credits: parseCredits(form.get("credits")),
      trailerUrl: trailerUrl || null,
      tags: splitCsv(form.get("tags")),
      published: form.get("published") === "on",
      order: Number.isFinite(order) ? order : 0,
    };

    try {
      await api(id ? `/admin/projects/${id}` : "/admin/projects", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      await refresh();
      setCreating(false);
      setEditing(null);
      toast.success("Project saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save project.");
    }
  }

  const Fields = ({ edit }: { edit?: ProjectView }) => (
    <>
      <AdminDialogGrid>
        <AdminFormField label="Project Title" wide>
          <input name="title" defaultValue={edit?.title} required maxLength={160} />
        </AdminFormField>
        <AdminFormField label="Project Type">
          <input name="type" defaultValue={edit?.type} maxLength={100} />
        </AdminFormField>
        <AdminFormField label="Status">
          <select name="status" defaultValue={edit?.status ?? "Development"}>
            <option>Development</option>
            <option>Pre-production</option>
            <option>In Production</option>
            <option>Completed</option>
          </select>
        </AdminFormField>
        <AdminFormField label="Location">
          <input name="location" defaultValue={edit?.location} maxLength={200} />
        </AdminFormField>
        <AdminFormField label="Display Order">
          <input name="order" type="number" min="0" max="10000" defaultValue={edit?.order ?? 0} />
        </AdminFormField>
        <AdminFormField label="Start Date">
          <input name="startDate" type="date" defaultValue={edit?.startDate} />
        </AdminFormField>
        <AdminFormField label="End Date">
          <input name="endDate" type="date" defaultValue={edit?.endDate} />
        </AdminFormField>
        <AdminFormField label={edit ? "Replace Cover" : "Cover Image"}>
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
        </AdminFormField>
        <AdminFormField label={edit ? "Replace Gallery" : "Gallery Images"} wide>
          <input name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp" />
        </AdminFormField>
        <AdminFormField label="Summary" wide>
          <textarea name="summary" rows={3} defaultValue={edit?.summary} maxLength={1000} />
        </AdminFormField>
        <AdminFormField label="Description" wide>
          <textarea name="description" rows={5} defaultValue={edit?.description} maxLength={15000} />
        </AdminFormField>
        <AdminFormField label="Body Sections" wide>
          <textarea name="body" rows={6} defaultValue={edit?.body.join("\n")} placeholder="One section per line" />
        </AdminFormField>
        <AdminFormField label="Credits (Name | Role)" wide>
          <textarea name="credits" rows={5} defaultValue={edit?.credits.map((item) => `${item.name} | ${item.role}`).join("\n")} />
        </AdminFormField>
        <AdminFormField label="Credits Text" wide>
          <textarea name="creditsText" rows={4} defaultValue={edit?.creditsText} maxLength={5000} />
        </AdminFormField>
        <AdminFormField label="Trailer URL" wide>
          <input name="trailerUrl" type="url" defaultValue={edit?.trailerUrl} placeholder="https://..." />
        </AdminFormField>
        <AdminFormField label="Tags" wide>
          <input name="tags" defaultValue={edit?.tags.join(", ")} placeholder="drama, indie, hindi" />
        </AdminFormField>
      </AdminDialogGrid>
      {edit && (
        <div className="grid gap-2 md:grid-cols-2">
          <label className="ad-dialog-check">
            <input name="removeCover" type="checkbox" />
            <span>Remove existing cover image</span>
          </label>
          <label className="ad-dialog-check">
            <input name="clearGallery" type="checkbox" />
            <span>Clear existing gallery</span>
          </label>
        </div>
      )}
      <label className="ad-dialog-check">
        <input name="published" type="checkbox" defaultChecked={edit?.published ?? false} />
        <span>Publish on public website</span>
      </label>
    </>
  );

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Production management"
        title="Projects"
        description="Manage complete project metadata, dates, media, credits and public visibility."
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
        {projects.map((project) => (
          <article className="ad-project-card" key={project.id}>
            <SiteMedia src={project.image} alt={project.title} kind="project" className="aspect-[16/8]" />
            <div className="ad-project-body">
              <div className="ad-project-meta">
                <span>{project.type}</span>
                <AdminStatus value={project.status} />
              </div>
              <h2>{project.title}</h2>
              <div className="ad-project-numbers">
                <div>
                  <strong>{project.applications}</strong>
                  <span>Applications</span>
                </div>
                <div>
                  <strong>{project.team}</strong>
                  <span>Team</span>
                </div>
              </div>
              <div className="ad-project-footer">
                <span>Updated {project.updated}</span>
                <div className="ad-row-actions">
                  <button onClick={() => setEditing(project)}>Manage →</button>
                  <AdminMoreButton
                    onEdit={() => setEditing(project)}
                    onArchive={async () => {
                      await api(`/admin/projects/${project.id}`, { method: "DELETE" });
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
        description="Create a complete project record."
        width="wide"
      >
        <AdminDialogForm onSubmit={(event) => persist(event)}>
          <Fields />
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel="Create Project" />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Manage"
        title={editing?.title ?? "Project"}
        description="Update all project fields and media."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={(event) => persist(event, editing.id)}>
            <Fields edit={editing} />
            {!!editing.galleryImages.length && (
              <div>
                <p className="ad-kicker">Current gallery</p>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {editing.galleryImages.map((src, index) => (
                    <SiteMedia
                      key={src}
                      src={src}
                      alt={`${editing.title} gallery ${index + 1}`}
                      kind="project"
                      className="aspect-square rounded-xl"
                    />
                  ))}
                </div>
              </div>
            )}
            <AdminDialogActions onCancel={() => setEditing(null)} primaryLabel="Save Changes" />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
