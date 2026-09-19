"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { type ApplicationRecord, dateLabel, fetchPage, type PageMeta } from "@/services/workspace";
import { useMemberDashboardStore } from "@/store/member-dashboard-store";

type ApplicationDetail = ApplicationRecord & {
  coverNote: string;
  portfolioImages?: string[];
  showreelUrl?: string;
  pitch?: string;
  documentUrl?: string;
};

function tone(status: string) {
  if (status === "Shortlisted" || status === "Selected") return "success";
  if (status === "Under Review") return "warning";
  if (status === "Rejected") return "danger";
  return "neutral";
}

export function MemberApplicationsSection() {
  const toast = useToast();
  const active = useMemberDashboardStore((state) => state.applicationFilter);
  const setActive = useMemberDashboardStore((state) => state.setApplicationFilter);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ApplicationRecord[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const filters = ["All", "Submitted", "Under Review", "Shortlisted", "Selected", "Not Selected"];

  useEffect(() => {
    let mounted = true;
    const status = active === "Not Selected" ? "Rejected" : active === "All" ? "" : active;
    const path = `/member/applications${status ? `?status=${encodeURIComponent(status)}` : ""}`;
    setLoading(true);

    void fetchPage<ApplicationRecord>(path, page, 10)
      .then((result) => {
        if (!mounted) return;
        setItems(result.items);
        setMeta(result.meta);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load applications."))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [active, page, toast]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      setSelected(await api<ApplicationDetail>(`/member/applications/${id}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load application.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="md-stack">
      <section className="md-page-header">
        <div>
          <p>Track your progress</p>
          <h1>My Applications</h1>
          <span>See every project and casting submission, the material you sent, and the latest review status.</span>
        </div>
      </section>

      <div className="md-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActive(filter);
              setPage(1);
            }}
            className={active === filter ? "active" : ""}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <article className="md-card md-app-empty">Loading applications…</article>
      ) : items.length ? (
        <article className="md-card md-table-card">
          <div className="md-table-head md-applications-head">
            <span>Role / Project</span>
            <span>Applied</span>
            <span>Location</span>
            <span>Status</span>
            <span></span>
          </div>

          {items.map((application) => (
            <div className="md-table-row md-application-row" key={application._id}>
              <div>
                <strong>{application.roleSnapshot ?? application.opportunityTitle}</strong>
                <span>
                  {application.opportunityTitle} · {application.opportunityType}
                </span>
              </div>
              <span>{dateLabel(application.createdAt)}</span>
              <span>{application.applicant.city ?? "—"}</span>
              <span className={`md-status ${tone(application.status)}`}>
                {application.status === "Rejected" ? "Not Selected" : application.status}
              </span>
              <button type="button" disabled={detailLoading} onClick={() => void openDetail(application._id)}>
                View
              </button>
            </div>
          ))}
        </article>
      ) : (
        <article className="md-card md-app-empty">
          <strong>No applications found.</strong>
          <span>Explore available opportunities and submit when a role fits your profile.</span>
          <Link href="/member/opportunities" className="md-text-link">
            Explore opportunities →
          </Link>
        </article>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      {selected && (
        <div className="md-app-detail-layer" role="dialog" aria-modal="true" aria-label="Application details">
          <button className="md-app-detail-backdrop" aria-label="Close application details" onClick={() => setSelected(null)} />
          <article className="md-app-detail">
            <header>
              <div>
                <p className="md-kicker">Application details</p>
                <h2>{selected.roleSnapshot ?? selected.opportunityTitle}</h2>
                <span>
                  {selected.opportunityTitle} · {dateLabel(selected.createdAt)}
                </span>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </header>

            <div className="md-app-detail-body">
              <div className="md-app-detail-status">
                <span>Current status</span>
                <strong className={`md-status ${tone(selected.status)}`}>
                  {selected.status === "Rejected" ? "Not Selected" : selected.status}
                </strong>
              </div>

              <section>
                <h3>Cover note</h3>
                <p>{selected.coverNote}</p>
              </section>

              {selected.pitch && (
                <section>
                  <h3>Pitch</h3>
                  <p>{selected.pitch}</p>
                </section>
              )}

              <div className="md-app-detail-links">
                {selected.showreelUrl && (
                  <a href={selected.showreelUrl} target="_blank" rel="noreferrer">
                    Showreel ↗
                  </a>
                )}
                {selected.documentUrl && (
                  <a href={selected.documentUrl} target="_blank" rel="noreferrer">
                    Supporting PDF ↗
                  </a>
                )}
              </div>

              {!!selected.portfolioImages?.length && (
                <section>
                  <h3>Submitted portfolio</h3>
                  <div className="md-app-detail-portfolio">
                    {selected.portfolioImages.map((image, index) => (
                      <SiteMedia
                        key={`${image}-${index}`}
                        src={image}
                        alt={`Submitted portfolio ${index + 1}`}
                        kind="team"
                        className="aspect-square rounded-xl"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
