"use client";

import { useEffect, useRef, useState } from "react";

import { SiteMedia } from "@/components/site/site-media";
import team from "@/data/core-team.json";

type TeamMember = (typeof team)[number];

function SocialIcon({ name }: { name: "linkedin" | "instagram" | "facebook" | "youtube" | "website" }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "linkedin")
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M6.5 8.2H3.4V21h3.1V8.2ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.7c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.2-3.9 2.1V8.2H9.1V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20l1-7.3Z" />
      </svg>
    );

  if (name === "instagram")
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );

  if (name === "facebook")
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8h3.4Z" />
      </svg>
    );

  if (name === "youtube")
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17 5.6 12 5.6 12 5.6s-5 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15.4V8.6l5 3.4-5 3.4Z" />
      </svg>
    );

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

function hasSocials(member: TeamMember) {
  return Boolean(member.linkedin || member.instagram || member.facebook || member.youtube || member.website);
}

export function CoreTeamSection() {
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
    <section id="core-team" className="site-section bg-[#fafafa]">
      <div className="site-shell">
        <div className="site-section-heading">
          <div>
            <p className="site-kicker">The People Behind the Work</p>
            <h2 className="site-heading mt-2">Core Team</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">
              Directors, producers and specialists working together across development, production, performance and post-production.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member) => (
            <article key={member.name} className="group site-card overflow-hidden">
              <SiteMedia
                src={member.image}
                alt={`${member.name}, ${member.designation}`}
                kind="team"
                className="aspect-[4/4.6]"
                imageClassName="transition duration-500 group-hover:scale-[1.025]"
              />

              <div className="p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--brand-red)]">{member.designation}</p>
                <h3 className="font-display mt-2 text-xl font-semibold leading-tight text-[#171717]">{member.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#777]">{member.shortBio}</p>

                <button
                  type="button"
                  onClick={() => setSelected(member)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#333] transition hover:text-[var(--brand-red)]"
                  aria-label={`View more about ${member.name}`}
                >
                  View More <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
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
            className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[24px] bg-white shadow-[0_35px_120px_rgba(0,0,0,.35)]"
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

            <div className="grid max-h-[88vh] overflow-y-auto md:grid-cols-[.82fr_1.18fr]">
              <SiteMedia
                src={selected.image}
                alt={`${selected.name}, ${selected.designation}`}
                kind="team"
                className="min-h-[300px] md:min-h-[480px]"
              />

              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                <p className="site-kicker">Core Team</p>
                <h2 id="team-member-name" className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                  {selected.name}
                </h2>
                <p className="mt-3 text-xs font-extrabold uppercase tracking-[.11em] text-[var(--brand-red)]">{selected.designation}</p>

                <div className="my-6 h-px bg-black/7" />

                <p className="text-sm leading-7 text-[#666]">{selected.shortBio}</p>

                {hasSocials(selected) ? (
                  <div className="mt-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#888]">Connect</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["linkedin", "instagram", "facebook", "youtube", "website"] as const).map((name) => {
                        const href = selected[name];
                        if (!href) return null;
                        return (
                          <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${selected.name} on ${name}`}
                            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-[#333] transition hover:border-[var(--brand-red)] hover:bg-[var(--brand-red)] hover:text-white"
                          >
                            <SocialIcon name={name} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-7 text-xs leading-5 text-[#999]">Social profiles will appear here when verified links are added.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
