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
import type data from "@/data/admin-dashboard.json";
import { memberView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

type Member = (typeof data.members)[number] & { suspended: boolean };

export function AdminMembersView() {
  const toast = useToast();
  const active = useAdminDashboardStore((s) => s.memberFilter);
  const setActive = useAdminDashboardStore((s) => s.setMemberFilter);
  const [query, setQuery] = useState("");
  const [members, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/users?search=${encodeURIComponent(query)}${active === "Verified" ? "&verified=true" : active === "Unverified" || active === "Needs Review" ? "&verified=false" : ""}`,
    memberView,
    true,
    1,
    25,
  );
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.error("Members must register through the sign-up page. Admin invitations are not available yet.");
  }
  async function toggleVerify() {
    if (!selected) return;
    try {
      await api(`/admin/users/${selected.id}`, { method: "PATCH", body: JSON.stringify({ verified: !selected.verified }) });
      await refresh();
      toast.success("Verification updated.");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update member.");
    }
  }
  async function toggleSuspended() {
    if (!selected) return;
    try {
      await api(`/admin/users/${selected.id}`, { method: "PATCH", body: JSON.stringify({ suspended: !selected.suspended }) });
      await refresh();
      toast.success(selected.suspended ? "Member reactivated." : "Member suspended and sessions revoked.");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update member.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Community management"
        title="Members & Talent"
        description="Search, verify and review the people who make up the M. Dadu Films community."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>Add Member</AdminPrimaryButton>}
      />
      <section className="ad-toolbar">
        <AdminFilters values={["All", "Verified", "Unverified", "Needs Review"]} active={active} onChange={setActive} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search members" />
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
          {members.map((m) => (
            <div key={m.id} className="ad-table-row">
              <div className="ad-person-cell">
                <SiteMedia src={m.image} alt={m.name} kind="team" className="h-10 w-10 shrink-0 rounded-full" />
                <div>
                  <strong>{m.name}</strong>
                  <span>{m.email}</span>
                </div>
              </div>
              <span>{m.role}</span>
              <span>{m.city}</span>
              <div className="ad-completion">
                <strong>{m.completion}%</strong>
                <i>
                  <b style={{ width: `${m.completion}%` }} />
                </i>
              </div>
              <div className="ad-member-status">
                {m.verified ? <span className="verified">✓ Verified</span> : <AdminStatus value={m.status} />}
              </div>
              <AdminMoreButton onEdit={() => setSelected(m)} />
            </div>
          ))}
        </div>
      </article>
      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow="Community"
        title="Add Member"
        description="Create a temporary member record for UI review."
        width="wide"
      >
        <AdminDialogForm onSubmit={addMember}>
          <AdminDialogGrid>
            <AdminFormField label="Full Name" wide>
              <input name="name" placeholder="Full name" autoFocus required />
            </AdminFormField>
            <AdminFormField label="Email">
              <input name="email" type="email" placeholder="name@example.com" required />
            </AdminFormField>
            <AdminFormField label="Mobile">
              <input name="mobile" placeholder="+91 ..." />
            </AdminFormField>
            <AdminFormField label="Talent Category">
              <input name="role" placeholder="Actor / Writer / Crew" />
            </AdminFormField>
            <AdminFormField label="City">
              <input name="city" placeholder="Indore" />
            </AdminFormField>
          </AdminDialogGrid>
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel="Add Member" />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Member review"
        title={selected?.name ?? "Member"}
        description={selected ? `${selected.role} · ${selected.city}` : ""}
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
