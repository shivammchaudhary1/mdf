"use client";

import { useEffect, useState } from "react";

import { useMemberData } from "@/components/member-data";
import { SiteMedia } from "@/components/site/site-media";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { uploadMedia } from "@/services/workspace";

function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function splitUrls(value: string) {
  return [
    ...new Set(
      value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function validHttps(values: string[]) {
  return values.every((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  });
}

export function MemberProfileSection() {
  const { data, profile, refresh } = useMemberData();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    profession: "",
    city: "",
    gender: "",
    birthDate: "",
    experience: "",
    availability: "",
    skills: "",
    languages: "",
    previousWork: "",
    socialLinks: "",
  });

  useEffect(() => {
    setForm({
      bio: profile.bio ?? "",
      profession: profile.profession ?? "",
      city: profile.city ?? "",
      gender: profile.gender ?? "",
      birthDate: profile.birthDate?.slice(0, 10) ?? "",
      experience: profile.experience ?? "",
      availability: profile.availability ?? "",
      skills: (profile.skills ?? []).join(", "),
      languages: (profile.languages ?? []).join(", "),
      previousWork: profile.previousWork ?? "",
      socialLinks: (profile.socialLinks ?? []).join("\n"),
    });
  }, [profile]);

  function field<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (saving) return;
    const socialLinks = splitUrls(form.socialLinks);

    if (!validHttps(socialLinks)) {
      toast.error("Social links must use valid https:// URLs.");
      return;
    }

    setSaving(true);
    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio: form.bio.trim(),
          profession: form.profession.trim(),
          city: form.city.trim(),
          gender: form.gender.trim(),
          ...(form.birthDate ? { birthDate: form.birthDate } : {}),
          experience: form.experience.trim(),
          availability: form.availability.trim(),
          skills: splitList(form.skills),
          languages: splitList(form.languages),
          previousWork: form.previousWork.trim(),
          socialLinks,
        }),
      });
      await refresh();
      setEditing(false);
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePhoto(file: File) {
    if (saving) return;
    setSaving(true);
    let uploaded: Awaited<ReturnType<typeof uploadMedia>> | undefined;
    try {
      uploaded = await uploadMedia(file);
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({ photoMediaId: uploaded.id }),
      });
      await refresh();
      toast.success("Profile photo saved.");
    } catch (error) {
      if (uploaded && !uploaded.duplicate) {
        await api(`/media/${uploaded.id}`, { method: "DELETE" }).catch(() => undefined);
      }
      toast.error(error instanceof Error ? error.message : "Unable to save photo.");
    } finally {
      setSaving(false);
    }
  }

  function choosePhoto() {
    if (saving) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void updatePhoto(file);
    };
    input.click();
  }

  async function removePhoto() {
    if (saving || !profile.photoMediaId) return;
    setSaving(true);
    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({ photoMediaId: null }),
      });
      await refresh();
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove photo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="md-stack">
      <section className="md-page-header">
        <div>
          <p>Your identity</p>
          <h1>My Profile</h1>
          <span>Keep your public profile current so casting teams see the right version of you.</span>
        </div>
        <button className="md-secondary" onClick={() => setEditing((value) => !value)} disabled={saving}>
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </section>

      <section className="md-profile-grid">
        <aside className="md-card md-profile-summary">
          <div className="md-profile-photo">
            <SiteMedia src={data.member.photo} alt={data.member.name} kind="team" className="aspect-square rounded-full" />
            <button type="button" onClick={choosePhoto} disabled={saving} aria-label="Replace profile photograph">
              ✎
            </button>
          </div>
          <h2>{data.member.name}</h2>
          <p>{data.member.profession}</p>
          <div className="md-badges">
            <span>{data.member.verified ? "✓ Verified Member" : "Not verified"}</span>
            <span>{data.member.availability || "Availability not set"}</span>
          </div>
          <div className="md-mini-details">
            <div>
              <span>Location</span>
              <strong>{data.member.location || "—"}</strong>
            </div>
            <div>
              <span>Experience</span>
              <strong>{profile.experience || "—"}</strong>
            </div>
            <div>
              <span>Member since</span>
              <strong>{data.member.memberSince}</strong>
            </div>
          </div>
          <button className="md-primary full" type="button" onClick={choosePhoto} disabled={saving}>
            {profile.photoMediaId ? "Replace Profile Photo" : "Upload Profile Photo"}
          </button>
          {profile.photoMediaId && (
            <button className="md-secondary full" type="button" onClick={() => void removePhoto()} disabled={saving}>
              Remove Photo
            </button>
          )}
        </aside>

        <div className="md-form-stack">
          <article className="md-card">
            <div className="md-card-head">
              <div>
                <p className="md-kicker">Introduction</p>
                <h2>About You</h2>
              </div>
            </div>
            <label className="md-field">
              <span>Bio</span>
              <textarea rows={5} value={form.bio} onChange={(event) => field("bio", event.target.value)} disabled={!editing} />
            </label>
          </article>

          <article className="md-card">
            <div className="md-card-head">
              <div>
                <p className="md-kicker">Basic details</p>
                <h2>Personal & Professional</h2>
              </div>
            </div>
            <div className="md-form-grid">
              <label className="md-field">
                <span>Profession</span>
                <input value={form.profession} onChange={(event) => field("profession", event.target.value)} disabled={!editing} />
              </label>
              <label className="md-field">
                <span>City</span>
                <input value={form.city} onChange={(event) => field("city", event.target.value)} disabled={!editing} />
              </label>
              <label className="md-field">
                <span>Gender</span>
                <select value={form.gender} onChange={(event) => field("gender", event.target.value)} disabled={!editing}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>
              <label className="md-field">
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => field("birthDate", event.target.value)}
                  disabled={!editing}
                />
              </label>
              <label className="md-field">
                <span>Experience</span>
                <input value={form.experience} onChange={(event) => field("experience", event.target.value)} disabled={!editing} />
              </label>
              <label className="md-field">
                <span>Availability</span>
                <input value={form.availability} onChange={(event) => field("availability", event.target.value)} disabled={!editing} />
              </label>
            </div>
          </article>

          <article className="md-card">
            <div className="md-card-head">
              <div>
                <p className="md-kicker">Skills</p>
                <h2>Skills & Languages</h2>
              </div>
            </div>
            {editing ? (
              <div className="md-form-grid">
                <label className="md-field">
                  <span>Skills — comma separated</span>
                  <textarea rows={4} value={form.skills} onChange={(event) => field("skills", event.target.value)} />
                </label>
                <label className="md-field">
                  <span>Languages — comma separated</span>
                  <textarea rows={4} value={form.languages} onChange={(event) => field("languages", event.target.value)} />
                </label>
              </div>
            ) : (
              <div className="md-tag-block">
                <span>Skills</span>
                <div>{(profile.skills ?? []).length ? profile.skills?.map((item) => <i key={item}>{item}</i>) : <i>Not added</i>}</div>
                <span>Languages</span>
                <div>
                  {(profile.languages ?? []).length ? profile.languages?.map((item) => <i key={item}>{item}</i>) : <i>Not added</i>}
                </div>
              </div>
            )}
          </article>

          <article className="md-card">
            <div className="md-card-head">
              <div>
                <p className="md-kicker">Experience</p>
                <h2>Previous Work & Social Links</h2>
              </div>
            </div>
            <label className="md-field">
              <span>Previous Work</span>
              <textarea
                rows={5}
                value={form.previousWork}
                onChange={(event) => field("previousWork", event.target.value)}
                disabled={!editing}
                placeholder="Selected projects, productions, credits or relevant work."
              />
            </label>
            <label className="md-field">
              <span>Social Links — one HTTPS URL per line</span>
              <textarea
                rows={5}
                value={form.socialLinks}
                onChange={(event) => field("socialLinks", event.target.value)}
                disabled={!editing}
                placeholder={"https://instagram.com/...\nhttps://youtube.com/..."}
              />
            </label>
          </article>

          {editing && (
            <div className="md-save-row">
              <button className="md-secondary" type="button" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="md-primary" type="button" disabled={saving} onClick={() => void save()}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
