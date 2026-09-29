"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { clearClientSession, refreshSession } from "@/services/auth-session";
import { dateLabel, uploadMedia } from "@/services/workspace";
import { useAppStore } from "@/store/app-store";

type AdminProfileRecord = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "SUPER_ADMIN";
  verified: boolean;
  authProvider: "local" | "google" | "both";
  photoMediaId?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginCount: number;
};

type SessionRecord = {
  id: string;
  remember: boolean;
  deviceLabel?: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};

function AdminSessions() {
  const router = useRouter();
  const toast = useToast();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [confirmCurrent, setConfirmCurrent] = useState<SessionRecord | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setSessions(await api<SessionRecord[]>("/auth/sessions"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load active sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function revoke(session: SessionRecord) {
    if (busyId) return;
    setBusyId(session.id);
    try {
      await api(`/auth/sessions/${session.id}`, { method: "DELETE" });
      if (session.current) {
        clearClientSession();
        toast.info("This device was signed out.");
        router.replace("/login");
        return;
      }
      setSessions((current) => current.filter((item) => item.id !== session.id));
      toast.success("Device signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to revoke session.");
    } finally {
      setBusyId("");
      setConfirmCurrent(null);
    }
  }

  async function logoutAll() {
    if (busyId) return;
    setBusyId("all");
    try {
      await api("/auth/logout-all", { method: "POST" });
      clearClientSession();
      toast.info("All devices have been signed out.");
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out all devices.");
    } finally {
      setBusyId("");
      setConfirmAll(false);
    }
  }

  return (
    <>
      <article className="ad-card ad-profile-sessions">
        <div className="ad-card-head">
          <div>
            <p className="ad-kicker">Security</p>
            <h2>Active Sessions</h2>
          </div>
          <button type="button" className="ad-profile-text-button" disabled={loading} onClick={() => void load()}>
            Refresh
          </button>
        </div>
        <p className="ad-profile-card-copy">Review administrator sessions and sign out devices you no longer recognize.</p>

        {loading ? (
          <div className="ad-profile-session-empty">Loading active sessions…</div>
        ) : sessions.length ? (
          <div className="ad-profile-session-list">
            {sessions.map((session) => (
              <div className="ad-profile-session-row" key={session.id}>
                <div className="ad-profile-session-copy">
                  <div>
                    <strong>{session.deviceLabel || "Signed-in device"}</strong>
                    {session.current && <span>Current device</span>}
                    {session.remember && <i>Remembered</i>}
                  </div>
                  <p>
                    Last active {dateLabel(session.lastSeenAt)} · Expires {dateLabel(session.expiresAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!!busyId}
                  onClick={() => (session.current ? setConfirmCurrent(session) : void revoke(session))}
                >
                  {busyId === session.id ? "Signing out…" : "Sign out"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="ad-profile-session-empty">No active sessions found.</div>
        )}

        <div className="ad-profile-session-footer">
          <span>Sign out all devices if you need to invalidate every administrator session.</span>
          <button type="button" disabled={!!busyId} onClick={() => setConfirmAll(true)}>
            Sign out all devices
          </button>
        </div>
      </article>

      <ConfirmDialog
        open={!!confirmCurrent}
        title="Sign out this device?"
        description="This is your current administrator session. You will be returned to the login page immediately."
        confirmLabel="Sign Out"
        destructive
        loading={!!busyId}
        onCancel={() => setConfirmCurrent(null)}
        onConfirm={() => confirmCurrent && void revoke(confirmCurrent)}
      />
      <ConfirmDialog
        open={confirmAll}
        title="Sign out all devices?"
        description="Every active session for this administrator account will be revoked, including this browser."
        confirmLabel="Sign Out All"
        destructive
        loading={busyId === "all"}
        onCancel={() => setConfirmAll(false)}
        onConfirm={() => void logoutAll()}
      />
    </>
  );
}

export function AdminProfileView() {
  const toast = useToast();
  const account = useAppStore((state) => state.account);
  const profilePhoto = useAppStore((state) => state.profilePhoto);
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AdminProfileRecord | null>(null);
  const [name, setName] = useState(account?.name ?? "");
  const [mobile, setMobile] = useState(account?.mobile ?? "");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [removePhotoOpen, setRemovePhotoOpen] = useState(false);

  function sync(record: AdminProfileRecord) {
    setProfile(record);
    setName(record.name);
    setMobile(record.mobile);
  }

  async function loadProfile() {
    setLoading(true);
    setLoadError("");
    try {
      sync(await api<AdminProfileRecord>("/admin/profile"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load administrator profile.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const cleanName = name.trim();
    const cleanMobile = mobile.trim();
    if (cleanName.length < 2) {
      toast.error("Enter a name with at least 2 characters.");
      return;
    }
    if (cleanMobile && !/^\+?[\d ()-]{7,20}$/.test(cleanMobile)) {
      toast.error("Enter a valid mobile number.");
      return;
    }

    setSaving(true);
    try {
      const updated = await api<AdminProfileRecord>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: cleanName, mobile: cleanMobile }),
      });
      sync(updated);
      await refreshSession();
      toast.success("Administrator profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save administrator profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || photoBusy) return;

    setPhotoBusy(true);
    try {
      const uploaded = await uploadMedia(file, "member-profile");
      const updated = await api<AdminProfileRecord>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ photoMediaId: uploaded.id }),
      });
      sync(updated);
      await refreshSession();
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    if (photoBusy) return;
    setPhotoBusy(true);
    try {
      const updated = await api<AdminProfileRecord>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ photoMediaId: null }),
      });
      sync(updated);
      await refreshSession();
      setRemovePhotoOpen(false);
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove profile photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  const photo = profile?.photo ?? profilePhoto;
  const initials = (profile?.name ?? account?.name ?? "")
    .split(" ")
    .map((value) => value[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Administrator account"
        title="My Profile"
        description="Manage your administrator identity, profile photo, contact details and signed-in devices."
      />

      {loading && !profile ? (
        <div className="ad-empty">Loading administrator profile…</div>
      ) : loadError && !profile ? (
        <div className="ad-profile-load-error">
          <strong>Administrator profile could not be loaded.</strong>
          <span>{loadError}</span>
          <button type="button" className="ad-primary" onClick={() => void loadProfile()}>
            Try Again
          </button>
        </div>
      ) : (
        <section className="ad-profile-layout">
          <div className="ad-form-stack">
            <article className="ad-card">
              <div className="ad-card-head">
                <div>
                  <p className="ad-kicker">Profile photo</p>
                  <h2>Administrator Identity</h2>
                </div>
              </div>
              <div className="ad-profile-photo-row">
                <div className={`ad-profile-photo ${photo ? "has-photo" : ""}`}>
                  {photo ? (
                    <SiteMedia src={photo} alt={`${profile?.name ?? "Administrator"} profile`} kind="team" className="h-full w-full rounded-full" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="ad-profile-photo-copy">
                  <strong>{profile?.name}</strong>
                  <span>Use a clear JPEG, PNG or WebP image up to 10 MB.</span>
                  <div>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(event) => void changePhoto(event)}
                    />
                    <button type="button" className="ad-primary" disabled={photoBusy} onClick={() => fileInput.current?.click()}>
                      {photoBusy ? "Updating…" : photo ? "Change Photo" : "Upload Photo"}
                    </button>
                    {photo && (
                      <button type="button" className="ad-profile-secondary" disabled={photoBusy} onClick={() => setRemovePhotoOpen(true)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <form className="ad-card" onSubmit={save}>
              <div className="ad-card-head">
                <div>
                  <p className="ad-kicker">Account</p>
                  <h2>Personal Details</h2>
                </div>
              </div>
              <div className="ad-form-grid">
                <label className="ad-field">
                  <span>Full Name</span>
                  <input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label className="ad-field">
                  <span>Mobile</span>
                  <input
                    value={mobile}
                    maxLength={24}
                    inputMode="tel"
                    autoComplete="tel"
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="+91 ..."
                  />
                </label>
                <label className="ad-field">
                  <span>Email</span>
                  <input value={profile?.email ?? account?.email ?? ""} disabled />
                  <small>Administrator email remains locked to the verified sign-in identity.</small>
                </label>
                <label className="ad-field">
                  <span>Role</span>
                  <input value="Super Admin" disabled />
                  <small>{profile?.verified ? "Verified administrator account" : "Email verification pending"}</small>
                </label>
              </div>
              <div className="ad-profile-save-row">
                <button
                  type="button"
                  className="ad-profile-secondary"
                  disabled={saving}
                  onClick={() => profile && sync(profile)}
                >
                  Reset Changes
                </button>
                <button type="submit" className="ad-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>

            <AdminSessions />
          </div>

          <aside className="ad-card ad-profile-summary">
            <p className="ad-kicker">Account status</p>
            <h2>Super Admin</h2>
            <p>Your personal administrator profile is private and is only used inside the secured admin workspace.</p>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{profile?.verified ? "Verified" : "Verification pending"}</dd>
              </div>
              <div>
                <dt>Sign-in method</dt>
                <dd>{profile?.authProvider === "google" ? "Google" : profile?.authProvider === "both" ? "Password + Google" : "Password"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile?.email || "—"}</dd>
              </div>
              <div>
                <dt>Mobile</dt>
                <dd>{profile?.mobile || "Not added"}</dd>
              </div>
              <div>
                <dt>Last sign-in</dt>
                <dd>{dateLabel(profile?.lastLoginAt)}</dd>
              </div>
              <div>
                <dt>Successful logins</dt>
                <dd>{profile?.loginCount ?? 0}</dd>
              </div>
              <div>
                <dt>Account created</dt>
                <dd>{dateLabel(profile?.createdAt)}</dd>
              </div>
            </dl>
          </aside>
        </section>
      )}

      <ConfirmDialog
        open={removePhotoOpen}
        title="Remove profile photo?"
        description="Your administrator initials will be shown until you upload another profile photo."
        confirmLabel="Remove Photo"
        destructive
        loading={photoBusy}
        onCancel={() => setRemovePhotoOpen(false)}
        onConfirm={() => void removePhoto()}
      />
    </div>
  );
}
