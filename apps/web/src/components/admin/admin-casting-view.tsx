"use client";

import { type FormEvent, useEffect, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import {
  AdminCollectionState,
  AdminFilters,
  AdminMoreButton,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStatus,
} from "@/components/admin/admin-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { type CastingView, castingView, type ProjectRecord } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { allPages, type ApplicationRecord, fetchPage, type PageMeta, slugFor, uploadMedia } from "@/services/workspace";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

import { useAdminRecords } from "./use-admin-records";

const splitLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitCsv = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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

  async function formBody(form: FormData, id?: string) {
    const title = String(form.get("title") ?? "").trim();
    const cover = form.get("cover");
    const projectId = String(form.get("projectId") ?? "").trim();
    const shootDate = String(form.get("shootDate") ?? "").trim();
    const deadline = String(form.get("deadline") ?? "").trim();
    const ageMinRaw = String(form.get("ageMin") ?? "").trim();
    const ageMaxRaw = String(form.get("ageMax") ?? "").trim();

    let coverMediaId: string | null | undefined;
    if (cover instanceof File && cover.size > 0) coverMediaId = (await uploadMedia(cover)).id;
    else if (id && form.get("removeCover") === "on") coverMediaId = null;

    return {
      title,
      ...(!id ? { slug: slugFor(title) } : {}),
      projectId: projectId || null,
      role: String(form.get("role") ?? "").trim(),
      category: String(form.get("category") ?? "").trim(),
      summary: String(form.get("summary") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      details: splitLines(form.get("details")),
      status: String(form.get("status") ?? "Draft"),
      published: form.get("published") === "on",
      location: String(form.get("location") ?? "").trim(),
      shootDate: shootDate || null,
      deadline: deadline || null,
      ...(ageMinRaw ? { ageMin: Number(ageMinRaw) } : {}),
      ...(ageMaxRaw ? { ageMax: Number(ageMaxRaw) } : {}),
      gender: String(form.get("gender") ?? "").trim(),
      experience: String(form.get("experience") ?? "").trim(),
      compensation: String(form.get("compensation") ?? "").trim(),
      requirements: String(form.get("requirements") ?? "").trim(),
      ...(coverMediaId !== undefined ? { coverMediaId } : {}),
      tags: splitCsv(form.get("tags")),
    };
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/admin/castings", { method: "POST", body: JSON.stringify(await formBody(new FormData(event.currentTarget))) });
      await refresh();
      setCreating(false);
      toast.success("Casting saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save casting.");
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    try {
      await api(`/admin/castings/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(await formBody(new FormData(event.currentTarget), editing.id)),
      });
      await refresh();
      setEditing(null);
      toast.success("Casting updated.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to update casting.");
    }
  }

  async function setState(open: boolean) {
    if (!editing) return;
    try {
      if (open) await api(`/admin/castings/${editing.id}`, { method: "PATCH", body: JSON.stringify({ status: "Open", published: true }) });
      else await api(`/admin/castings/${editing.id}/close`, { method: "PATCH" });
      await refresh();
      setEditing(null);
      toast.success(open ? "Casting reopened." : "Casting closed.");
    } catch (stateError) {
      toast.error(stateError instanceof Error ? stateError.message : "Unable to update casting.");
    }
  }

  const Fields = ({ edit }: { edit?: CastingView }) => (
    <>
      <AdminDialogGrid>
        <AdminFormField label="Title" wide>
          <input name="title" defaultValue={edit?.title} required maxLength={160} />
        </AdminFormField>
        <AdminFormField label="Project">
          <select name="projectId" defaultValue={edit?.projectId ?? ""}>
            <option value="">No linked project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField label="Role">
          <input name="role" defaultValue={edit?.role} maxLength={160} />
        </AdminFormField>
        <AdminFormField label="Category">
          <input name="category" defaultValue={edit?.category} maxLength={100} />
        </AdminFormField>
        <AdminFormField label="Location">
          <input name="location" defaultValue={edit?.location} maxLength={200} />
        </AdminFormField>
        <AdminFormField label="Status">
          <select name="status" defaultValue={edit?.status === "Closing Soon" ? "Open" : (edit?.status ?? "Draft")}>
            <option>Draft</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </AdminFormField>
        <AdminFormField label="Shoot Date">
          <input name="shootDate" type="date" defaultValue={edit?.shootDate} />
        </AdminFormField>
        <AdminFormField label="Application Deadline">
          <input name="deadline" type="date" defaultValue={edit?.deadline} />
        </AdminFormField>
        <AdminFormField label="Minimum Age">
          <input name="ageMin" type="number" min="0" max="120" defaultValue={edit?.ageMin} />
        </AdminFormField>
        <AdminFormField label="Maximum Age">
          <input name="ageMax" type="number" min="0" max="120" defaultValue={edit?.ageMax} />
        </AdminFormField>
        <AdminFormField label="Gender">
          <input name="gender" defaultValue={edit?.gender} maxLength={50} placeholder="Any / Male / Female / ..." />
        </AdminFormField>
        <AdminFormField label="Compensation">
          <input name="compensation" defaultValue={edit?.compensation} maxLength={1000} />
        </AdminFormField>
        <AdminFormField label={edit ? "Replace Cover" : "Cover Image"} wide>
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
        </AdminFormField>
        <AdminFormField label="Summary" wide>
          <textarea name="summary" rows={3} defaultValue={edit?.summary} maxLength={1000} />
        </AdminFormField>
        <AdminFormField label="Description" wide>
          <textarea name="description" rows={5} defaultValue={edit?.description} maxLength={10000} />
        </AdminFormField>
        <AdminFormField label="Details" wide>
          <textarea name="details" rows={5} defaultValue={edit?.details.join("\n")} placeholder="One detail per line" />
        </AdminFormField>
        <AdminFormField label="Experience" wide>
          <textarea name="experience" rows={3} defaultValue={edit?.experience} maxLength={1000} />
        </AdminFormField>
        <AdminFormField label="Requirements" wide>
          <textarea name="requirements" rows={4} defaultValue={edit?.requirements} maxLength={5000} />
        </AdminFormField>
        <AdminFormField label="Tags" wide>
          <input name="tags" defaultValue={edit?.tags.join(", ")} placeholder="actor, hindi, lead" />
        </AdminFormField>
      </AdminDialogGrid>
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

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Opportunity management"
        title="Casting Calls"
        description="Create, publish and manage complete casting-call details."
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
          <article className="ad-casting-card" key={casting.id}>
            <div className="ad-casting-top">
              <span>{casting.category}</span>
              <AdminStatus value={casting.status} />
            </div>
            <h2>{casting.title}</h2>
            <p>{casting.project}</p>
            <div className="ad-casting-detail">
              <div>
                <span>Location</span>
                <strong>{casting.location || "—"}</strong>
              </div>
              <div>
                <span>Deadline</span>
                <strong>{casting.deadline || "—"}</strong>
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
          </article>
        ))}
      </section>
      <PaginationControls meta={meta} onPage={setPage} />

      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow="Create opportunity"
        title="New Casting Call"
        description="Create a complete casting record."
        width="wide"
      >
        <AdminDialogForm onSubmit={create}>
          <Fields />
          <AdminDialogActions onCancel={() => setCreating(false)} primaryLabel="Create Casting Call" />
        </AdminDialogForm>
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Manage casting"
        title={editing?.title ?? "Casting"}
        description="Edit, close or reopen this casting call."
        width="wide"
      >
        {editing && (
          <AdminDialogForm onSubmit={save}>
            <Fields edit={editing} />
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
            <AdminDialogActions onCancel={() => setEditing(null)} primaryLabel="Save Changes" />
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
