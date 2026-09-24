"use client";

import { useEffect, useRef, useState } from "react";

import { SiteMedia } from "@/components/site/site-media";
import { type PublicCoreTeamMember, usePublicCoreTeam } from "@/components/site/use-public-core-team";
import websiteData from "@/data/website-data.json";

type TeamMember = PublicCoreTeamMember;
type SocialName = "instagram" | "facebook" | "x" | "linkedin" | "youtube";

const socials: Array<{ name: SocialName; label: string }> = [
  { name: "instagram", label: "Instagram" },
  { name: "facebook", label: "Facebook" },
  { name: "x", label: "X" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "youtube", label: "YouTube" },
];

function SocialIcon({ name }: { name: SocialName }) {
  const common = { viewBox: "0 0 24 24", width: 15, height: 15, "aria-hidden": true };

  if (name === "instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );

  if (name === "facebook")
    return (
      <svg {...common} fill="currentColor">
        <path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8h3.4Z" />
      </svg>
    );

  if (name === "x")
    return (
      <svg {...common} fill="currentColor">
        <path d="M18.7 3H22l-7.2 8.2L23.3 21h-6.7l-5.2-6.8L5.4 21H2l7.8-8.9L1.6 3h6.8l4.7 6.2L18.7 3Zm-1.2 16h1.8L7.4 4.9H5.5L17.5 19Z" />
      </svg>
    );

  if (name === "linkedin")
    return (
      <svg {...common} fill="currentColor">
        <path d="M6.5 8.2H3.4V21h3.1V8.2ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.7c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.2-3.9 2.1V8.2H9.1V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20l1-7.3Z" />
      </svg>
    );

  return (
    <svg {...common} fill="currentColor">
      <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17 5.6 12 5.6 12 5.6s-5 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15.4V8.6l5 3.4-5 3.4Z" />
    </svg>
  );
}

function SocialLinks({ member, large = false }: { member: TeamMember; large?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {socials.map(({ name, label }) => {
        const href = member[name];
        const size = large ? "h-10 w-10" : "h-8 w-8";

        if (!href)
          return (
            <span
              key={name}
              aria-label={`${label} link not added for ${member.name}`}
              title={`${label} link will appear when added`}
              className={`grid ${size} place-items-center rounded-full border border-black/6 bg-[#fafafa] text-[#c0c0c0]`}
            >
              <SocialIcon name={name} />
            </span>
          );

        return (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} on ${label}`}
            className={`grid ${size} place-items-center rounded-full border border-black/10 text-[#444] transition hover:border-[var(--brand-red)] hover:bg-[var(--brand-red)] hover:text-white`}
          >
            <SocialIcon name={name} />
          </a>
        );
      })}
    </div>
  );
}

export function CoreTeamSection() {
  const { team, loading, error, refresh } = usePublicCoreTeam();
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }

    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <section id="core-team" className="site-section bg-white">
      <div className="site-shell">
        <div className="site-section-heading">
          <div>
            <p className="site-kicker">{websiteData.aboutUs.teamSection.eyebrow}</p>
            <h2 className="site-heading mt-2">{websiteData.aboutUs.teamSection.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{websiteData.aboutUs.teamSection.description}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member) => (
            <article key={member.id} className="group site-card flex h-full flex-col overflow-hidden">
              <SiteMedia
                src={member.image}
                alt={`${member.name}, ${member.designation}`}
                kind="team"
                className="aspect-[4/4.7]"
                imageClassName="transition duration-500 group-hover:scale-[1.025]"
              />

              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--brand-red)]">{member.designation}</p>
                <h3 className="font-display mt-2 text-xl font-semibold leading-tight text-[#171717]">{member.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#777]">{member.shortBio}</p>

                <div className="mt-auto pt-5">
                  <SocialLinks member={member} />
                  <button
                    type="button"
                    onClick={() => setSelected(member)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#333] transition hover:text-[var(--brand-red)]"
                    aria-label={`View more about ${member.name}`}
                  >
                    View More <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !team.length && (
          <div className="site-card mt-5 p-8 text-center sm:p-10">
            <p className="font-display text-2xl font-semibold">
              {error ? "Unable to load Core Team." : "Core team profiles are being updated."}
            </p>
            <p className="mt-2 text-sm text-[#777]">
              {error || "Published team members will appear here."}
            </p>
            {error && (
              <button type="button" onClick={() => void refresh()} className="site-button site-button-outline mt-5">
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[160] grid place-items-center p-4 sm:p-6" role="presentation">
          <button
            type="button"
            aria-label="Close team member details"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-member-name"
            className="relative z-10 w-full max-w-[820px] overflow-hidden rounded-[24px] bg-white shadow-[0_35px_120px_rgba(0,0,0,.35)]"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/8 bg-white/95 text-xl text-[#444] shadow-sm transition hover:bg-[#f5f5f2]"
            >
              ×
            </button>

            <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-[.82fr_1.18fr]">
              <SiteMedia
                src={selected.image}
                alt={`${selected.name}, ${selected.designation}`}
                kind="team"
                className="min-h-[310px] md:min-h-[540px]"
              />

              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                <p className="site-kicker">{websiteData.aboutUs.teamSection.modalEyebrow}</p>
                <h2 id="team-member-name" className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                  {selected.name}
                </h2>
                <p className="mt-3 text-xs font-extrabold uppercase tracking-[.11em] text-[var(--brand-red)]">{selected.designation}</p>

                <div className="my-6 h-px bg-black/7" />
                <p className="text-sm leading-7 text-[#666]">{selected.details}</p>

                <div className="mt-6">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#888]">Focus</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/8 bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#555]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#888]">Connect</p>
                  <div className="mt-3">
                    <SocialLinks member={selected} large />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
