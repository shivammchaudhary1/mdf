"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type CastingView, castingView, type ProjectRecord } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { allPages, type ApplicationRecord, fetchPage, type PageMeta, slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

const ROLE_OPTIONS = [
  "Lead Actor",
  "Supporting Actor",
  "Character Actor",
  "Child Artist",
  "Voice Artist",
  "Dancer",
  "Singer",
  "Anchor / Host",
  "Model",
  "DOP / Cinematographer",
  "Assistant Director",
  "Editor",
  "Makeup Artist",
  "Costume Stylist",
  "Art Department",
  "Production",
];

const CATEGORY_OPTIONS = ["Acting", "Crew", "Voice Over", "Model", "Dance", "Music", "Host / Presenter"];

const GENDER_OPTIONS = ["Any", "Male", "Female", "Non-binary"];

const EXPERIENCE_OPTIONS = ["Fresher", "0–1 year", "1–3 years", "3–5 years", "5+ years"];

const COMPENSATION_OPTIONS = ["Paid", "Unpaid", "Negotiable", "Expenses Only", "Collaboration / TFP"];

const TAG_OPTIONS = [
  "Lead",
  "Supporting",
  "Hindi",
  "English",
  "Regional",
  "Film",
  "Short Film",
  "Advertisement",
  "Music Video",
  "Web Series",
  "OTT",
  "Theatre",
  "Freshers Welcome",
  "Experienced",
];

const splitLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

function presetValue(value: string, options: string[]) {
  if (!value) return "";
  return options.includes(value) ? value : "Other";
}

