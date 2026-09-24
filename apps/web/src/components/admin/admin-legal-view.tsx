"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { AdminPageHeader, AdminStatus } from "@/components/admin/admin-shared";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel } from "@/services/workspace";

import { useAdminRecords } from "./use-admin-records";

type LegalRecord = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  body?: string[];
  status?: string;
  published: boolean;
  publishedAt?: string;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
};

const identityLegal = (item: LegalRecord) => item;

type PolicySlug = "privacy" | "terms";

type RegistrationForm = {
  gst: string;
  registration: string;
  registeredAddress: string;
  jurisdiction: string;
  copyright: string;
};

const registrationDefaults: RegistrationForm = {
  gst: "",
  registration: "",
  registeredAddress: "",
  jurisdiction: "India",
  copyright: "© M. Dadu Films. All rights reserved.",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function existingPolicyBlocks(body?: string[]) {
  return (body ?? []).map((block) => {
    const trimmed = block.trim();
    if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

    const lines = trimmed.split(/\r?\n/);
    const first = lines[0]?.trim() ?? "";
    if (first.startsWith("## ")) {
      const heading = escapeHtml(first.slice(3).trim());
      const rest = lines.slice(1).join("\n").trim();
      return `<h2>${heading}</h2>${rest ? `<p>${escapeHtml(rest).replace(/\n/g, "<br>")}</p>` : ""}`;
    }

    return trimmed ? `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>` : "";
  }).filter(Boolean);
}

function words(blocks: string[]) {
  if (typeof document === "undefined") return blocks.join(" ").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const node = document.createElement("div");
  node.innerHTML = blocks.join("");
  return (node.textContent ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function policyStatus(item?: LegalRecord) {
  return item?.status ?? (item?.published ? "Published" : "Draft");
}

function PolicyEditor({
  open,
  item,
  slug,
  onClose,
  onSaved,
}: {
  open: boolean;
  item?: LegalRecord;
  slug: PolicySlug;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(slug === "privacy" ? "Privacy Policy" : "Terms & Conditions");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState<string[]>(["<p><br></p>"]);
  const [status, setStatus] = useState("Draft");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [version, setVersion] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(item?.title || (slug === "privacy" ? "Privacy Policy" : "Terms & Conditions"));
    setDescription(item?.description ?? "");
    const currentBody = existingPolicyBlocks(item?.body);
    setBody(currentBody.length ? currentBody : ["<p><br></p>"]);
    setStatus(policyStatus(item));
    setEffectiveDate(item?.data?.effectiveDate ?? item?.publishedAt?.slice(0, 10) ?? "");
    setVersion(item?.data?.version ?? "");
    setSaving(false);
  }, [open, item, slug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const count = words(body);
    if (!title.trim() || !description.trim()) {
      toast.error("Policy title and summary are required.");
      return;
    }

    if (count < 30) {
      toast.error("Add the reviewed policy content before saving.");
      return;
    }

    setSaving(true);
    try {
      await api(`/admin/content/legal${item ? `/${item._id}` : ""}`, {
        method: item ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(!item ? { slug } : {}),
          title: title.trim(),
          description: description.trim(),
          body,
          status,
          published: status === "Published",
          ...(status === "Draft" ? { publishedAt: null } : {}),
          data: {
            effectiveDate,
            version: version.trim(),
          },
        }),
      });

      await onSaved();
      toast.success(`${title.trim()} saved.`);
      onClose();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save policy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      eyebrow="Legal policy"
      title={title}
      description="Write and review the policy, then choose whether it remains a draft or is publicly published."
      width="wide"
    >
      <AdminDialogForm onSubmit={submit}>
        <div className="ad-legal-editor-layout-v2">
          <div className="ad-legal-editor-main-v2">
            <section className="ad-legal-form-section-v2">
              <p className="ad-kicker">Policy content</p>

              <AdminFormField label="Policy Title" wide>
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} disabled={saving} />
              </AdminFormField>

              <AdminFormField label="Short Summary" wide>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={1500}
                  disabled={saving}
                />
              </AdminFormField>

              <div>
                <p className="ad-legal-field-label-v2">Rich Policy Content</p>
                <AdminRichTextEditor value={body} onChange={setBody} disabled={saving} />
              </div>
            </section>
          </div>

          <aside className="ad-legal-editor-side-v2">
            <section className="ad-legal-form-section-v2">
              <p className="ad-kicker">Publishing</p>

              <AdminFormField label="Status" wide>
                <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </AdminFormField>

              <AdminFormField label="Effective Date" wide>
                <input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} disabled={saving} />
              </AdminFormField>

              <AdminFormField label="Version / Revision" wide>
                <input
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  maxLength={80}
                  placeholder="e.g. 1.0 or Sep 2026"
                  disabled={saving}
                />
              </AdminFormField>
            </section>

            <section className="ad-legal-form-section-v2">
              <p className="ad-kicker">Document check</p>
              <div className="ad-legal-doc-stats-v2">
                <div><span>Words</span><strong>{words(body).toLocaleString("en-IN")}</strong></div>
                <div><span>Blocks</span><strong>{body.filter(Boolean).length}</strong></div>
                <div><span>Public route</span><strong>/{slug}</strong></div>
              </div>
              <a className="ad-legal-public-link-v2" href={`/${slug}`} target="_blank" rel="noreferrer">
                Open public page ↗
              </a>
            </section>

            <section className="ad-legal-review-v2">
              <strong>Legal review recommended</strong>
              <p>Publishing makes this document publicly accessible. Use only wording that has been reviewed for your actual business and platform practices.</p>
            </section>
          </aside>
        </div>

        <AdminDialogActions onCancel={onClose} primaryLabel={saving ? "Saving Policy…" : "Save Policy"} />
      </AdminDialogForm>
    </AdminDialog>
  );
}

