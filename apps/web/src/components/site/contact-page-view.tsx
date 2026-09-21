"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, type ReactNode, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { useToast } from "@/components/ui/toast-provider";
import websiteData from "@/data/website-data.json";
import { api } from "@/services/api";

import { usePublicData } from "./use-public-data";

type ContactIconName = "mail" | "phone" | "location" | "briefcase" | "updates" | "profile" | "dashboard" | "apply";

function ContactIcon({ name }: { name: ContactIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M7 3h3l1.3 4-2 1.5a15 15 0 0 0 6.2 6.2l1.5-2L21 14v3a3 3 0 0 1-3 3C10.3 20 4 13.7 4 6a3 3 0 0 1 3-3Z" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg {...common}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2" />
      </svg>
    );
  }

  if (name === "updates") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 1 0 1.7 4.2" />
        <path d="M18 4v4h-4" />
        <path d="M8.5 12h7M12 8.5V15.5" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 4h14v16H5z" />
      <path d="M8 9h8M8 13h5" />
      <path d="m14 16 2 2 4-5" />
    </svg>
  );
}

export function ContactPageView() {
  const data = usePublicData("brand");
  const page = websiteData.contactPage;
  const searchParams = useSearchParams();
  const requestedSubject = searchParams.get("subject") ?? "General Inquiry";
  const requestedMessage = searchParams.get("message") ?? "";
  const requestedService = searchParams.get("service");
  const toast = useToast();
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);

    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          subject: fields.get("subject"),
          message: fields.get("message"),
        }),
      });
      form.reset();
      toast.success(page.form.successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : page.form.errorMessage);
    } finally {
      setSending(false);
    }
  }

  const contacts: Array<{
    label: string;
    value: string;
    icon: ContactIconName;
    href?: string;
  }> = page.contactCards.map((card) => {
    if (card.valueKey === "phone") {
      return {
        label: card.label,
        value: data.brand.phone,
        icon: card.icon as ContactIconName,
        href: data.brand.phone ? `tel:${data.brand.phone.replace(/\s+/g, "")}` : undefined,
      };
    }

    if (card.valueKey === "location") {
      return {
        label: card.label,
        value: data.brand.location,
        icon: card.icon as ContactIconName,
      };
    }

    return {
      label: card.label,
      value: data.brand.email,
      icon: card.icon as ContactIconName,
      href: data.brand.email
        ? card.mailtoSubject
          ? `mailto:${data.brand.email}?subject=${encodeURIComponent(card.mailtoSubject)}`
          : `mailto:${data.brand.email}`
        : undefined,
    };
  });

  const contactValue = (value: string, href?: string): ReactNode =>
    href ? (
      <a href={href} className="transition hover:text-[var(--brand-red)]">
        {value}
      </a>
    ) : (
      value
    );

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
              <span className="text-[#444]">Contact Us</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{page.hero.eyebrow}</p>
                  <span className="h-px w-12 bg-[var(--brand-red)]" aria-hidden="true" />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {page.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">{page.hero.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {page.hero.tags.map((tag) => (
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
                src={page.hero.image}
                alt={page.hero.imageAlt}
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
          <div className="site-shell grid gap-7 lg:grid-cols-[.72fr_1.28fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contacts.map(({ label, value, icon, href }) => (
                <div key={label} className="site-card flex items-start gap-4 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-[var(--brand-red)]">
                    <ContactIcon name={icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#222]">{label}</p>
                    <p className="mt-1 break-words text-sm leading-6 text-[#777]">{contactValue(value, href)}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="site-card grid gap-4 p-6 sm:p-8">
              {requestedService && (
                <div className="rounded-xl border border-[#f2c9cc] bg-[#fff5f6] px-4 py-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--brand-red)]">
                    {page.form.serviceInquiryLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#333]">{requestedService}</p>
                </div>
              )}

              <div>
                <p className="site-kicker">{page.form.eyebrow}</p>
                <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{page.form.title}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">{page.form.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="site-label" htmlFor="contact-name">
                    Your Name
                  </label>
                  <input id="contact-name" name="name" required maxLength={100} className="site-input" autoComplete="name" />
                </div>
                <div>
                  <label className="site-label" htmlFor="contact-email">
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    className="site-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="site-label" htmlFor="contact-subject">
                  Subject
                </label>
                <select id="contact-subject" name="subject" defaultValue={requestedSubject} className="site-input">
                  {page.form.subjects.map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="site-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={7}
                  required
                  maxLength={5000}
                  className="site-input resize-y"
                  placeholder={page.form.messagePlaceholder}
                  defaultValue={requestedMessage}
                />
              </div>

              <button type="submit" disabled={sending} className="site-button site-button-primary justify-center">
                {sending ? page.form.sendingLabel : page.form.submitLabel}
              </button>

              <p className="text-xs leading-5 text-[#777]">
                {page.form.privacyPrefix}{" "}
                <Link href="/privacy" className="font-semibold underline">
                  {page.form.privacyLinkLabel}
                </Link>
                .
              </p>
            </form>
          </div>
        </section>

        <section className="site-section bg-white">
          <div className="site-shell">
            <div className="overflow-hidden rounded-[24px] bg-[#0d0d0d] text-white">
              <div className="grid gap-8 px-6 py-9 sm:px-9 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:px-12 lg:py-12">
                <div>
                  <p className="site-kicker !text-[#ff646b]">{page.community.eyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{page.community.title}</h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">{page.community.description}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/signup" className="site-button site-button-primary">
                      {page.community.primaryCta}
                    </Link>
                    <Link href="/casting" className="site-button site-button-dark-outline">
                      {page.community.secondaryCta}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {page.community.benefits.map((benefit) => (
                    <article key={benefit.title} className="rounded-2xl border border-white/10 bg-white/[.055] p-5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#ff646b]">
                        <ContactIcon name={benefit.icon as ContactIconName} />
                      </span>
                      <h3 className="mt-4 text-sm font-bold">{benefit.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/55">{benefit.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="site-shell pb-8 lg:pb-12">
          <div className="rounded-[20px] border border-black/6 bg-[#fafafa] p-7 sm:p-9">
            <p className="site-kicker">{page.closing.eyebrow}</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">{page.closing.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">{page.closing.description}</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
