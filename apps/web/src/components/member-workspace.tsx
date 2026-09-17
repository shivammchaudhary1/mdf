"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Workspace, useApiData, LoadError } from "@/components/workspace";
import { api, type CurrentUser } from "@/services/api";
import { LoadingState, EmptyState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { MediaUpload } from "@/components/media-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { runtimeConfig } from "@/config/runtime";
import { CollectionBrowser } from "@/components/collection-browser";
import type { ApiContent } from "@/services/content";
type Profile = {
  completion: number;
  bio?: string;
  city?: string;
  profession?: string;
  gender?: string;
  birthDate?: string;
  skills?: string[];
  languages?: string[];
  experience?: string;
  availability?: string;
  photo?: string;
  portfolio?: string[];
  videos?: string[];
  showreel?: string;
  previousWork?: string;
  socialLinks?: string[];
  resume?: string;
};
export type ApplicationRecord = {
  _id: string;
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  status: string;
  coverNote: string;
  adminNotes?: string;
  createdAt: string;
};
function Applications() {
  const { data, error, reload } = useApiData<ApplicationRecord[]>(
    "/member/applications",
  );
  if (error) return <LoadError message={error} retry={reload} />;
  if (!data) return <LoadingState />;
  return data.length ? (
    <div className="grid gap-4">
      {data.map((item) => (
        <article key={item._id} className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl">{item.opportunityTitle}</h2>
            <span className="badge">{item.status}</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Applied {new Date(item.createdAt).toLocaleDateString()}
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">
              View your application
            </summary>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
              {item.coverNote}
            </p>
          </details>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState
      title="Your next story starts with an application."
      description="Explore opportunities to find a role that fits your skills."
    />
  );
}
function ProfileEditor({ portfolioOnly = false }: { portfolioOnly?: boolean }) {
  const { data, error, reload } = useApiData<Profile>("/member/profile");
  if (error) return <LoadError message={error} retry={reload} />;
  if (!data) return <LoadingState />;
  return (
    <ProfileForm
      key={JSON.stringify(data)}
      profile={data}
      reload={reload}
      portfolioOnly={portfolioOnly}
    />
  );
}
function ProfileForm({
  profile,
  reload,
  portfolioOnly,
}: {
  profile: Profile;
  reload: () => void;
  portfolioOnly: boolean;
}) {
  const toast = useToast();
  const [photo, setPhoto] = useState(profile.photo ?? "");
  const [portfolio, setPortfolio] = useState(profile.portfolio ?? []);
  const [resume, setResume] = useState(profile.resume ?? "");
  const [remove, setRemove] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload: Record<string, unknown> = { photo, portfolio, resume };
    for (const [key, value] of Object.entries(values)) {
      const text = String(value).trim();
      if (["skills", "languages", "videos", "socialLinks"].includes(key))
        payload[key] = text
          .split(key === "skills" || key === "languages" ? "," : "\n")
          .map((v) => v.trim())
          .filter(Boolean);
      else if (text || !["showreel", "birthDate"].includes(key))
        payload[key] = text;
    }
    setPending(true);
    setError("");
    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Changes saved successfully.");
      reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }
  const textFields = [
    ["bio", "About you"],
    ["city", "City"],
    ["profession", "Profession / category"],
    ["gender", "Gender (optional)"],
    ["experience", "Experience"],
    ["availability", "Availability"],
    ["previousWork", "Previous work"],
  ];
  return (
    <form onSubmit={save} className="grid gap-8">
      <div className="card p-6">
        <p className="mb-4 font-semibold">
          Profile completion · {profile.completion}%
        </p>
        <progress
          className="h-2 w-full accent-red-600"
          value={profile.completion}
          max={100}
        />
      </div>
      {!portfolioOnly && (
        <div className="card grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <SmartImage
              src={photo}
              placeholderKind="team"
              alt="Your profile photo"
              width={160}
              height={160}
              className="mb-5 rounded-xl"
            />
            <MediaUpload onUploaded={(media) => setPhoto(media.urls.profile)} />
          </div>
          <div className="grid gap-5">
            {textFields.slice(1, 3).map(([name, label]) => (
              <label key={name} className="grid gap-2 text-sm font-semibold">
                {label}
                <input
                  name={name}
                  defaultValue={String(profile[name as keyof Profile] ?? "")}
                  className="field"
                  maxLength={100}
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-semibold">
              Date of birth
              <input
                type="date"
                name="birthDate"
                defaultValue={profile.birthDate?.slice(0, 10)}
                max={new Date().toISOString().slice(0, 10)}
                className="field"
              />
            </label>
          </div>
          {textFields
            .filter(([,], index) => index !== 1 && index !== 2)
            .map(([name, label]) => (
              <label key={name} className="grid gap-2 text-sm font-semibold">
                {label}
                <textarea
                  name={name}
                  defaultValue={String(profile[name as keyof Profile] ?? "")}
                  className="field"
                  rows={3}
                  maxLength={name === "previousWork" ? 5000 : 1000}
                />
              </label>
            ))}
          {["skills", "languages"].map((name) => (
            <label
              key={name}
              className="grid gap-2 text-sm font-semibold capitalize"
            >
              {name} (comma separated)
              <input
                name={name}
                defaultValue={(
                  profile[name as "skills" | "languages"] ?? []
                ).join(", ")}
                className="field"
              />
            </label>
          ))}
        </div>
      )}
      <div className="card grid gap-6 p-6">
        <h2 className="font-display text-2xl">Portfolio photographs</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {portfolio.map((path) => (
            <div key={path}>
              <SmartImage
                src={path}
                alt="Portfolio photograph"
                placeholderKind="gallery"
                width={400}
                height={300}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setRemove(path)}
                className="mt-2 text-sm text-red-700"
              >
                Remove photo
              </button>
            </div>
          ))}
        </div>
        {portfolio.length < 30 && (
          <MediaUpload
            onUploaded={(media) =>
              setPortfolio((values) => [...values, media.urls.medium])
            }
          />
        )}
        <p className="text-sm text-slate-500">
          Save changes after adding or removing photos.
        </p>
      </div>
      <div className="card grid gap-5 p-6">
        <label className="grid gap-2 text-sm font-semibold">
          Showreel URL
          <input
            name="showreel"
            type="url"
            className="field"
            placeholder="https://"
            defaultValue={profile.showreel}
          />
        </label>
        {["videos", "socialLinks"].map((name) => (
          <label key={name} className="grid gap-2 text-sm font-semibold">
            {name === "videos" ? "Video URLs" : "Social profile URLs"} (one
            HTTPS link per line)
            <textarea
              name={name}
              className="field"
              rows={3}
              defaultValue={(
                profile[name as "videos" | "socialLinks"] ?? []
              ).join("\n")}
            />
          </label>
        ))}
        <MediaUpload
          document
          onUploaded={(media) => setResume(media.urls.document)}
        />
        {resume && (
          <a
            href={`${new URL(runtimeConfig.apiUrl).origin}${resume}`}
            className="text-sm text-red-700"
            target="_blank"
            rel="noreferrer"
          >
            Download your resume ↗
          </a>
        )}
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="brand-button brand-button-primary justify-self-start"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
      <ConfirmDialog
        open={!!remove}
        title="Remove this portfolio photo?"
        description="It will be removed from your portfolio when you save changes."
        destructive
        onCancel={() => setRemove(null)}
        onConfirm={() => {
          setPortfolio((values) => values.filter((value) => value !== remove));
          setRemove(null);
        }}
      />
    </form>
  );
}
function Opportunities() {
  const { data, error, reload } = useApiData<ApiContent[]>("/content/casting");
  if (error) return <LoadError message={error} retry={reload} />;
  return data ? (
    <CollectionBrowser kind="casting" items={data} />
  ) : (
    <LoadingState />
  );
}
function Overview({ user }: { user: CurrentUser }) {
  const { data } = useApiData<Profile>("/member/profile");
  return (
    <>
      <div className="mb-8 rounded-2xl bg-[var(--surface-dark)] p-8 text-white">
        <p className="text-sm uppercase tracking-widest text-[var(--brand-gold)]">
          People · Stories · Cinema
        </p>
        <h1 className="font-display mt-4 text-4xl">Welcome, {user.name}.</h1>
        <p className="mt-4 text-white/70">
          Keep creating. Your next opportunity starts here.
        </p>
      </div>
      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        <Link href="/member/profile" className="card p-6">
          <h2 className="font-semibold">Complete your profile</h2>
          <p className="mt-3 text-3xl font-semibold">
            {data?.completion ?? 0}%
          </p>
          <progress
            className="mt-4 h-2 w-full accent-red-600"
            value={data?.completion ?? 0}
            max={100}
          />
        </Link>
        <div className="card p-6">
          <h2 className="font-semibold">Verification status</h2>
          <p className="mt-3 text-lg">
            {user.verified ? "Verified member" : "Not yet verified"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Member verification is managed by M. Dadu Films.
          </p>
        </div>
      </div>
      <h2 className="font-display mb-6 text-3xl">Your applications</h2>
      <Applications />
      <Link
        href="/member/opportunities"
        className="brand-button brand-button-primary mt-8"
      >
        Explore opportunities →
      </Link>
    </>
  );
}
export function MemberWorkspace({
  section = "dashboard",
}: {
  section?: string;
}) {
  return (
    <Workspace section={section}>
      {(user) => (
        <>
          {section !== "dashboard" && (
            <h1 className="font-display mb-8 text-4xl font-semibold">
              {(
                {
                  profile: "My profile",
                  portfolio: "My portfolio",
                  applications: "My applications",
                  opportunities: "Explore opportunities",
                  settings: "Account settings",
                } as Record<string, string>
              )[section] ?? "Member dashboard"}
            </h1>
          )}
          {section === "profile" ? (
            <ProfileEditor />
          ) : section === "portfolio" ? (
            <ProfileEditor portfolioOnly />
          ) : section === "applications" ? (
            <Applications />
          ) : section === "opportunities" ? (
            <Opportunities />
          ) : section === "settings" ? (
            <div className="card p-7">
              <h2 className="font-semibold">{user.name}</h2>
              <p className="mt-3">{user.email}</p>
              <p className="mt-2">{user.mobile}</p>
              <Link
                href="/forgot-password"
                className="brand-button mt-6 border"
              >
                Change password
              </Link>
            </div>
          ) : (
            <Overview user={user} />
          )}
        </>
      )}
    </Workspace>
  );
}