export function AdminLegalView() {
  const toast = useToast();
  const [records, , refresh, , , , loading, error] = useAdminRecords<LegalRecord, LegalRecord>(
    "/admin/content/legal",
    identityLegal,
    true,
    1,
    100,
  );

  const registration = records.find((record) => record.slug === "registration");
  const privacy = records.find((record) => record.slug === "privacy");
  const terms = records.find((record) => record.slug === "terms");

  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>(registrationDefaults);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicySlug | null>(null);

  useEffect(() => {
    setRegistrationForm({
      ...registrationDefaults,
      ...(registration?.data ?? {}),
    });
  }, [registration?._id, registration?.updatedAt]);

  const closePolicy = useCallback(() => setEditingPolicy(null), []);

  const publishedPolicies = [privacy, terms].filter((item) => item?.published).length;
  const registrationFilled = [
    registrationForm.gst,
    registrationForm.registration,
    registrationForm.registeredAddress,
  ].filter((value) => value.trim()).length;

  const latestUpdate = useMemo(() => {
    const values = [registration?.updatedAt, privacy?.updatedAt, terms?.updatedAt].filter(Boolean) as string[];
    if (!values.length) return "";
    return values.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [registration?.updatedAt, privacy?.updatedAt, terms?.updatedAt]);

  function updateRegistration<K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) {
    setRegistrationForm((current) => ({ ...current, [key]: value }));
  }

  async function saveRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRegistration) return;
    setSavingRegistration(true);

    try {
      await api(`/admin/content/legal${registration ? `/${registration._id}` : ""}`, {
        method: registration ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(!registration ? { slug: "registration" } : {}),
          title: "Company Registration & Legal Details",
          status: "Published",
          published: true,
          data: Object.fromEntries(Object.entries(registrationForm).map(([key, value]) => [key, value.trim()])),
        }),
      });

      await refresh();
      toast.success("Legal company details saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save legal details.");
    } finally {
      setSavingRegistration(false);
    }
  }

  if (loading || error) {
    return (
      <div className="ad-stack">
        <AdminPageHeader
          eyebrow="Trust & compliance"
          title="Legal Content"
          description="Manage verified registration details and the public Privacy Policy and Terms & Conditions."
        />
        <div className="ad-settings-loading-v2">{loading ? "Loading legal content…" : error}</div>
      </div>
    );
  }

  const activePolicy = editingPolicy === "privacy" ? privacy : editingPolicy === "terms" ? terms : undefined;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Trust & compliance"
        title="Legal Content"
        description="Manage verified company legal details and edit public policies with a safe rich-text workflow."
      />

      <section className="ad-legal-metrics-v2">
        <article>
          <span>Policies published</span>
          <strong>{publishedPolicies}/2</strong>
          <small>Privacy + Terms</small>
        </article>
        <article>
          <span>Registration fields</span>
          <strong>{registrationFilled}/3</strong>
          <small>GST, registration, address</small>
        </article>
        <article>
          <span>Jurisdiction</span>
          <strong>{registrationForm.jurisdiction || "—"}</strong>
          <small>Configured legal region</small>
        </article>
        <article>
          <span>Last update</span>
          <strong>{latestUpdate ? dateLabel(latestUpdate) : "Not yet"}</strong>
          <small>Across legal records</small>
        </article>
      </section>

      <section className="ad-legal-policy-grid-v2">
        {([
          ["privacy", "Privacy Policy", privacy, "/privacy"],
          ["terms", "Terms & Conditions", terms, "/terms"],
        ] as const).map(([slug, fallbackTitle, item, route]) => (
          <article className="ad-legal-policy-card-v2" key={slug}>
            <div className="ad-legal-policy-top-v2">
              <div>
                <p className="ad-kicker">Public policy</p>
                <h2>{item?.title || fallbackTitle}</h2>
              </div>
              <AdminStatus value={policyStatus(item)} />
            </div>

            <p>{item?.description || "No policy summary has been saved yet."}</p>

            <div className="ad-legal-policy-meta-v2">
              <div><span>Words</span><strong>{words(existingPolicyBlocks(item?.body)).toLocaleString("en-IN")}</strong></div>
              <div><span>Effective</span><strong>{item?.data?.effectiveDate || "—"}</strong></div>
              <div><span>Version</span><strong>{item?.data?.version || "—"}</strong></div>
              <div><span>Updated</span><strong>{item?.updatedAt ? dateLabel(item.updatedAt) : "—"}</strong></div>
            </div>

            <div className="ad-legal-policy-actions-v2">
              <button type="button" onClick={() => setEditingPolicy(slug)}>
                {item ? "Edit Policy" : "Create Policy"}
              </button>
              <a href={route} target="_blank" rel="noreferrer">View Public ↗</a>
            </div>
          </article>
        ))}
      </section>

      <section className="ad-legal-layout-v2">
        <form className="ad-legal-registration-v2" onSubmit={saveRegistration}>
          <div className="ad-settings-card-head-v2">
            <div>
              <p className="ad-kicker">Company legal identity</p>
              <h2>Registration & Compliance Details</h2>
            </div>
            <span>Verified values only</span>
          </div>

          <div className="ad-settings-form-grid-v2">
            <label>
              <span>GST Number</span>
              <input
                value={registrationForm.gst}
                onChange={(event) => updateRegistration("gst", event.target.value)}
                placeholder="Leave blank until verified"
                maxLength={80}
              />
            </label>

            <label>
              <span>Registration / CIN</span>
              <input
                value={registrationForm.registration}
                onChange={(event) => updateRegistration("registration", event.target.value)}
                placeholder="Leave blank until verified"
                maxLength={120}
              />
            </label>

            <label className="wide">
              <span>Registered Address</span>
              <textarea
                rows={3}
                value={registrationForm.registeredAddress}
                onChange={(event) => updateRegistration("registeredAddress", event.target.value)}
                maxLength={500}
              />
            </label>

            <label>
              <span>Jurisdiction / Country</span>
              <input
                value={registrationForm.jurisdiction}
                onChange={(event) => updateRegistration("jurisdiction", event.target.value)}
                maxLength={120}
              />
            </label>

            <label className="wide">
              <span>Copyright Text</span>
              <input
                value={registrationForm.copyright}
                onChange={(event) => updateRegistration("copyright", event.target.value)}
                maxLength={240}
              />
            </label>
          </div>

          <div className="ad-legal-registration-actions-v2">
            <p>Empty registration fields are supported so unverified legal identifiers are never invented.</p>
            <button type="submit" className="ad-primary" disabled={savingRegistration}>
              {savingRegistration ? "Saving…" : "Save Legal Details"}
            </button>
          </div>
        </form>

        <aside className="ad-legal-side-v2">
          <article className="ad-legal-review-card-v2">
            <p className="ad-kicker">Publishing checklist</p>
            <h2>Before a policy goes live</h2>
            <div>
              <span><b>1</b>Confirm the policy reflects the actual platform behaviour.</span>
              <span><b>2</b>Set an effective date and optional revision label.</span>
              <span><b>3</b>Have final wording professionally reviewed where appropriate.</span>
              <span><b>4</b>Switch status to Published only when ready.</span>
            </div>
          </article>

          <article className="ad-legal-safe-card-v2">
            <p className="ad-kicker">Safety</p>
            <h2>Rich text is constrained.</h2>
            <p>Scripts, embedded media, inline event handlers, unsafe URLs and arbitrary styles are rejected by the backend.</p>
          </article>
        </aside>
      </section>

      {editingPolicy && (
        <PolicyEditor
          open
          slug={editingPolicy}
          item={activePolicy}
          onClose={closePolicy}
          onSaved={async () => {
            await refresh();
          }}
        />
      )}
    </div>
  );
}
