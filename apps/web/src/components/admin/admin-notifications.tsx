"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/admin-icons";

const notifications = [
  {
    id: "n1",
    title: "3 applications need review",
    meta: "The Last Frame · Lead Actor",
    time: "8m",
    href: "/admin/applications",
    unread: true,
  },
  {
    id: "n2",
    title: "New member awaiting verification",
    meta: "Dev Arora · Editor",
    time: "32m",
    href: "/admin/users",
    unread: true,
  },
  {
    id: "n3",
    title: "Casting closes soon",
    meta: "Assistant Director · Rangmanch",
    time: "1h",
    href: "/admin/casting",
    unread: false,
  },
  {
    id: "n4",
    title: "New contact query",
    meta: "Brand collaboration",
    time: "2h",
    href: "/admin/contacts",
    unread: false,
  },
];

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const unreadCount = notifications.filter(
    (item) => item.unread && !readIds.includes(item.id),
  ).length;

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
          <button
            type="button"
            className="ad-notification-dismiss"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
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
                      setReadIds((ids) =>
                        ids.includes(item.id) ? ids : [...ids, item.id],
                      );
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

            <Link
              href="/admin"
              className="ad-notification-footer"
              onClick={() => setOpen(false)}
            >
              View admin overview
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
