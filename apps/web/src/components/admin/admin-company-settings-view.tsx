"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-shared";
import { useToast } from "@/components/ui/toast-provider";
import { PUBLIC_COMPANY } from "@/config/company";
import { api } from "@/services/api";
import { dateLabel } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

type SettingsRecord = {
  _id: string;
  slug: string;
  title: string;
  published: boolean;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
};

const identitySettings = (item: SettingsRecord) => item;

type CompanyForm = {
  companyName: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  phoneAlt: string;
  location: string;
  website: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  facebook: string;
};

const defaults: CompanyForm = {
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
};

const socialKeys = ["instagram", "youtube", "linkedin", "facebook"] as const;

function mapCompany(data?: Record<string, string>): CompanyForm {
  return { ...defaults, ...(data ?? {}) };
}

function completion(form: CompanyForm) {
  const required: Array<keyof CompanyForm> = [
    "companyName",
    "tagline",
    "description",
    "email",
    "phone",
    "location",
    "website",
  ];
  const filled = required.filter((key) => form[key].trim()).length;
  return Math.round((filled / required.length) * 100);
}

export function AdminCompanySettingsView() {
  const toast = useToast();
  const [records, , refresh, , , , loading, error] = useAdminRecords<SettingsRecord, SettingsRecord>(
    "/admin/content/settings",
    identitySettings,
    true,
    1,
    100,
  );

  const company = records.find((record) => record.slug === "company");
  const [form, setForm] = useState<CompanyForm>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(mapCompany(company?.data));
  }, [company?._id, company?.updatedAt]);

  const progress = useMemo(() => completion(form), [form]);
  const socials = socialKeys.filter((key) => form[key].trim()).length;
  const contactPoints = [form.email, form.phone, form.phoneAlt, form.location, form.website].filter((value) => value.trim()).length;

  function update<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    if (!form.companyName.trim() || !form.tagline.trim() || !form.description.trim()) {
      toast.error("Company name, tagline and description are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Enter a valid public email address.");
      return;
    }

    for (const key of ["website", ...socialKeys] as const) {
      const value = form[key].trim();
      if (value && !/^https:\/\//i.test(value)) {
        toast.error(`${key} must use a full https:// URL.`);
        return;
      }
    }

    setSaving(true);
    try {
      await api(`/admin/content/settings${company ? `/${company._id}` : ""}`, {
        method: company ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(!company ? { slug: "company" } : {}),
          title: "Company Settings",
          status: "Published",
          published: true,
          data: Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])),
        }),
      });

      await refresh();
      toast.success("Company settings saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save company settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || error) {
    return (
      <div className="ad-stack">
        <AdminPageHeader
          eyebrow="Platform configuration"
          title="Company Settings"
          description="Manage the company identity and public contact information used across the website."
        />
        <div className="ad-settings-loading-v2">{loading ? "Loading company settings…" : error}</div>
      </div>
    );
  }

  return (
    <form className="ad-stack" onSubmit={submit}>
      <AdminPageHeader
        eyebrow="Platform configuration"
        title="Company Settings"
        description="Manage the company identity, contact details and social profiles that feed public-facing website sections."
        action={
          <button type="submit" className="ad-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        }
      />

      <section className="ad-settings-metrics-v2">
        <article>
          <span>Configuration</span>
          <strong>{progress}%</strong>
          <small>Core public profile</small>
        </article>
        <article>
          <span>Contact points</span>
          <strong>{contactPoints}/5</strong>
          <small>Email, phones, location, website</small>
        </article>
        <article>
          <span>Social profiles</span>
          <strong>{socials}/4</strong>
          <small>Connected public channels</small>
        </article>
        <article>
          <span>Last saved</span>
          <strong>{company?.updatedAt ? dateLabel(company.updatedAt) : "Not yet"}</strong>
          <small>{company ? "Stored in MongoDB" : "Using verified defaults"}</small>
        </article>
      </section>

      <section className="ad-settings-layout-v2">
        <div className="ad-settings-main-v2">
          <article className="ad-settings-card-v2">
            <div className="ad-settings-card-head-v2">
              <div>
                <p className="ad-kicker">Brand identity</p>
                <h2>Company Profile</h2>
              </div>
              <span>Public website</span>
            </div>

            <div className="ad-settings-form-grid-v2">
              <label>
                <span>Public Company Name *</span>
                <input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} maxLength={160} />
              </label>

              <label>
                <span>Legal / Registered Name</span>
                <input
                  value={form.legalName}
                  onChange={(event) => update("legalName", event.target.value)}
                  maxLength={200}
                  placeholder="Leave blank until verified"
                />
              </label>

              <label className="wide">
                <span>Tagline *</span>
                <input value={form.tagline} onChange={(event) => update("tagline", event.target.value)} maxLength={220} />
              </label>

              <label className="wide">
                <span>Company Description *</span>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  maxLength={1500}
                />
              </label>
            </div>
          </article>

          <article className="ad-settings-card-v2">
            <div className="ad-settings-card-head-v2">
              <div>
                <p className="ad-kicker">Contact</p>
                <h2>Public Contact Details</h2>
              </div>
              <span>Contact + footer</span>
            </div>

            <div className="ad-settings-form-grid-v2">
              <label>
                <span>Public Email *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  maxLength={254}
                />
              </label>

              <label>
                <span>Website</span>
                <input
                  type="url"
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                  placeholder="https://..."
                  maxLength={500}
                />
              </label>

              <label>
                <span>Primary Phone</span>
                <input value={form.phone} onChange={(event) => update("phone", event.target.value)} maxLength={40} />
              </label>

              <label>
                <span>Alternate Phone</span>
                <input value={form.phoneAlt} onChange={(event) => update("phoneAlt", event.target.value)} maxLength={40} />
              </label>

              <label className="wide">
                <span>Public Location</span>
                <input value={form.location} onChange={(event) => update("location", event.target.value)} maxLength={300} />
              </label>
            </div>
          </article>

          <article className="ad-settings-card-v2">
            <div className="ad-settings-card-head-v2">
              <div>
                <p className="ad-kicker">Social presence</p>
                <h2>Official Social Profiles</h2>
              </div>
              <span>HTTPS links only</span>
            </div>

            <div className="ad-settings-form-grid-v2">
              <label>
                <span>Instagram</span>
                <input
                  type="url"
                  value={form.instagram}
                  onChange={(event) => update("instagram", event.target.value)}
                  placeholder="https://instagram.com/..."
                  maxLength={500}
                />
              </label>

              <label>
                <span>YouTube</span>
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(event) => update("youtube", event.target.value)}
                  placeholder="https://youtube.com/..."
                  maxLength={500}
                />
              </label>

              <label>
                <span>LinkedIn</span>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(event) => update("linkedin", event.target.value)}
                  placeholder="https://linkedin.com/..."
                  maxLength={500}
                />
              </label>

              <label>
                <span>Facebook</span>
                <input
                  type="url"
                  value={form.facebook}
                  onChange={(event) => update("facebook", event.target.value)}
                  placeholder="https://facebook.com/..."
                  maxLength={500}
                />
              </label>
            </div>
          </article>
        </div>

        <aside className="ad-settings-side-v2">
          <article className="ad-settings-preview-v2">
            <p className="ad-kicker">Public preview</p>
            <h2>{form.companyName || "Company name"}</h2>
            <strong>{form.tagline || "Company tagline"}</strong>
            <p>{form.description || "Company description will appear here."}</p>

            <dl>
              <div><dt>Email</dt><dd>{form.email || "—"}</dd></div>
              <div><dt>Phone</dt><dd>{form.phone || "—"}</dd></div>
              <div><dt>Location</dt><dd>{form.location || "—"}</dd></div>
            </dl>
          </article>

          <article className="ad-settings-impact-v2">
            <p className="ad-kicker">Where this is used</p>
            <h2>Public configuration</h2>
            <div>
              <span><b>Footer</b>Company name, tagline, description and social links</span>
              <span><b>Contact</b>Email, primary phone and location</span>
              <span><b>Site fallback</b>Verified company defaults remain available during API failure</span>
            </div>
          </article>

          <article className="ad-settings-note-v2">
            <p className="ad-kicker">Data quality</p>
            <h2>Use verified public information.</h2>
            <p>
              Leave legal name or social links blank until confirmed. Saving an empty optional field is supported and safer than publishing guessed information.
            </p>
          </article>
        </aside>
      </section>
    </form>
  );
}
