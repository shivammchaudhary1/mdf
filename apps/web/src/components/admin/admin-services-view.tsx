"use client";

import { type FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminPrimaryButton, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel, slugFor, uploadMedia } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

const SERVICE_CATEGORIES = ["Production", "Commercial", "Music", "Corporate", "Creative", "Post-Production", "Other"] as const;

type ServiceSource = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  body?: string[];
  coverMediaId?: string;
  coverImage?: string;
  status?: string;
  published?: boolean;
  publishedAt?: string;
  order?: number;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  highlights: string[];
  coverMediaId?: string;
  image: string;
  legacyImage: string;
  imageAlt: string;
  status: string;
  publishedAt: string;
  order: number;
  modalEyebrow: string;
  modalTitle: string;
  overview: string;
  idealFor: string;
  contactSubject: string;
  contactMessage: string;
  createdAt: string;
  updatedAt: string;
};

type ServiceSummary = {
  total: number;
  published: number;
  drafts: number;
  categories: number;
};

function mapService(item: ServiceSource): ServiceItem {
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    category: item.category ?? "Other",
    description: item.description ?? "",
    highlights: item.body ?? [],
    coverMediaId: item.coverMediaId,
    image: item.coverImage ?? item.data?.image ?? "",
    legacyImage: item.data?.image ?? "",
    imageAlt: item.data?.imageAlt ?? item.title,
    status: item.status ?? (item.published ? "Published" : "Draft"),
    publishedAt: item.publishedAt ?? "",
    order: item.order ?? 0,
    modalEyebrow: item.data?.modalEyebrow ?? item.category ?? "Service",
    modalTitle: item.data?.modalTitle ?? item.title,
    overview: item.data?.overview ?? "",
    idealFor: item.data?.idealFor ?? "",
    contactSubject: item.data?.contactSubject ?? "Production",
    contactMessage: item.data?.contactMessage ?? "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function ServiceEditorDialog({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item?: ServiceItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const editing = !!item;
  const [status, setStatus] = useState("Draft");
  const [category, setCategory] = useState("Production");
  const [scheduledAt, setScheduledAt] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setStatus(item?.status ?? "Draft");
    setCategory(item?.category ?? "Production");
    setScheduledAt(item?.status === "Scheduled" ? localDateTime(item.publishedAt) : "");
    setCover(null);
    setRemoveCover(false);
    setSaving(false);
  }, [open, item]);

  useEffect(() => {
    if (!cover) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(cover);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const highlights = lines(form.get("highlights"));
    const overview = String(form.get("overview") ?? "").trim();
    const idealFor = String(form.get("idealFor") ?? "").trim();
    const contactSubject = String(form.get("contactSubject") ?? "").trim();
    const contactMessage = String(form.get("contactMessage") ?? "").trim();

    if (!title || !description || !overview || !highlights.length || !idealFor) {
      toast.error("Title, card description, overview, highlights and Best Suited For are required.");
      return;
    }

    if (!editing && !cover) {
      toast.error("Choose a service cover image.");
      return;
    }

    if (status === "Scheduled" && !scheduledAt) {
      toast.error("Choose a future publish date and time.");
      return;
    }

    setSaving(true);
    let uploadedId: string | undefined;
    let uploadedDuplicate = false;

    try {
      if (cover) {
        const uploaded = await uploadMedia(cover, "website-image");
        uploadedId = uploaded.id;
        uploadedDuplicate = !!uploaded.duplicate;
      }

      const payload = {
        title,
        ...(!editing ? { slug: slugFor(title) } : {}),
        category,
        description,
        body: highlights,
        status,
        published: status === "Published" || status === "Scheduled",
        ...(status === "Scheduled"
          ? { publishedAt: new Date(scheduledAt).toISOString() }
          : status === "Draft"
            ? { publishedAt: null }
            : {}),
        order: Number(form.get("order") ?? 0) || 0,
        ...(uploadedId ? { coverMediaId: uploadedId } : removeCover ? { coverMediaId: null } : {}),
        data: {
          modalEyebrow: String(form.get("modalEyebrow") ?? "").trim() || category,
          modalTitle: String(form.get("modalTitle") ?? "").trim() || title,
          overview,
          idealFor,
          contactSubject: contactSubject || "Production",
          contactMessage,
          image: uploadedId || removeCover ? "" : item?.legacyImage ?? "",
          imageAlt: String(form.get("imageAlt") ?? "").trim() || title,
        },
      };

      await api(editing ? `/admin/content/services/${item.id}` : "/admin/content/services", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      await onSaved();
      toast.success(editing ? "Service updated." : "Service created.");
      onClose();
    } catch (saveError) {
      if (uploadedId && !uploadedDuplicate) await api(`/media/${uploadedId}`, { method: "DELETE" }).catch(() => undefined);
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      eyebrow={editing ? "Edit service" : "New service"}
      title={editing ? item.title : "Create Service"}
      description="Fields power the public Services page and Know More modal."
      width="wide"
    >
      <AdminDialogForm onSubmit={submit}>
        <div className="ad-service-editor-v1">
          <div className="ad-service-editor-main-v1">
            <section className="ad-service-form-section-v1">
              <p className="ad-kicker">Service Card</p>
              <AdminDialogGrid>
                <AdminFormField label="Service Title" wide>
                  <input name="title" defaultValue={item?.title ?? ""} required maxLength={160} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Category">
                  <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving}>
                    {SERVICE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </AdminFormField>

                <AdminFormField label="Display Order">
                  <input name="order" type="number" min="0" max="10000" defaultValue={item?.order ?? 0} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Card Description" wide>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={item?.description ?? ""}
                    required
                    maxLength={1500}
                    disabled={saving}
                    placeholder="Short description shown on the service card"
                  />
                </AdminFormField>
              </AdminDialogGrid>
            </section>

            <section className="ad-service-form-section-v1">
              <p className="ad-kicker">Know More Modal</p>
              <AdminDialogGrid>
                <AdminFormField label="Modal Eyebrow">
                  <input name="modalEyebrow" defaultValue={item?.modalEyebrow ?? ""} maxLength={100} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Modal Title">
                  <input name="modalTitle" defaultValue={item?.modalTitle ?? ""} maxLength={160} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Overview" wide>
                  <textarea name="overview" rows={5} defaultValue={item?.overview ?? ""} required maxLength={3000} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="What We Can Support" wide>
                  <textarea
                    name="highlights"
                    rows={6}
                    defaultValue={item?.highlights.join("\n") ?? ""}
                    required
                    maxLength={5000}
                    disabled={saving}
                    placeholder={"One point per line\nConcept and planning\nCrew and shoot coordination\nPost-production support"}
                  />
                </AdminFormField>

                <AdminFormField label="Best Suited For" wide>
                  <textarea name="idealFor" rows={3} defaultValue={item?.idealFor ?? ""} required maxLength={2000} disabled={saving} />
                </AdminFormField>
              </AdminDialogGrid>
            </section>

            <section className="ad-service-form-section-v1">
              <p className="ad-kicker">Contact Prefill</p>
              <AdminDialogGrid>
                <AdminFormField label="Contact Subject">
                  <input name="contactSubject" defaultValue={item?.contactSubject ?? "Production"} maxLength={160} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Contact Message" wide>
                  <textarea
                    name="contactMessage"
                    rows={5}
                    defaultValue={item?.contactMessage ?? ""}
                    maxLength={5000}
                    disabled={saving}
                    placeholder="Message prefilled when a visitor starts an enquiry for this service"
                  />
                </AdminFormField>
              </AdminDialogGrid>
            </section>
          </div>

          <aside className="ad-service-editor-side-v1">
            <section className="ad-service-form-section-v1">
              <p className="ad-kicker">Publishing</p>
              <AdminFormField label="Status" wide>
                <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Scheduled</option>
                </select>
              </AdminFormField>

              {status === "Scheduled" && (
                <AdminFormField label="Publish Date & Time" wide>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    disabled={saving}
                  />
                </AdminFormField>
              )}
            </section>

            <section className="ad-service-form-section-v1">
              <p className="ad-kicker">Service Image</p>
              {previewUrl || item?.image ? (
                previewUrl ? (
                  <div className="ad-cms-local-preview-v1 service" style={{ backgroundImage: `url("${previewUrl}")` }} />
                ) : (
                  <SiteMedia src={item?.image} alt={item?.imageAlt || item?.title || "Service"} kind="project" className="aspect-[16/9] rounded-xl" />
                )
              ) : (
                <div className="ad-cms-image-empty-v1">No service image</div>
              )}

              <label className="ad-cms-file-button-v1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving}
                  onChange={(event) => {
                    setCover(event.currentTarget.files?.[0] ?? null);
                    setRemoveCover(false);
                  }}
                />
                <span>{cover ? "Change Selected Image" : item?.image ? "Replace Image" : "Choose Image"}</span>
              </label>

              <AdminFormField label="Image Alt Text" wide>
                <input name="imageAlt" defaultValue={item?.imageAlt ?? ""} maxLength={200} disabled={saving} />
              </AdminFormField>

              {editing && item?.image && (
                <label className="ad-dialog-check">
                  <input
                    type="checkbox"
                    checked={removeCover}
                    onChange={(event) => {
                      setRemoveCover(event.target.checked);
                      if (event.target.checked) setCover(null);
                    }}
                  />
                  <span>Remove current service image</span>
                </label>
              )}
            </section>
          </aside>
        </div>

        <AdminDialogActions onCancel={onClose} primaryLabel={saving ? "Saving Service…" : editing ? "Save Changes" : "Create Service"} />
      </AdminDialogForm>
    </AdminDialog>
  );
}

export function AdminServicesView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("order");

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (deferredQuery) params.set("search", deferredQuery);
    if (category) params.set("category", category);
    params.set("sort", sort);
    return `/admin/content/services?${params.toString()}`;
  }, [status, deferredQuery, category, sort]);

  const [items, , refresh, meta, setPage, , loading, error] = useAdminRecords<ServiceSource, ServiceItem>(
    path,
    mapService,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<ServiceSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ServiceItem | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<ServiceSummary>("/admin/content/services/summary"));
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

  async function openEditor(id: string) {
    setDetailLoading(true);
    try {
      setEditing(mapService(await api<ServiceSource>(`/admin/content/services/${id}`)));
    } catch (detailError) {
      toast.error(detailError instanceof Error ? detailError.message : "Unable to load service.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function archive() {
    if (!archiveTarget || archiving) return;
    setArchiving(true);
    try {
      await api(`/admin/content/services/${archiveTarget.id}`, { method: "DELETE" });
      setArchiveTarget(null);
      await changed();
      toast.success("Service archived.");
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : "Unable to archive service.");
    } finally {
      setArchiving(false);
    }
  }

  const noResults = !loading && !error && items.length === 0;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Website CMS"
        title="Services"
        description="Manage service cards and detailed Know More content shown on the public Services page."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Service</AdminPrimaryButton>}
      />

      <section className="ad-services-overview-v1">
        <div><span>Total services</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Published</span><strong>{summary?.published ?? "—"}</strong></div>
        <div><span>Drafts</span><strong>{summary?.drafts ?? "—"}</strong></div>
        <div><span>Categories</span><strong>{summary?.categories ?? "—"}</strong></div>
      </section>

      <section className="ad-cms-how-v1">
        <div><b>1</b><span><strong>Card content</strong>Maintain the title, category, summary and image.</span></div>
        <div><b>2</b><span><strong>Detailed service</strong>Configure overview, support points and ideal project types.</span></div>
        <div><b>3</b><span><strong>Enquiry handoff</strong>Prepare the subject and message used when visitors contact the team.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "Published", "Draft", "Scheduled"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search title, category, description or service details" />
      </section>

      <section className="ad-cms-filterbar-v1">
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="order">Display order</option>
            <option value="newest">Newest</option>
            <option value="updated">Recently updated</option>
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
          </select>
        </label>

        {(category || query || status !== "All" || sort !== "order") && (
          <button type="button" onClick={() => {
            setCategory("");
            setQuery("");
            setStatus("All");
            setSort("order");
          }}>
            Clear Filters
          </button>
        )}
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-cms-empty-v1">
          <div>◫</div>
          <p className="ad-kicker">{query || category || status !== "All" ? "No results" : "Services CMS"}</p>
          <h2>{query || category || status !== "All" ? "No services match these filters." : "Create your first backend service."}</h2>
          <p>The existing public Services page remains static for now. This dashboard prepares the backend records without changing it.</p>
          <button type="button" className="ad-dialog-primary" onClick={() => setCreating(true)}>Create Service</button>
        </section>
      )}

      {!!items.length && (
        <section className="ad-services-grid-v1">
          {items.map((item) => (
            <article className="ad-service-card-v1" key={item.id}>
              <div className="ad-service-card-image-v1">
                <SiteMedia src={item.image} alt={item.imageAlt || item.title} kind="project" className="aspect-[16/9]" />
                <div><AdminStatus value={item.status} /></div>
              </div>

              <div className="ad-service-card-body-v1">
                <div className="ad-service-card-heading-v1">
                  <div>
                    <span>{item.category}</span>
                    <h2>{item.title}</h2>
                  </div>
                  <small>#{item.order}</small>
                </div>

                <p>{item.description || "No card description added."}</p>

                <div className="ad-service-support-v1">
                  <span>{item.highlights.length} support point{item.highlights.length === 1 ? "" : "s"}</span>
                  <span>{item.idealFor ? "Ideal audience set" : "Ideal audience missing"}</span>
                </div>

                {!!item.highlights.length && (
                  <div className="ad-service-highlights-v1">
                    {item.highlights.slice(0, 3).map((value) => <span key={value}>✓ {value}</span>)}
                    {item.highlights.length > 3 && <span>+{item.highlights.length - 3} more</span>}
                  </div>
                )}

                <div className="ad-service-card-footer-v1">
                  <span>Updated {dateLabel(item.updatedAt)}</span>
                  <div>
                    <button type="button" disabled={detailLoading} onClick={() => void openEditor(item.id)}>
                      {detailLoading ? "Loading…" : "Edit"}
                    </button>
                    <button type="button" onClick={() => setArchiveTarget(item)}>Archive</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <ServiceEditorDialog open={creating} onClose={() => setCreating(false)} onSaved={changed} />
      <ServiceEditorDialog open={!!editing} item={editing ?? undefined} onClose={() => setEditing(null)} onSaved={changed} />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this service?"
        description={archiveTarget ? `"${archiveTarget.title}" will be removed from the public Services page and archived in the CMS.` : undefined}
        confirmLabel="Archive Service"
        destructive
        loading={archiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => void archive()}
      />
    </div>
  );
}
