"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSearch,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type ProjectCredit, type ProjectLink, type ProjectView, projectView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

const PROJECT_TYPES = [
  "Film",
  "Short Film",
  "Feature Film",
  "Advertisement",
  "Music Video",
  "Web Series",
  "Documentary",
  "Corporate Film",
  "Digital Film",
];

const CREDIT_ROLES = [
  "Director",
  "Producer",
  "Executive Producer",
  "DOP / Cinematographer",
  "Writer",
  "Editor",
  "Actor",
  "Music Director",
  "Sound",
  "Art Director",
  "Costume",
  "Makeup",
  "VFX",
  "Colorist",
  "Production",
];

const LINK_TITLES = ["Teaser", "Trailer", "Behind the Scenes", "Making Of", "Full Film", "Music Video", "Interview"];

const TAG_OPTIONS = [
  "Drama",
  "Comedy",
  "Thriller",
  "Romance",
  "Action",
  "Documentary",
  "Advertisement",
  "Music",
  "Hindi",
  "English",
  "Regional",
  "Indie",
  "Commercial",
];

const splitLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

function trimRows<T extends Record<string, string>>(rows: T[]) {
  return rows
    .map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.trim()])) as T)
    .filter((row) => Object.values(row).every(Boolean));
}

function ProjectFields({ edit, uploading }: { edit?: ProjectView; uploading: boolean }) {
  const initialTypePreset = edit?.type && PROJECT_TYPES.includes(edit.type) ? edit.type : edit?.type ? "Other" : "";
  const [typePreset, setTypePreset] = useState(initialTypePreset);
  const [customType, setCustomType] = useState(initialTypePreset === "Other" ? (edit?.type ?? "") : "");

  const [credits, setCredits] = useState<ProjectCredit[]>(edit?.credits?.length ? edit.credits : []);
  const [creditRolePresets, setCreditRolePresets] = useState<string[]>(
    (edit?.credits ?? []).map((credit) => (CREDIT_ROLES.includes(credit.role) ? credit.role : "Other")),
  );

  const existingLinks = useMemo<ProjectLink[]>(() => {
    if (edit?.links?.length) return edit.links;
    if (edit?.trailerUrl) return [{ title: "Trailer", url: edit.trailerUrl }];
    return [];
  }, [edit]);

  const [links, setLinks] = useState<ProjectLink[]>(existingLinks);
  const [linkTitlePresets, setLinkTitlePresets] = useState<string[]>(
    existingLinks.map((link) => (LINK_TITLES.includes(link.title) ? link.title : "Other")),
  );

  const [tags, setTags] = useState<string[]>(edit?.tags ?? []);
  const [tagPreset, setTagPreset] = useState("");
  const [customTag, setCustomTag] = useState("");

  const [coverPreview, setCoverPreview] = useState(edit?.image ?? "");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(edit?.galleryImages ?? []);

  useEffect(
    () => () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      galleryPreviews.filter((value) => value.startsWith("blob:")).forEach((value) => URL.revokeObjectURL(value));
    },
    [coverPreview, galleryPreviews],
  );

  function updateCredit(index: number, patch: Partial<ProjectCredit>) {
    setCredits((current) => current.map((credit, itemIndex) => (itemIndex === index ? { ...credit, ...patch } : credit)));
  }

  function updateLink(index: number, patch: Partial<ProjectLink>) {
    setLinks((current) => current.map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)));
  }

  function addTag() {
    const value = (tagPreset === "Other" ? customTag : tagPreset).trim();
    if (!value || tags.some((tag) => tag.toLowerCase() === value.toLowerCase()) || tags.length >= 20) return;
    setTags((current) => [...current, value]);
    setTagPreset("");
    setCustomTag("");
  }

  return (
    <>
      {uploading && (
        <div className="ad-project-uploading" role="status">
          <i />
          <div>
            <strong>Uploading project media…</strong>
            <span>Please keep this window open while images are processed.</span>
          </div>
        </div>
      )}

      <input type="hidden" name="resolvedType" value={(typePreset === "Other" ? customType : typePreset).trim()} />
      <input type="hidden" name="creditsJson" value={JSON.stringify(trimRows(credits))} />
      <input type="hidden" name="linksJson" value={JSON.stringify(trimRows(links))} />
      <input type="hidden" name="tagsJson" value={JSON.stringify(tags)} />

      <AdminDialogGrid>
        <AdminFormField label="Project Title" wide>
          <input name="title" defaultValue={edit?.title} required maxLength={160} />
        </AdminFormField>

        <AdminFormField label="Project Type">
          <select value={typePreset} onChange={(event) => setTypePreset(event.target.value)}>
            <option value="">Not specified</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
            <option>Other</option>
          </select>
          {typePreset === "Other" && (
            <input
              className="mt-2"
              value={customType}
              onChange={(event) => setCustomType(event.target.value)}
              maxLength={100}
              placeholder="Enter project type"
            />
          )}
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
          <input name="location" defaultValue={edit?.location} maxLength={200} placeholder="Optional" />
        </AdminFormField>

        <AdminFormField label="Display Order">
          <input
            name="order"
            type="number"
            min="0"
            max="10000"
            defaultValue={edit?.order ?? ""}
            placeholder="Optional — newest projects appear first"
          />
        </AdminFormField>

        <AdminFormField label="Start Date">
          <input name="startDate" type="date" defaultValue={edit?.startDate} />
        </AdminFormField>

        <AdminFormField label="End Date">
          <input name="endDate" type="date" defaultValue={edit?.endDate} />
        </AdminFormField>

        <AdminFormField label={edit ? "Replace Cover" : "Cover Image"} wide>
          <input
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
              setCoverPreview(URL.createObjectURL(file));
            }}
          />
          {coverPreview && (
            <div className="ad-project-cover-preview">
              <img src={coverPreview} alt="Selected cover preview" />
              <span>Cover preview</span>
            </div>
          )}
        </AdminFormField>

        <AdminFormField label={edit ? "Replace Gallery (max 4)" : "Gallery Images (max 4)"} wide>
          <div className="ad-project-gallery-pickers">
            {Array.from({ length: 4 }, (_, index) => (
              <label className="ad-project-gallery-slot" key={index}>
                {galleryPreviews[index] ? (
                  <img src={galleryPreviews[index]} alt={`Gallery preview ${index + 1}`} />
                ) : (
                  <span>+ Image {index + 1}</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  name={`gallery-${index}`}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setGalleryPreviews((current) => {
                      const next = [...current];
                      const old = next[index];
                      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
                      next[index] = URL.createObjectURL(file);
                      return next.slice(0, 4);
                    });
                  }}
                />
              </label>
            ))}
          </div>
          <small className="ad-project-help">Choose up to four images. Selecting a slot replaces that position when editing.</small>
        </AdminFormField>

        <AdminFormField label="Summary" wide>
          <textarea name="summary" rows={3} defaultValue={edit?.summary} maxLength={1000} placeholder="Optional" />
        </AdminFormField>

        <AdminFormField label="Description" wide>
          <textarea name="description" rows={5} defaultValue={edit?.description} maxLength={15000} placeholder="Optional" />
        </AdminFormField>

        <AdminFormField label="Body Sections" wide>
          <textarea name="body" rows={6} defaultValue={edit?.body.join("\n")} placeholder="Optional — one paragraph/section per line" />
        </AdminFormField>
      </AdminDialogGrid>

      <section className="ad-project-builder">
        <div className="ad-project-builder-head">
          <div>
            <p className="ad-kicker">Credits</p>
            <strong>Name + role</strong>
          </div>
          <button
            type="button"
            className="ad-dialog-secondary"
            onClick={() => {
              if (credits.length >= 100) return;
              setCredits((current) => [...current, { name: "", role: "" }]);
              setCreditRolePresets((current) => [...current, ""]);
            }}
          >
            + Add Credit
          </button>
        </div>

        {credits.map((credit, index) => {
          const preset = creditRolePresets[index] ?? (CREDIT_ROLES.includes(credit.role) ? credit.role : credit.role ? "Other" : "");
          return (
            <div className="ad-project-row" key={`credit-${index}`}>
              <input
                value={credit.name}
                onChange={(event) => updateCredit(index, { name: event.target.value })}
                placeholder="Name"
                maxLength={100}
              />
              <select
                value={preset}
                onChange={(event) => {
                  const value = event.target.value;
                  setCreditRolePresets((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
                  updateCredit(index, { role: value === "Other" ? "" : value });
                }}
              >
                <option value="">Role</option>
                {CREDIT_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
                <option>Other</option>
              </select>
              {preset === "Other" && (
                <input
                  value={credit.role}
                  onChange={(event) => updateCredit(index, { role: event.target.value })}
                  placeholder="Custom role"
                  maxLength={100}
                />
              )}
              <button
                type="button"
                className="ad-project-remove"
                onClick={() => {
                  setCredits((current) => current.filter((_, itemIndex) => itemIndex !== index));
                  setCreditRolePresets((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </section>

      <AdminFormField label="Credits Text">
        <textarea
          name="creditsText"
          rows={4}
          defaultValue={edit?.creditsText}
          maxLength={5000}
          placeholder="Optional additional credit note"
        />
      </AdminFormField>

      <section className="ad-project-builder">
        <div className="ad-project-builder-head">
          <div>
            <p className="ad-kicker">Links</p>
            <strong>Project links</strong>
          </div>
          <button
            type="button"
            className="ad-dialog-secondary"
            onClick={() => {
              if (links.length >= 20) return;
              setLinks((current) => [...current, { title: "", url: "" }]);
              setLinkTitlePresets((current) => [...current, ""]);
            }}
          >
            + Add Link
          </button>
        </div>

        {links.map((link, index) => {
          const preset = linkTitlePresets[index] ?? (LINK_TITLES.includes(link.title) ? link.title : link.title ? "Other" : "");
          return (
            <div className="ad-project-row" key={`link-${index}`}>
              <select
                value={preset}
                onChange={(event) => {
                  const value = event.target.value;
                  setLinkTitlePresets((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
                  updateLink(index, { title: value === "Other" ? "" : value });
                }}
              >
                <option value="">Link title</option>
                {LINK_TITLES.map((title) => (
                  <option key={title}>{title}</option>
                ))}
                <option>Other</option>
              </select>
              {preset === "Other" && (
                <input
                  value={link.title}
                  onChange={(event) => updateLink(index, { title: event.target.value })}
                  placeholder="Custom title"
                  maxLength={100}
                />
              )}
              <input
                type="url"
                value={link.url}
                onChange={(event) => updateLink(index, { url: event.target.value })}
                placeholder="https://..."
                maxLength={500}
              />
              <button
                type="button"
                className="ad-project-remove"
                onClick={() => {
                  setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index));
                  setLinkTitlePresets((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </section>

      <section className="ad-project-builder">
        <div className="ad-project-builder-head">
          <div>
            <p className="ad-kicker">Tags</p>
            <strong>Optional discovery tags</strong>
          </div>
        </div>
        <div className="ad-project-tag-add">
          <select value={tagPreset} onChange={(event) => setTagPreset(event.target.value)}>
            <option value="">Choose tag</option>
            {TAG_OPTIONS.map((tag) => (
              <option key={tag}>{tag}</option>
            ))}
            <option>Other</option>
          </select>
          {tagPreset === "Other" && (
            <input value={customTag} onChange={(event) => setCustomTag(event.target.value)} placeholder="Custom tag" maxLength={100} />
          )}
          <button type="button" className="ad-dialog-secondary" onClick={addTag}>
            Add
          </button>
        </div>
        {!!tags.length && (
          <div className="ad-project-tags">
            {tags.map((tag) => (
              <button type="button" key={tag} onClick={() => setTags((current) => current.filter((value) => value !== tag))}>
                {tag} ×
              </button>
            ))}
          </div>
        )}
      </section>

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
}

export function AdminProjectsView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.projectFilter);
  const setActive = useAdminDashboardStore((state) => state.setProjectFilter);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProjectView | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const params = new URLSearchParams();
  if (active !== "All") params.set("status", active);
  if (query.trim()) params.set("search", query.trim());

  const [projects, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/projects${params.toString() ? `?${params.toString()}` : ""}`,
    projectView,
    true,
    1,
    20,
  );

  async function persist(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const startDate = String(form.get("startDate") ?? "").trim();
    const endDate = String(form.get("endDate") ?? "").trim();
    const orderValue = String(form.get("order") ?? "").trim();
    const cover = form.get("cover");

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    const credits = JSON.parse(String(form.get("creditsJson") ?? "[]")) as ProjectCredit[];
    const links = JSON.parse(String(form.get("linksJson") ?? "[]")) as ProjectLink[];
    const tags = JSON.parse(String(form.get("tagsJson") ?? "[]")) as string[];

    if (credits.some((credit) => !credit.name.trim() || !credit.role.trim())) {
      toast.error("Complete both name and role for every credit, or remove the empty row.");
      return;
    }

    if (links.some((link) => !link.title.trim() || !link.url.trim())) {
      toast.error("Complete both title and URL for every project link, or remove the empty row.");
      return;
    }

    for (const link of links) {
      try {
        const parsed = new URL(link.url);
        if (parsed.protocol !== "https:") throw new Error();
      } catch {
        toast.error(`Use a valid HTTPS URL for "${link.title}".`);
        return;
      }
    }

    const slotFiles = Array.from({ length: 4 }, (_, index) => form.get(`gallery-${index}`)).filter(
      (value): value is File => value instanceof File && value.size > 0,
    );

    setUploading((cover instanceof File && cover.size > 0) || slotFiles.length > 0);
    setSaving(true);
    const newlyUploadedIds: string[] = [];
    let projectSaved = false;

    try {
      let coverMediaId: string | null | undefined;
      if (cover instanceof File && cover.size > 0) {
        const uploaded = await uploadMedia(cover, "project");
        coverMediaId = uploaded.id;
        newlyUploadedIds.push(uploaded.id);
      } else if (id && form.get("removeCover") === "on") coverMediaId = null;

      let galleryMediaIds: string[] | undefined;
      if (slotFiles.length) {
        const current = id && editing ? [...editing.galleryMediaIds].slice(0, 4) : [];

        for (let index = 0; index < 4; index++) {
          const file = form.get(`gallery-${index}`);
          if (!(file instanceof File) || file.size <= 0) continue;
          const uploaded = await uploadMedia(file, "project");
          current[index] = uploaded.id;
          newlyUploadedIds.push(uploaded.id);
        }

        galleryMediaIds = current.filter(Boolean).slice(0, 4);
      } else if (id && form.get("clearGallery") === "on") {
        galleryMediaIds = [];
      }

      const body = {
        title,
        ...(!id ? { slug: slugFor(title) } : {}),
        type: String(form.get("resolvedType") ?? "").trim() || undefined,
        summary: String(form.get("summary") ?? "").trim() || undefined,
        description: String(form.get("description") ?? "").trim() || undefined,
        body: splitLines(form.get("body")),
        creditsText: String(form.get("creditsText") ?? "").trim() || undefined,
        status: String(form.get("status") ?? "Development"),
        location: String(form.get("location") ?? "").trim() || undefined,
        startDate: startDate || null,
        endDate: endDate || null,
        ...(coverMediaId !== undefined ? { coverMediaId } : {}),
        ...(galleryMediaIds !== undefined ? { galleryMediaIds } : {}),
        credits,
        links,
        tags,
        published: form.get("published") === "on",
        order: orderValue ? Number(orderValue) : null,
      };

      await api(id ? `/admin/projects/${id}` : "/admin/projects", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });

      projectSaved = true;
      await refresh();
      setCreating(false);
      setEditing(null);
      toast.success("Project saved.");
    } catch (saveError) {
      if (!projectSaved && newlyUploadedIds.length) {
        await Promise.allSettled(newlyUploadedIds.map((mediaId) => api(`/media/${mediaId}`, { method: "DELETE" })));
      }

      const message = saveError instanceof Error ? saveError.message : "Unable to save project.";
      toast.error(message, "Project was not created. Your form is still open so you can fix the issue.");
      throw saveError;
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Production management"
        title="Projects"
        description="Create, publish and maintain project information. Only the details you provide are shown publicly."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Project</AdminPrimaryButton>}
      />

      <section className="ad-toolbar">
        <AdminFilters
          values={["All", "Development", "Pre-production", "In Production", "Completed"]}
          active={active}
          onChange={setActive}
        />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search projects" />
      </section>

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
            {project.image && <SiteMedia src={project.image} alt={project.title} kind="project" className="aspect-[16/8]" />}
            <div className="ad-project-body">
              <div className="ad-project-meta">
                <span>{project.type || "Project"}</span>
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
                  <span>Credits</span>
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
        description="Only the project title is required. Add the rest only when it is useful."
        width="wide"
      >
        <AdminDialogForm onSubmit={(event) => persist(event)}>
          <ProjectFields uploading={uploading || saving} />
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel={saving ? "Creating…" : "Create Project"} />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Manage"
        title={editing?.title ?? "Project"}
        description="Update any project field or media. Empty optional details stay hidden on the public page."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={(event) => persist(event, editing.id)}>
            <ProjectFields edit={editing} uploading={uploading || saving} />
            <AdminDialogActions onCancel={() => setEditing(null)} primaryLabel={saving ? "Saving…" : "Save Changes"} />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
