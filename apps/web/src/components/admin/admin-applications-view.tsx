"use client";

import { type FormEvent, useDeferredValue, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch } from "@/components/admin/admin-shared";
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
  rawStatus: string;
  status: string;
  applied: string;
};

function statusLabel(status: string) {
  return status === "Rejected" ? "Not Selected" : status;
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`ad-status ${value.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(value)}</span>;
}

const view = (record: ApplicationRecord): ApplicationView => ({
  id: record._id,
  applicant: record.applicant.name,
  email: record.applicant.email,
  mobile: record.applicant.mobile,
  city: record.applicant.city ?? "—",
  role: record.roleSnapshot ?? record.opportunityTitle,
  project: record.opportunityTitle,
  type: record.opportunityType,
  rawStatus: record.status,
  status: statusLabel(record.status),
  applied: dateLabel(record.createdAt),
});

export function AdminApplicationsView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.applicationFilter);
  const setActive = useAdminDashboardStore((state) => state.setApplicationFilter);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);
  const [reviewStatus, setReviewStatus] = useState("Submitted");
  const [detailLoading, setDetailLoading] = useState(false);

  const backendStatus = active === "Not Selected" ? "Rejected" : active === "All" ? "" : active;

  const [applications, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/applications?search=${encodeURIComponent(deferredQuery)}${backendStatus ? `&status=${encodeURIComponent(backendStatus)}` : ""}`,
    view,
    true,
    1,
    20,
  );

  async function review(id: string) {
    setDetailLoading(true);

    try {
      const result = await api<ApplicationRecord>(`/admin/applications/${id}`);
      setSelected(result);
      setReviewStatus(result.status);
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
          status: reviewStatus,
          adminNotes: String(form.get("notes") ?? ""),
        }),
      });

      await refresh();
      setSelected(null);
      toast.success(
        reviewStatus === "Selected" ? "Applicant selected." : reviewStatus === "Rejected" ? "Applicant marked Not Selected." : "Application updated.",
        "The member will see the new status immediately.",
      );
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to update application.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Casting workflow"
        title="Applications"
        description="Review complete submissions, portfolio material, private notes and final selection status."
      />

      <section className="ad-toolbar">
        <AdminFilters
          values={["All", "Submitted", "Under Review", "Shortlisted", "Selected", "Not Selected"]}
          active={active}
          onChange={setActive}
        />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search applicant, email, mobile or project" />
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
              <StatusBadge value={application.rawStatus} />
              <div className="ad-row-actions">
                <button disabled={detailLoading} onClick={() => void review(application.id)}>
                  {detailLoading ? "Loading…" : "Review"}
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

            <section className="ad-application-decision">
              <div>
                <p className="ad-kicker">Decision</p>
                <h3>Application outcome</h3>
                <span>Use the quick actions or choose a workflow status below.</span>
              </div>

              <div className="ad-application-decision-actions">
                <button
                  type="button"
                  className={reviewStatus === "Selected" ? "selected" : ""}
                  onClick={() => setReviewStatus("Selected")}
                >
                  ✓ Selected
                </button>
                <button
                  type="button"
                  className={reviewStatus === "Rejected" ? "not-selected" : ""}
                  onClick={() => setReviewStatus("Rejected")}
                >
                  × Not Selected
                </button>
              </div>
            </section>

            <AdminDialogGrid>
              <AdminFormField label="Application Status">
                <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Not Selected</option>
                </select>
              </AdminFormField>

              <AdminFormField label="Internal Review Notes" wide>
                <textarea name="notes" rows={5} defaultValue={selected.adminNotes ?? ""} placeholder="Private notes visible only to admins" />
              </AdminFormField>
            </AdminDialogGrid>

            <p className="ad-dialog-footnote">
              Members see the final status in My Applications. “Not Selected” is stored internally as the existing Rejected workflow state.
            </p>

            <AdminDialogActions onCancel={() => setSelected(null)} primaryLabel="Save Review" />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
