"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-shared";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel, fetchPage, type PageMeta } from "@/services/workspace";

import {
  leadLabel,
  type LeadOptions,
  type LeadPriority,
  type LeadRecord,
  type LeadStatus,
  localDateTime,
  money,
} from "./admin-leads-view";

type LeadActivity = {
  _id: string;
  leadId: string;
  type: string;
  actorId: string;
  actorName: string;
  note?: string;
  callOutcome?: string;
  followUpAt?: string;
  fromStatus?: LeadStatus;
  toStatus?: LeadStatus;
  createdAt: string;
};

type EditForm = {
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  website: string;
  city: string;
  services: string[];
  source: string;
  sourceOther: string;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue: string;
  convertedValue: string;
  assignedTo: string;
  nextFollowUpAt: string;
  lostReason: string;
};

function formFromLead(lead: LeadRecord): EditForm {
  return {
    companyName: lead.companyName,
    contactPerson: lead.contactPerson ?? "",
    mobile: lead.mobile ?? "",
    email: lead.email ?? "",
    website: lead.website ?? "",
    city: lead.city ?? "",
    services: lead.services ?? [],
    source: lead.source,
    sourceOther: "",
    status: lead.status,
    priority: lead.priority,
    estimatedValue: lead.estimatedValue === undefined ? "" : String(lead.estimatedValue),
    convertedValue: lead.convertedValue === undefined ? "" : String(lead.convertedValue),
    assignedTo: lead.assignedTo ?? "",
    nextFollowUpAt: localDateTime(lead.nextFollowUpAt),
    lostReason: lead.lostReason ?? "",
  };
}

function isoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function AdminLeadDetailView({ leadId }: { leadId: string }) {
  const toast = useToast();
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [options, setOptions] = useState<LeadOptions | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicates, setDuplicates] = useState<LeadRecord[]>([]);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [activityMeta, setActivityMeta] = useState<PageMeta | undefined>();
  const [activityPage, setActivityPage] = useState(1);
  const [activityType, setActivityType] = useState("CALL");
  const [activityNote, setActivityNote] = useState("");
  const [callOutcome, setCallOutcome] = useState("Connected");
  const [callOutcomeOther, setCallOutcomeOther] = useState("");
  const [activityFollowUp, setActivityFollowUp] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);
  const [serviceChoice, setServiceChoice] = useState("");
  const [serviceOther, setServiceOther] = useState("");

  const loadLead = useCallback(async () => {
    const record = await api<LeadRecord>(`/admin/leads/${leadId}`);
    setLead(record);
    setForm(formFromLead(record));
  }, [leadId]);

  const loadOptions = useCallback(async () => {
    setOptions(await api<LeadOptions>("/admin/leads/options"));
  }, []);

  const loadActivities = useCallback(async () => {
    const page = await fetchPage<LeadActivity>(`/admin/leads/${leadId}/activities`, activityPage, 10, true);
    setActivities(page.items);
    setActivityMeta(page.meta);
  }, [leadId, activityPage]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([loadLead(), loadOptions()])
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load lead.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadLead, loadOptions, toast]);

  useEffect(() => {
    void loadActivities().catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load lead activity."));
  }, [loadActivities, toast]);

  useEffect(() => {
    if (!serviceChoice && options?.services?.length) setServiceChoice(options.services.find((value) => value !== "Other") ?? options.services[0]);
  }, [options, serviceChoice]);

  if (loading && !lead) return <div className="ad-empty">Loading lead…</div>;
  if (!lead || !form) return <div className="ad-empty">Lead not found.</div>;

  const update = <K extends keyof EditForm>(key: K, value: EditForm[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));
  const assignee = options?.assignees.find((admin) => admin.id === lead.assignedTo);

  async function checkDuplicates(currentForm: EditForm) {
    const params = new URLSearchParams({ excludeId: leadId });
    if (currentForm.mobile.trim()) params.set("mobile", currentForm.mobile.trim());
    if (currentForm.email.trim()) params.set("email", currentForm.email.trim());
    if (!currentForm.mobile.trim() && !currentForm.email.trim()) return [];
    return (await api<{ items: LeadRecord[] }>(`/admin/leads/duplicates?${params.toString()}`)).items;
  }

  async function save(force = false) {
    if (saving) return;
    const currentForm = form;
    if (!currentForm) return;
    if (!currentForm.mobile.trim() && !currentForm.email.trim()) {
      toast.error("Keep at least a mobile number or email address.");
      return;
    }
    setSaving(true);
    try {
      if (!force) {
        const matches = await checkDuplicates(currentForm);
        if (matches.length) {
          setDuplicates(matches);
          return;
        }
      }

      const source = currentForm.source === "Other" ? currentForm.sourceOther.trim() || "Other" : currentForm.source;
      const updated = await api<LeadRecord>(`/admin/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({
          companyName: currentForm.companyName.trim(),
          contactPerson: currentForm.contactPerson.trim(),
          mobile: currentForm.mobile.trim() || null,
          email: currentForm.email.trim() || null,
          website: currentForm.website.trim() || null,
          city: currentForm.city.trim() || null,
          services: currentForm.services,
          source,
          status: currentForm.status,
          priority: currentForm.priority,
          estimatedValue: currentForm.estimatedValue ? Number(currentForm.estimatedValue) : null,
          convertedValue: currentForm.convertedValue ? Number(currentForm.convertedValue) : null,
          assignedTo: currentForm.assignedTo || null,
          nextFollowUpAt: isoOrNull(currentForm.nextFollowUpAt),
          lostReason: currentForm.status === "LOST" ? currentForm.lostReason.trim() : null,
        }),
      });
      setLead(updated);
      setForm(formFromLead(updated));
      setDuplicates([]);
      setActivityPage(1);
      await Promise.all([loadActivities(), loadOptions()]);
      toast.success("Lead updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update lead.");
    } finally {
      setSaving(false);
    }
  }

  function addService() {
    const currentForm = form;
    if (!currentForm) return;
    const value = serviceChoice === "Other" ? serviceOther.trim() : serviceChoice.trim();
    if (!value || currentForm.services.includes(value)) return;
    update("services", [...currentForm.services, value]);
    if (serviceChoice === "Other") setServiceOther("");
  }

  async function addActivity() {
    if (activitySaving) return;
    setActivitySaving(true);
    try {
      const outcome = callOutcome === "Other" ? callOutcomeOther.trim() : callOutcome;
      await api(`/admin/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify({
          type: activityType,
          note: activityNote.trim() || undefined,
          callOutcome: activityType === "CALL" ? outcome : undefined,
          followUpAt: activityFollowUp ? new Date(activityFollowUp).toISOString() : undefined,
        }),
      });
      setActivityNote("");
      setActivityFollowUp("");
      setCallOutcomeOther("");
      setActivityPage(1);
      await Promise.all([loadLead(), loadActivities(), loadOptions()]);
      toast.success("Activity added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add activity.");
    } finally {
      setActivitySaving(false);
    }
  }

  async function archive() {
    try {
      const updated = await api<LeadRecord>(`/admin/leads/${leadId}`, { method: "DELETE" });
      setLead(updated);
      setForm(formFromLead(updated));
      setArchiveConfirm(false);
      toast.success("Lead archived.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to archive lead.");
    }
  }

  async function restore() {
    try {
      const updated = await api<LeadRecord>(`/admin/leads/${leadId}/restore`, { method: "POST" });
      setLead(updated);
      setForm(formFromLead(updated));
      toast.success("Lead restored.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to restore lead.");
    }
  }

  const sourceOptions = options?.sources ?? ["Cold Call", "WhatsApp", "Website", "Referral", "Other"];
  const currentSourceKnown = sourceOptions.includes(form.source);
  const sourceSelectValue = currentSourceKnown ? form.source : "Other";

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Lead workspace"
        title={lead.companyName}
        description={`${lead.contactPerson || "No contact person"} · ${lead.mobile || lead.email || "No contact details"}`}
        action={
          <div className="ad-lead-header-actions">
            <Link href="/admin/leads" className="ad-profile-secondary">← Leads</Link>
            {lead.archived ? (
              <button type="button" className="ad-primary" onClick={() => void restore()}>Restore Lead</button>
            ) : (
              <button type="button" className="ad-lead-archive-button" onClick={() => setArchiveConfirm(true)}>Archive</button>
            )}
          </div>
        }
      />

      <section className="ad-lead-detail-metrics">
        <article><span>Status</span><strong className={`ad-lead-status is-${lead.status.toLowerCase()}`}>{leadLabel(lead.status)}</strong></article>
        <article><span>Priority</span><strong>{leadLabel(lead.priority)}</strong></article>
        <article><span>Estimated</span><strong>{money(lead.estimatedValue)}</strong></article>
        <article><span>Converted</span><strong>{money(lead.convertedValue)}</strong></article>
        <article><span>Owner</span><strong>{assignee?.name || "Unassigned"}</strong></article>
        <article><span>Next follow-up</span><strong>{lead.nextFollowUpAt ? dateLabel(lead.nextFollowUpAt) : "Not scheduled"}</strong></article>
      </section>

      {duplicates.length > 0 && (
        <section className="ad-lead-duplicate-warning">
          <strong>Possible duplicate contact details</strong>
          <span>One or more active leads use the same phone/email. Review them before saving.</span>
          <div>
            {duplicates.map((item) => <Link key={item._id} href={`/admin/leads/${item._id}`}>{item.companyName}</Link>)}
          </div>
          <div className="ad-lead-warning-actions">
            <button type="button" onClick={() => setDuplicates([])}>Cancel</button>
            <button type="button" disabled={saving} onClick={() => void save(true)}>Save Anyway</button>
          </div>
        </section>
      )}

      <section className="ad-lead-detail-layout">
        <form
          className="ad-card ad-lead-edit-card"
          onSubmit={(event) => {
            event.preventDefault();
            void save(false);
          }}
        >
          <div className="ad-card-head">
            <div><p className="ad-kicker">Lead record</p><h2>Details & Pipeline</h2></div>
            <span>Updated {dateLabel(lead.updatedAt)}</span>
          </div>

          <div className="ad-lead-form-grid">
            <label className="ad-lead-field"><span>Company / Client *</span><input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Contact Person</span><input value={form.contactPerson} onChange={(event) => update("contactPerson", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Mobile</span><input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Email</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Website</span><input type="url" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
            <label className="ad-lead-field"><span>City</span><input value={form.city} onChange={(event) => update("city", event.target.value)} /></label>

            <div className="ad-lead-field ad-lead-field-wide">
              <span>Services / Interest</span>
              <div className="ad-lead-service-add">
                <select value={serviceChoice} onChange={(event) => setServiceChoice(event.target.value)}>
                  {(options?.services ?? []).map((value) => <option key={value}>{value}</option>)}
                </select>
                {serviceChoice === "Other" && <input value={serviceOther} onChange={(event) => setServiceOther(event.target.value)} placeholder="Custom service" />}
                <button type="button" onClick={addService}>Add</button>
              </div>
              <div className="ad-lead-chips">
                {form.services.map((service) => (
                  <button key={service} type="button" onClick={() => update("services", form.services.filter((value) => value !== service))}>{service} ×</button>
                ))}
              </div>
            </div>

            <label className="ad-lead-field">
              <span>Source</span>
              <select
                value={sourceSelectValue}
                onChange={(event) => {
                  update("source", event.target.value);
                  if (event.target.value !== "Other") update("sourceOther", "");
                }}
              >
                {sourceOptions.map((value) => <option key={value}>{value}</option>)}
              </select>
              {sourceSelectValue === "Other" && (
                <input
                  value={currentSourceKnown ? form.sourceOther : form.source}
                  onChange={(event) => update("sourceOther", event.target.value)}
                  placeholder="Custom source"
                />
              )}
            </label>

            <label className="ad-lead-field">
              <span>Status</span>
              <select value={form.status} onChange={(event) => update("status", event.target.value as LeadStatus)}>
                {(options?.statuses ?? []).map((value) => <option key={value} value={value}>{leadLabel(value)}</option>)}
              </select>
            </label>

            <label className="ad-lead-field">
              <span>Priority</span>
              <select value={form.priority} onChange={(event) => update("priority", event.target.value as LeadPriority)}>
                {(options?.priorities ?? []).map((value) => <option key={value} value={value}>{leadLabel(value)}</option>)}
              </select>
            </label>

            <label className="ad-lead-field">
              <span>Assigned To</span>
              <select value={form.assignedTo} onChange={(event) => update("assignedTo", event.target.value)}>
                <option value="">Unassigned</option>
                {(options?.assignees ?? []).map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
              </select>
            </label>

            <label className="ad-lead-field"><span>Estimated Value (₹)</span><input type="number" min="0" value={form.estimatedValue} onChange={(event) => update("estimatedValue", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Converted Value (₹)</span><input type="number" min="0" value={form.convertedValue} onChange={(event) => update("convertedValue", event.target.value)} /></label>
            <label className="ad-lead-field"><span>Next Follow-up</span><input type="datetime-local" value={form.nextFollowUpAt} onChange={(event) => update("nextFollowUpAt", event.target.value)} /></label>

            {form.status === "LOST" && (
              <label className="ad-lead-field ad-lead-field-wide"><span>Lost Reason *</span><textarea value={form.lostReason} onChange={(event) => update("lostReason", event.target.value)} required /></label>
            )}
          </div>

          <div className="ad-lead-save-row">
            <button type="button" className="ad-profile-secondary" onClick={() => setForm(formFromLead(lead))}>Reset Changes</button>
            <button type="submit" className="ad-primary" disabled={saving || lead.archived}>{saving ? "Saving…" : "Save Lead"}</button>
          </div>
        </form>

        <aside className="ad-card ad-lead-contact-card">
          <p className="ad-kicker">Quick contact</p>
          <h2>{lead.contactPerson || lead.companyName}</h2>
          <dl>
            <div><dt>Phone</dt><dd>{lead.mobile || "—"}</dd></div>
            <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
            <div><dt>City</dt><dd>{lead.city || "—"}</dd></div>
            <div><dt>Source</dt><dd>{lead.source}</dd></div>
            <div><dt>Last contacted</dt><dd>{lead.lastContactedAt ? dateLabel(lead.lastContactedAt) : "Never"}</dd></div>
            <div><dt>Created</dt><dd>{dateLabel(lead.createdAt)}</dd></div>
          </dl>
          <div className="ad-lead-contact-actions">
            {lead.mobile && <a href={`tel:${lead.mobile}`}>Call</a>}
            {lead.mobile && <a href={`https://wa.me/${lead.mobile.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            {lead.email && <a href={`mailto:${lead.email}`}>Email</a>}
            {lead.website && <a href={lead.website} target="_blank" rel="noreferrer">Website ↗</a>}
          </div>
        </aside>
      </section>

      <section className="ad-lead-activity-layout">
        <article className="ad-card">
          <div className="ad-card-head">
            <div><p className="ad-kicker">Log activity</p><h2>Next Action</h2></div>
          </div>
          <div className="ad-lead-activity-form">
            <label className="ad-lead-field">
              <span>Activity Type</span>
              <select value={activityType} onChange={(event) => setActivityType(event.target.value)}>
                {(options?.activityTypes ?? []).filter((value) => value !== "STATUS_CHANGE").map((value) => <option key={value} value={value}>{leadLabel(value)}</option>)}
              </select>
            </label>

            {activityType === "CALL" && (
              <label className="ad-lead-field">
                <span>Call Outcome</span>
                <select value={callOutcome} onChange={(event) => setCallOutcome(event.target.value)}>
                  {(options?.callOutcomes ?? []).map((value) => <option key={value}>{value}</option>)}
                </select>
                {callOutcome === "Other" && <input value={callOutcomeOther} onChange={(event) => setCallOutcomeOther(event.target.value)} placeholder="Custom outcome" />}
              </label>
            )}

            <label className="ad-lead-field">
              <span>Follow-up Date / Time</span>
              <input type="datetime-local" value={activityFollowUp} onChange={(event) => setActivityFollowUp(event.target.value)} />
            </label>

            <label className="ad-lead-field ad-lead-field-wide">
              <span>Note</span>
              <textarea value={activityNote} maxLength={5000} onChange={(event) => setActivityNote(event.target.value)} placeholder="Conversation notes, requirement, next step…" />
            </label>

            <button type="button" className="ad-primary" disabled={activitySaving || lead.archived} onClick={() => void addActivity()}>
              {activitySaving ? "Saving…" : "Add Activity"}
            </button>
          </div>
        </article>

        <article className="ad-card">
          <div className="ad-card-head">
            <div><p className="ad-kicker">History</p><h2>Activity Timeline</h2></div>
            <span>{activityMeta?.total ?? activities.length} entries</span>
          </div>

          <div className="ad-lead-timeline">
            {activities.length ? (
              activities.map((activity) => (
                <div key={activity._id} className="ad-lead-timeline-item">
                  <i />
                  <div>
                    <div className="ad-lead-timeline-head">
                      <strong>{leadLabel(activity.type)}</strong>
                      <time>{new Date(activity.createdAt).toLocaleString("en-IN")}</time>
                    </div>
                    <span>by {activity.actorName}</span>
                    {activity.callOutcome && <b>Outcome: {activity.callOutcome}</b>}
                    {activity.fromStatus && activity.toStatus && <b>{leadLabel(activity.fromStatus)} → {leadLabel(activity.toStatus)}</b>}
                    {activity.note && <p>{activity.note}</p>}
                    {activity.followUpAt && <small>Follow-up: {new Date(activity.followUpAt).toLocaleString("en-IN")}</small>}
                  </div>
                </div>
              ))
            ) : (
              <div className="ad-empty">No activity logged yet.</div>
            )}
          </div>
          <PaginationControls meta={activityMeta} onPage={setActivityPage} compact />
        </article>
      </section>

      <ConfirmDialog
        open={archiveConfirm}
        title="Archive this lead?"
        description="The lead will leave the active pipeline but its details and complete activity history will be retained."
        confirmLabel="Archive Lead"
        destructive
        onCancel={() => setArchiveConfirm(false)}
        onConfirm={() => void archive()}
      />
    </div>
  );
}
