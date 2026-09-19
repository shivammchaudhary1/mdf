"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminIcon } from "@/components/admin/admin-icons";

import { useAdminDashboard } from "./use-admin-dashboard";

export function AdminNotifications() {
  const dashboard = useAdminDashboard();
  const notifications = dashboard.recentActivity.map((x, i) => ({
    id: `${x.title}-${x.time}-${i}`,
    title: x.title,
    meta: x.meta,
    time: x.time,
    href: "/admin",
    unread: true,
  }));
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const unreadCount = notifications.filter((item) => item.unread && !readIds.includes(item.id)).length;

  function markAllRead() {
    setReadIds(notifications.map((item) => item.id));
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
                      setReadIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
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
