"use client";

import { useEffect, useState } from "react";

import { useMemberData } from "@/components/member-data";
import { SiteMedia } from "@/components/site/site-media";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { uploadMedia } from "@/services/workspace";

const SKILL_OPTIONS = [
  "Acting",
  "Theatre",
  "Screen Acting",
  "Direction",
  "DOP / Cinematography",
  "Camera",
  "Lighting",
  "Editing",
  "Sound",
  "Screenwriting",
  "Production",
  "Production Design",
  "Makeup",
  "Costume",
  "Dance",
  "Voice Over",
  "Photography",
  "Music",
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Urdu",
  "Punjabi",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Bhojpuri",
];

type SocialLinksForm = {
  youtube: string;
  instagram: string;
  facebook: string;
  other: string;
};

type ProfileForm = {
  bio: string;
  profession: string;
  city: string;
  gender: string;
  birthDate: string;
  experience: string;
  availability: string;
  skills: string[];
  languages: string[];
  previousWork: string;
  socialLinks: SocialLinksForm;
};

type TextField = Exclude<keyof ProfileForm, "skills" | "languages" | "socialLinks">;

function validHttps(values: string[]) {
  return values.every((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  });
}

function hostMatches(value: string, domains: string[]) {
  if (!value.trim()) return true;

  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function socialForm(values: string[] = []): SocialLinksForm {
  const result: SocialLinksForm = { youtube: "", instagram: "", facebook: "", other: "" };

  for (const value of values) {
    let host = "";

    try {
      host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      if (!result.other) result.other = value;
      continue;
    }

    if (!result.youtube && (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com"))) {
      result.youtube = value;
    } else if (!result.instagram && (host === "instagram.com" || host.endsWith(".instagram.com"))) {
      result.instagram = value;
    } else if (
      !result.facebook &&
      (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com" || host.endsWith(".fb.com"))
    ) {
      result.facebook = value;
    } else if (!result.other) {
      result.other = value;
    }
  }

  return result;
}

function MultiSelectField({
  label,
  placeholder,
  options,
  values,
  customValue,
  onCustomChange,
  onToggle,
  onAddCustom,
}: {
  label: string;
  placeholder: string;
  options: string[];
  values: string[];
  customValue: string;
  onCustomChange: (value: string) => void;
  onToggle: (value: string) => void;
  onAddCustom: () => void;
}) {
  const [otherOpen, setOtherOpen] = useState(false);

  return (
    <div className="md-field">
      <span>{label}</span>

      <details className="md-multi-select">
        <summary>{values.length ? `${values.length} selected` : placeholder}</summary>

        <div className="md-multi-menu">
          <div className="md-multi-options">
            {options.map((option) => (
              <label key={option} className="md-multi-option">
                <input type="checkbox" checked={values.includes(option)} onChange={() => onToggle(option)} />
                <span>{option}</span>
              </label>
            ))}

            <label className="md-multi-option">
              <input type="checkbox" checked={otherOpen} onChange={(event) => setOtherOpen(event.target.checked)} />
              <span>Other</span>
            </label>
          </div>

          {otherOpen && (
            <div className="md-multi-other">
              <strong>Add your own</strong>
              <div>
                <input
                  value={customValue}
                  onChange={(event) => onCustomChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onAddCustom();
                    }
                  }}
                  placeholder={`Add another ${label.toLowerCase().replace("select ", "")}`}
                />
                <button type="button" onClick={onAddCustom} disabled={!customValue.trim()}>
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

export function MemberProfileSection() {
  const { data, profile, refresh } = useMemberData();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    bio: "",
    profession: "",
    city: "",
    gender: "",
    birthDate: "",
    experience: "",
    availability: "",
    skills: [],
    languages: [],
    previousWork: "",
    socialLinks: { youtube: "", instagram: "", facebook: "", other: "" },
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
      skills: profile.skills ?? [],
      languages: profile.languages ?? [],
      previousWork: profile.previousWork ?? "",
      socialLinks: socialForm(profile.socialLinks ?? []),
    });
    setCustomSkill("");
    setCustomLanguage("");
  }, [profile]);

  function field(key: TextField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function socialField(key: keyof SocialLinksForm, value: string) {
    setForm((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [key]: value },
    }));
  }

  function toggleList(key: "skills" | "languages", value: string) {
    const current = form[key];

    if (current.includes(value)) {
      setForm((state) => ({ ...state, [key]: state[key].filter((item) => item !== value) }));
      return;
    }

    if (current.length >= 30) {
      toast.info(`You can select up to 30 ${key}.`);
      return;
    }

    setForm((state) => ({ ...state, [key]: [...state[key], value] }));
  }

  function addCustom(key: "skills" | "languages", value: string, clear: () => void) {
    const item = value.trim();
    if (!item) return;

    if (form[key].some((current) => current.toLowerCase() === item.toLowerCase())) {
      clear();
      return;
    }

    if (form[key].length >= 30) {
      toast.info(`You can select up to 30 ${key}.`);
      return;
    }

    setForm((state) => ({ ...state, [key]: [...state[key], item] }));
    clear();
  }

  async function save() {
    if (saving) return;

    const socialLinks = Object.values(form.socialLinks)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!validHttps(socialLinks)) {
      toast.error("Social links must use valid https:// URLs.");
      return;
    }

    if (!hostMatches(form.socialLinks.youtube, ["youtube.com", "youtu.be"])) {
      toast.error("YouTube must contain a valid YouTube link.");
      return;
    }

    if (!hostMatches(form.socialLinks.instagram, ["instagram.com"])) {
      toast.error("Instagram must contain a valid Instagram link.");
      return;
    }

    if (!hostMatches(form.socialLinks.facebook, ["facebook.com", "fb.com"])) {
      toast.error("Facebook must contain a valid Facebook link.");
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
          skills: form.skills,
          languages: form.languages,
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
      uploaded = await uploadMedia(file, "member-profile");

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
                <MultiSelectField
                  label="Select skills"
                  placeholder="Choose one or more skills"
                  options={SKILL_OPTIONS}
                  values={form.skills}
                  customValue={customSkill}
                  onCustomChange={setCustomSkill}
                  onToggle={(value) => toggleList("skills", value)}
                  onAddCustom={() => addCustom("skills", customSkill, () => setCustomSkill(""))}
                />

                <MultiSelectField
                  label="Select languages"
                  placeholder="Choose one or more languages"
                  options={LANGUAGE_OPTIONS}
                  values={form.languages}
                  customValue={customLanguage}
                  onCustomChange={setCustomLanguage}
                  onToggle={(value) => toggleList("languages", value)}
                  onAddCustom={() => addCustom("languages", customLanguage, () => setCustomLanguage(""))}
                />
              </div>
            ) : (
              <div className="md-tag-block">
                <span>Skills</span>
                <div>{form.skills.length ? form.skills.map((item) => <i key={item}>{item}</i>) : <i>Not added</i>}</div>

                <span>Languages</span>
                <div>{form.languages.length ? form.languages.map((item) => <i key={item}>{item}</i>) : <i>Not added</i>}</div>
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

            <div className="md-social-grid">
              <label className="md-field">
                <span>YouTube</span>
                <input
                  type="url"
                  value={form.socialLinks.youtube}
                  onChange={(event) => socialField("youtube", event.target.value)}
                  disabled={!editing}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </label>

              <label className="md-field">
                <span>Instagram</span>
                <input
                  type="url"
                  value={form.socialLinks.instagram}
                  onChange={(event) => socialField("instagram", event.target.value)}
                  disabled={!editing}
                  placeholder="https://instagram.com/yourprofile"
                />
              </label>

              <label className="md-field">
                <span>Facebook</span>
                <input
                  type="url"
                  value={form.socialLinks.facebook}
                  onChange={(event) => socialField("facebook", event.target.value)}
                  disabled={!editing}
                  placeholder="https://facebook.com/yourprofile"
                />
              </label>

              <label className="md-field">
                <span>Other</span>
                <input
                  type="url"
                  value={form.socialLinks.other}
                  onChange={(event) => socialField("other", event.target.value)}
                  disabled={!editing}
                  placeholder="https://your-portfolio-or-other-link.com"
                />
              </label>
            </div>
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