function CastingFields({
  edit,
  projects,
  busy,
}: {
  edit?: CastingView;
  projects: ProjectRecord[];
  busy: boolean;
}) {
  const [rolePreset, setRolePreset] = useState(() => presetValue(edit?.role ?? "", ROLE_OPTIONS));
  const [customRole, setCustomRole] = useState(() => (rolePreset === "Other" ? edit?.role ?? "" : ""));

  const [categoryPreset, setCategoryPreset] = useState(() => presetValue(edit?.category ?? "", CATEGORY_OPTIONS));
  const [customCategory, setCustomCategory] = useState(() => (categoryPreset === "Other" ? edit?.category ?? "" : ""));

  const [genderPreset, setGenderPreset] = useState(() => presetValue(edit?.gender ?? "", GENDER_OPTIONS));
  const [customGender, setCustomGender] = useState(() => (genderPreset === "Other" ? edit?.gender ?? "" : ""));

  const [experiencePreset, setExperiencePreset] = useState(() => presetValue(edit?.experience ?? "", EXPERIENCE_OPTIONS));
  const [customExperience, setCustomExperience] = useState(() => (experiencePreset === "Other" ? edit?.experience ?? "" : ""));

  const [compensationPreset, setCompensationPreset] = useState(() => presetValue(edit?.compensation ?? "", COMPENSATION_OPTIONS));
  const [customCompensation, setCustomCompensation] = useState(() => (compensationPreset === "Other" ? edit?.compensation ?? "" : ""));

  const [tags, setTags] = useState<string[]>(edit?.tags ?? []);
  const [tagPreset, setTagPreset] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [coverPreview, setCoverPreview] = useState(edit?.coverImage ?? "");

  useEffect(
    () => () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview],
  );

  const tagCount = useMemo(() => tags.length, [tags]);

  function addTag() {
    const value = (tagPreset === "Other" ? customTag : tagPreset).trim();
    if (!value || tagCount >= 20 || tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) return;

    setTags((current) => [...current, value]);
    setTagPreset("");
    setCustomTag("");
  }

  return (
    <>
      <input type="hidden" name="resolvedRole" value={(rolePreset === "Other" ? customRole : rolePreset).trim()} />
      <input type="hidden" name="resolvedCategory" value={(categoryPreset === "Other" ? customCategory : categoryPreset).trim()} />
      <input type="hidden" name="resolvedGender" value={(genderPreset === "Other" ? customGender : genderPreset).trim()} />
      <input
        type="hidden"
        name="resolvedExperience"
        value={(experiencePreset === "Other" ? customExperience : experiencePreset).trim()}
      />
      <input
        type="hidden"
        name="resolvedCompensation"
        value={(compensationPreset === "Other" ? customCompensation : compensationPreset).trim()}
      />
      <input type="hidden" name="tagsJson" value={JSON.stringify(tags)} />

      {busy && (
        <div className="ad-casting-save-state" role="status">
          <i />
          <div>
            <strong>Saving casting call…</strong>
            <span>Media and casting details are being processed.</span>
          </div>
        </div>
      )}

      <section className="ad-casting-form-section">
        <div className="ad-casting-form-head">
          <p className="ad-kicker">Basic information</p>
          <span>Only the title is required. Add the rest when relevant.</span>
        </div>

        <AdminDialogGrid>
          <AdminFormField label="Casting Title" wide>
            <input name="title" defaultValue={edit?.title} required maxLength={160} placeholder="e.g. Female Lead for Short Film" />
          </AdminFormField>

          <AdminFormField label="Linked Project">
            <select name="projectId" defaultValue={edit?.projectId ?? ""}>
              <option value="">No linked project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label="Status">
            <select name="status" defaultValue={edit?.status === "Closing Soon" ? "Open" : (edit?.status ?? "Draft")}>
              <option>Draft</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </AdminFormField>

          <AdminFormField label="Category">
            <select value={categoryPreset} onChange={(event) => setCategoryPreset(event.target.value)}>
              <option value="">Not specified</option>
              {CATEGORY_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
              <option>Other</option>
            </select>
            {categoryPreset === "Other" && (
              <input
                className="mt-2"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                maxLength={100}
                placeholder="Custom category"
              />
            )}
          </AdminFormField>

          <AdminFormField label="Role">
            <select value={rolePreset} onChange={(event) => setRolePreset(event.target.value)}>
              <option value="">Not specified</option>
              {ROLE_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
              <option>Other</option>
            </select>
            {rolePreset === "Other" && (
              <input
                className="mt-2"
                value={customRole}
                onChange={(event) => setCustomRole(event.target.value)}
                maxLength={160}
                placeholder="Custom role"
              />
            )}
          </AdminFormField>

          <AdminFormField label="Location" wide>
            <input name="location" defaultValue={edit?.location} maxLength={200} placeholder="e.g. Mumbai, Maharashtra" />
          </AdminFormField>
        </AdminDialogGrid>
      </section>

      <section className="ad-casting-form-section">
        <div className="ad-casting-form-head">
          <p className="ad-kicker">Casting criteria</p>
          <span>Leave fields blank when there is no restriction.</span>
        </div>

        <AdminDialogGrid>
          <AdminFormField label="Minimum Age">
            <input name="ageMin" type="number" min="0" max="120" defaultValue={edit?.ageMin ?? ""} placeholder="Optional" />
          </AdminFormField>

          <AdminFormField label="Maximum Age">
            <input name="ageMax" type="number" min="0" max="120" defaultValue={edit?.ageMax ?? ""} placeholder="Optional" />
          </AdminFormField>

          <AdminFormField label="Gender">
            <select value={genderPreset} onChange={(event) => setGenderPreset(event.target.value)}>
              <option value="">No restriction</option>
              {GENDER_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
              <option>Other</option>
            </select>
            {genderPreset === "Other" && (
              <input
                className="mt-2"
                value={customGender}
                onChange={(event) => setCustomGender(event.target.value)}
                maxLength={50}
                placeholder="Custom value"
              />
            )}
          </AdminFormField>

          <AdminFormField label="Experience">
            <select value={experiencePreset} onChange={(event) => setExperiencePreset(event.target.value)}>
              <option value="">Not specified</option>
              {EXPERIENCE_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
              <option>Other</option>
            </select>
            {experiencePreset === "Other" && (
              <input
                className="mt-2"
                value={customExperience}
                onChange={(event) => setCustomExperience(event.target.value)}
                maxLength={1000}
                placeholder="Custom experience requirement"
              />
            )}
          </AdminFormField>
        </AdminDialogGrid>
      </section>

      <section className="ad-casting-form-section">
        <div className="ad-casting-form-head">
          <p className="ad-kicker">Schedule & compensation</p>
          <span>Dates and compensation are optional.</span>
        </div>

        <AdminDialogGrid>
          <AdminFormField label="Application Deadline">
            <input name="deadline" type="date" defaultValue={edit?.deadline} />
          </AdminFormField>

          <AdminFormField label="Shoot Date">
            <input name="shootDate" type="date" defaultValue={edit?.shootDate} />
          </AdminFormField>

          <AdminFormField label="Compensation" wide>
            <select value={compensationPreset} onChange={(event) => setCompensationPreset(event.target.value)}>
              <option value="">Not specified</option>
              {COMPENSATION_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
              <option>Other</option>
            </select>
            {compensationPreset === "Other" && (
              <input
                className="mt-2"
                value={customCompensation}
                onChange={(event) => setCustomCompensation(event.target.value)}
                maxLength={1000}
                placeholder="e.g. ₹5,000/day + travel"
              />
            )}
          </AdminFormField>
        </AdminDialogGrid>
      </section>

      <section className="ad-casting-form-section">
        <div className="ad-casting-form-head">
          <p className="ad-kicker">Public content</p>
          <span>These details help members understand the opportunity quickly.</span>
        </div>

        <AdminDialogGrid>
          <AdminFormField label="Summary" wide>
            <textarea
              name="summary"
              rows={3}
              defaultValue={edit?.summary}
              maxLength={1000}
              placeholder="Short summary visible on cards and listing pages"
            />
          </AdminFormField>

          <AdminFormField label="Description" wide>
            <textarea
              name="description"
              rows={5}
              defaultValue={edit?.description}
              maxLength={10000}
              placeholder="Detailed casting-call description"
            />
          </AdminFormField>

          <AdminFormField label="Requirements" wide>
            <textarea
              name="requirements"
              rows={4}
              defaultValue={edit?.requirements}
              maxLength={5000}
              placeholder="Specific requirements, look, skills, availability, etc."
            />
          </AdminFormField>

          <AdminFormField label="Additional Details" wide>
            <textarea
              name="details"
              rows={4}
              defaultValue={edit?.details.join("\n")}
              placeholder="One additional detail per line"
            />
          </AdminFormField>
        </AdminDialogGrid>
      </section>

      <section className="ad-casting-form-section">
        <div className="ad-casting-form-head">
          <p className="ad-kicker">Media & discovery</p>
          <span>Add a cover preview and optional discovery tags.</span>
        </div>

        <AdminFormField label={edit ? "Replace Cover Image" : "Cover Image"} wide>
          <input
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
              setCoverPreview(URL.createObjectURL(file));
            }}
          />
          {coverPreview && (
            <div className="ad-casting-cover-preview">
              <img src={coverPreview} alt="Casting cover preview" />
              <div>
                <strong>Cover preview</strong>
                <span>This is how the selected image will appear with the casting call.</span>
              </div>
            </div>
          )}
        </AdminFormField>

        <div className="ad-casting-tags-builder">
          <div className="ad-casting-tag-add">
            <select value={tagPreset} onChange={(event) => setTagPreset(event.target.value)}>
              <option value="">Choose tag</option>
              {TAG_OPTIONS.map((tag) => (
                <option key={tag}>{tag}</option>
              ))}
              <option>Other</option>
            </select>

            {tagPreset === "Other" && (
              <input value={customTag} onChange={(event) => setCustomTag(event.target.value)} maxLength={100} placeholder="Custom tag" />
            )}

            <button type="button" className="ad-dialog-secondary" onClick={addTag}>
              Add Tag
            </button>
          </div>

          {!!tags.length && (
            <div className="ad-casting-tags">
              {tags.map((tag) => (
                <button type="button" key={tag} onClick={() => setTags((current) => current.filter((value) => value !== tag))}>
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {edit && (
        <label className="ad-dialog-check">
          <input name="removeCover" type="checkbox" />
          <span>Remove existing cover image</span>
        </label>
      )}

      <label className="ad-dialog-check">
        <input name="published" type="checkbox" defaultChecked={edit?.published ?? false} />
        <span>Publish on public website</span>
      </label>
    </>
  );
}

export function AdminCastingView() {
  const toast = useToast();
  const active = useAdminDashboardStore((state) => state.castingFilter);
  const setActive = useAdminDashboardStore((state) => state.setCastingFilter);

  const castingPath =
    active === "All"
      ? "/admin/castings"
      : active === "Closing Soon"
        ? "/admin/castings?closingSoon=true"
        : `/admin/castings?status=${encodeURIComponent(active)}`;

  const [castings, , refresh, meta, setPage, , loading, error] = useAdminRecords(castingPath, castingView, true, 1, 20);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CastingView | null>(null);
  const [selected, setSelected] = useState<CastingView | null>(null);
  const [saving, setSaving] = useState(false);
  const [applicants, setApplicants] = useState<ApplicationRecord[]>([]);
  const [appPage, setAppPage] = useState(1);
  const [appMeta, setAppMeta] = useState<PageMeta>();
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState("");
  const [appReload, setAppReload] = useState(0);

  useEffect(() => {
    let activeRequest = true;

    void allPages<ProjectRecord>("/admin/projects")
      .then((rows) => {
        if (activeRequest) setProjects(rows.sort((a, b) => a.title.localeCompare(b.title)));
      })
      .catch((loadError) => toast.error(loadError instanceof Error ? loadError.message : "Unable to load projects."));

    return () => {
      activeRequest = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!selected) {
      setApplicants([]);
      setAppMeta(undefined);
      setAppError("");
      return;
    }

    let activeRequest = true;
    setAppLoading(true);
    setAppError("");

    void fetchPage<ApplicationRecord>(`/admin/applications?opportunityId=${selected.id}`, appPage, 10)
      .then((result) => {
        if (activeRequest) {
          setApplicants(result.items);
          setAppMeta(result.meta);
        }
      })
      .catch((loadError) => {
        if (activeRequest) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load applicants.";
          setApplicants([]);
          setAppMeta(undefined);
          setAppError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (activeRequest) setAppLoading(false);
      });

    return () => {
      activeRequest = false;
    };
  }, [selected, appPage, appReload, toast]);

  async function persist(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const projectId = String(form.get("projectId") ?? "").trim();
    const deadline = String(form.get("deadline") ?? "").trim();
    const shootDate = String(form.get("shootDate") ?? "").trim();
    const ageMinRaw = String(form.get("ageMin") ?? "").trim();
    const ageMaxRaw = String(form.get("ageMax") ?? "").trim();
    const cover = form.get("cover");

    if (ageMinRaw && ageMaxRaw && Number(ageMinRaw) > Number(ageMaxRaw)) {
      toast.error("Minimum age cannot exceed maximum age.");
      return;
    }

    if (deadline && shootDate && new Date(deadline) > new Date(shootDate)) {
      toast.error("Application deadline cannot be after the shoot date.");
      return;
    }

    let tags: string[] = [];
    try {
      const parsed = JSON.parse(String(form.get("tagsJson") ?? "[]"));
      tags = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
    } catch {
      tags = [];
    }

    const uploadedIds: string[] = [];
    let saved = false;
    setSaving(true);

    try {
      let coverMediaId: string | null | undefined;

      if (cover instanceof File && cover.size > 0) {
        const uploaded = await uploadMedia(cover, "casting");
        coverMediaId = uploaded.id;
        uploadedIds.push(uploaded.id);
      } else if (id && form.get("removeCover") === "on") {
        coverMediaId = null;
      }

      const body = {
        title,
        ...(!id ? { slug: slugFor(title) } : {}),
        projectId: projectId || null,
        role: String(form.get("resolvedRole") ?? "").trim() || undefined,
        category: String(form.get("resolvedCategory") ?? "").trim() || undefined,
        summary: String(form.get("summary") ?? "").trim() || undefined,
        description: String(form.get("description") ?? "").trim() || undefined,
        details: splitLines(form.get("details")),
        status: String(form.get("status") ?? "Draft"),
        published: form.get("published") === "on",
        location: String(form.get("location") ?? "").trim() || undefined,
        shootDate: shootDate || null,
        deadline: deadline || null,
        ...(ageMinRaw ? { ageMin: Number(ageMinRaw) } : {}),
        ...(ageMaxRaw ? { ageMax: Number(ageMaxRaw) } : {}),
        gender: String(form.get("resolvedGender") ?? "").trim() || undefined,
        experience: String(form.get("resolvedExperience") ?? "").trim() || undefined,
        compensation: String(form.get("resolvedCompensation") ?? "").trim() || undefined,
        requirements: String(form.get("requirements") ?? "").trim() || undefined,
        ...(coverMediaId !== undefined ? { coverMediaId } : {}),
        tags,
      };

      await api(id ? `/admin/castings/${id}` : "/admin/castings", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });

      saved = true;

      if (active !== "All") setActive("All");
      else await refresh();

      setCreating(false);
      setEditing(null);
      toast.success(id ? "Casting call updated." : "Casting call created.");
    } catch (saveError) {
      if (!saved && uploadedIds.length) {
        await Promise.allSettled(uploadedIds.map((mediaId) => api(`/media/${mediaId}`, { method: "DELETE" })));
      }

      toast.error(saveError instanceof Error ? saveError.message : "Unable to save casting call.");
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function setState(open: boolean) {
    if (!editing) return;

    try {
      if (open) {
        await api(`/admin/castings/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "Open", published: true }),
        });
      } else {
        await api(`/admin/castings/${editing.id}/close`, { method: "PATCH" });
      }

      await refresh();
      setEditing(null);
      toast.success(open ? "Casting reopened." : "Casting closed.");
    } catch (stateError) {
      toast.error(stateError instanceof Error ? stateError.message : "Unable to update casting.");
    }
  }

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Opportunity management"
        title="Casting Calls"
        description="Create, publish and manage casting opportunities for members and public talent."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Casting Call</AdminPrimaryButton>}
      />

      <AdminFilters values={["All", "Open", "Closing Soon", "Draft", "Closed"]} active={active} onChange={setActive} />

      <AdminCollectionState
        loading={loading}
        error={error}
        empty={!castings.length}
        emptyText="No casting calls match this filter."
        onRetry={() => void refresh()}
      />

      <section className="ad-casting-grid">
        {castings.map((casting) => (
          <article className="ad-casting-card ad-casting-card-v2" key={casting.id}>
            {casting.coverImage && (
              <SiteMedia src={casting.coverImage} alt={casting.title} kind="team" className="aspect-[16/8] ad-casting-card-media" />
            )}

            <div className="ad-casting-card-content">
              <div className="ad-casting-top">
                <span>{casting.category || casting.role || "Casting Call"}</span>
                <AdminStatus value={casting.status} />
              </div>

              <h2>{casting.title}</h2>

              {(casting.project !== "—" || casting.role) && (
                <p>{[casting.project !== "—" ? casting.project : "", casting.role].filter(Boolean).join(" · ")}</p>
              )}

              <div className="ad-casting-detail">
                <div>
                  <span>Location</span>
                  <strong>{casting.location || "Not specified"}</strong>
                </div>
                <div>
                  <span>Deadline</span>
                  <strong>{casting.deadline || "Not specified"}</strong>
                </div>
                <div>
                  <span>Applications</span>
                  <strong>{casting.applications}</strong>
                </div>
              </div>

              <div className="ad-casting-actions">
                <button
                  onClick={() => {
                    setSelected(casting);
                    setAppPage(1);
                  }}
                >
                  View Applicants
                </button>

                <AdminMoreButton
                  onEdit={() => setEditing(casting)}
                  onArchive={async () => {
                    await api(`/admin/castings/${casting.id}`, { method: "DELETE" });
                    await refresh();
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </section>

      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={creating}
        onClose={() => {
          if (!saving) setCreating(false);
        }}
        eyebrow="Create opportunity"
        title="New Casting Call"
        description="Create a clean casting record. Only the title is required; all other criteria are optional."
        width="wide"
      >
        <AdminDialogForm onSubmit={(event) => persist(event)}>
          <CastingFields projects={projects} busy={saving} />
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel={saving ? "Creating…" : "Create Casting Call"} />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
        eyebrow="Manage casting"
        title={editing?.title ?? "Casting"}
        description="Edit, close or reopen this casting call."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={(event) => persist(event, editing.id)}>
            <CastingFields edit={editing} projects={projects} busy={saving} />

            <div className="ad-review-quick">
              <span>Publishing state</span>
              <div>
                <button type="button" className="reject" onClick={() => void setState(false)}>
                  Close
                </button>
                <button type="button" className="select" onClick={() => void setState(true)}>
                  Reopen & Publish
                </button>
              </div>
            </div>

            <AdminDialogActions onCancel={() => setEditing(null)} primaryLabel={saving ? "Saving…" : "Save Changes"} />
          </AdminDialogForm>
        )}
      </AdminDialog>

      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Applicants"
        title={selected?.title ?? "Casting"}
        description={selected ? `${selected.project} · ${selected.location}` : ""}
        width="wide"
      >
        <div className="ad-applicant-panel">
          <div className="ad-applicant-summary">
            <span>Total applications</span>
            <strong>{appMeta?.total ?? selected?.applications ?? 0}</strong>
          </div>

          <AdminCollectionState
            loading={appLoading}
            error={appError}
            empty={!applicants.length}
            emptyText="No applications for this casting call yet."
            onRetry={() => setAppReload((value) => value + 1)}
          />

          <div className="ad-applicant-demo-list">
            {applicants.map((applicant) => (
              <div key={applicant._id}>
                <div className="ad-mini-avatar">{applicant.applicant.name[0]}</div>
                <div>
                  <strong>{applicant.applicant.name}</strong>
                  <span>Application submission</span>
                </div>
                <AdminStatus value={applicant.status} />
                <button onClick={() => window.location.assign("/admin/applications")}>Review</button>
              </div>
            ))}
          </div>

          <PaginationControls meta={appMeta} onPage={setAppPage} compact />

          <AdminDialogActions
            onCancel={() => setSelected(null)}
            primaryLabel="Open Applications Page"
            primaryType="button"
            onPrimary={() => window.location.assign("/admin/applications")}
          />
        </div>
      </AdminDialog>
    </div>
  );
}
