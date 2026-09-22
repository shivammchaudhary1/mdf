"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";

const groupTabs = [
  { label: "All Talent", value: "All" },
  { label: "Actors", value: "Actor" },
  { label: "Crew", value: "Crew" },
  { label: "Writers", value: "Writer" },
  { label: "Creators", value: "Creator" },
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
type Talent = (typeof websiteData.talentPage.directory.items)[number];

const inputClass =
  "h-9 w-full rounded-[9px] border border-black/10 bg-[#fbfbf9] px-3 text-[12px] text-[#222] outline-none transition placeholder:text-[#aaa] focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/[.03]";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function TalentPageView() {
  const pageContent = websiteData.talentPage;
  const talents = pageContent.directory.items as Talent[];
  const pageSize = pageContent.directory.pageSize;
  const [activeGroup, setActiveGroup] = useState<(typeof groupTabs)[number]["value"]>("All");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(blank);
  const [filters, setFilters] = useState<Filters>(blank);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const cities = useMemo(() => unique(talents.map((talent) => talent.location)), [talents]);
  const roles = useMemo(() => unique(talents.map((talent) => talent.role)), [talents]);
  const genders = useMemo(() => unique(talents.map((talent) => talent.gender)), [talents]);
  const languages = useMemo(() => unique(talents.flatMap((talent) => talent.languages)), [talents]);
  const availabilities = useMemo(() => unique(talents.map((talent) => talent.availability)), [talents]);



  const filteredTalents = useMemo(() => {
    const search = normalize(filters.search);
    const skill = normalize(filters.skill);

    return talents.filter((talent) => {
      if (activeGroup !== "All" && talent.group !== activeGroup) return false;

      if (search) {
        const haystack = normalize(
          [talent.name, talent.role, talent.location, talent.group, ...talent.skills, ...talent.languages].join(" "),
        );
        if (!haystack.includes(search)) return false;
      }

      if (filters.city && talent.location !== filters.city) return false;
      if (filters.profession && talent.role !== filters.profession) return false;
      if (filters.gender && talent.gender !== filters.gender) return false;
      if (filters.language && !talent.languages.includes(filters.language)) return false;
      if (filters.availability && talent.availability !== filters.availability) return false;
      if (skill && !talent.skills.some((item) => normalize(item).includes(skill))) return false;

      if (filters.experience === "0-2" && talent.experienceYears > 2) return false;
      if (filters.experience === "3-5" && (talent.experienceYears < 3 || talent.experienceYears > 5)) return false;
      if (filters.experience === "6+" && talent.experienceYears < 6) return false;

      if (filters.ageMin && talent.age < Number(filters.ageMin)) return false;
      if (filters.ageMax && talent.age > Number(filters.ageMax)) return false;

      return true;
    });
  }, [activeGroup, filters, talents]);

  const pages = Math.max(1, Math.ceil(filteredTalents.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const pageTalents = filteredTalents.slice(start, start + pageSize);
  const ageError = Boolean(draft.ageMin && draft.ageMax && Number(draft.ageMin) > Number(draft.ageMax));

  useEffect(() => {
    setPage(1);
  }, [activeGroup, filters]);

  function apply() {
    if (ageError) return;
    setFilters({ ...draft });
  }

  function clear() {
    setDraft(blank);
    setFilters(blank);
    setActiveGroup("All");
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
              <div
                className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent lg:block"
                aria-hidden="true"
              />
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
                Browse actors, crew, writers and creators using practical production filters without losing the visual focus of the work.
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
                        onClick={() => setActiveGroup(tab.value)}
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
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <select
                      aria-label="Profession"
                      className={inputClass}
                      value={draft.profession}
                      onChange={(event) => setDraft({ ...draft, profession: event.target.value })}
                    >
                      <option value="">All roles</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((open) => !open)}
                    className={`h-9 rounded-[9px] border px-3 text-[10px] font-bold transition lg:col-span-1 ${
                      advancedOpen
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-black/10 bg-white text-[#555] hover:border-black/20"
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
                      <select
                        className={inputClass}
                        value={draft.language}
                        onChange={(event) => setDraft({ ...draft, language: event.target.value })}
                      >
                        <option value="">Any language</option>
                        {languages.map((language) => (
                          <option key={language} value={language}>
                            {language}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Gender</span>
                      <select className={inputClass} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })}>
                        <option value="">Any gender</option>
                        {genders.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Availability</span>
                      <select
                        className={inputClass}
                        value={draft.availability}
                        onChange={(event) => setDraft({ ...draft, availability: event.target.value })}
                      >
                        <option value="">Any availability</option>
                        {availabilities.map((availability) => (
                          <option key={availability} value={availability}>
                            {availability}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Experience</span>
                      <select
                        className={inputClass}
                        value={draft.experience}
                        onChange={(event) => setDraft({ ...draft, experience: event.target.value })}
                      >
                        <option value="">Any experience</option>
                        <option value="0-2">0–2 years</option>
                        <option value="3-5">3–5 years</option>
                        <option value="6+">6+ years</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.1em] text-[#888]">Minimum age</span>
                      <input
                        className={inputClass}
                        type="number"
                        min="16"
                        max="80"
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
                        max="80"
                        placeholder="Max age"
                        value={draft.ageMax}
                        onChange={(event) => setDraft({ ...draft, ageMax: event.target.value })}
                      />
                    </label>
                  </div>
                )}

                {ageError && (
                  <p className="mt-2 text-[10px] font-semibold text-[#c5353e]">Minimum age cannot exceed maximum age.</p>
                )}
              </div>
            </div>

            <div id="talent-results" className="scroll-mt-28 pt-10">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#999]">Public profiles</p>
                <h3 className="font-display mt-1 text-2xl font-semibold text-[#111]">
                  {filteredTalents.length ? "People ready to collaborate" : "No matching talent"}
                </h3>
              </div>

              {pageTalents.length === 0 ? (
                <div className="rounded-[24px] border border-black/6 bg-white px-6 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,.035)]">
                  <p className="site-kicker">No Results</p>
                  <h3 className="font-display mt-2 text-3xl font-semibold">Try a wider search.</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777]">
                    Clear one or more filters to discover more people in the M. Dadu Films creative community.
                  </p>
                  <button type="button" onClick={clear} className="site-button site-button-outline mt-6">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pageTalents.map((talent) => (
                    <article
                      key={talent.id}
                      className="group relative overflow-hidden rounded-[20px] border border-black/6 bg-white shadow-[0_14px_38px_rgba(0,0,0,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.08)]"
                    >
                      <Link
                        href={`/talent/${talent.id}`}
                        aria-label={`View ${talent.name} portfolio`}
                        className="absolute inset-0 z-10 cursor-pointer"
                      >
                        <span className="sr-only">View {talent.name} portfolio</span>
                      </Link>
                      <div className="relative">
                        <SiteMedia
                          src={talent.image}
                          alt={`${talent.name}, ${talent.role}`}
                          kind="team"
                          className="aspect-[4/4.7] bg-[#efeee9]"
                          imageClassName="transition duration-500 group-hover:scale-[1.025]"
                        />

                        <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.1em] text-[#444] shadow-sm backdrop-blur">
                          {talent.group}
                        </div>

                        <div
                          className={`absolute right-3 top-3 rounded-full border px-3 py-1.5 text-[9px] font-black shadow-sm backdrop-blur ${
                            talent.emailVerified
                              ? "border-[#cfe8d5] bg-[#eff9f1]/95 text-[#2f7041]"
                              : "border-white/60 bg-white/90 text-[#777]"
                          }`}
                        >
                          {talent.emailVerified ? "✓ Email verified" : "Not verified"}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-display truncate text-[22px] font-semibold leading-tight text-[#111]">{talent.name}</h3>
                            <p className="mt-1 truncate text-sm font-medium text-[#666]">{talent.role}</p>
                          </div>
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              talent.availability === "Available"
                                ? "bg-[#4f9b62]"
                                : talent.availability === "Limited"
                                  ? "bg-[#d49b45]"
                                  : "bg-[#aaa]"
                            }`}
                            title={talent.availability}
                            aria-label={talent.availability}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-black/6 py-3 text-[11px]">
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#aaa]">Based in</span>
                            <strong className="mt-1 block font-semibold text-[#555]">{talent.location}</strong>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#aaa]">Experience</span>
                            <strong className="mt-1 block font-semibold text-[#555]">{talent.experience}</strong>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {talent.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-full bg-[#f4f4f1] px-2.5 py-1.5 text-[10px] font-semibold text-[#666]">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-semibold text-[#999]">
                          <span>{talent.age} yrs · {talent.gender}</span>
                          <span className="truncate text-right">{talent.languages.slice(0, 2).join(" · ")}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <PaginationControls
                meta={{
                  page: safePage,
                  limit: pageSize,
                  total: filteredTalents.length,
                  pages,
                  hasNext: safePage < pages,
                  hasPrevious: safePage > 1,
                }}
                onPage={changePage}
              />
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
                <div
                  className="absolute inset-y-0 left-0 w-[34%] bg-gradient-to-r from-[#101010] via-[#101010]/55 to-transparent"
                  aria-hidden="true"
                />
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
