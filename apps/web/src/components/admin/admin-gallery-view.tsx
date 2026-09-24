"use client";

import { type ChangeEvent, type FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminPrimaryButton, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel, slugFor, uploadMedia } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

const CATEGORY_OPTIONS = ["Other", "Behind the Scenes", "Production", "Events", "Portraits", "Locations", "Cast & Crew"] as const;
const PRESET_TAGS = ["Featured", "Behind the Scenes", "On Set", "Production", "Events", "Portraits", "Locations", "Cast & Crew", "Other"] as const;

type GallerySource = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  coverMediaId?: string;
  coverImage?: string;
  status?: string;
  published: boolean;
  publishedAt?: string;
  order?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  coverMediaId?: string;
  image: string;
  status: string;
  published: boolean;
  publishedAt: string;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type GallerySummary = {
  total: number;
  published: number;
  featured: number;
  behindTheScenes: number;
};

function mapGallery(item: GallerySource): GalleryItem {
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    category: item.category ?? "Other",
    description: item.description ?? "",
    coverMediaId: item.coverMediaId,
    image: item.coverImage ?? "",
    status: item.status ?? (item.published ? "Published" : "Draft"),
    published: item.published,
    publishedAt: item.publishedAt?.slice(0, 10) ?? "",
    order: item.order ?? 0,
    tags: item.tags ?? [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function titleFromFile(name: string) {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Gallery Image";
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 160);
}

function normalizedTags(category: string, tags: string[]) {
  const values = [...tags];
  if (category && category !== "Other" && !values.some((tag) => tag.toLowerCase() === category.toLowerCase())) values.push(category);
  if (!values.length) values.push("Other");

  return values
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.findIndex((value) => value.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 20);
}

function LocalPreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return <div className="ad-gallery-local-preview-v1" style={url ? { backgroundImage: `url("${url}")` } : undefined} />;
}

