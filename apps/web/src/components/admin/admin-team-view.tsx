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

const TEAM_GROUPS = ["Core Team", "Creative Team", "Advisors"] as const;

type TeamSource = {
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
  role?: string;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type TeamItem = {
  id: string;
  name: string;
  slug: string;
  designation: string;
  group: string;
  shortBio: string;
  details: string;
  focus: string[];
  coverMediaId?: string;
  image: string;
  legacyImage: string;
  imageAlt: string;
  status: string;
  publishedAt: string;
  order: number;
  instagram: string;
  facebook: string;
  x: string;
  linkedin: string;
  youtube: string;
  createdAt: string;
  updatedAt: string;
};

type TeamSummary = {
  total: number;
  published: number;
  coreTeam: number;
  creativeTeam: number;
  advisors: number;
};

function mapTeam(item: TeamSource): TeamItem {
  return {
    id: item._id,
    name: item.title,
    slug: item.slug,
    designation: item.role ?? "",
    group: item.data?.group ?? item.category ?? "Core Team",
    shortBio: item.description ?? "",
    details: item.data?.details ?? "",
    focus: item.body ?? [],
    coverMediaId: item.coverMediaId,
    image: item.coverImage ?? item.data?.image ?? "",
    legacyImage: item.data?.image ?? "",
    imageAlt: item.data?.imageAlt ?? item.title,
    status: item.status ?? (item.published ? "Published" : "Draft"),
    publishedAt: item.publishedAt ?? "",
    order: item.order ?? 0,
    instagram: item.data?.instagram ?? "",
    facebook: item.data?.facebook ?? "",
    x: item.data?.x ?? "",
    linkedin: item.data?.linkedin ?? "",
    youtube: item.data?.youtube ?? "",
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

function TeamEditorDialog({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item?: TeamItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const editing = !!item;
  const [group, setGroup] = useState("Core Team");
  const [status, setStatus] = useState("Draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setGroup(item?.group ?? "Core Team");
    setStatus(item?.status ?? "Draft");
    setScheduledAt(item?.status === "Scheduled" ? localDateTime(item.publishedAt) : "");
    setPhoto(null);
    setRemovePhoto(false);
    setSaving(false);
  }, [open, item]);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const designation = String(form.get("designation") ?? "").trim();
    const shortBio = String(form.get("shortBio") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();
    const focus = lines(form.get("focus"));

    if (!name || !designation || !shortBio || !details) {
      toast.error("Name, designation, short bio and detailed profile are required.");
      return;
    }

    if (!editing && !photo) {
      toast.error("Choose a team member photo.");
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
      if (photo) {
        const uploaded = await uploadMedia(photo, "team");
        uploadedId = uploaded.id;
        uploadedDuplicate = !!uploaded.duplicate;
      }

      const payload = {
        title: name,
        ...(!editing ? { slug: slugFor(name) } : {}),
        category: group,
        description: shortBio,
        body: focus,
        role: designation,
        status,
        published: status === "Published" || status === "Scheduled",
        ...(status === "Scheduled"
          ? { publishedAt: new Date(scheduledAt).toISOString() }
          : status === "Draft"
            ? { publishedAt: null }
            : {}),
        order: Number(form.get("order") ?? 0) || 0,
        ...(uploadedId ? { coverMediaId: uploadedId } : removePhoto ? { coverMediaId: null } : {}),
        data: {
          group,
          details,
          image: uploadedId || removePhoto ? "" : item?.legacyImage ?? "",
          imageAlt: String(form.get("imageAlt") ?? "").trim() || name,
          instagram: String(form.get("instagram") ?? "").trim(),
          facebook: String(form.get("facebook") ?? "").trim(),
          x: String(form.get("x") ?? "").trim(),
          linkedin: String(form.get("linkedin") ?? "").trim(),
          youtube: String(form.get("youtube") ?? "").trim(),
        },
      };

      await api(editing ? `/admin/content/team/${item.id}` : "/admin/content/team", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      await onSaved();
      toast.success(editing ? "Team member updated." : "Team member created.");
      onClose();
    } catch (saveError) {
      if (uploadedId && !uploadedDuplicate) await api(`/media/${uploadedId}`, { method: "DELETE" }).catch(() => undefined);
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save team member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      eyebrow={editing ? "Edit team member" : "New team member"}
      title={editing ? item.name : "Add Team Member"}
      description="Published profiles appear in the About Us Core Team section. Team Group remains an admin organization tag."
      width="wide"
    >
      <AdminDialogForm onSubmit={submit}>
        <div className="ad-team-editor-v1">
          <div className="ad-team-editor-main-v1">
            <section className="ad-team-form-section-v1">
              <p className="ad-kicker">Profile</p>
              <AdminDialogGrid>
                <AdminFormField label="Full Name" wide>
                  <input name="name" defaultValue={item?.name ?? ""} required maxLength={160} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Designation">
                  <input name="designation" defaultValue={item?.designation ?? ""} required maxLength={160} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Team Group">
                  <select value={group} onChange={(event) => setGroup(event.target.value)} disabled={saving}>
                    {TEAM_GROUPS.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </AdminFormField>

                <AdminFormField label="Short Bio" wide>
                  <textarea name="shortBio" rows={4} defaultValue={item?.shortBio ?? ""} required maxLength={1500} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Detailed Profile" wide>
                  <textarea
                    name="details"
                    rows={6}
                    defaultValue={item?.details ?? ""}
                    required
                    maxLength={5000}
                    disabled={saving}
                    placeholder="Longer profile used in detailed team presentation later"
                  />
                </AdminFormField>

                <AdminFormField label="Focus Areas" wide>
                  <textarea
                    name="focus"
                    rows={5}
                    defaultValue={item?.focus.join("\n") ?? ""}
                    maxLength={3000}
                    disabled={saving}
                    placeholder={"One focus area per line\nDirection\nProducing\nCreative Development"}
                  />
                </AdminFormField>
              </AdminDialogGrid>
            </section>

            <section className="ad-team-form-section-v1">
              <p className="ad-kicker">Social Profiles</p>
              <AdminDialogGrid>
                <AdminFormField label="Instagram">
                  <input name="instagram" type="url" defaultValue={item?.instagram ?? ""} placeholder="https://..." disabled={saving} />
                </AdminFormField>
                <AdminFormField label="Facebook">
                  <input name="facebook" type="url" defaultValue={item?.facebook ?? ""} placeholder="https://..." disabled={saving} />
                </AdminFormField>
                <AdminFormField label="X / Twitter">
                  <input name="x" type="url" defaultValue={item?.x ?? ""} placeholder="https://..." disabled={saving} />
                </AdminFormField>
                <AdminFormField label="LinkedIn">
                  <input name="linkedin" type="url" defaultValue={item?.linkedin ?? ""} placeholder="https://..." disabled={saving} />
                </AdminFormField>
                <AdminFormField label="YouTube" wide>
                  <input name="youtube" type="url" defaultValue={item?.youtube ?? ""} placeholder="https://..." disabled={saving} />
                </AdminFormField>
              </AdminDialogGrid>
            </section>
          </div>

          <aside className="ad-team-editor-side-v1">
            <section className="ad-team-form-section-v1">
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

              <AdminFormField label="Display Order" wide>
                <input name="order" type="number" min="0" max="10000" defaultValue={item?.order ?? 0} disabled={saving} />
              </AdminFormField>
            </section>

            <section className="ad-team-form-section-v1">
              <p className="ad-kicker">Profile Photo</p>
              {previewUrl || item?.image ? (
                previewUrl ? (
                  <div className="ad-cms-local-preview-v1 team" style={{ backgroundImage: `url("${previewUrl}")` }} />
                ) : (
                  <SiteMedia src={item?.image} alt={item?.imageAlt || item?.name || "Team member"} kind="team" className="aspect-[4/4.5] rounded-xl" />
                )
              ) : (
                <div className="ad-cms-image-empty-v1 team">No team photo</div>
              )}

              <label className="ad-cms-file-button-v1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving}
                  onChange={(event) => {
                    setPhoto(event.currentTarget.files?.[0] ?? null);
                    setRemovePhoto(false);
                  }}
                />
                <span>{photo ? "Change Selected Photo" : item?.image ? "Replace Photo" : "Choose Photo"}</span>
              </label>

              <AdminFormField label="Image Alt Text" wide>
                <input name="imageAlt" defaultValue={item?.imageAlt ?? ""} maxLength={200} disabled={saving} />
              </AdminFormField>

              {editing && item?.image && (
                <label className="ad-dialog-check">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(event) => {
                      setRemovePhoto(event.target.checked);
                      if (event.target.checked) setPhoto(null);
                    }}
                  />
                  <span>Remove current profile photo</span>
                </label>
              )}
            </section>
          </aside>
        </div>

        <AdminDialogActions onCancel={onClose} primaryLabel={saving ? "Saving Member…" : editing ? "Save Changes" : "Add Team Member"} />
      </AdminDialogForm>
    </AdminDialog>
  );
}

export function AdminTeamView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState("order");

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (deferredQuery) params.set("search", deferredQuery);
    if (group) params.set("category", group);
    params.set("sort", sort);
    return `/admin/content/team?${params.toString()}`;
  }, [status, deferredQuery, group, sort]);

  const [members, , refresh, meta, setPage, , loading, error] = useAdminRecords<TeamSource, TeamItem>(
    path,
    mapTeam,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<TeamItem | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<TeamSummary>("/admin/content/team/summary"));
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
      setEditing(mapTeam(await api<TeamSource>(`/admin/content/team/${id}`)));
    } catch (detailError) {
      toast.error(detailError instanceof Error ? detailError.message : "Unable to load team member.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function archive() {
    if (!archiveTarget || archiving) return;
    setArchiving(true);
    try {
      await api(`/admin/content/team/${archiveTarget.id}`, { method: "DELETE" });
      setArchiveTarget(null);
      await changed();
      toast.success("Team member archived.");
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : "Unable to archive team member.");
    } finally {
      setArchiving(false);
    }
  }

  const noResults = !loading && !error && members.length === 0;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Website CMS"
        title="Team"
        description="Manage profiles shown in the About Us Core Team section. Team Group is kept as an admin organization tag."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>Add Team Member</AdminPrimaryButton>}
      />

      <section className="ad-team-overview-v1">
        <div><span>Total people</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Published</span><strong>{summary?.published ?? "—"}</strong></div>
        <div><span>Core team</span><strong>{summary?.coreTeam ?? "—"}</strong></div>
        <div><span>Creative</span><strong>{summary?.creativeTeam ?? "—"}</strong></div>
        <div><span>Advisors</span><strong>{summary?.advisors ?? "—"}</strong></div>
      </section>

      <section className="ad-cms-how-v1">
        <div><b>1</b><span><strong>Identity</strong>Name, designation, group and profile image.</span></div>
        <div><b>2</b><span><strong>Story</strong>Short bio, detailed profile and focus areas aligned with About Us.</span></div>
        <div><b>3</b><span><strong>Presence</strong>Social links, order and publishing status are managed centrally.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "Published", "Draft", "Scheduled"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search name, designation, group, bio or focus area" />
      </section>

      <section className="ad-cms-filterbar-v1">
        <label>
          <span>Team Group</span>
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="">All groups</option>
            {TEAM_GROUPS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="order">Display order</option>
            <option value="newest">Newest</option>
            <option value="updated">Recently updated</option>
            <option value="title-asc">Name A–Z</option>
            <option value="title-desc">Name Z–A</option>
          </select>
        </label>

        {(group || query || status !== "All" || sort !== "order") && (
          <button type="button" onClick={() => {
            setGroup("");
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
          <div>◎</div>
          <p className="ad-kicker">{query || group || status !== "All" ? "No results" : "Team CMS"}</p>
          <h2>{query || group || status !== "All" ? "No team members match these filters." : "Add your first backend team member."}</h2>
          <p>Published team members appear automatically in the About Us Core Team section.</p>
          <button type="button" className="ad-dialog-primary" onClick={() => setCreating(true)}>Add Team Member</button>
        </section>
      )}

      {!!members.length && (
        <section className="ad-team-grid-v1">
          {members.map((member) => (
            <article className="ad-team-card-v1" key={member.id}>
              <div className="ad-team-card-image-v1">
                <SiteMedia src={member.image} alt={member.imageAlt || member.name} kind="team" className="aspect-[4/4.5]" />
                <div><AdminStatus value={member.status} /></div>
                <span>{member.group}</span>
              </div>

              <div className="ad-team-card-body-v1">
                <p>{member.designation || "Designation not added"}</p>
                <h2>{member.name}</h2>
                <div className="ad-team-bio-v1">{member.shortBio || "No short bio added."}</div>

                {!!member.focus.length && (
                  <div className="ad-team-focus-v1">
                    {member.focus.slice(0, 3).map((value) => <span key={value}>{value}</span>)}
                    {member.focus.length > 3 && <span>+{member.focus.length - 3}</span>}
                  </div>
                )}

                <div className="ad-team-social-count-v1">
                  <span>{[member.instagram, member.facebook, member.x, member.linkedin, member.youtube].filter(Boolean).length} social link(s)</span>
                  <span>Order #{member.order}</span>
                </div>

                <div className="ad-team-card-footer-v1">
                  <span>Updated {dateLabel(member.updatedAt)}</span>
                  <div>
                    <button type="button" disabled={detailLoading} onClick={() => void openEditor(member.id)}>
                      {detailLoading ? "Loading…" : "Edit"}
                    </button>
                    <button type="button" onClick={() => setArchiveTarget(member)}>Archive</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <TeamEditorDialog open={creating} onClose={() => setCreating(false)} onSaved={changed} />
      <TeamEditorDialog open={!!editing} item={editing ?? undefined} onClose={() => setEditing(null)} onSaved={changed} />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this team member?"
        description={archiveTarget ? `"${archiveTarget.name}" will be removed from the About Us Core Team section once archived.` : undefined}
        confirmLabel="Archive Member"
        destructive
        loading={archiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => void archive()}
      />
    </div>
  );
}
