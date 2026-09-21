"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { SiteMedia } from "@/components/site/site-media";

type ServiceDetails = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  modal: {
    eyebrow: string;
    title: string;
    overview: string;
    highlights: string[];
    idealFor: string;
    contactSubject: string;
    contactMessage: string;
  };
};

function contactHref(service: ServiceDetails) {
  const params = new URLSearchParams({
    subject: service.modal.contactSubject,
    message: service.modal.contactMessage,
    service: service.title,
  });

  return `/contact?${params.toString()}`;
}

export function ServiceDetailsModal({ service, onClose }: { service: ServiceDetails; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[170] grid place-items-center p-3 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Close service details"
        className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="relative z-10 w-full max-w-[900px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_120px_rgba(0,0,0,.38)]"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full border border-black/8 bg-white/95 text-xl text-[#444] shadow-sm transition hover:bg-[#f4f4f1]"
        >
          ×
        </button>

        <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative min-h-[280px] bg-[#111] sm:min-h-[340px] lg:min-h-[620px]">
            <SiteMedia
              src={service.image}
              alt={service.title}
              kind="project"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[#ff646b]">{service.category}</p>
              <p className="font-display mt-2 text-2xl font-semibold">{service.title}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="site-kicker">{service.modal.eyebrow}</p>
            <h2 id="service-modal-title" className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              {service.modal.title}
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#666]">{service.modal.overview}</p>

            <div className="my-7 h-px bg-black/7" />

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#888]">What we can support</p>
              <div className="mt-4 grid gap-3">
                {service.modal.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-black/7 bg-[#fafafa] p-3.5">
                    <span className="mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-[10px] font-black text-[var(--brand-red)]">
                      ✓
                    </span>
                    <p className="text-sm leading-6 text-[#5f5f5f]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#10151a] p-5 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#ff646b]">Best suited for</p>
              <p className="mt-2 text-sm leading-6 text-white/65">{service.modal.idealFor}</p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={contactHref(service)} className="site-button site-button-primary flex-1">
                Contact Us
              </Link>
              <button type="button" onClick={onClose} className="site-button site-button-outline flex-1">
                Back to Services
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
