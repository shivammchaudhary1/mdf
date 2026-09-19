"use client";
import { useState } from "react";

import { AdminCollectionState, AdminPageHeader, AdminStatus } from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { contactView } from "@/services/admin-workspace";
import { api } from "@/services/api";

import { useAdminRecords } from "./use-admin-records";

export function AdminContactsView() {
  const toast = useToast();
  const [contacts, , refresh, meta, setPage, , loading, error] = useAdminRecords("/admin/contacts", contactView, true, 1, 20);
  const [selectedId, setSelectedId] = useState("");
  const selected = contacts.find((x) => x.id === selectedId) ??
    contacts[0] ?? { id: "", name: "", email: "", subject: "", message: "", status: "", received: "" };
  async function resolve() {
    if (!selected.id) return;
    try {
      await api(`/admin/contacts/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status: "Resolved" }) });
      await refresh();
      toast.success("Marked as resolved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update contact.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact Queries"
        description="Review production, casting and collaboration messages submitted from the public website."
      />
      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!contacts.length}
        emptyText="No contact queries yet."
        onRetry={() => void refresh()}
      />
      {contacts.length > 0 && (
        <section className="ad-inbox">
          <div className="ad-inbox-list">
            {contacts.map((i) => (
              <button type="button" key={i.id} onClick={() => setSelectedId(i.id)} className={selected.id === i.id ? "active" : ""}>
                <div>
                  <strong>{i.name}</strong>
                  <span>{i.subject}</span>
                </div>
                <time>{i.received}</time>
                <AdminStatus value={i.status} />
              </button>
            ))}
          </div>
          <article className="ad-inbox-message">
            <div className="ad-inbox-message-head">
              <div>
                <p className="ad-kicker">{selected.status}</p>
                <h2>{selected.subject}</h2>
                <span>
                  {selected.name} · {selected.email}
                </span>
              </div>
              <AdminStatus value={selected.status} />
            </div>
            <p>{selected.message}</p>
            <div className="ad-inbox-actions">
              <button onClick={() => toast.info("Email replies are not configured yet.")}>Reply</button>
              <button onClick={resolve}>Mark Resolved</button>
            </div>
          </article>
        </section>
      )}
      <PaginationControls meta={meta} onPage={setPage} />
    </div>
  );
}
