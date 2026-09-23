"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";
import { api } from "@/services/api";
import type { Page, PageMeta } from "@/services/workspace";

const groupTabs = [
  { label: "All Talent", value: "all" },
  { label: "Actors", value: "actor" },
  { label: "Crew", value: "crew" },
  { label: "Writers", value: "writer" },
  { label: "Creators", value: "creator" },
] as const;

const blank = {
  search: "",
  city: "",
  profession: "",
  gender: "",
  skill: "",
  language: "",
  availability: "",
  experience: "",
  ageMin: "",
  ageMax: "",
};

type Filters = typeof blank;

type PublicTalentProfile = {
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
};

type PublicTalent = {
  id: string;
  name: string;
  verified: boolean;
  profile: PublicTalentProfile | null;
};

type TalentOptions = {
  cities: string[];
  professions: string[];
  genders: string[];
  languages: string[];
  availabilities: string[];
};

const inputClass =
  "h-9 w-full rounded-[9px] border border-black/10 bg-[#fbfbf9] px-3 text-[12px] text-[#222] outline-none transition placeholder:text-[#aaa] focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/[.03]";

function groupLabel(profession = "") {
  if (/actor/i.test(profession)) return "Actor";
  if (/writer/i.test(profession)) return "Writer";
  if (/creator/i.test(profession)) return "Creator";
  return "Crew";
}

function experienceLabel(value?: string) {
  return value?.trim() || "Not added";
}

