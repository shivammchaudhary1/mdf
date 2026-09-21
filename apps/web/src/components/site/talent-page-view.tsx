"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMedia } from "@/components/site/site-media";
import { PaginationControls } from "@/components/ui/pagination-controls";
import websiteData from "@/data/website-data.json";
import { usePublicUiStore } from "@/store/public-ui-store";

import { usePublicData } from "./use-public-data";

const groups = ["All", "Actor", "Crew", "Writer"];
const blank = {
  search: "",
  city: "",
  profession: "",
  gender: "",
  skills: "",
  languages: "",
  availability: "",
  experience: "",
  ageMin: "",
  ageMax: "",
};
type Filters = typeof blank;

export function TalentPageView() {
  const active = usePublicUiStore((s) => s.talentFilter),
    setActive = usePublicUiStore((s) => s.setTalentFilter);
  const [page, setPage] = useState(1),
    [draft, setDraft] = useState<Filters>(blank),
    [filters, setFilters] = useState<Filters>(blank);
  const data = usePublicData("talents", { page, limit: 12, filter: active, ...filters });
  const pageContent = websiteData.talentPage;

  useEffect(() => setPage(1), [active, filters]);

  function apply() {
    if (draft.ageMin && draft.ageMax && Number(draft.ageMin) > Number(draft.ageMax)) return;
    setFilters(draft);
  }

  function clear() {
    setDraft(blank);
    setFilters(blank);
    setActive("All");
    setPage(1);
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
            <div className="mb-5 flex flex-wrap gap-2">
              {groups.map((f) => (
                <button
                  key={f}
                  onClick={() => setActive(f)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    active === f ? "bg-[#111] text-white" : "border border-black/8 bg-white text-[#666]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mb-8 rounded-[20px] border border-black/6 bg-white p-5">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input
                  className="field"
                  placeholder="Search name, role, skill…"
                  value={draft.search}
                  onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="Profession / role"
                  value={draft.profession}
                  onChange={(e) => setDraft({ ...draft, profession: e.target.value })}
                />
                <select className="field" value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value })}>
                  <option value="">Any gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
                <input
                  className="field"
                  placeholder="Skill"
                  value={draft.skills}
                  onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="Language"
                  value={draft.languages}
                  onChange={(e) => setDraft({ ...draft, languages: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="Availability"
                  value={draft.availability}
                  onChange={(e) => setDraft({ ...draft, availability: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="Experience"
                  value={draft.experience}
                  onChange={(e) => setDraft({ ...draft, experience: e.target.value })}
                />
                <input
                  className="field"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min age"
                  value={draft.ageMin}
                  onChange={(e) => setDraft({ ...draft, ageMin: e.target.value })}
                />
                <input
                  className="field"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max age"
                  value={draft.ageMax}
                  onChange={(e) => setDraft({ ...draft, ageMax: e.target.value })}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-full bg-[#111] px-5 py-2.5 text-xs font-semibold text-white" onClick={apply}>
                  Apply Filters
                </button>
                <button className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-semibold" onClick={clear}>
                  Clear
                </button>
                {draft.ageMin && draft.ageMax && Number(draft.ageMin) > Number(draft.ageMax) && (
                  <span className="self-center text-xs text-red-600">Minimum age cannot exceed maximum age.</span>
                )}
              </div>
            </div>
            {data.loading ? (
              <div className="rounded-[20px] bg-white p-8 text-sm text-[#666]">Loading talent…</div>
            ) : data.talents.length === 0 ? (
              <div className="rounded-[20px] bg-white p-8">
                <h2 className="font-display text-2xl font-semibold">No talent found</h2>
                <p className="mt-2 text-sm text-[#666]">Try clearing or widening your filters.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.talents.map((t) => (
                  <Link href={`/talent/${t.id}`} key={t.id} className="site-card overflow-hidden transition hover:-translate-y-0.5">
                    <SiteMedia src={t.image} alt={t.name} kind="team" className="aspect-[4/4.3]" />
                    <div className="p-5">
                      <div className="flex justify-between">
                        <div>
                          <h2 className="font-display text-xl font-semibold">{t.name}</h2>
                          <p className="mt-1 text-sm text-[#666]">{t.role}</p>
                        </div>
                        {t.verified && (
                          <span className="rounded-full bg-[#eef7ff] px-2.5 py-1 text-[10px] font-bold text-[#2b6cb0]">Verified</span>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between text-xs text-[#888]">
                        <span>{t.location}</span>
                        <span>{t.experience}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {t.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="rounded-full bg-[#f4f4f2] px-3 py-1 text-[11px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <PaginationControls meta={data.meta} onPage={setPage} />
            <div className="mt-10 rounded-[20px] bg-[#101010] p-7 text-white">
              <h2 className="font-display text-3xl font-semibold">Build your profile. Be discoverable.</h2>
              <p className="mt-3 text-sm text-white/58">
                Create a member profile, showcase your work and choose whether your verified talent profile is publicly discoverable.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
