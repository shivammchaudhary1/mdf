"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { SiteMedia } from "@/components/site/site-media";
import { useToast } from "@/components/ui/toast-provider";
import { api, ApiError } from "@/services/api";
import { mediaUrl, type MemberProfile, uploadMedia } from "@/services/workspace";

export function ApplyForm({
  opportunityId,
  closed,
  opportunityType,
}: {
  opportunityId: string;
  closed: boolean;
  opportunityType: "PROJECT" | "CASTING";
}) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void api<MemberProfile>("/member/profile")
      .then((result) => {
        if (!active) return;
        setProfile(result);
      })
      .catch((loadError) => {
        if (!active) return;
        if (loadError instanceof ApiError && loadError.status === 401) setLogin(true);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const portfolio = useMemo(() => {
    const ids = profile?.profile?.portfolioMediaIds ?? [];
    const urls = profile?.profile?.portfolio ?? [];
    return ids.map((id, index) => ({ id, image: mediaUrl(urls[index]) }));
  }, [profile]);

  function togglePortfolio(id: string) {
    setSelectedPortfolio((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id].slice(0, 8)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const document = data.get("document");
    setPending(true);
    setError("");
    setLogin(false);

    try {
      let documentMediaId: string | undefined;
      if (document instanceof File && document.size > 0) {
        if (document.type !== "application/pdf") throw new Error("Optional document must be a PDF.");
        documentMediaId = (await uploadMedia(document, "user-resume")).id;
      }

      await api("/member/applications", {
        method: "POST",
        body: JSON.stringify({
          opportunityId,
          opportunityType,
          coverNote: String(data.get("coverNote") ?? "").trim(),
          portfolioMediaIds: selectedPortfolio,
          ...(data.get("showreel") ? { showreelUrl: String(data.get("showreel")) } : {}),
          ...(data.get("pitch") ? { pitch: String(data.get("pitch")).trim() } : {}),
          ...(documentMediaId ? { documentMediaId } : {}),
        }),
      });

      setDone(true);
      toast.success("Application submitted.", "You can track the latest status from your member dashboard.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to apply.";
      setError(message);
      setLogin(submitError instanceof ApiError && submitError.status === 401);
      toast.error("Application not submitted.", message);
    } finally {
      setPending(false);
    }
  }

  if (closed) {
    return <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-900">Applications for this opportunity are closed.</p>;
  }

  if (done) {
    return (
      <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">
        Application submitted.{" "}
        <Link href="/member/applications" className="underline">
          Track your application
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <div>
        <p className="site-kicker">Apply now</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">Share the strongest version of your profile</h2>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Cover note
        <textarea name="coverNote" required minLength={20} maxLength={5000} rows={6} className="field" />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Showreel link (optional)
        <input name="showreel" type="url" placeholder="https://" className="field" />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Pitch / additional note (optional)
        <textarea name="pitch" maxLength={10000} rows={4} className="field" />
      </label>

      {!profileLoading && portfolio.length > 0 && (
        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold">Select portfolio images (up to 8)</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {portfolio.map((item, index) => {
              const selected = selectedPortfolio.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePortfolio(item.id)}
                  className={`overflow-hidden rounded-xl border text-left ${selected ? "border-[var(--brand-red)] ring-2 ring-red-100" : "border-black/10"}`}
                >
                  <SiteMedia src={item.image} alt={`Portfolio ${index + 1}`} kind="team" className="aspect-square" />
                  <span className="block px-2 py-2 text-[10px] font-bold">{selected ? "✓ Selected" : "Select"}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className="grid gap-2 text-sm font-semibold">
        Optional PDF document
        <input name="document" type="file" accept="application/pdf" className="field" />
        <span className="text-xs font-normal text-[#888]">Optional supporting document, maximum 10 MB.</span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {login && (
        <Link href="/login" className="text-sm font-semibold text-red-700">
          Sign in to apply →
        </Link>
      )}

      <button disabled={pending || login} className="site-button site-button-primary justify-center">
        {pending ? "Submitting…" : login ? "Sign in required" : "Submit application"}
      </button>
    </form>
  );
}
