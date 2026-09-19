"use client";

import { type FormEvent, useState } from "react";

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
import { api } from "@/services/api";
import { dateLabel, slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

type Kind = "blog" | "gallery" | "bts" | "shows" | "team" | "work";
type Source = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  body?: string[];
  coverMediaId?: string;
  coverImage?: string;
  mediaIds?: string[];
  media?: string[];
  status?: string;
  published: boolean;
  publishedAt?: string;
  role?: string;
  videoUrl?: string;
  order?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  projectId?: string;
  data?: Record<string, string>;
};
type Item = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  body: string[];
  coverMediaId?: string;
  image: string;
  mediaIds: string[];
  media: string[];
  status: string;
  published: boolean;
  publishedAt: string;
  role: string;
  videoUrl: string;
  order: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  projectId?: string;
  author: string;
  platform: string;
  group: string;
};

const cfg = {
  work: {
    eyebrow: "Production services",
    title: "Our Work",
    description: "Manage production-work categories and service content.",
    action: "Add Work Item",
  },
  blog: {
    eyebrow: "Editorial CMS",
    title: "Blog & News",
    description: "Draft, schedule, publish and manage editorial content.",
    action: "New Post",
  },
  gallery: {
    eyebrow: "Media CMS",
    title: "Gallery",
    description: "Curate gallery entries and supporting media.",
    action: "Add Gallery Item",
  },
  bts: {
    eyebrow: "Media CMS",
    title: "Behind the Scenes",
    description: "Manage production-process media and on-set stories.",
    action: "Add BTS Item",
  },
  shows: {
    eyebrow: "External media",
    title: "Shows & Media",
    description: "Manage external media links and publishing schedules.",
    action: "Add Media Link",
  },
  team: {
    eyebrow: "People CMS",
    title: "Team",
    description: "Control public team profiles and presentation order.",
    action: "Add Team Member",
  },
} as const;