function TagPicker({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [custom, setCustom] = useState("");

  function toggle(tag: string) {
    if (tags.some((value) => value.toLowerCase() === tag.toLowerCase())) {
      onChange(tags.filter((value) => value.toLowerCase() !== tag.toLowerCase()));
    } else {
      onChange([...tags, tag].slice(0, 20));
    }
  }

  function addCustom() {
    const value = custom.trim().slice(0, 100);
    if (!value) return;
    if (!tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) onChange([...tags, value].slice(0, 20));
    setCustom("");
  }

  return (
    <div className="ad-gallery-tags-v1">
      <div className="ad-gallery-tag-options-v1">
        {PRESET_TAGS.map((tag) => {
          const active = tags.some((value) => value.toLowerCase() === tag.toLowerCase());
          return (
            <button type="button" key={tag} className={active ? "active" : ""} onClick={() => toggle(tag)}>
              {active ? "✓ " : "+ "}
              {tag}
            </button>
          );
        })}
      </div>

      <div className="ad-gallery-custom-tag-v1">
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          maxLength={100}
          placeholder="Custom tag"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" onClick={addCustom}>Add Tag</button>
      </div>

      {!!tags.length && (
        <div className="ad-gallery-selected-tags-v1">
          {tags.map((tag) => (
            <button type="button" key={tag} onClick={() => toggle(tag)} title="Remove tag">
              {tag} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryUploadDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState("Draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (open) return;
    setFiles([]);
    setCategory("Other");
    setTags([]);
    setStatus("Draft");
    setScheduledAt("");
    setSaving(false);
    setProgress("");
  }, [open]);

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.currentTarget.files ?? []).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    const merged = [...files, ...incoming].filter(
      (file, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified === file.lastModified,
        ) === index,
    );

    if (merged.length > 8) toast.error("Choose up to 8 images in one upload batch.");
    setFiles(merged.slice(0, 8));
    event.currentTarget.value = "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length || saving) {
      if (!files.length) toast.error("Choose at least one image.");
      return;
    }

    if (status === "Scheduled" && !scheduledAt) {
      toast.error("Choose a future publish date for scheduled images.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const baseOrder = Number(form.get("order") ?? 0) || 0;
    const description = String(form.get("description") ?? "").trim();
    const appliedTags = normalizedTags(category, tags);
    const failed: File[] = [];
    let completed = 0;

    setSaving(true);

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setProgress(`Processing ${index + 1} of ${files.length}: ${file.name}`);

      try {
        const uploaded = await uploadMedia(file, "gallery");
        const title = titleFromFile(file.name);

        try {
          await api("/admin/content/gallery", {
            method: "POST",
            body: JSON.stringify({
              title,
              slug: slugFor(title),
              category,
              description,
              coverMediaId: uploaded.id,
              status,
              published: status === "Published" || status === "Scheduled",
              ...(status === "Scheduled" ? { publishedAt: scheduledAt } : {}),
              order: baseOrder + index,
              tags: appliedTags,
            }),
          });
          completed += 1;
        } catch (createError) {
          if (!uploaded.duplicate) await api(`/media/${uploaded.id}`, { method: "DELETE" }).catch(() => undefined);
          throw createError;
        }
      } catch (uploadError) {
        failed.push(file);
        toast.error(
          `Could not save ${file.name}.`,
          uploadError instanceof Error ? uploadError.message : "Upload failed.",
        );
      }
    }

    setSaving(false);
    setProgress("");
    setFiles(failed);

    if (completed) await onSaved();

    if (!failed.length) {
      toast.success(
        `${completed} gallery image${completed === 1 ? "" : "s"} saved.`,
        "Images were cropped to square WebP variants automatically.",
      );
      onClose();
    } else if (completed) {
      toast.success(`${completed} image${completed === 1 ? "" : "s"} saved.`, `${failed.length} image(s) remain to retry.`);
    }
  }

  return (
    <AdminDialog
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      eyebrow="Gallery upload"
      title="Add Gallery Images"
      description="Choose one image or a batch of up to 8. New gallery uploads are automatically processed into square WebP variants."
      width="wide"
    >
      <AdminDialogForm onSubmit={submit}>
        <section className="ad-gallery-drop-v1">
          <div>
            <p className="ad-kicker">Images</p>
            <h3>{files.length ? `${files.length} of 8 selected` : "Select up to 8 photographs"}</h3>
            <span>JPEG, PNG or WebP · maximum 10 MB each · square crop is generated by the backend</span>
          </div>

          <label>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={chooseFiles} disabled={saving} />
            <span>{files.length ? "Add More Images" : "Choose Images"}</span>
          </label>
        </section>

        {!!files.length && (
          <div className="ad-gallery-upload-grid-v1">
            {files.map((file) => (
              <article key={`${file.name}-${file.size}-${file.lastModified}`}>
                <LocalPreview file={file} />
                <div>
                  <strong>{titleFromFile(file.name)}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}

        <AdminDialogGrid>
          <AdminFormField label="Category">
            <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving}>
              {CATEGORY_OPTIONS.map((value) => <option key={value}>{value}</option>)}
            </select>
          </AdminFormField>

          <AdminFormField label="Publishing">
            <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
              <option>Draft</option>
              <option>Published</option>
              <option>Scheduled</option>
            </select>
          </AdminFormField>

          {status === "Scheduled" && (
            <AdminFormField label="Publish Date">
              <input type="date" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} disabled={saving} />
            </AdminFormField>
          )}

          <AdminFormField label="Starting Display Order">
            <input name="order" type="number" min="0" max="10000" defaultValue="0" disabled={saving} />
          </AdminFormField>

          <AdminFormField label="Common Caption / Note" wide>
            <textarea name="description" rows={3} maxLength={1500} placeholder="Optional note applied to all images in this batch" disabled={saving} />
          </AdminFormField>

          <AdminFormField label="Tags" wide>
            <TagPicker tags={tags} onChange={setTags} />
          </AdminFormField>
        </AdminDialogGrid>

        {saving && (
          <div className="ad-gallery-processing-v1">
            <i />
            <div><strong>Preparing gallery images</strong><span>{progress}</span></div>
          </div>
        )}

        <p className="ad-dialog-footnote">
          The filename becomes the initial image title automatically. You can edit title, category, tags and publishing details later.
        </p>

        <AdminDialogActions
          onCancel={onClose}
          primaryLabel={saving ? "Processing…" : files.length > 1 ? `Upload ${files.length} Images` : "Upload Image"}
        />
      </AdminDialogForm>
    </AdminDialog>
  );
}

function GalleryEditDialog({
  item,
  onClose,
  onSaved,
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState("Draft");

  useEffect(() => {
    if (!item) return;
    setCategory(item.category || "Other");
    setTags(item.tags);
    setStatus(item.status);
  }, [item]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const publishedAt = String(form.get("publishedAt") ?? "").trim();
    const replacement = form.get("image");
    let uploadedId: string | undefined;
    let uploadedDuplicate = false;

    if (status === "Scheduled" && !publishedAt) {
      toast.error("Choose a future publish date for scheduled content.");
      return;
    }

    try {
      if (replacement instanceof File && replacement.size > 0) {
        const uploaded = await uploadMedia(replacement, "gallery");
        uploadedId = uploaded.id;
        uploadedDuplicate = !!uploaded.duplicate;
      }

      await api(`/admin/content/gallery/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          category,
          description: String(form.get("description") ?? "").trim(),
          status,
          published: status === "Published" || status === "Scheduled",
          publishedAt: status === "Scheduled" ? publishedAt : null,
          order: Number(form.get("order") ?? 0) || 0,
          tags: normalizedTags(category, tags),
          ...(uploadedId ? { coverMediaId: uploadedId } : {}),
        }),
      });

      await onSaved();
      toast.success("Gallery image updated.");
      onClose();
    } catch (saveError) {
      if (uploadedId && !uploadedDuplicate) await api(`/media/${uploadedId}`, { method: "DELETE" }).catch(() => undefined);
      toast.error(saveError instanceof Error ? saveError.message : "Unable to update gallery image.");
    }
  }

  return (
    <AdminDialog
      open={!!item}
      onClose={onClose}
      eyebrow="Edit gallery image"
      title={item?.title ?? "Gallery Image"}
      description="Update the admin metadata or replace the image. A replacement is square-cropped automatically."
      width="wide"
    >
      {item && (
        <AdminDialogForm onSubmit={submit}>
          <section className="ad-gallery-edit-hero-v1">
            <SiteMedia src={item.image} alt={item.title} kind="gallery" className="aspect-square rounded-2xl" />
            <div>
              <p className="ad-kicker">Current image</p>
              <h3>{item.title}</h3>
              <span>{item.category} · {dateLabel(item.createdAt)}</span>
              <div>{item.tags.slice(0, 5).map((tag) => <small key={tag}>{tag}</small>)}</div>
            </div>
          </section>

          <AdminDialogGrid>
            <AdminFormField label="Title" wide>
              <input name="title" defaultValue={item.title} required maxLength={160} />
            </AdminFormField>

            <AdminFormField label="Category">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORY_OPTIONS.map((value) => <option key={value}>{value}</option>)}
              </select>
            </AdminFormField>

            <AdminFormField label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>Draft</option>
                <option>Published</option>
                <option>Scheduled</option>
              </select>
            </AdminFormField>

            {status === "Scheduled" && (
              <AdminFormField label="Publish Date">
                <input name="publishedAt" type="date" defaultValue={item.publishedAt} />
              </AdminFormField>
            )}

            <AdminFormField label="Display Order">
              <input name="order" type="number" min="0" max="10000" defaultValue={item.order} />
            </AdminFormField>

            <AdminFormField label="Caption / Note" wide>
              <textarea name="description" rows={3} defaultValue={item.description} maxLength={1500} />
            </AdminFormField>

            <AdminFormField label="Tags" wide>
              <TagPicker tags={tags} onChange={setTags} />
            </AdminFormField>

            <AdminFormField label="Replace Image" wide>
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            </AdminFormField>
          </AdminDialogGrid>

          <AdminDialogActions onCancel={onClose} primaryLabel="Save Changes" />
        </AdminDialogForm>
      )}
    </AdminDialog>
  );
}

export function AdminGalleryView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (deferredQuery) params.set("search", deferredQuery);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    params.set("sort", sort);
    return `/admin/content/gallery?${params.toString()}`;
  }, [status, deferredQuery, category, tag, sort]);

  const [items, , refresh, meta, setPage, , loading, error] = useAdminRecords<GallerySource, GalleryItem>(
    path,
    mapGallery,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<GallerySummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<GalleryItem | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<GallerySummary>("/admin/content/gallery/summary"));
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  async function changed() {
    await Promise.allSettled([refresh(), loadSummary()]);
  }

  async function archive() {
    if (!archiveTarget || archiving) return;
    setArchiving(true);

    try {
      await api(`/admin/content/gallery/${archiveTarget.id}`, { method: "DELETE" });
      setArchiveTarget(null);
      await changed();
      toast.success("Gallery image archived.");
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : "Unable to archive gallery image.");
    } finally {
      setArchiving(false);
    }
  }

  const noResults = !loading && !error && !items.length;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Media CMS"
        title="Gallery"
        description="Upload square gallery photographs, organise them with categories and tags, and control gallery publishing from one place."
        action={<AdminPrimaryButton onClick={() => setUploading(true)}>Upload Images</AdminPrimaryButton>}
      />

      <section className="ad-gallery-overview-v1">
        <div><span>Total images</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Published</span><strong>{summary?.published ?? "—"}</strong></div>
        <div><span>Featured</span><strong>{summary?.featured ?? "—"}</strong></div>
        <div><span>Behind the scenes</span><strong>{summary?.behindTheScenes ?? "—"}</strong></div>
      </section>

      <section className="ad-gallery-how-v1">
        <div><b>1</b><span><strong>Upload 1–8 images</strong>Select a single photograph or one batch from your computer.</span></div>
        <div><b>2</b><span><strong>Automatic square processing</strong>The backend creates compressed square WebP variants using attention-aware cropping.</span></div>
        <div><b>3</b><span><strong>Organise</strong>Use Featured, Behind the Scenes, Other or custom tags, then search/filter anytime.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "Published", "Draft", "Scheduled"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search title, caption, category or tag" />
      </section>

      <section className="ad-gallery-filters-v1">
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Tag</span>
          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="">All tags</option>
            {PRESET_TAGS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
            <option value="order">Display order</option>
          </select>
        </label>

        {(category || tag || sort !== "newest" || query || status !== "All") && (
          <button
            type="button"
            onClick={() => {
              setStatus("All");
              setQuery("");
              setCategory("");
              setTag("");
              setSort("newest");
            }}
          >
            Clear Filters
          </button>
        )}
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-gallery-empty-v1">
          <div>▧</div>
          <p className="ad-kicker">{query || category || tag || status !== "All" ? "No results" : "Gallery is empty"}</p>
          <h2>{query || category || tag || status !== "All" ? "No images match these filters." : "Upload your first gallery images."}</h2>
          <p>
            {query || category || tag || status !== "All"
              ? "Clear filters or try a different search."
              : "You can select one image or up to eight at once. Titles are generated from filenames and can be edited later."}
          </p>
          <button type="button" className="ad-dialog-primary" onClick={() => setUploading(true)}>Upload Images</button>
        </section>
      )}

      {!!items.length && (
        <section className="ad-gallery-grid-v1">
          {items.map((item) => (
            <article className="ad-gallery-card-v1" key={item.id}>
              <div className="ad-gallery-image-v1">
                <SiteMedia src={item.image} alt={item.title} kind="gallery" className="aspect-square" />
                <div className="ad-gallery-card-badge-v1"><AdminStatus value={item.status} /></div>
              </div>

              <div className="ad-gallery-card-body-v1">
                <div className="ad-gallery-card-title-v1">
                  <div>
                    <span>{item.category || "Other"}</span>
                    <h2>{item.title}</h2>
                  </div>
                  <small>#{item.order}</small>
                </div>

                {!!item.tags.length && (
                  <div className="ad-gallery-card-tags-v1">
                    {item.tags.slice(0, 3).map((value) => <span key={value}>{value}</span>)}
                    {item.tags.length > 3 && <span>+{item.tags.length - 3}</span>}
                  </div>
                )}

                <div className="ad-gallery-card-footer-v1">
                  <span>{dateLabel(item.createdAt)}</span>
                  <div>
                    <button type="button" onClick={() => setEditing(item)}>Edit</button>
                    <button type="button" onClick={() => setArchiveTarget(item)}>Archive</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <GalleryUploadDialog open={uploading} onClose={() => setUploading(false)} onSaved={changed} />
      <GalleryEditDialog item={editing} onClose={() => setEditing(null)} onSaved={changed} />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this gallery image?"
        description={archiveTarget ? `"${archiveTarget.title}" will be removed from active gallery records. The member-facing gallery is not changed by this admin-only work.` : undefined}
        confirmLabel="Archive Image"
        destructive
        loading={archiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => void archive()}
      />
    </div>
  );
}
