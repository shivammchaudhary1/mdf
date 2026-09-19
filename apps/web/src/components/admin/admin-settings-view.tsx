"use client";

import { type FormEvent, useRef, useState } from "react";

import { PUBLIC_COMPANY } from "@/config/company";
import { api } from "@/services/api";
import type { ContentRecord } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";
const identity = (x: ContentRecord) => x;

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminCollectionState, AdminPageHeader } from "@/components/admin/admin-shared";
import { useToast } from "@/components/ui/toast-provider";

export function AdminSettingsView({ legal = false }: { legal?: boolean }) {
  const toast = useToast();
  const [records, , refresh, , , , loading, error] = useAdminRecords(`/admin/content/${legal ? "legal" : "settings"}`, identity);
  const fields = useRef<HTMLDivElement>(null);
  const settings = records.find((x) => x.slug === "company")?.data ?? {};
  const registration = records.find((x) => x.slug === "registration")?.data ?? {};
  const data = {
    settings: {
      companyName: PUBLIC_COMPANY.name,
      legalName: PUBLIC_COMPANY.legalName,
      tagline: PUBLIC_COMPANY.tagline,
      description: PUBLIC_COMPANY.description,
      email: PUBLIC_COMPANY.email,
      phone: PUBLIC_COMPANY.phone,
      phoneAlt: PUBLIC_COMPANY.phoneAlt,
      location: PUBLIC_COMPANY.location,
      website: PUBLIC_COMPANY.website,
      instagram: "",
      youtube: "",
      linkedin: "",
      facebook: "",
      ...settings,
    },
    legal: {
      gst: "",
      registration: "",
      copyright: "",
      privacyUpdated: records.find((x) => x.slug === "privacy")?.published ? "Published" : "Draft",
      termsUpdated: records.find((x) => x.slug === "terms")?.published ? "Published" : "Draft",
      ...registration,
    },
  };
  async function persist(slug: string, title: string, body: Record<string, unknown>) {
    const existing = records.find((x) => x.slug === slug);
    await api(`/admin/content/${legal ? "legal" : "settings"}${existing ? `/${existing._id}` : ""}`, {
      method: existing ? "PATCH" : "POST",
      body: JSON.stringify({ slug, title, ...body }),
    });
    await refresh();
  }

  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<"privacy" | "terms" | null>(null);

  if (loading || error)
    return (
      <div className="ad-stack">
        <AdminPageHeader
          eyebrow={legal ? "Trust & compliance" : "Platform configuration"}
          title={legal ? "Legal Content" : "Company Settings"}
          description={
            legal
              ? "Keep registration details, copyright text and policy publishing status in one place."
              : "Manage the public-facing company identity, contact details and social links."
          }
        />
        <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />
      </div>
    );

  async function save() {
    if (saving) return;
    setSaving(true);
    const inputs = Array.from(fields.current?.querySelectorAll("input") ?? []).map((input) => input.value);
    const keys = legal
      ? ["gst", "registration", "copyright"]
      : [
          "companyName",
          "legalName",
          "tagline",
          "description",
          "email",
          "phone",
          "phoneAlt",
          "website",
          "location",
          "instagram",
          "youtube",
          "linkedin",
          "facebook",
        ];
    const values = Object.fromEntries(keys.map((key, i) => [key, (inputs[i] ?? "").trim()]));
    if (!legal) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        toast.error("Enter a valid public email address.");
        setSaving(false);
        return;
      }
      const urls = ["website", "instagram", "youtube", "linkedin", "facebook"];
      for (const key of urls) {
        if (values[key] && !/^https:\/\//i.test(values[key])) {
          toast.error(`${key} must use a full https:// URL.`);
          setSaving(false);
          return;
        }
      }
    }
    try {
      await persist(legal ? "registration" : "company", legal ? "Company registration" : "Company settings", {
        published: true,
        data: values,
      });
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }
  async function savePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!policy || saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await persist(policy, policy === "privacy" ? "Privacy Policy" : "Terms of Use", {
        body: [String(form.get("content") ?? "")],
        published: form.get("published") === "on",
      });
      toast.success("Policy saved.");
      setPolicy(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save policy.");
    } finally {
      setSaving(false);
    }
  }

  if (legal)
    return (
      <div className="ad-stack">
        <AdminPageHeader
          eyebrow="Trust & compliance"
          title="Legal Content"
          description="Keep registration details, copyright text and policy publishing status in one place."
        />
        <section className="ad-settings-grid">
          <div className="ad-form-stack" ref={fields} key={JSON.stringify(legal ? data.legal : data.settings)}>
            <article className="ad-card">
              <div className="ad-card-head">
                <div>
                  <p className="ad-kicker">Company identity</p>
                  <h2>Registration Details</h2>
                </div>
              </div>
              <div className="ad-form-grid">
                <label className="ad-field">
                  <span>GST Number</span>
                  <input defaultValue={data.legal.gst} placeholder="Add verified GST number only" />
                </label>
                <label className="ad-field">
                  <span>Registration / CIN</span>
                  <input defaultValue={data.legal.registration} placeholder="Add verified registration only" />
                </label>
              </div>
            </article>
            <article className="ad-card">
              <div className="ad-card-head">
                <div>
                  <p className="ad-kicker">Policies</p>
                  <h2>Publishing Status</h2>
                </div>
              </div>
              <div className="ad-policy-list">
                <div>
                  <strong>Privacy Policy</strong>
                  <span>{data.legal.privacyUpdated}</span>
                  <button type="button" onClick={() => setPolicy("privacy")}>
                    Edit
                  </button>
                </div>
                <div>
                  <strong>Terms of Use</strong>
                  <span>{data.legal.termsUpdated}</span>
                  <button type="button" onClick={() => setPolicy("terms")}>
                    Edit
                  </button>
                </div>
              </div>
            </article>
            <article className="ad-card">
              <label className="ad-field">
                <span>Copyright Text</span>
                <input defaultValue={data.legal.copyright} />
              </label>
            </article>
            <button className="ad-primary ad-save" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save Legal Content"}
            </button>
          </div>
          <aside className="ad-card ad-trust-card">
            <p className="ad-kicker">Important</p>
            <h2>Do not invent legal data.</h2>
            <p>
              Only verified GST, registration and legal text should be published. Empty fields are intentionally supported until real
              details are supplied.
            </p>
          </aside>
        </section>

        <AdminDialog
          open={!!policy}
          onClose={() => setPolicy(null)}
          eyebrow="Legal content"
          title={policy === "privacy" ? "Privacy Policy" : "Terms of Use"}
          description="Draft the policy UI here. Have final legal wording reviewed before publication."
          width="wide"
        >
          <AdminDialogForm onSubmit={savePolicy}>
            <AdminFormField label="Policy Content">
              <textarea
                name="content"
                defaultValue={records.find((x) => x.slug === policy)?.body?.join("\n\n") ?? ""}
                rows={14}
                placeholder="Enter reviewed legal policy text here."
              />
            </AdminFormField>
            <label className="ad-dialog-check">
              <input type="checkbox" name="published" defaultChecked={records.find((x) => x.slug === policy)?.published ?? false} />
              <span>Mark as ready to publish after legal review</span>
            </label>
            <AdminDialogActions onCancel={() => setPolicy(null)} primaryLabel="Save Policy Draft" />
          </AdminDialogForm>
        </AdminDialog>
      </div>
    );

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Platform configuration"
        title="Company Settings"
        description="Manage the public-facing company identity, contact details and social links."
      />
      <section className="ad-settings-grid">
        <div className="ad-form-stack" ref={fields} key={JSON.stringify(legal ? data.legal : data.settings)}>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Brand</p>
                <h2>Company Identity</h2>
              </div>
            </div>
            <div className="ad-form-grid">
              <label className="ad-field">
                <span>Public Company Name</span>
                <input defaultValue={data.settings.companyName} />
              </label>
              <label className="ad-field">
                <span>Legal / Registered Name</span>
                <input defaultValue={data.settings.legalName} />
              </label>
              <label className="ad-field ad-field-wide">
                <span>Tagline</span>
                <input defaultValue={data.settings.tagline} />
              </label>
              <label className="ad-field ad-field-wide">
                <span>Company Description</span>
                <input defaultValue={data.settings.description} />
              </label>
            </div>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Contact</p>
                <h2>Public Contact Details</h2>
              </div>
            </div>
            <div className="ad-form-grid">
              <label className="ad-field">
                <span>Email</span>
                <input type="email" defaultValue={data.settings.email} />
              </label>
              <label className="ad-field">
                <span>Primary Phone</span>
                <input defaultValue={data.settings.phone} />
              </label>
              <label className="ad-field">
                <span>Alternate Phone</span>
                <input defaultValue={data.settings.phoneAlt} />
              </label>
              <label className="ad-field">
                <span>Website</span>
                <input type="url" defaultValue={data.settings.website} />
              </label>
              <label className="ad-field ad-field-wide">
                <span>Location</span>
                <input defaultValue={data.settings.location} />
              </label>
            </div>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Social</p>
                <h2>Social Profiles</h2>
              </div>
            </div>
            <div className="ad-form-grid">
              <label className="ad-field">
                <span>Instagram</span>
                <input defaultValue={data.settings.instagram} />
              </label>
              <label className="ad-field">
                <span>YouTube</span>
                <input defaultValue={data.settings.youtube} />
              </label>
              <label className="ad-field">
                <span>LinkedIn</span>
                <input defaultValue={data.settings.linkedin} />
              </label>
              <label className="ad-field">
                <span>Facebook</span>
                <input defaultValue={data.settings.facebook} />
              </label>
            </div>
          </article>
          <button className="ad-primary ad-save" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
        <aside className="ad-card ad-settings-note">
          <p className="ad-kicker">Public configuration</p>
          <h2>Connected to the Settings API.</h2>
          <p>Changes saved here are stored in MongoDB and are used by public-facing sections such as contact details and social links.</p>
        </aside>
      </section>
    </div>
  );
}
