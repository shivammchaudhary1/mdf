"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type ContactRecord, contactView } from "@/services/admin-workspace";
import { api } from "@/services/api";

import { useAdminRecords } from "./use-admin-records";

type ContactView = ReturnType<typeof contactView>;
type ContactSummary = {
  total: number;
  new: number;
  open: number;
  resolved: number;
};

export function AdminContactsView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (deferredQuery) params.set("search", deferredQuery);
    const value = params.toString();
    return `/admin/contacts${value ? `?${value}` : ""}`;
  }, [status, deferredQuery]);

  const [contacts, setContacts, refresh, meta, setPage, , loading, error] = useAdminRecords(
    path,
    contactView,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<ContactSummary | null>(null);
  const [selected, setSelected] = useState<ContactRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactView | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<ContactSummary>("/admin/contacts/summary"));
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  async function openQuery(id: string) {
    setDetailLoading(true);

    try {
      setSelected(await api<ContactRecord>(`/admin/contacts/${id}`));
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Unable to load contact query.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(nextStatus: string) {
    if (!selected || statusBusy) return;
    setStatusBusy(true);

    try {
      const updated = await api<ContactRecord>(`/admin/contacts/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setSelected(updated);
      setContacts((current) =>
        current.map((item) =>
          item.id === updated._id
            ? {
                ...item,
                status: updated.status,
              }
            : item,
        ),
      );

      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success(`Contact marked ${nextStatus.toLowerCase()}.`);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update contact.");
    } finally {
      setStatusBusy(false);
    }
  }

  function replyByEmail() {
    if (!selected) return;

    const subject = encodeURIComponent(`Re: ${selected.subject}`);
    const body = encodeURIComponent(`Hi ${selected.name},\n\n`);
    window.location.href = `mailto:${selected.email}?subject=${subject}&body=${body}`;
  }

  async function deleteQuery() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);

    try {
      await api(`/admin/contacts/${deleteTarget.id}`, { method: "DELETE" });
      if (selected?._id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);

      await Promise.allSettled([refresh(), loadSummary()]);
      toast.success("Contact query deleted.");
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to delete contact query.");
    } finally {
      setDeleting(false);
    }
  }

  const noResults = !loading && !error && contacts.length === 0;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact Queries"
        description="Review public enquiries, keep their status organised and reply using the contact information submitted by the visitor."
      />

      <section className="ad-inbox-overview-v2">
        <div><span>Total queries</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>New</span><strong>{summary?.new ?? "—"}</strong></div>
        <div><span>Open</span><strong>{summary?.open ?? "—"}</strong></div>
        <div><span>Resolved</span><strong>{summary?.resolved ?? "—"}</strong></div>
      </section>

      <section className="ad-inbox-how-v2">
        <div><b>1</b><span><strong>Review</strong>Open the full message and sender details.</span></div>
        <div><b>2</b><span><strong>Respond</strong>Reply by email, then mark the query Replied.</span></div>
        <div><b>3</b><span><strong>Close the loop</strong>Resolve completed enquiries or flag spam.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "New", "Open", "Replied", "Resolved", "Spam"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search name, email, subject or message" />
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-inbox-empty-v2">
          <div className="ad-inbox-empty-icon">✉</div>
          <p className="ad-kicker">{query || status !== "All" ? "No results" : "Inbox clear"}</p>
          <h2>{query || status !== "All" ? "No contact queries match these filters." : "No contact queries yet."}</h2>
          <p>
            {query || status !== "All"
              ? "Clear the current search or status filter and try again."
              : "New website enquiries will appear here automatically after visitors submit the public Contact form."}
          </p>
          {(query || status !== "All") && (
            <button
              type="button"
              className="ad-dialog-secondary"
              onClick={() => {
                setQuery("");
                setStatus("All");
              }}
            >
              Clear Filters
            </button>
          )}
        </section>
      )}

      {!!contacts.length && (
        <section className="ad-inbox-grid-v2">
          {contacts.map((item) => (
            <article className="ad-inbox-card-v2" key={item.id}>
              <div className="ad-inbox-card-head-v2">
                <div>
                  <p className="ad-kicker">Contact query</p>
                  <h2>{item.subject}</h2>
                </div>
                <AdminStatus value={item.status} />
              </div>

              <div className="ad-inbox-sender-v2">
                <strong>{item.name}</strong>
                <span>{item.email}</span>
              </div>

              <p className="ad-inbox-preview-v2">{item.message}</p>

              <div className="ad-inbox-card-footer-v2">
                <time>{item.received}</time>
                <div>
                  <button type="button" disabled={detailLoading} onClick={() => void openQuery(item.id)}>
                    {detailLoading ? "Loading…" : "View Query"}
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(item)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={!!selected}
        onClose={() => {
          if (!statusBusy) setSelected(null);
        }}
        eyebrow="Contact query"
        title={selected?.subject ?? "Query"}
        description={selected ? `${selected.name} · ${selected.email}` : ""}
        width="wide"
      >
        {selected && (
          <div className="ad-contact-detail-v2">
            <section className="ad-contact-detail-head-v2">
              <div>
                <span>From</span>
                <strong>{selected.name}</strong>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <div>
                <span>Status</span>
                <AdminStatus value={selected.status} />
              </div>
              <div>
                <span>Received</span>
                <strong>{new Date(selected.createdAt).toLocaleString("en-IN")}</strong>
              </div>
            </section>

            <section className="ad-contact-message-v2">
              <p className="ad-kicker">Message</p>
              <p>{selected.message}</p>
            </section>

            <section className="ad-contact-workflow-v2">
              <div>
                <p className="ad-kicker">Workflow</p>
                <h3>Update query status</h3>
                <span>Opening the mail app does not automatically mark the query as replied.</span>
              </div>

              <div className="ad-contact-status-actions-v2">
                {["Open", "Replied", "Resolved", "Spam"].map((value) => (
                  <button
                    type="button"
                    key={value}
                    disabled={statusBusy || selected.status === value}
                    className={selected.status === value ? "active" : ""}
                    onClick={() => void updateStatus(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>

            <div className="ad-contact-detail-actions-v2">
              <button type="button" className="ad-dialog-cancel" onClick={() => setSelected(null)}>Close</button>
              <button type="button" className="ad-dialog-secondary" onClick={() => setDeleteTarget(contactView(selected))}>Delete Query</button>
              <button type="button" className="ad-dialog-primary" onClick={replyByEmail}>Reply by Email</button>
            </div>
          </div>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this contact query?"
        description={deleteTarget ? `"${deleteTarget.subject}" will be permanently deleted from the admin inbox.` : undefined}
        confirmLabel="Delete Query"
        destructive
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteQuery()}
      />
    </div>
  );
}
