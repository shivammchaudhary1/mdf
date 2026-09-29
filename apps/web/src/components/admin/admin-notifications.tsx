"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminIcon } from "@/components/admin/admin-icons";

import { useAdminDashboard } from "./use-admin-dashboard";

export function AdminNotifications({ accountId }: { accountId: string }) {
  const dashboard = useAdminDashboard();
  const notifications = dashboard.recentActivity.map((x) => ({
    id: x.id,
    title: x.title,
    meta: x.meta,
    time: x.time,
    href: "/admin",
    unread: true,
  }));
  const storageKey = `mdadu:admin-notifications-read:${accountId}`;
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [readStateReady, setReadStateReady] = useState(false);

  useEffect(() => {
    setReadStateReady(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      setReadIds(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string").slice(-250) : []);
    } catch {
      setReadIds([]);
    } finally {
      setReadStateReady(true);
    }
  }, [storageKey]);

  function rememberRead(ids: string[]) {
    const next = [...new Set(ids)].slice(-250);
    setReadIds(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Reading a notification should still work when browser storage is unavailable.
    }
  }

  const unreadCount = readStateReady
    ? notifications.filter((item) => item.unread && !readIds.includes(item.id)).length
    : 0;

  function markAllRead() {
    rememberRead([...readIds, ...notifications.map((item) => item.id)]);
  }

  return (
    <div className="ad-notification-wrap">
      <button
        type="button"
        className="ad-icon-button ad-notification-trigger"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <AdminIcon name="bell" />
        {unreadCount > 0 && <span className="ad-notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <>
          <button type="button" className="ad-notification-dismiss" aria-label="Close notifications" onClick={() => setOpen(false)} />
          <div className="ad-notification-popover">
            <div className="ad-notification-head">
              <div>
                <p className="ad-kicker">Updates</p>
                <h3>Notifications</h3>
              </div>
              <button type="button" onClick={markAllRead}>
                Mark all read
              </button>
            </div>

            <div className="ad-notification-list">
              {notifications.map((item) => {
                const unread = item.unread && !readIds.includes(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={unread ? "unread" : ""}
                    onClick={() => {
                      if (!readIds.includes(item.id)) rememberRead([...readIds, item.id]);
                      setOpen(false);
                    }}
                  >
                    <span className="ad-notification-dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.meta}</p>
                    </div>
                    <time>{item.time}</time>
                  </Link>
                );
              })}
            </div>

            <Link href="/admin" className="ad-notification-footer" onClick={() => setOpen(false)}>
              View admin overview
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
