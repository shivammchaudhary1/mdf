"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { api } from "@/services/api";
import { useAppStore } from "@/store/app-store";

type PublicTalent = {
  id: string;
  name: string;
  verified: boolean;
  profile: {
    bio?: string;
    city?: string;
    profession?: string;
    gender?: string;
    age?: number;
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
  } | null;
};

function linkLabel(value: string, fallback: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("youtube") || host === "youtu.be") return "YouTube";
    if (host.includes("facebook") || host === "fb.com") return "Facebook";
    if (host.includes("imdb")) return "IMDb";
    if (host.includes("vimeo")) return "Vimeo";
    return host;
  } catch {
    return fallback;
  }
}

function visitorKey() {
  const storageKey = "mdadu-public-talent-visitor";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const value =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(storageKey, value);
  return value;
}

export function TalentProfileView({ id }: { id: string }) {
  const account = useAppStore((state) => state.account);
  const [data, setData] = useState<PublicTalent>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    void api<PublicTalent>(`/talent/${id}`)
      .then((response) => {
        if (!active) return;
        setData(response);
        setNotFound(false);
      })
      .catch((error: { status?: number }) => {
        if (!active) return;
        setNotFound(error?.status === 404);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!data || account?.id === id) return;

    const key = visitorKey();
    const day = new Date().toISOString().slice(0, 10);
    const localDedupKey = `mdadu-talent-view:${id}:${day}`;

    if (window.localStorage.getItem(localDedupKey)) return;
    window.localStorage.setItem(localDedupKey, "1");

    const params = new URLSearchParams({ visitorKey: key });
    void api(`/talent/${id}/view?${params.toString()}`).catch(() => {
      window.localStorage.removeItem(localDedupKey);
    });
  }, [account?.id, data, id]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main id="main-content">
          <section className="site-section bg-[#fafafa]">
            <div className="site-shell py-20 text-center text-sm text-[#777]">Loading talent profile…</div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (notFound || !data?.profile) {
    return (
      <>
        <SiteHeader />
        <main id="main-content">
          <section className="site-section bg-[#fafafa]">
            <div className="site-shell py-20 text-center">
              <p className="site-kicker">Profile unavailable</p>
              <h1 className="font-display mt-3 text-4xl font-semibold">This public talent profile is not available.</h1>
              <Link href="/talent" className="site-button site-button-primary mt-7">Back to Talent Network</Link>
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const profile = data.profile;

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <Link href="/talent" className="text-xs font-semibold text-[#666]">
              ← Back to Talent Network
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
              <aside className="site-card h-fit overflow-hidden">
                <SiteMedia src={profile.photo ?? ""} alt={data.name} kind="team" className="aspect-[4/5]" />

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-3xl font-semibold">{data.name}</h1>
                    <span className="rounded-full bg-[#edf8f0] px-2.5 py-1 text-[10px] font-bold text-[#2f7543]">
                      ✓ Verified Member
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#666]">{profile.profession || "Creative Member"}</p>

                  <div className="mt-5 grid gap-3 text-sm">
                    <p><strong>Location:</strong> {profile.city || "Not added"}</p>
                    <p><strong>Experience:</strong> {profile.experience || "Not added"}</p>
                    <p><strong>Availability:</strong> {profile.availability || "Not added"}</p>
                    {profile.gender && <p><strong>Gender:</strong> {profile.gender}</p>}
                    {profile.age ? <p><strong>Age:</strong> {profile.age}</p> : null}
                  </div>

                  {profile.showreel && (
                    <a href={profile.showreel} target="_blank" rel="noreferrer" className="site-button site-button-primary mt-6 w-full justify-center">
                      View Intro / Pitch Video ↗
                    </a>
                  )}
                </div>
              </aside>

              <div className="grid gap-6">
                <article className="site-card p-7">
                  <h2 className="font-display text-2xl font-semibold">About</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{profile.bio || "No biography added yet."}</p>
                </article>

                <article className="site-card p-7">
                  <h2 className="font-display text-2xl font-semibold">Skills & Languages</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(profile.skills ?? []).map((item) => (
                      <span key={`skill-${item}`} className="rounded-full bg-[#f4f4f2] px-3 py-1.5 text-xs">{item}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(profile.languages ?? []).map((item) => (
                      <span key={`language-${item}`} className="rounded-full border border-black/10 px-3 py-1.5 text-xs">{item}</span>
                    ))}
                  </div>
                </article>

                {profile.previousWork && (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Previous Work</h2>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{profile.previousWork}</p>
                  </article>
                )}

                {!!profile.portfolio?.length && (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Portfolio</h2>
                    <p className="mt-2 text-sm leading-6 text-[#777]">Public photographs selected by the member.</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {profile.portfolio.map((src, index) => (
                        <SiteMedia
                          key={`${data.id}-portfolio-${index}`}
                          src={src}
                          alt={`${data.name} portfolio ${index + 1}`}
                          kind="gallery"
                          className="aspect-[4/5] rounded-xl"
                        />
                      ))}
                    </div>
                  </article>
                )}

                {profile.showreel || profile.videos?.length || profile.socialLinks?.length ? (
                  <article className="site-card p-7">
                    <h2 className="font-display text-2xl font-semibold">Work Links</h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {profile.videos?.map((value, index) => (
                        <a key={`${value}-${index}`} href={value} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">
                          Video {index + 1} ↗
                        </a>
                      ))}
                      {profile.socialLinks?.map((value, index) => (
                        <a key={`${value}-${index}`} href={value} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">
                          {linkLabel(value, `Link ${index + 1}`)} ↗
                        </a>
                      ))}
                    </div>
                  </article>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
