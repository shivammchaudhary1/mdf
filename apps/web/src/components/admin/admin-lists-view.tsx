"use client";

import { type FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminPageHeader, AdminPrimaryButton, AdminSearch } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type ListView, listView, type ProjectRecord, type TalentRecord } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { allPages, fetchPage, type PageMeta } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

type ListDetail = {
  _id: string;
  name: string;
  purpose?: string;
  projectId?: string;
  memberIds: string[];
  members: TalentRecord[];
  updatedAt?: string;
};
type ProjectOption = { id: string; title: string };
type ListSummary = { lists: number; uniqueTalent: number; savedEntries: number; linkedLists: number };

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function AdminListsView() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [projectFilter, setProjectFilter] = useState("");

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (deferredQuery) params.set("search", deferredQuery);
    if (projectFilter) params.set("projectId", projectFilter);
    return `/admin/lists${params.size ? `?${params.toString()}` : ""}`;
  }, [deferredQuery, projectFilter]);

  const [lists, , refresh, meta, setPage, , loading, error] = useAdminRecords(path, listView, true, 1, 20);

  const [summary, setSummary] = useState<ListSummary | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ListView | null>(null);
  const [detail, setDetail] = useState<ListDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ListView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const deferredPickerQuery = useDeferredValue(pickerQuery.trim());
  const [pickerPage, setPickerPage] = useState(1);
  const [picker, setPicker] = useState<TalentRecord[]>([]);
  const [pickerMeta, setPickerMeta] = useState<PageMeta>();
  const [pickerLoading, setPickerLoading] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [memberBusy, setMemberBusy] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await api<ListSummary>("/admin/lists/summary"));
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([allPages<ProjectRecord>("/admin/projects"), api<ListSummary>("/admin/lists/summary")])
      .then(([rows, stats]) => {
        if (!active) return;
        setProjects(rows.map((x) => ({ id: x._id, title: x.title })).sort((a, b) => a.title.localeCompare(b.title)));
        setSummary(stats);
      })
      .catch((e) => {
        if (active) toast.error(e instanceof Error ? e.message : "Unable to load saved-list options.");
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      setDetail(await api<ListDetail>(`/admin/lists/${id}`));
    } catch (e) {
      setDetail(null);
      setDetailError(e instanceof Error ? e.message : "Unable to load talent list.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      setEditing(false);
      setPickerOpen(false);
      setPickerQuery("");
      return;
    }
    void loadDetail(selected.id);
  }, [selected, loadDetail]);

  useEffect(() => {
    if (!pickerOpen) return;

    let active = true;
    setPickerLoading(true);

    const params = new URLSearchParams({ suspended: "false" });
    if (verifiedOnly) params.set("verified", "true");
    if (deferredPickerQuery) params.set("search", deferredPickerQuery);

    void fetchPage<TalentRecord>(`/admin/members?${params.toString()}`, pickerPage, 12)
      .then((result) => {
        if (!active) return;
        setPicker(result.items);
        setPickerMeta(result.meta);
      })
      .catch((e) => {
        if (active) toast.error(e instanceof Error ? e.message : "Unable to load talent.");
      })
      .finally(() => {
        if (active) setPickerLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pickerOpen, deferredPickerQuery, pickerPage, verifiedOnly, toast]);

  async function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const purpose = String(form.get("purpose") ?? "").trim();
    const projectId = String(form.get("projectId") ?? "").trim();

    try {
      await api("/admin/lists", {
        method: "POST",
        body: JSON.stringify({ name, ...(purpose ? { purpose } : {}), ...(projectId ? { projectId } : {}) }),
      });
      setCreating(false);
      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Talent list created.", "Open Manage List to start adding talent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create list.");
    }
  }

  async function updateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const purpose = String(form.get("purpose") ?? "").trim();
    const projectId = String(form.get("projectId") ?? "").trim();

    try {
      await api(`/admin/lists/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, purpose, projectId: projectId || null }),
      });
      setSelected((current) => (current ? { ...current, name, purpose, projectId: projectId || undefined } : current));
      setEditing(false);
      await Promise.allSettled([refresh(), loadDetail(selected.id), loadSummary()]);
      toast.success("Talent list updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update list.");
    }
  }

  async function addMember(memberId: string) {
    if (!selected || memberBusy) return;
    setMemberBusy(memberId);
    try {
      const updated = await api<ListDetail>(`/admin/lists/${selected.id}/members`, {
        method: "POST",
        body: JSON.stringify({ memberId }),
      });
      setDetail(updated);
      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Talent added to shortlist.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to add talent.");
    } finally {
      setMemberBusy(null);
    }
  }

  async function removeMember(memberId: string) {
    if (!selected || memberBusy) return;
    setMemberBusy(memberId);
    try {
      const updated = await api<ListDetail>(`/admin/lists/${selected.id}/members/${memberId}`, { method: "DELETE" });
      setDetail(updated);
      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Talent removed from shortlist.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to remove talent.");
    } finally {
      setMemberBusy(null);
    }
  }

  async function deleteList() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api(`/admin/lists/${deleteTarget.id}`, { method: "DELETE" });
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Talent list deleted.", "Member accounts were not changed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete list.");
    } finally {
      setDeleting(false);
    }
  }

  const saved = new Set(detail?.memberIds ?? []);
  const projectTitle = (id?: string) => projects.find((x) => x.id === id)?.title ?? (id ? "Linked project" : "No linked project");
  const noResults = !loading && !error && !lists.length;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Talent organization"
        title="Saved Talent Lists"
        description="Create internal casting shortlists, group promising members and optionally connect a list to a project."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Talent List</AdminPrimaryButton>}
      />

      <section className="ad-list-overview-v2">
        {[
          ["Total lists", summary?.lists],
          ["Unique talent", summary?.uniqueTalent],
          ["Saved entries", summary?.savedEntries],
          ["Project linked", summary?.linkedLists],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </section>

      <section className="ad-list-how-v2">
        <div><b>1</b><span><strong>Create a shortlist</strong>Name it by role, campaign or casting need.</span></div>
        <div><b>2</b><span><strong>Add talent</strong>Search active members and save people worth revisiting.</span></div>
        <div><b>3</b><span><strong>Keep decisions separate</strong>Lists organize talent; selection stays in Applications.</span></div>
      </section>

      <section className="ad-toolbar ad-list-toolbar-v2">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search list name or purpose" />
        <label className="ad-list-project-filter">
          <span>Project</span>
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
          </select>
        </label>
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-list-empty-v2">
          <div className="ad-list-empty-icon">◎</div>
          <p className="ad-kicker">{query || projectFilter ? "No results" : "Start organizing talent"}</p>
          <h2>{query || projectFilter ? "No saved lists match these filters." : "Create your first talent shortlist."}</h2>
          <p>{query || projectFilter ? "Clear the current filters and try again." : "Example: “Monsoon Letters — Female Lead”. Add talent after creating the list."}</p>
          <button
            type="button"
            className={query || projectFilter ? "ad-dialog-secondary" : "ad-dialog-primary"}
            onClick={() => {
              if (query || projectFilter) {
                setQuery("");
                setProjectFilter("");
              } else setCreating(true);
            }}
          >
            {query || projectFilter ? "Clear Filters" : "Create Talent List"}
          </button>
        </section>
      )}

      {!!lists.length && (
        <section className="ad-list-grid ad-list-grid-v2">
          {lists.map((list) => (
            <article className="ad-list-card ad-list-card-v2" key={list.id}>
              <div className="ad-list-card-top-v2">
                <div className="ad-list-count-v2"><strong>{list.members}</strong><span>{list.members === 1 ? "member" : "members"}</span></div>
                <span className={`ad-list-project-pill-v2 ${list.projectId ? "linked" : ""}`}>
                  {list.projectId ? "Project linked" : "Reusable list"}
                </span>
              </div>

              <div className="ad-list-card-copy-v2">
                <p className="ad-kicker">Saved shortlist</p>
                <h2>{list.name}</h2>
                <p>{list.purpose || "No purpose added yet."}</p>
              </div>

              <div className="ad-list-card-meta-v2">
                <div><span>Project</span><strong>{projectTitle(list.projectId)}</strong></div>
                <div><span>Updated</span><strong>{list.updated}</strong></div>
              </div>

              <div className="ad-list-actions ad-list-actions-v2">
                <button type="button" onClick={() => setSelected(list)}>Manage List →</button>
                <button type="button" onClick={() => setDeleteTarget(list)}>Delete</button>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow="Create shortlist"
        title="New Talent List"
        description="This is an internal admin list. It does not notify, select or reject any member."
        width="wide"
      >
        <AdminDialogForm onSubmit={createList}>
          <AdminDialogGrid>
            <AdminFormField label="List Name" wide>
              <input name="name" required maxLength={100} autoFocus placeholder="e.g. Monsoon Letters — Female Lead" />
            </AdminFormField>
            <AdminFormField label="Purpose" wide>
              <textarea name="purpose" rows={3} maxLength={200} placeholder="What is this shortlist for?" />
            </AdminFormField>
            <AdminFormField label="Linked Project" wide>
              <select name="projectId">
                <option value="">No linked project — reusable list</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
              </select>
            </AdminFormField>
          </AdminDialogGrid>
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel="Create List" />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Saved shortlist"
        title={selected?.name ?? "Talent List"}
        description={detail?.purpose || "Manage list details and shortlisted members."}
        width="wide"
      >
        {selected && (
          <div className="ad-list-manage-v2">
            {detailLoading ? (
              <div className="ad-empty">Loading saved list…</div>
            ) : detailError ? (
              <div className="ad-empty">
                <span>{detailError}</span>
                <button type="button" className="ad-dialog-secondary" onClick={() => void loadDetail(selected.id)}>Try Again</button>
              </div>
            ) : detail ? (
              <>
                <section className="ad-list-summary-v2">
                  <div><span>Saved talent</span><strong>{detail.memberIds.length}</strong></div>
                  <div><span>Linked project</span><strong>{projectTitle(detail.projectId)}</strong></div>
                  <div><span>Last updated</span><strong>{dateLabel(detail.updatedAt)}</strong></div>
                </section>

                <div className="ad-list-manage-actions-v2">
                  <span>Internal shortlist only — application decisions remain in Applications.</span>
                  <div>
                    <button type="button" className="ad-dialog-secondary" onClick={() => setEditing((v) => !v)}>
                      {editing ? "Cancel Editing" : "Edit Details"}
                    </button>
                    <button
                      type="button"
                      className="ad-dialog-primary"
                      onClick={() => {
                        setPickerOpen((v) => !v);
                        setPickerPage(1);
                      }}
                    >
                      {pickerOpen ? "Close Talent Picker" : "+ Add Talent"}
                    </button>
                  </div>
                </div>

                {editing && (
                  <AdminDialogForm onSubmit={updateList}>
                    <AdminDialogGrid>
                      <AdminFormField label="List Name" wide>
                        <input name="name" defaultValue={detail.name} required maxLength={100} />
                      </AdminFormField>
                      <AdminFormField label="Purpose" wide>
                        <textarea name="purpose" rows={3} defaultValue={detail.purpose ?? ""} maxLength={200} />
                      </AdminFormField>
                      <AdminFormField label="Linked Project" wide>
                        <select name="projectId" defaultValue={detail.projectId ?? ""}>
                          <option value="">No linked project</option>
                          {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                        </select>
                      </AdminFormField>
                    </AdminDialogGrid>
                    <AdminDialogActions onCancel={() => setEditing(false)} primaryLabel="Save Details" />
                  </AdminDialogForm>
                )}

                {pickerOpen && (
                  <section className="ad-list-picker-v2">
                    <header>
                      <div>
                        <p className="ad-kicker">Talent picker</p>
                        <h3>Add people to this shortlist</h3>
                        <span>Suspended accounts are excluded automatically.</span>
                      </div>
                      <label className="ad-list-verified-toggle-v2">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => {
                            setVerifiedOnly(e.target.checked);
                            setPickerPage(1);
                          }}
                        />
                        <span>Verified only</span>
                      </label>
                    </header>

                    <AdminSearch
                      value={pickerQuery}
                      onChange={(value) => {
                        setPickerQuery(value);
                        setPickerPage(1);
                      }}
                      placeholder="Search name, Member ID, category or city"
                    />

                    {pickerLoading ? (
                      <div className="ad-empty">Loading talent…</div>
                    ) : !picker.length ? (
                      <div className="ad-dialog-empty"><strong>No matching active talent.</strong><span>Try another search or turn off Verified only.</span></div>
                    ) : (
                      <div className="ad-list-member-grid-v2">
                        {picker.map((member) => {
                          const isSaved = saved.has(member.id);
                          return (
                            <article className="ad-list-member-v2" key={member.id}>
                              <SiteMedia src={member.profile?.photo} alt={member.name} kind="team" className="h-12 w-12 shrink-0 rounded-xl" />
                              <div className="ad-list-member-copy-v2">
                                <strong>{member.name}</strong>
                                <span>{member.memberCode || "MDF member"}</span>
                                <small>{[member.profile?.profession, member.profile?.city].filter(Boolean).join(" · ") || "Profile details not added"}</small>
                              </div>
                              <div className="ad-list-member-action-v2">
                                {member.verified && <small>✓ Verified</small>}
                                <button type="button" disabled={isSaved || memberBusy === member.id} onClick={() => void addMember(member.id)}>
                                  {isSaved ? "Added" : memberBusy === member.id ? "Adding…" : "Add"}
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}

                    <PaginationControls meta={pickerMeta} onPage={setPickerPage} compact />
                  </section>
                )}

                <section className="ad-list-saved-v2">
                  <header>
                    <div>
                      <p className="ad-kicker">Shortlisted talent</p>
                      <h3>{detail.members.length ? `${detail.members.length} saved member${detail.members.length === 1 ? "" : "s"}` : "This shortlist is empty"}</h3>
                    </div>
                  </header>

                  {!detail.members.length ? (
                    <div className="ad-dialog-empty"><strong>No talent saved yet.</strong><span>Use Add Talent above to build this shortlist.</span></div>
                  ) : (
                    <div className="ad-list-member-grid-v2">
                      {detail.members.map((member) => (
                        <article className="ad-list-member-v2 saved" key={member.id}>
                          <SiteMedia src={member.profile?.photo} alt={member.name} kind="team" className="h-12 w-12 shrink-0 rounded-xl" />
                          <div className="ad-list-member-copy-v2">
                            <strong>{member.name}</strong>
                            <span>{member.memberCode || "MDF member"}</span>
                            <small>{[member.profile?.profession, member.profile?.city].filter(Boolean).join(" · ") || member.email}</small>
                          </div>
                          <div className="ad-list-member-action-v2">
                            <small className={member.suspended ? "danger" : member.verified ? "" : "muted"}>
                              {member.suspended ? "Suspended" : member.verified ? "✓ Verified" : "Needs review"}
                            </small>
                            <button
                              type="button"
                              className="remove"
                              disabled={memberBusy === member.id}
                              onClick={() => void removeMember(member.id)}
                            >
                              {memberBusy === member.id ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <div className="ad-list-footer-v2">
                  <span>Deleting a list never deletes member accounts, profiles or applications.</span>
                  <div>
                    <button type="button" className="ad-dialog-cancel" onClick={() => setSelected(null)}>Close</button>
                    <button type="button" className="ad-dialog-secondary" onClick={() => setDeleteTarget(selected)}>Delete List</button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this talent list?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently deleted. Member accounts, profiles and applications are not affected.` : undefined}
        confirmLabel="Delete List"
        destructive
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteList()}
      />
    </div>
  );
}
