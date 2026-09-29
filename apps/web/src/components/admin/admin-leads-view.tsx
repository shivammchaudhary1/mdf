"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminIcon } from "@/components/admin/admin-icons";
import { AdminCollectionState, AdminPageHeader, AdminSearch } from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "CONVERTED"
  | "LOST"
  | "ON_HOLD";

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type LeadRecord = {
  _id: string;
  companyName: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  website?: string;
  city?: string;
  services?: string[];
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue?: number;
  convertedValue?: number;
  assignedTo?: string;
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  lostReason?: string;
  convertedAt?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadOptions = {
  statuses: LeadStatus[];
  priorities: LeadPriority[];
  sources: string[];
  services: string[];
  callOutcomes: string[];
  activityTypes: string[];
  assignees: Array<{ id: string; name: string; email: string }>;
};

type LeadSummary = {
  total: number;
  new: number;
  converted: number;
  followUpsToday: number;
  overdue: number;
  conversionRate: number;
  pipelineValue: number;
  convertedValue: number;
  statuses: Record<string, number>;
};

type LeadForm = {
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

const emptyForm: LeadForm = {
  companyName: "",
  contactPerson: "",
  mobile: "",
  email: "",
  website: "",
  city: "",
  services: [],
  source: "Cold Call",
  sourceOther: "",
  status: "NEW",
  priority: "MEDIUM",
  estimatedValue: "",
  convertedValue: "",
  assignedTo: "",
  nextFollowUpAt: "",
  lostReason: "",
};

const identityLead = (lead: LeadRecord) => lead;

export function leadLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function money(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function isoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function SelectOther({
  label,
  value,
  customValue,
  options,
  onValue,
  onCustom,
}: {
  label: string;
  value: string;
  customValue: string;
  options: string[];
  onValue: (value: string) => void;
  onCustom: (value: string) => void;
}) {
  return (
    <label className="ad-lead-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onValue(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {value === "Other" && (
        <input value={customValue} onChange={(event) => onCustom(event.target.value)} placeholder={`Enter another ${label.toLowerCase()}`} />
      )}
    </label>
  );
}

function ServicesPicker({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [choice, setChoice] = useState(options.find((option) => option !== "Other") ?? "");
  const [other, setOther] = useState("");

  useEffect(() => {
    if (!choice && options.length) setChoice(options.find((option) => option !== "Other") ?? options[0]);
  }, [options, choice]);

  function add() {
    const value = choice === "Other" ? other.trim() : choice.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    if (choice === "Other") setOther("");
  }

  return (
    <div className="ad-lead-field ad-lead-field-wide">
      <span>Services / Interest</span>
      <div className="ad-lead-service-add">
        <select value={choice} onChange={(event) => setChoice(event.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        {choice === "Other" && <input value={other} onChange={(event) => setOther(event.target.value)} placeholder="Custom service" />}
        <button type="button" onClick={add}>
          Add
        </button>
      </div>
      <div className="ad-lead-chips">
        {values.length ? (
          values.map((service) => (
            <button key={service} type="button" onClick={() => onChange(values.filter((value) => value !== service))}>
              {service} ×
            </button>
          ))
        ) : (
          <small>No services selected yet.</small>
        )}
      </div>
    </div>
  );
}

function AddLeadDialog({
  open,
  options,
  onClose,
  onCreated,
  onOptionsRefresh,
}: {
  open: boolean;
  options: LeadOptions | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
  onOptionsRefresh: () => Promise<void>;
}) {
  const toast = useToast();
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [duplicates, setDuplicates] = useState<LeadRecord[]>([]);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setDuplicates([]);
    }
  }, [open]);

  const update = <K extends keyof LeadForm>(key: K, value: LeadForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function duplicateCheck() {
    const params = new URLSearchParams();
    if (form.mobile.trim()) params.set("mobile", form.mobile.trim());
    if (form.email.trim()) params.set("email", form.email.trim());
    if (!params.toString()) return [];
    return (await api<{ items: LeadRecord[] }>(`/admin/leads/duplicates?${params.toString()}`)).items;
  }

  async function create(force = false) {
    if (saving) return;
    if (form.companyName.trim().length < 2) {
      toast.error("Enter a company / client name.");
      return;
    }
    if (!form.mobile.trim() && !form.email.trim()) {
      toast.error("Add at least a mobile number or email.");
      return;
    }

    setSaving(true);
    try {
      if (!force) {
        const matches = await duplicateCheck();
        if (matches.length) {
          setDuplicates(matches);
          return;
        }
      }

      const source = form.source === "Other" ? form.sourceOther.trim() || "Other" : form.source;
      await api("/admin/leads", {
        method: "POST",
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactPerson: form.contactPerson.trim() || undefined,
          mobile: form.mobile.trim() || undefined,
          email: form.email.trim() || undefined,
          website: form.website.trim() || undefined,
          city: form.city.trim() || undefined,
          services: form.services,
          source,
          status: form.status,
          priority: form.priority,
          estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
          convertedValue: form.convertedValue ? Number(form.convertedValue) : undefined,
          assignedTo: form.assignedTo || null,
          nextFollowUpAt: isoOrNull(form.nextFollowUpAt),
          lostReason: form.status === "LOST" ? form.lostReason.trim() : undefined,
        }),
      });

      setForm(emptyForm);
      setDuplicates([]);
      await Promise.all([onCreated(), onOptionsRefresh()]);
      onClose();
      toast.success("Lead created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create lead.");
    } finally {
      setSaving(false);
    }
  }

  const sources = options?.sources?.length ? options.sources : ["Cold Call", "WhatsApp", "Website", "Referral", "Other"];
  const services = options?.services?.length ? options.services : ["Film Production", "Casting", "Post Production", "Other"];

  return (
    <AdminDialog open={open} onClose={onClose} eyebrow="Mini CRM" title="Add Lead" description="Create a lead and schedule the next action." width="wide">
      <form
        className="ad-lead-form"
        onSubmit={(event) => {
          event.preventDefault();
          void create(false);
        }}
      >
        {duplicates.length > 0 && (
          <div className="ad-lead-duplicate-warning">
            <strong>Possible duplicate found</strong>
            <span>Review these existing leads before creating another record. You can still continue if this is a different opportunity.</span>
            <div>
              {duplicates.map((lead) => (
                <Link key={lead._id} href={`/admin/leads/${lead._id}`} target="_blank">
                  {lead.companyName} · {lead.mobile || lead.email || "No contact"}
                </Link>
              ))}
            </div>
            <div className="ad-lead-warning-actions">
              <button type="button" onClick={() => setDuplicates([])}>
                Go Back
              </button>
              <button type="button" disabled={saving} onClick={() => void create(true)}>
                Create Anyway
              </button>
            </div>
          </div>
        )}

        <div className="ad-lead-form-grid">
          <label className="ad-lead-field">
            <span>Company / Client Name *</span>
            <input value={form.companyName} maxLength={180} onChange={(event) => update("companyName", event.target.value)} required />
          </label>
          <label className="ad-lead-field">
            <span>Contact Person</span>
            <input value={form.contactPerson} maxLength={120} onChange={(event) => update("contactPerson", event.target.value)} />
          </label>
          <label className="ad-lead-field">
            <span>Mobile</span>
            <input value={form.mobile} maxLength={30} inputMode="tel" onChange={(event) => update("mobile", event.target.value)} />
          </label>
          <label className="ad-lead-field">
            <span>Email</span>
            <input type="email" value={form.email} maxLength={254} onChange={(event) => update("email", event.target.value)} />
          </label>
          <label className="ad-lead-field">
            <span>Website</span>
            <input type="url" value={form.website} placeholder="https://..." onChange={(event) => update("website", event.target.value)} />
          </label>
          <label className="ad-lead-field">
            <span>City</span>
            <input value={form.city} maxLength={120} onChange={(event) => update("city", event.target.value)} />
          </label>

          <ServicesPicker options={services} values={form.services} onChange={(value) => update("services", value)} />

          <SelectOther
            label="Source"
            value={form.source}
            customValue={form.sourceOther}
            options={sources}
            onValue={(value) => update("source", value)}
            onCustom={(value) => update("sourceOther", value)}
          />

          <label className="ad-lead-field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => update("status", event.target.value as LeadStatus)}>
              {(options?.statuses ?? ["NEW"]).map((status) => (
                <option key={status} value={status}>
                  {leadLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-lead-field">
            <span>Priority</span>
            <select value={form.priority} onChange={(event) => update("priority", event.target.value as LeadPriority)}>
              {(options?.priorities ?? ["LOW", "MEDIUM", "HIGH", "URGENT"]).map((priority) => (
                <option key={priority} value={priority}>
                  {leadLabel(priority)}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-lead-field">
            <span>Assigned To</span>
            <select value={form.assignedTo} onChange={(event) => update("assignedTo", event.target.value)}>
              <option value="">Unassigned</option>
              {(options?.assignees ?? []).map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-lead-field">
            <span>Estimated Value (₹)</span>
            <input type="number" min="0" step="1" value={form.estimatedValue} onChange={(event) => update("estimatedValue", event.target.value)} />
          </label>

          {form.status === "CONVERTED" && (
            <label className="ad-lead-field">
              <span>Converted Value (₹)</span>
              <input type="number" min="0" step="1" value={form.convertedValue} onChange={(event) => update("convertedValue", event.target.value)} />
            </label>
          )}

          <label className="ad-lead-field">
            <span>Next Follow-up</span>
            <input type="datetime-local" value={form.nextFollowUpAt} onChange={(event) => update("nextFollowUpAt", event.target.value)} />
          </label>

          {form.status === "LOST" && (
            <label className="ad-lead-field ad-lead-field-wide">
              <span>Lost Reason *</span>
              <textarea value={form.lostReason} maxLength={1000} onChange={(event) => update("lostReason", event.target.value)} required />
            </label>
          )}
        </div>

        <div className="ad-dialog-actions">
          <button type="button" className="ad-dialog-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="ad-dialog-primary" disabled={saving || duplicates.length > 0}>
            {saving ? "Saving…" : "Create Lead"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function AdminLeadsView() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [archived, setArchived] = useState("false");
  const [addOpen, setAddOpen] = useState(false);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [options, setOptions] = useState<LeadOptions | null>(null);

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (deferredQuery) params.set("search", deferredQuery);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (source) params.set("source", source);
    if (followUp) params.set("followUp", followUp);
    params.set("archived", archived);
    return `/admin/leads?${params.toString()}`;
  }, [deferredQuery, status, priority, source, followUp, archived]);

  const [leads, , refresh, meta, setPage, , loading, error] = useAdminRecords<LeadRecord, LeadRecord>(
    path,
    identityLead,
    true,
    1,
    20,
  );

  async function loadSummary() {
    try {
      setSummary(await api<LeadSummary>("/admin/leads/summary"));
    } catch {
      setSummary(null);
    }
  }

  async function loadOptions() {
    try {
      setOptions(await api<LeadOptions>("/admin/leads/options"));
    } catch {
      setOptions(null);
    }
  }

  useEffect(() => {
    void Promise.all([loadSummary(), loadOptions()]);
  }, []);

  const assigneeName = (id?: string) => options?.assignees.find((admin) => admin.id === id)?.name ?? "Unassigned";

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Sales pipeline"
        title="Leads CRM"
        description="Track prospects, follow-ups, calls, proposals and conversions in one administrator-only workspace."
        action={
          <button type="button" className="ad-primary" onClick={() => setAddOpen(true)}>
            <AdminIcon name="plus" />
            Add Lead
          </button>
        }
      />

      <section className="ad-lead-metrics">
        <article><span>Active Leads</span><strong>{summary?.total ?? "—"}</strong><small>{summary?.new ?? "—"} new</small></article>
        <article><span>Follow-ups Today</span><strong>{summary?.followUpsToday ?? "—"}</strong><small>{summary?.overdue ?? "—"} overdue</small></article>
        <article><span>Conversion</span><strong>{summary ? `${summary.conversionRate}%` : "—"}</strong><small>{summary?.converted ?? "—"} converted</small></article>
        <article><span>Pipeline Value</span><strong>{summary ? money(summary.pipelineValue) : "—"}</strong><small>Open opportunities</small></article>
        <article><span>Converted Value</span><strong>{summary ? money(summary.convertedValue) : "—"}</strong><small>Won business</small></article>
      </section>

      <section className="ad-lead-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search company, person, phone, email, city or service" />
        <div className="ad-lead-filters">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {(options?.statuses ?? []).map((value) => <option key={value} value={value}>{leadLabel(value)}</option>)}
          </select>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="">All priorities</option>
            {(options?.priorities ?? []).map((value) => <option key={value} value={value}>{leadLabel(value)}</option>)}
          </select>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">All sources</option>
            {(options?.sources ?? []).filter((value) => value !== "Other").map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={followUp} onChange={(event) => setFollowUp(event.target.value)}>
            <option value="">All follow-ups</option>
            <option value="TODAY">Today</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
          <select value={archived} onChange={(event) => setArchived(event.target.value)}>
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
        </div>
      </section>

      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!loading && !error && !leads.length}
        emptyText="No leads match these filters."
        onRetry={() => void refresh()}
      />

      {!!leads.length && (
        <article className="ad-card ad-lead-table-card">
          <div className="ad-lead-table-scroll">
            <div className="ad-lead-table">
              <div className="ad-lead-table-head">
                <span>Lead</span>
                <span>Contact</span>
                <span>Services</span>
                <span>Source</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Follow-up</span>
                <span>Value</span>
                <span>Owner</span>
                <span></span>
              </div>
              {leads.map((lead) => (
                <div className="ad-lead-table-row" key={lead._id}>
                  <div>
                    <strong>{lead.companyName}</strong>
                    <span>{lead.contactPerson || lead.city || "—"}</span>
                  </div>
                  <div>
                    <strong>{lead.mobile || "—"}</strong>
                    <span>{lead.email || "No email"}</span>
                  </div>
                  <div className="ad-lead-table-services">
                    {(lead.services ?? []).slice(0, 2).map((service) => <span key={service}>{service}</span>)}
                    {(lead.services?.length ?? 0) > 2 && <small>+{(lead.services?.length ?? 0) - 2}</small>}
                  </div>
                  <span>{lead.source}</span>
                  <span className={`ad-lead-status is-${lead.status.toLowerCase()}`}>{leadLabel(lead.status)}</span>
                  <span className={`ad-lead-priority is-${lead.priority.toLowerCase()}`}>{leadLabel(lead.priority)}</span>
                  <span>{lead.nextFollowUpAt ? dateLabel(lead.nextFollowUpAt) : "—"}</span>
                  <strong>{money(lead.status === "CONVERTED" ? lead.convertedValue : lead.estimatedValue)}</strong>
                  <span>{assigneeName(lead.assignedTo)}</span>
                  <Link className="ad-lead-open" href={`/admin/leads/${lead._id}`}>Open →</Link>
                </div>
              ))}
            </div>
          </div>
        </article>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <AddLeadDialog
        open={addOpen}
        options={options}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          await Promise.all([refresh(), loadSummary()]);
        }}
        onOptionsRefresh={loadOptions}
      />
    </div>
  );
}
