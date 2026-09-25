"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { clearClientSession } from "@/services/auth-session";
import { dateLabel } from "@/services/workspace";

type SessionRecord = {
  id: string;
  remember: boolean;
  deviceLabel?: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};

export function MemberSessions() {
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
      <article className="md-card md-session-card">
        <div className="md-card-head">
          <div>
            <p className="md-kicker">Security</p>
            <h2>Active Sessions</h2>
          </div>
          <button className="md-session-refresh" type="button" disabled={loading} onClick={() => void load()}>
            Refresh
          </button>
        </div>

        <p className="md-session-intro">Review devices currently signed in to your account and revoke access you no longer recognize.</p>

        {loading ? (
          <div className="md-session-empty">Loading active sessions…</div>
        ) : sessions.length ? (
          <div className="md-session-list">
            {sessions.map((session) => (
              <div className="md-session-row" key={session.id}>
                <div className="md-session-device" aria-hidden="true">
                  {session.deviceLabel?.toLowerCase().includes("mobile") ||
                  session.deviceLabel?.toLowerCase().includes("iphone") ||
                  session.deviceLabel?.toLowerCase().includes("android")
                    ? "▯"
                    : "▰"}
                </div>
                <div className="md-session-copy">
                  <div className="md-session-title">
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
                  className={session.current ? "md-session-current-action" : "md-session-action"}
                  disabled={!!busyId}
                  onClick={() => (session.current ? setConfirmCurrent(session) : void revoke(session))}
                >
                  {busyId === session.id ? "Signing out…" : "Sign out"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="md-session-empty">No active sessions found.</div>
        )}

        <div className="md-session-footer">
          <span>Signing out all devices will also sign out this browser.</span>
          <button type="button" disabled={!!busyId} onClick={() => setConfirmAll(true)}>
            Sign out all devices
          </button>
        </div>
      </article>

      <ConfirmDialog
        open={!!confirmCurrent}
        title="Sign out this device?"
        description="This is your current session. You will be returned to the login page immediately."
        confirmLabel="Sign Out"
        destructive
        loading={!!busyId}
        onCancel={() => setConfirmCurrent(null)}
        onConfirm={() => confirmCurrent && void revoke(confirmCurrent)}
      />

      <ConfirmDialog
        open={confirmAll}
        title="Sign out all devices?"
        description="Every active session for this account will be revoked, including this browser."
        confirmLabel="Sign Out All"
        destructive
        loading={busyId === "all"}
        onCancel={() => setConfirmAll(false)}
        onConfirm={() => void logoutAll()}
      />
    </>
  );
}