export function TalentPageView() {
  const pageContent = websiteData.talentPage;
  const pageSize = pageContent.directory.pageSize || 20;
  const [activeGroup, setActiveGroup] = useState<(typeof groupTabs)[number]["value"]>("all");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(blank);
  const [filters, setFilters] = useState<Filters>(blank);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [items, setItems] = useState<PublicTalent[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [options, setOptions] = useState<TalentOptions>({
    cities: [],
    professions: [],
    genders: [],
    languages: [],
    availabilities: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const ageError = Boolean(draft.ageMin && draft.ageMax && Number(draft.ageMin) > Number(draft.ageMax));

  const queryPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    if (activeGroup === "actor" || activeGroup === "writer" || activeGroup === "crew") {
      params.set("group", activeGroup);
    } else if (activeGroup === "creator") {
      params.set("profession", filters.profession || "creator");
    } else if (filters.profession) {
      params.set("profession", filters.profession);
    }

    if (filters.search) params.set("search", filters.search.trim());
    if (filters.city) params.set("city", filters.city);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.skill) params.set("skills", filters.skill.trim());
    if (filters.language) params.set("languages", filters.language);
    if (filters.availability) params.set("availability", filters.availability);
    if (filters.experience) params.set("experience", filters.experience);
    if (filters.ageMin) params.set("ageMin", filters.ageMin);
    if (filters.ageMax) params.set("ageMax", filters.ageMax);

    return `/talent?${params.toString()}`;
  }, [activeGroup, filters, page, pageSize]);

  useEffect(() => {
    void api<TalentOptions>("/talent/options")
      .then(setOptions)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    void api<Page<PublicTalent>>(queryPath)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setMeta(response.meta);
      })
      .catch((error) => {
        if (!active) return;
        setItems([]);
        setMeta(undefined);
        setLoadError(error instanceof Error ? error.message : "Unable to load talent profiles.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryPath]);

  useEffect(() => {
    setPage(1);
  }, [activeGroup, filters]);

  function apply() {
    if (ageError) return;
    setFilters({ ...draft });
    setPage(1);
  }

  function clear() {
    setDraft(blank);
    setFilters(blank);
    setActiveGroup("all");
    setAdvancedOpen(false);
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    requestAnimationFrame(() => {
      document.getElementById("talent-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav className="flex items-center gap-3 text-[11px] font-semibold text-[#888]" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#444]">Talents</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{pageContent.hero.eyebrow}</p>
                  <span className="h-px w-12 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {pageContent.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">{pageContent.hero.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {pageContent.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/8 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#555]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <Image
                src={pageContent.hero.image}
                alt={pageContent.hero.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent lg:block" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell">
            <div className="max-w-2xl">
              <p className="site-kicker">Talent Directory</p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-.02em] text-[#111] sm:text-4xl">
                Find the right person for the next frame.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#777]">
                Live public profiles from verified M. Dadu Films members who have chosen to make their talent profile visible.
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[14px] border border-black/6 bg-white shadow-[0_8px_24px_rgba(0,0,0,.035)]">
              <div className="border-b border-black/6 bg-[#f8f8f6] px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {groupTabs.map((tab) => {
                    const active = activeGroup === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                          setActiveGroup(tab.value);
                          setPage(1);
                        }}
                        className={`inline-flex h-8 items-center rounded-full px-3 text-[10px] font-bold transition ${
                          active
                            ? "bg-[#111] text-white shadow-sm"
                            : "border border-black/8 bg-white text-[#666] hover:border-black/15 hover:text-[#111]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <input
                      aria-label="Search talent"
                      className={inputClass}
                      placeholder="Search name, role, skill or location"
                      value={draft.search}
                      onChange={(event) => setDraft({ ...draft, search: event.target.value })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") apply();
                      }}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <select
                      aria-label="City"
                      className={inputClass}
                      value={draft.city}
                      onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                    >
                      <option value="">All cities</option>
                      {options.cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <select
                      aria-label="Profession"
                      className={inputClass}
                      value={draft.profession}
                      onChange={(event) => setDraft({ ...draft, profession: event.target.value })}
                      disabled={activeGroup === "creator"}
                    >
                      <option value="">All roles</option>
                      {options.professions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((open) => !open)}
                    className={`h-9 rounded-[9px] border px-3 text-[10px] font-bold transition lg:col-span-1 ${
                      advancedOpen ? "border-[#111] bg-[#111] text-white" : "border-black/10 bg-white text-[#555] hover:border-black/20"
                    }`}
                  >
                    {advancedOpen ? "Less" : "More"}
                  </button>

                  <button
                    type="button"
                    onClick={clear}
                    className="h-9 rounded-[9px] border border-black/10 bg-white px-3 text-[10px] font-bold text-[#555] transition hover:border-black/20 hover:text-[#111] lg:col-span-1"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={apply}
                    disabled={ageError}
                    className="h-9 rounded-[9px] bg-[var(--brand-red)] px-3 text-[10px] font-bold text-white transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-40 lg:col-span-2"
                  >
                    Apply Filters
                  </button>
                </div>

                {advancedOpen && (
                  <div className="mt-3 grid gap-2 border-t border-black/6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Skill</span>
                      <input
                        className={inputClass}
                        placeholder="e.g. Theatre, Editing"
                        value={draft.skill}
                        onChange={(event) => setDraft({ ...draft, skill: event.target.value })}
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Language</span>
                      <select className={inputClass} value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })}>
                        <option value="">Any language</option>
                        {options.languages.map((language) => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Gender</span>
                      <select className={inputClass} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })}>
                        <option value="">Any gender</option>
                        {options.genders.map((gender) => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Availability</span>
                      <select className={inputClass} value={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.target.value })}>
                        <option value="">Any availability</option>
                        {options.availabilities.map((availability) => (
                          <option key={availability} value={availability}>{availability}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Experience</span>
                      <input
                        className={inputClass}
                        placeholder="e.g. 3 years"
                        value={draft.experience}
                        onChange={(event) => setDraft({ ...draft, experience: event.target.value })}
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Minimum age</span>
                      <input
                        className={inputClass}
                        type="number"
                        min="16"
                        max="100"
                        placeholder="Min age"
                        value={draft.ageMin}
                        onChange={(event) => setDraft({ ...draft, ageMin: event.target.value })}
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Maximum age</span>
                      <input
                        className={inputClass}
                        type="number"
                        min="16"
                        max="100"
                        placeholder="Max age"
                        value={draft.ageMax}
                        onChange={(event) => setDraft({ ...draft, ageMax: event.target.value })}
                      />
                    </label>
                  </div>
                )}

                {ageError && <p className="mt-2 text-[10px] font-semibold text-[#c5353e]">Minimum age cannot exceed maximum age.</p>}
              </div>
            </div>

            <div id="talent-results" className="scroll-mt-28 pt-10">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#999]">Public profiles</p>
                <h3 className="font-display mt-1 text-2xl font-semibold text-[#111]">
                  {loading ? "Loading talent…" : items.length ? "People ready to collaborate" : "No matching talent"}
                </h3>
              </div>

              {loadError ? (
                <div className="rounded-[24px] border border-black/6 bg-white px-6 py-14 text-center">
                  <p className="site-kicker">Unable to load</p>
                  <h3 className="font-display mt-2 text-3xl font-semibold">Talent directory is temporarily unavailable.</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777]">{loadError}</p>
                </div>
              ) : !loading && items.length === 0 ? (
                <div className="rounded-[24px] border border-black/6 bg-white px-6 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,.035)]">
                  <p className="site-kicker">No Results</p>
                  <h3 className="font-display mt-2 text-3xl font-semibold">No public talent profiles found.</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777]">
                    Only verified members who enable Public talent profile appear here.
                  </p>
                  <button type="button" onClick={clear} className="site-button site-button-outline mt-6">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((talent) => {
                    const profile = talent.profile ?? {};
                    const group = groupLabel(profile.profession);
                    return (
                      <article
                        key={talent.id}
                        className="group relative overflow-hidden rounded-[20px] border border-black/6 bg-white shadow-[0_14px_38px_rgba(0,0,0,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.08)]"
                      >
                        <Link href={`/talent/${talent.id}`} aria-label={`View ${talent.name} portfolio`} className="absolute inset-0 z-10 cursor-pointer">
                          <span className="sr-only">View {talent.name} portfolio</span>
                        </Link>

                        <div className="relative">
                          <SiteMedia
                            src={profile.photo ?? ""}
                            alt={`${talent.name}, ${profile.profession ?? "Talent"}`}
                            kind="team"
                            className="aspect-[4/4.7] bg-[#efeee9]"
                            imageClassName="transition duration-500 group-hover:scale-[1.025]"
                          />
                          <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.1em] text-[#444] shadow-sm backdrop-blur">
                            {group}
                          </div>
                          <div className="absolute right-3 top-3 rounded-full border border-[#cfe8d5] bg-[#eff9f1]/95 px-3 py-1.5 text-[9px] font-black text-[#2f7041] shadow-sm backdrop-blur">
                            ✓ Verified
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-display truncate text-[22px] font-semibold leading-tight text-[#111]">{talent.name}</h3>
                              <p className="mt-1 truncate text-sm font-medium text-[#666]">{profile.profession || "Creative Member"}</p>
                            </div>
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                profile.availability === "Available"
                                  ? "bg-[#4f9b62]"
                                  : profile.availability === "Limited"
                                    ? "bg-[#d49b45]"
                                    : "bg-[#aaa]"
                              }`}
                              title={profile.availability || "Availability not added"}
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 border-y border-black/6 py-3 text-[11px]">
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#aaa]">Based in</span>
                              <strong className="mt-1 block font-semibold text-[#555]">{profile.city || "Not added"}</strong>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#aaa]">Experience</span>
                              <strong className="mt-1 block font-semibold text-[#555]">{experienceLabel(profile.experience)}</strong>
                            </div>
                          </div>

                          <div className="mt-4 flex min-h-7 flex-wrap gap-1.5">
                            {(profile.skills ?? []).slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-full bg-[#f4f4f1] px-2.5 py-1.5 text-[10px] font-semibold text-[#666]">
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-semibold text-[#999]">
                            <span>{profile.age ? `${profile.age} yrs` : "Age not added"}{profile.gender ? ` · ${profile.gender}` : ""}</span>
                            <span className="truncate text-right">{(profile.languages ?? []).slice(0, 2).join(" · ") || "Languages not added"}</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <PaginationControls meta={meta} onPage={changePage} />
            </div>

            <div className="relative mt-12 overflow-hidden rounded-[20px] bg-[#101010] p-7 text-white sm:p-8 lg:px-10 lg:py-9">
              <div className="absolute inset-y-0 right-0 hidden w-[54%] sm:block">
                <SiteMedia
                  src={pageContent.supportingSection.image}
                  alt={pageContent.supportingSection.imageAlt}
                  kind="team"
                  className="h-full"
                  imageClassName="object-cover object-center opacity-100"
                />
                <div className="absolute inset-y-0 left-0 w-[34%] bg-gradient-to-r from-[#101010] via-[#101010]/55 to-transparent" aria-hidden="true" />
              </div>

              <div className="relative z-10 max-w-xl">
                <p className="site-kicker !text-[#ff646b]">{pageContent.supportingSection.eyebrow}</p>
                <h2 className="font-display mt-3 text-3xl font-semibold">{pageContent.supportingSection.title}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/58">{pageContent.supportingSection.description}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
