"use client";
import { type FormEvent, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminSearch,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import type data from "@/data/admin-dashboard.json";
import { applicationView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";
type Application = (typeof data.applications)[number] & { notes?: string };
export function AdminApplicationsView() {
  const toast = useToast(),
    active = useAdminDashboardStore((s) => s.applicationFilter),
    setActive = useAdminDashboardStore((s) => s.setApplicationFilter);
  const [query, setQuery] = useState("");
  const [applications, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/applications?search=${encodeURIComponent(query)}${active !== "All" ? `&status=${encodeURIComponent(active)}` : ""}`,
    applicationView,
    true,
    1,
    25,
  );
  const [selected, setSelected] = useState<Application | null>(null);
  async function update(status: string, notes?: string) {
    if (!selected) return;
    try {
      await api(`/admin/applications/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(notes !== undefined ? { adminNotes: notes } : {}) }),
      });
      await refresh();
      toast.success("Application updated.");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update application.");
    }
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    return update(String(f.get("status")), String(f.get("notes") ?? ""));
  }
  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Casting workflow"
        title="Applications"
        description="Review submissions, shortlist talent and keep every casting decision organized."
      />
      <section className="ad-toolbar">
        <AdminFilters
          values={["All", "Submitted", "Under Review", "Shortlisted", "Selected", "Rejected"]}
          active={active}
          onChange={setActive}
        />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search applicant or project" />
      </section>
      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!applications.length}
        emptyText="No applications match this filter."
        onRetry={() => void refresh()}
      />
      <article className="ad-card ad-table-card">
        <div className="ad-table ad-applications-table">
          <div className="ad-table-head">
            <span>Applicant</span>
            <span>Role / Project</span>
            <span>Applied</span>
            <span>City</span>
            <span>Status</span>
            <span></span>
          </div>
          {applications.map((a) => (
            <div key={a.id} className="ad-table-row">
              <div>
                <strong>{a.applicant}</strong>
                <span>{a.city}</span>
              </div>
              <div>
                <strong>{a.role}</strong>
                <span>{a.project}</span>
              </div>
              <span>{a.applied}</span>
              <span>{a.city}</span>
              <AdminStatus value={a.status} />
              <div className="ad-row-actions">
                <button onClick={() => setSelected(a)}>Review</button>
                <AdminMoreButton />
              </div>
            </div>
          ))}
        </div>
      </article>
      <PaginationControls meta={meta} onPage={setPage} />
      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Application review"
        title={selected?.applicant ?? "Applicant"}
        description={selected ? `${selected.role} · ${selected.project}` : ""}
        width="wide"
      >
        {selected && (
          <AdminDialogForm onSubmit={save}>
            <div className="ad-review-summary">
              <div>
                <span>Applicant</span>
                <strong>{selected.applicant}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{selected.role}</strong>
              </div>
              <div>
                <span>Project</span>
                <strong>{selected.project}</strong>
              </div>
              <div>
                <span>Applied</span>
                <strong>{selected.applied}</strong>
              </div>
            </div>
            <AdminDialogGrid>
              <AdminFormField label="Application Status">
                <select name="status" defaultValue={selected.status}>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Shortlisted</option>
                  <option>Selected</option>
                  <option>Rejected</option>
                </select>
              </AdminFormField>
              <AdminFormField label="Applicant City">
                <input value={selected.city} disabled />
              </AdminFormField>
              <AdminFormField label="Internal Review Notes" wide>
                <textarea name="notes" rows={5} defaultValue={selected.notes ?? ""} />
              </AdminFormField>
            </AdminDialogGrid>
            <AdminDialogActions onCancel={() => setSelected(null)} primaryLabel="Save Review" />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
