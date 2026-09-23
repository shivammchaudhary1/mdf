"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminSearch,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type MemberView, memberView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

type MemberOverview = {
  members: number;
  verified: number;
  newMembers: number;
};

export function AdminMembersView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.memberFilter);
  const setActive = useAdminDashboardStore((state) => state.setMemberFilter);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [overview, setOverview] = useState<MemberOverview | null>(null);

  const [members, , refresh, meta, setPage, page, loading, error] = useAdminRecords(
    `/admin/members?search=${encodeURIComponent(deferredQuery)}${
      active === "Verified" ? "&verified=true" : active === "Unverified" || active === "Needs Review" ? "&verified=false" : ""
    }`,
    memberView,
    true,
    1,
    20,
  );

  const [selected, setSelected] = useState<MemberView | null>(null);

  async function loadOverview() {
    try {
      const result = await api<MemberOverview>("/admin/metrics");
      setOverview(result);
    } catch {
      setOverview(null);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  async function toggleVerify() {
    if (!selected) return;

    try {
      await api(`/admin/members/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !selected.verified }),
      });
      await Promise.all([refresh(), loadOverview()]);
      toast.success("Verification updated.");
      setSelected(null);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update member.");
    }
  }

  async function toggleSuspended() {
    if (!selected) return;

    try {
      await api(`/admin/members/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ suspended: !selected.suspended }),
      });
      await refresh();
      toast.success(selected.suspended ? "Member reactivated." : "Member suspended and sessions revoked.");
      setSelected(null);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update member.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Community management"
        title="Members"
        description="Search, verify, suspend and review registered community members. Every member has a permanent MDF Member ID."
      />

      <section className="ad-member-overview" aria-label="Member overview">
        <div>
          <span>Total members</span>
          <strong>{overview?.members ?? "—"}</strong>
        </div>
        <div>
          <span>Verified</span>
          <strong>{overview?.verified ?? "—"}</strong>
        </div>
        <div>
          <span>Joined in last 30 days</span>
          <strong>{overview?.newMembers ?? "—"}</strong>
        </div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "Verified", "Unverified", "Needs Review"]} active={active} onChange={setActive} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search name, email, Member ID, mobile…" />
      </section>

      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!members.length}
        emptyText="No members match this filter."
        onRetry={() => void refresh()}
      />

      <article className="ad-card ad-table-card">
        <div className="ad-table ad-members-table">
          <div className="ad-table-head">
            <span>Member</span>
            <span>Category</span>
            <span>Location</span>
            <span>Profile</span>
            <span>Status</span>
            <span></span>
          </div>

          {members.map((member, index) => (
            <div key={member.id} className="ad-table-row">
              <div className="ad-person-cell">
                <SiteMedia src={member.image} alt={member.name} kind="team" className="h-10 w-10 shrink-0 rounded-full" />
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                  {member.memberCode && (
                    <small className="ad-member-code" title="Permanent MDF Member ID">
                      {member.memberCode}
                    </small>
                  )}
                  <small className="ad-member-row-number">#{(page - 1) * 20 + index + 1}</small>
                </div>
              </div>

              <span>{member.role || "—"}</span>
              <span>{member.city || "—"}</span>

              <div className="ad-completion">
                <strong>{member.completion}%</strong>
                <i>
                  <b style={{ width: `${member.completion}%` }} />
                </i>
              </div>

              <div className="ad-member-status">
                {member.verified ? <span className="verified">✓ Verified</span> : <AdminStatus value={member.status} />}
              </div>

              <AdminMoreButton onEdit={() => setSelected(member)} />
            </div>
          ))}
        </div>
      </article>

      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Member review"
        title={selected?.name ?? "Member"}
        description={selected ? `${selected.memberCode || "MDF Member"} · ${selected.role || "No category"} · ${selected.city || "No location"}` : ""}
      >
        {selected && (
          <div className="ad-member-review">
            <div className="ad-member-review-top">
              <div className="ad-avatar">{selected.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{selected.email}</strong>
                <span>Profile completion {selected.completion}%</span>
              </div>
            </div>

            {selected.memberCode && (
              <div className="ad-member-id-card">
                <span>MDF Member ID</span>
                <strong>{selected.memberCode}</strong>
                <small>Permanent internal reference for this member.</small>
              </div>
            )}

            <div className="ad-review-summary">
              <div>
                <span>Status</span>
                <strong>{selected.status}</strong>
              </div>
              <div>
                <span>Joined</span>
                <strong>{selected.joined}</strong>
              </div>
              <div>
                <span>Verification</span>
                <strong>{selected.verified ? "Verified" : "Not verified"}</strong>
              </div>
              <div>
                <span>Profile</span>
                <strong>{selected.completion}%</strong>
              </div>
            </div>

            <div className="ad-dialog-actions">
              <button type="button" className="ad-dialog-cancel" onClick={() => setSelected(null)}>
                Close
              </button>
              <button type="button" className="ad-dialog-secondary" onClick={toggleSuspended}>
                {selected.suspended ? "Reactivate" : "Suspend"}
              </button>
              <button type="button" className="ad-dialog-primary" onClick={toggleVerify}>
                {selected.verified ? "Remove Verification" : "Verify Member"}
              </button>
            </div>
          </div>
        )}
      </AdminDialog>
    </div>
  );
}
