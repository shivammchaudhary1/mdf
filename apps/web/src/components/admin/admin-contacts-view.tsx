"use client";

import { useState } from "react";

import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { contactView } from "@/services/admin-workspace";
import { api } from "@/services/api";

import { useAdminRecords } from "./use-admin-records";

export function AdminContactsView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const params = new URLSearchParams();
  if (status !== "All") params.set("status", status);
  if (query.trim()) params.set("search", query.trim());

  const [contacts, , refresh, meta, setPage, , loading, error] = useAdminRecords(
    `/admin/contacts${params.toString() ? `?${params}` : ""}`,
    contactView,
    true,
    1,
    20,
  );

  const [selectedId, setSelectedId] = useState("");
  const selected = contacts.find((item) => item.id === selectedId) ??
    contacts[0] ?? { id: "", name: "", email: "", subject: "", message: "", status: "", received: "" };

  async function updateStatus(nextStatus: string) {
    if (!selected.id) return;
    try {
      await api(`/admin/contacts/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      await refresh();
      toast.success(`Contact marked ${nextStatus.toLowerCase()}.`);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update contact.");
    }
  }

  function reply() {
    if (!selected.id) return;
    const subject = encodeURIComponent(`Re: ${selected.subject}`);
    const body = encodeURIComponent(`Hi ${selected.name},\n\n`);
    window.location.href = `mailto:${selected.email}?subject=${subject}&body=${body}`;
    void updateStatus("Replied");
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact Queries"
        description="Search, triage and reply to public enquiries without leaving misleading dead controls."
      />

      <section className="ad-toolbar">
        <AdminFilters values={["All", "New", "Open", "Replied", "Resolved", "Spam"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search name, email or subject" />
      </section>

      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!contacts.length}
        emptyText="No contact queries match this filter."
        onRetry={() => void refresh()}
      />

      {contacts.length > 0 && (
        <section className="ad-inbox">
          <div className="ad-inbox-list">
            {contacts.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={selected.id === item.id ? "active" : ""}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.subject}</span>
                </div>
                <time>{item.received}</time>
                <AdminStatus value={item.status} />
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
              <button onClick={reply}>Reply by Email</button>
              <button onClick={() => void updateStatus("Open")}>Mark Open</button>
              <button onClick={() => void updateStatus("Resolved")}>Resolve</button>
              <button onClick={() => void updateStatus("Spam")}>Spam</button>
            </div>
          </article>
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />
    </div>
  );
}
