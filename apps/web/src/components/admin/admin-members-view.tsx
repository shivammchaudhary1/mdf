"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type MemberView, memberView, type TalentRecord } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { mediaUrl } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

type MemberOverview = {
  members: number;
  verified: number;
  newMembers: number;
};

function detailDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function AdminMembersView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.memberFilter);
  const setActive = useAdminDashboardStore((state) => state.setMemberFilter);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [selected, setSelected] = useState<TalentRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [members, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/members?search=${encodeURIComponent(deferredQuery)}${
      active === "Verified" ? "&verified=true" : active === "Unverified" || active === "Needs Review" ? "&verified=false" : ""
    }`,
    memberView,
    true,
    1,
    20,
  );

  const selectedView = useMemo(() => (selected ? memberView(selected) : null), [selected]);

  async function loadOverview() {
    try {
      setOverview(await api<MemberOverview>("/admin/metrics"));
    } catch {
      setOverview(null);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  async function openMember(member: MemberView) {
    setDetailLoading(true);
    try {
      setSelected(await api<TalentRecord>(`/admin/members/${member.id}`));
    } catch (detailError) {
      toast.error(detailError instanceof Error ? detailError.message : "Unable to load member details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleVerify() {
    if (!selectedView) return;

    try {
      await api(`/admin/members/${selectedView.id}`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !selectedView.verified }),
      });
      await Promise.all([refresh(), loadOverview()]);
      toast.success("Verification updated.");
      setSelected(null);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update member.");
    }
  }

  async function toggleSuspended() {
    if (!selectedView) return;

    try {
      await api(`/admin/members/${selectedView.id}`, {
        method: "PATCH",
        body: JSON.stringify({ suspended: !selectedView.suspended }),
      });
      await refresh();
      toast.success(selectedView.suspended ? "Member reactivated." : "Member suspended and sessions revoked.");
      setSelected(null);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update member.");
    }
  }

  const profile = selected?.profile;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Community management"
        title="Members"
        description="Search and manage registered community members using a permanent monthly MDF Member ID."
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
        <AdminSearch value={query} onChange={setQuery} placeholder="Search ID, name, email, phone or category" />
      </section>

      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!members.length}
        emptyText="No members match this filter."
        onRetry={() => void refresh()}
      />

      <article className="ad-card ad-table-card">
        <div className="ad-table ad-members-table ad-members-table-v2">
          <div className="ad-table-head">
            <span>Member ID</span>
            <span>Member</span>
            <span>Category</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Status</span>
            <span></span>
          </div>

          {members.map((member) => (
            <div key={member.id} className="ad-table-row">
              <strong className="ad-member-code-v2">{member.memberCode || "Assigning…"}</strong>

              <div className="ad-person-cell">
                <SiteMedia src={member.image} alt={member.name} kind="team" className="h-10 w-10 shrink-0 rounded-full" />
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.city || "Location not added"}</span>
                </div>
              </div>

              <span>{member.role || "—"}</span>
              <span className="ad-member-contact">{member.email}</span>
              <span className="ad-member-contact">{member.mobile || "—"}</span>

              <div className="ad-member-status">
                {member.suspended ? (
                  <AdminStatus value="Suspended" />
                ) : member.verified ? (
                  <span className="verified">✓ Verified</span>
                ) : (
                  <AdminStatus value="Needs Review" />
                )}
              </div>

              <div className="ad-row-actions">
                <button type="button" disabled={detailLoading} onClick={() => void openMember(member)}>
                  {detailLoading ? "Loading…" : "Edit"}
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
        eyebrow="Member profile"
        title={selected?.name ?? "Member"}
        description={selected ? `${selected.memberCode || "MDF Member"} · Complete account and profile details` : ""}
        width="wide"
      >
        {selected && selectedView && (
          <div className="ad-member-detail-v2">
            <section className="ad-member-detail-hero">
              <SiteMedia src={selectedView.image} alt={selected.name} kind="team" className="h-20 w-20 shrink-0 rounded-2xl" />
              <div>
                <p className="ad-kicker">MDF Member</p>
                <h3>{selected.name}</h3>
                <strong>{selected.memberCode || "Member ID pending"}</strong>
                <span>{selected.email} · {selected.mobile || "No phone"}</span>
              </div>
            </section>

            <section className="ad-member-detail-grid">
              <div><span>Category</span><strong>{profile?.profession || "—"}</strong></div>
              <div><span>City</span><strong>{profile?.city || "—"}</strong></div>
              <div><span>Verification</span><strong>{selected.verified ? "Verified" : "Not verified"}</strong></div>
              <div><span>Account</span><strong>{selected.suspended ? "Suspended" : "Active"}</strong></div>
              <div><span>Auth</span><strong>{selected.authProvider || "—"}</strong></div>
              <div><span>Joined</span><strong>{detailDate(selected.createdAt)}</strong></div>
              <div><span>Last login</span><strong>{detailDate(selected.lastLoginAt)}</strong></div>
              <div><span>Login count</span><strong>{selected.loginCount ?? 0}</strong></div>
              <div><span>Profile</span><strong>{profile?.completion ?? 0}% complete</strong></div>
              <div><span>Profile views</span><strong>{profile?.profileViews ?? 0}</strong></div>
              <div><span>Gender</span><strong>{profile?.gender || "—"}</strong></div>
              <div><span>Date of birth</span><strong>{profile?.birthDate ? detailDate(profile.birthDate) : "—"}</strong></div>
              <div><span>Experience</span><strong>{profile?.experience || "—"}</strong></div>
              <div><span>Availability</span><strong>{profile?.availability || "—"}</strong></div>
              <div><span>Public profile</span><strong>{profile?.publicVisible ? "Visible" : "Private"}</strong></div>
              <div><span>Email alerts</span><strong>{profile?.emailCastingAlerts === false ? "Off" : "On"}</strong></div>
            </section>

            {profile?.bio && (
              <section className="ad-member-detail-section">
                <p className="ad-kicker">Bio</p>
                <p>{profile.bio}</p>
              </section>
            )}

            {(profile?.skills?.length || profile?.languages?.length) && (
              <section className="ad-member-detail-columns">
                <div>
                  <p className="ad-kicker">Skills</p>
                  <div className="ad-member-detail-chips">
                    {(profile.skills ?? []).map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
                <div>
                  <p className="ad-kicker">Languages</p>
                  <div className="ad-member-detail-chips">
                    {(profile.languages ?? []).map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              </section>
            )}

            {profile?.previousWork && (
              <section className="ad-member-detail-section">
                <p className="ad-kicker">Previous work</p>
                <p className="whitespace-pre-wrap">{profile.previousWork}</p>
              </section>
            )}

            {(profile?.showreel || profile?.resume || profile?.socialLinks?.length) && (
              <section className="ad-member-detail-links">
                {profile.showreel && <a href={profile.showreel} target="_blank" rel="noreferrer">Showreel ↗</a>}
                {profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>}
                {(profile.socialLinks ?? []).filter(Boolean).map((link, index) => (
                  <a key={`${link}-${index}`} href={link} target="_blank" rel="noreferrer">Social {index + 1} ↗</a>
                ))}
              </section>
            )}

            {!!profile?.portfolio?.length && (
              <section className="ad-member-detail-section">
                <p className="ad-kicker">Portfolio</p>
                <div className="ad-member-detail-portfolio">
                  {profile.portfolio.slice(0, 8).map((image, index) => (
                    <SiteMedia
                      key={`${image}-${index}`}
                      src={mediaUrl(image)}
                      alt={`${selected.name} portfolio ${index + 1}`}
                      kind="team"
                      className="aspect-square rounded-xl"
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="ad-dialog-actions">
              <button type="button" className="ad-dialog-cancel" onClick={() => setSelected(null)}>Close</button>
              <button type="button" className="ad-dialog-secondary" onClick={toggleSuspended}>
                {selectedView.suspended ? "Reactivate" : "Suspend"}
              </button>
              <button type="button" className="ad-dialog-primary" onClick={toggleVerify}>
                {selectedView.verified ? "Remove Verification" : "Verify Member"}
              </button>
            </div>
          </div>
        )}
      </AdminDialog>
    </div>
  );
}
