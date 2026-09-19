"use client";

import { type FormEvent, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel, mediaUrl } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

type ApplicationRecord = {
  _id: string;
  applicant: { name: string; email: string; mobile: string; city?: string };
  opportunityTitle: string;
  roleSnapshot?: string;
  opportunityType: "PROJECT" | "CASTING";
  coverNote: string;
  portfolioImages?: string[];
  showreelUrl?: string;
  pitch?: string;
  documentUrl?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
};

type ApplicationView = {
  id: string;
  applicant: string;
  email: string;
  mobile: string;
  city: string;
  role: string;
  project: string;
  type: string;
  status: string;
  applied: string;
};

const view = (record: ApplicationRecord): ApplicationView => ({
  id: record._id,
  applicant: record.applicant.name,
  email: record.applicant.email,
  mobile: record.applicant.mobile,
  city: record.applicant.city ?? "—",
  role: record.roleSnapshot ?? record.opportunityTitle,
  project: record.opportunityTitle,
  type: record.opportunityType,
  status: record.status,
  applied: dateLabel(record.createdAt),
});

export function AdminApplicationsView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.applicationFilter);
  const setActive = useAdminDashboardStore((state) => state.setApplicationFilter);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [applications, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/applications?search=${encodeURIComponent(query)}${active !== "All" ? `&status=${encodeURIComponent(active)}` : ""}`,
    view,
    true,
    1,
    25,
  );

  async function review(id: string) {
    setDetailLoading(true);
    try {
      setSelected(await api<ApplicationRecord>(`/admin/applications/${id}`));
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Unable to load application.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);

    try {
      await api(`/admin/applications/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: String(form.get("status") ?? selected.status),
          adminNotes: String(form.get("notes") ?? ""),
        }),
      });
      await refresh();
      setSelected(null);
      toast.success("Application updated.", "The member will see the new status immediately.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to update application.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Casting workflow"
        title="Applications"
        description="Review complete submissions, private notes, portfolio material and application status."
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

          {applications.map((application) => (
            <div key={application.id} className="ad-table-row">
              <div>
                <strong>{application.applicant}</strong>
                <span>{application.email}</span>
              </div>
              <div>
                <strong>{application.role}</strong>
                <span>{application.project}</span>
              </div>
              <span>{application.applied}</span>
              <span>{application.city}</span>
              <AdminStatus value={application.status} />
              <div className="ad-row-actions">
                <button disabled={detailLoading} onClick={() => void review(application.id)}>
                  Review
                </button>
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
        title={selected?.applicant.name ?? "Applicant"}
        description={selected ? `${selected.roleSnapshot ?? selected.opportunityTitle} · ${selected.opportunityTitle}` : ""}
        width="wide"
      >
        {selected && (
          <AdminDialogForm onSubmit={save}>
            <div className="ad-review-summary">
              <div>
                <span>Email</span>
                <strong>{selected.applicant.email}</strong>
              </div>
              <div>
                <span>Mobile</span>
                <strong>{selected.applicant.mobile}</strong>
              </div>
              <div>
                <span>City</span>
                <strong>{selected.applicant.city ?? "—"}</strong>
              </div>
              <div>
                <span>Applied</span>
                <strong>{dateLabel(selected.createdAt)}</strong>
              </div>
            </div>

            <section className="grid gap-3 rounded-xl border border-black/8 bg-[#fafaf8] p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Cover note</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555]">{selected.coverNote}</p>
              </div>
              {selected.pitch && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Pitch</span>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555]">{selected.pitch}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {selected.showreelUrl && (
                  <a href={selected.showreelUrl} target="_blank" rel="noreferrer" className="site-button site-button-outline">
                    Showreel ↗
                  </a>
                )}
                {selected.documentUrl && (
                  <a href={selected.documentUrl} target="_blank" rel="noreferrer" className="site-button site-button-outline">
                    Supporting PDF ↗
                  </a>
                )}
              </div>
            </section>

            {!!selected.portfolioImages?.length && (
              <section>
                <p className="ad-kicker">Selected portfolio</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {selected.portfolioImages.map((image, index) => (
                    <SiteMedia
                      key={`${image}-${index}`}
                      src={mediaUrl(image)}
                      alt={`Application portfolio ${index + 1}`}
                      kind="team"
                      className="aspect-square rounded-xl"
                    />
                  ))}
                </div>
              </section>
            )}

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
              <AdminFormField label="Internal Review Notes" wide>
                <textarea name="notes" rows={5} defaultValue={selected.adminNotes ?? ""} />
              </AdminFormField>
            </AdminDialogGrid>

            <AdminDialogActions onCancel={() => setSelected(null)} primaryLabel="Save Review" />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
