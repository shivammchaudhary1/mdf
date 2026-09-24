"use client";

import { type FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";

import { useAdminRecords } from "./use-admin-records";

type CareerRecord = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  city?: string;
  coverNote: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  status: string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
};

type CareerView = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  city: string;
  status: string;
  applied: string;
};

type CareerSummary = {
  total: number;
  submitted: number;
  inReview: number;
  shortlisted: number;
};

function mapCareer(record: CareerRecord): CareerView {
  return {
    id: record._id,
    name: record.name,
    email: record.email,
    mobile: record.mobile,
    role: record.role,
    city: record.city ?? "—",
    status: record.status,
    applied: new Date(record.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

export function AdminCareersView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (deferredQuery) params.set("search", deferredQuery);
    if (status !== "All") params.set("status", status);
    const value = params.toString();
    return `/admin/careers${value ? `?${value}` : ""}`;
  }, [status, deferredQuery]);

  const [records, setRecords, refresh, meta, setPage, , loading, error] = useAdminRecords(
    path,
    mapCareer,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [selected, setSelected] = useState<CareerRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("Submitted");
  const [saving, setSaving] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<CareerSummary>("/admin/careers/summary"));
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  async function review(id: string) {
    setDetailLoading(true);

    try {
      const result = await api<CareerRecord>(`/admin/careers/${id}`);
      setSelected(result);
      setReviewStatus(result.status);
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Unable to load career application.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;

    const form = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const updated = await api<CareerRecord>(`/admin/careers/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reviewStatus,
          adminNotes: String(form.get("notes") ?? "").trim(),
        }),
      });

      setRecords((current) =>
        current.map((item) =>
          item.id === updated._id
            ? {
                ...item,
                status: updated.status,
              }
            : item,
        ),
      );

      setSelected(null);
      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Career application updated.", "The candidate is notified when the status changes.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to update career application.");
    } finally {
      setSaving(false);
    }
  }

  const noResults = !loading && !error && records.length === 0;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Hiring pipeline"
        title="Career Applications"
        description="Review public career submissions, inspect candidate links and keep the recruitment pipeline organised."
      />

      <section className="ad-career-overview-v2">
        <div><span>Total applications</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Submitted</span><strong>{summary?.submitted ?? "—"}</strong></div>
        <div><span>In review</span><strong>{summary?.inReview ?? "—"}</strong></div>
        <div><span>Shortlisted</span><strong>{summary?.shortlisted ?? "—"}</strong></div>
      </section>

      <section className="ad-inbox-how-v2">
        <div><b>1</b><span><strong>Review</strong>Read the cover note and open resume, portfolio or LinkedIn links.</span></div>
        <div><b>2</b><span><strong>Move through pipeline</strong>Mark In Review or Shortlisted as the conversation progresses.</span></div>
        <div><b>3</b><span><strong>Close outcome</strong>Use Closed or Rejected when the application is no longer active.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters
          values={["All", "Submitted", "In Review", "Shortlisted", "Closed", "Rejected"]}
          active={status}
          onChange={setStatus}
        />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search candidate, email, phone, role or city" />
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-inbox-empty-v2">
          <div className="ad-inbox-empty-icon">▣</div>
          <p className="ad-kicker">{query || status !== "All" ? "No results" : "Hiring inbox clear"}</p>
          <h2>{query || status !== "All" ? "No career applications match these filters." : "No career applications yet."}</h2>
          <p>
            {query || status !== "All"
              ? "Clear the current search or status filter and try again."
              : "New submissions from the public Careers page will appear here automatically."}
          </p>
          {(query || status !== "All") && (
            <button
              type="button"
              className="ad-dialog-secondary"
              onClick={() => {
                setQuery("");
                setStatus("All");
              }}
            >
              Clear Filters
            </button>
          )}
        </section>
      )}

      {!!records.length && (
        <section className="ad-career-grid-v2">
          {records.map((item) => (
            <article className="ad-career-card-v2" key={item.id}>
              <div className="ad-career-card-head-v2">
                <div className="ad-career-avatar-v2">{item.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="ad-kicker">Candidate</p>
                  <h2>{item.name}</h2>
                  <span>{item.email}</span>
                </div>
                <AdminStatus value={item.status} />
              </div>

              <div className="ad-career-role-v2">
                <span>Role / Area</span>
                <strong>{item.role}</strong>
              </div>

              <div className="ad-career-meta-v2">
                <div><span>City</span><strong>{item.city}</strong></div>
                <div><span>Applied</span><strong>{item.applied}</strong></div>
                <div><span>Mobile</span><strong>{item.mobile}</strong></div>
              </div>

              <div className="ad-career-card-actions-v2">
                <a href={`mailto:${item.email}`}>Email</a>
                <button type="button" disabled={detailLoading} onClick={() => void review(item.id)}>
                  {detailLoading ? "Loading…" : "Review Application →"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={!!selected}
        onClose={() => {
          if (!saving) setSelected(null);
        }}
        eyebrow="Career review"
        title={selected?.name ?? "Candidate"}
        description={selected ? `${selected.role} · ${selected.city || "Location not provided"}` : ""}
        width="wide"
      >
        {selected && (
          <AdminDialogForm onSubmit={save}>
            <section className="ad-career-detail-head-v2">
              <div><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              <div><span>Mobile</span><a href={`tel:${selected.mobile}`}>{selected.mobile}</a></div>
              <div><span>Applied</span><strong>{new Date(selected.createdAt).toLocaleString("en-IN")}</strong></div>
              <div><span>Current status</span><AdminStatus value={selected.status} /></div>
            </section>

            <section className="ad-career-cover-v2">
              <p className="ad-kicker">Candidate note</p>
              <p>{selected.coverNote}</p>
            </section>

            {(selected.resumeUrl || selected.portfolioUrl || selected.linkedinUrl) && (
              <section className="ad-career-links-v2">
                {selected.resumeUrl && <a target="_blank" rel="noreferrer" href={selected.resumeUrl}>Resume ↗</a>}
                {selected.portfolioUrl && <a target="_blank" rel="noreferrer" href={selected.portfolioUrl}>Portfolio ↗</a>}
                {selected.linkedinUrl && <a target="_blank" rel="noreferrer" href={selected.linkedinUrl}>LinkedIn ↗</a>}
              </section>
            )}

            <section className="ad-career-decision-v2">
              <div>
                <p className="ad-kicker">Pipeline</p>
                <h3>Move this application</h3>
                <span>Status changes are emailed to the candidate by the existing backend flow.</span>
              </div>

              <div>
                {["In Review", "Shortlisted", "Closed", "Rejected"].map((value) => (
                  <button
                    type="button"
                    key={value}
                    disabled={saving}
                    className={reviewStatus === value ? "active" : ""}
                    onClick={() => setReviewStatus(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>

            <AdminFormField label="Application Status">
              <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)} disabled={saving}>
                <option>Submitted</option>
                <option>In Review</option>
                <option>Shortlisted</option>
                <option>Closed</option>
                <option>Rejected</option>
              </select>
            </AdminFormField>

            <AdminFormField label="Internal Notes" wide>
              <textarea
                name="notes"
                rows={5}
                defaultValue={selected.adminNotes ?? ""}
                maxLength={5000}
                disabled={saving}
                placeholder="Private hiring notes. These are never shown to the candidate."
              />
            </AdminFormField>

            <p className="ad-dialog-footnote">
              Candidate-facing status email is sent only when the status actually changes. Internal notes remain private.
            </p>

            <AdminDialogActions onCancel={() => setSelected(null)} primaryLabel={saving ? "Saving…" : "Save Review"} />
          </AdminDialogForm>
        )}
      </AdminDialog>
    </div>
  );
}