const kindPath = (kind: Kind) => (kind === "bts" ? "behind-the-scenes" : kind === "work" ? "our-work" : kind);
const mapItem = (x: Source): Item => ({
  id: x._id,
  title: x.title,
  slug: x.slug,
  category: x.category ?? "",
  description: x.description ?? "",
  body: x.body ?? [],
  coverMediaId: x.coverMediaId,
  image: x.coverImage ?? "",
  mediaIds: x.mediaIds ?? [],
  media: x.media ?? [],
  status: x.status ?? (x.published ? "Published" : "Draft"),
  published: x.published,
  publishedAt: x.publishedAt?.slice(0, 10) ?? "",
  role: x.role ?? "",
  videoUrl: x.videoUrl ?? "",
  order: x.order ?? 0,
  tags: x.tags ?? [],
  seoTitle: x.seoTitle ?? "",
  seoDescription: x.seoDescription ?? "",
  projectId: x.projectId,
  author: x.data?.author ?? "",
  platform: x.data?.platform ?? "",
  group: x.data?.group ?? "",
});
const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
const csv = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function AdminContentView({ kind }: { kind: Kind }) {
  const toast = useToast();
  const active = useAdminDashboardStore((s) => s.contentFilter);
  const setActive = useAdminDashboardStore((s) => s.setContentFilter);
  const config = cfg[kind];
  const basePath = `/admin/content/${kindPath(kind)}`;
  const statuses = ["All", "Published", "Scheduled", "Draft"];
  const [query, setQuery] = useState("");
  const params = new URLSearchParams();
  if (active !== "All") params.set("status", active);
  if (query.trim()) params.set("search", query.trim());
  const path = `${basePath}${params.toString() ? `?${params}` : ""}`;
  const [items, , refresh, meta, setPage, , loading, error] = useAdminRecords<Source, Item>(path, mapItem, true, 1, 20);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const mediaPurpose =
    kind === "blog"
      ? "blog"
      : kind === "gallery"
        ? "gallery"
        : kind === "bts"
          ? "bts"
          : kind === "shows"
            ? "show"
            : kind === "team"
              ? "team"
              : "website-image";

  async function persist(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const status = String(form.get("status") ?? "Draft");
    const publishedAt = String(form.get("publishedAt") ?? "").trim();
    const url = String(form.get("videoUrl") ?? "").trim();
    const cover = form.get("cover");
    const extraFiles = form.getAll("media").filter((value): value is File => value instanceof File && value.size > 0);
    let coverMediaId: string | null | undefined;
    if (cover instanceof File && cover.size > 0) coverMediaId = (await uploadMedia(cover, mediaPurpose)).id;
    else if (id && form.get("removeCover") === "on") coverMediaId = null;
    let mediaIds: string[] | undefined;
    if (extraFiles.length) {
      mediaIds = [];
      for (const file of extraFiles) mediaIds.push((await uploadMedia(file, mediaPurpose)).id);
    } else if (id && form.get("clearMedia") === "on") mediaIds = [];

    const body = {
      title,
      ...(!id ? { slug: slugFor(title) } : {}),
      category: String(form.get("category") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      body: lines(form.get("body")),
      ...(coverMediaId !== undefined ? { coverMediaId } : {}),
      ...(mediaIds !== undefined ? { mediaIds } : {}),
      status,
      published: status === "Published" || status === "Scheduled",
      publishedAt: publishedAt || null,
      role: String(form.get("role") ?? "").trim(),
      videoUrl: url || null,
      order: Number(form.get("order") ?? 0) || 0,
      tags: csv(form.get("tags")),
      seoTitle: String(form.get("seoTitle") ?? "").trim(),
      seoDescription: String(form.get("seoDescription") ?? "").trim(),
      data: {
        author: String(form.get("author") ?? "").trim(),
        platform: String(form.get("platform") ?? "").trim(),
        group: String(form.get("group") ?? "").trim(),
      },
    };
    try {
      await api(id ? `${basePath}/${id}` : basePath, { method: id ? "PATCH" : "POST", body: JSON.stringify(body) });
      await refresh();
      setCreating(false);
      setEditing(null);
      toast.success("Content saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save content.");
      throw saveError;
    }
  }

  const Fields = ({ edit }: { edit?: Item }) => (
    <>
      <AdminDialogGrid>
        <AdminFormField label={kind === "team" ? "Full Name" : "Title"} wide>
          <input name="title" defaultValue={edit?.title} required maxLength={160} />
        </AdminFormField>
        <AdminFormField label="Category">
          <input name="category" defaultValue={edit?.category} maxLength={100} />
        </AdminFormField>
        <AdminFormField label="Role">
          <input name="role" defaultValue={edit?.role} maxLength={160} />
        </AdminFormField>
        <AdminFormField label="Status">
          <select name="status" defaultValue={edit?.status ?? "Draft"}>
            <option>Draft</option>
            <option>Published</option>
            <option>Scheduled</option>
          </select>
        </AdminFormField>
        <AdminFormField label="Publish Date">
          <input name="publishedAt" type="date" defaultValue={edit?.publishedAt} />
        </AdminFormField>
        <AdminFormField label="Display Order">
          <input name="order" type="number" min="0" max="10000" defaultValue={edit?.order ?? 0} />
        </AdminFormField>
        <AdminFormField label="Author">
          <input name="author" defaultValue={edit?.author} />
        </AdminFormField>
        <AdminFormField label="Platform">
          <input name="platform" defaultValue={edit?.platform} />
        </AdminFormField>
        <AdminFormField label="Group">
          <input name="group" defaultValue={edit?.group} />
        </AdminFormField>
        <AdminFormField label="External / Video URL" wide>
          <input name="videoUrl" type="url" defaultValue={edit?.videoUrl} placeholder="https://..." />
        </AdminFormField>
        <AdminFormField label="Summary / Description" wide>
          <textarea name="description" rows={4} defaultValue={edit?.description} maxLength={1500} />
        </AdminFormField>
        <AdminFormField label="Body Sections" wide>
          <textarea name="body" rows={8} defaultValue={edit?.body.join("\n")} placeholder="One section per line" />
        </AdminFormField>
        <AdminFormField label="Tags" wide>
          <input name="tags" defaultValue={edit?.tags.join(", ")} placeholder="film, casting, news" />
        </AdminFormField>
        <AdminFormField label="SEO Title" wide>
          <input name="seoTitle" defaultValue={edit?.seoTitle} maxLength={160} />
        </AdminFormField>
        <AdminFormField label="SEO Description" wide>
          <textarea name="seoDescription" rows={3} defaultValue={edit?.seoDescription} maxLength={300} />
        </AdminFormField>
        {kind !== "shows" && (
          <AdminFormField label={edit ? "Replace Cover" : "Cover Image"} wide>
            <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
          </AdminFormField>
        )}
        {(kind === "gallery" || kind === "bts") && (
          <AdminFormField label={edit ? "Replace Supporting Media" : "Supporting Media"} wide>
            <input name="media" type="file" multiple accept="image/jpeg,image/png,image/webp" />
          </AdminFormField>
        )}
      </AdminDialogGrid>
      {edit && kind !== "shows" && (
        <label className="ad-dialog-check">
          <input name="removeCover" type="checkbox" />
          <span>Remove current cover image</span>
        </label>
      )}
      {edit && (kind === "gallery" || kind === "bts") && (
        <label className="ad-dialog-check">
          <input name="clearMedia" type="checkbox" />
          <span>Clear current supporting media</span>
        </label>
      )}
    </>
  );

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>{config.action}</AdminPrimaryButton>}
      />
      <section className="ad-toolbar">
        <AdminFilters values={statuses} active={active} onChange={setActive} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search content" />
      </section>
      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!items.length}
        emptyText="No content matches this filter."
        onRetry={() => void refresh()}
      />

      <section className="ad-content-grid">
        {items.map((item) => (
          <article className="ad-content-card" key={item.id}>
            {kind !== "shows" && (
              <SiteMedia
                src={item.image}
                alt={item.title}
                kind={kind === "team" ? "team" : "gallery"}
                className={kind === "team" ? "aspect-[4/4.5]" : "aspect-[4/3]"}
              />
            )}
            <div>
              <div className="ad-content-meta">
                <span>{item.category || item.platform || item.group}</span>
                <AdminStatus value={item.status} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.role || (item.publishedAt && dateLabel(item.publishedAt)) || item.description}</p>
              <div className="ad-content-actions">
                <button onClick={() => setEditing(item)}>Edit</button>
                <AdminMoreButton
                  onEdit={() => setEditing(item)}
                  onArchive={async () => {
                    await api(`${basePath}/${item.id}`, { method: "DELETE" });
                    await refresh();
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </section>
      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow={config.eyebrow}
        title={config.action}
        description="Create and configure this CMS entry."
        width="wide"
      >
        <AdminDialogForm onSubmit={(event) => persist(event)}>
          <Fields />
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel={config.action} />
        </AdminDialogForm>
      </AdminDialog>
      <AdminDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Edit content"
        title={editing?.title ?? config.title}
        description="Update content, media, publishing and SEO fields."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={(event) => persist(event, editing.id)}>
            <Fields edit={editing} />
            {!!editing.media.length && (
              <div>
                <p className="ad-kicker">Current supporting media</p>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {editing.media.map((src, index) => (
                    <SiteMedia
                      key={src}
                      src={src}
                      alt={`${editing.title} media ${index + 1}`}
                      kind="gallery"
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
