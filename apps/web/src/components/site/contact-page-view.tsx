"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { useToast } from "@/components/ui/toast-provider";
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
      toast.success("Thanks — your message has been received.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  const contacts: Array<{
    label: string;
    value: string;
    icon: ContactIconName;
    href?: string;
  }> = [
    {
      label: "Email",
      value: data.brand.email,
      icon: "mail",
      href: data.brand.email ? `mailto:${data.brand.email}` : undefined,
    },
    {
      label: "Phone",
      value: data.brand.phone,
      icon: "phone",
      href: data.brand.phone ? `tel:${data.brand.phone.replace(/\s+/g, "")}` : undefined,
    },
    {
      label: "Location",
      value: data.brand.location,
      icon: "location",
    },
    {
      label: "Business Inquiries",
      value: data.brand.email,
      icon: "briefcase",
      href: data.brand.email ? `mailto:${data.brand.email}?subject=Business%20Inquiry` : undefined,
    },
  ];

  const memberBenefits: Array<{
    title: string;
    description: string;
    icon: ContactIconName;
  }> = [
    {
      title: "Stay Updated",
      description: "See the latest casting calls, projects and community opportunities.",
      icon: "updates",
    },
    {
      title: "Build Your Profile",
      description: "Create a talent profile and keep your portfolio, skills and showreel ready.",
      icon: "profile",
    },
    {
      title: "Your Dashboard",
      description: "Track your profile, saved opportunities and applications in one place.",
      icon: "dashboard",
    },
    {
      title: "Apply Easily",
      description: "Apply to relevant projects and casting calls directly from your account.",
      icon: "apply",
    },
  ];

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
        <PageIntro
          eyebrow="Let's Talk"
          title="We’d Love to Hear From You"
          description="Whether you’re a creator, a brand or a collaborator — we’re always open to new conversations."
          mediaAlt="M. Dadu Films production contact"
          mediaKind="project"
        />

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
              <div>
                <p className="site-kicker">Send a Message</p>
                <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">Tell us what you’re working on.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
                  Share the basics and our team can review your enquiry and get back to you.
                </p>
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
                <select id="contact-subject" name="subject" className="site-input">
                  <option>General Inquiry</option>
                  <option>Production</option>
                  <option>Brand / Business Inquiry</option>
                  <option>Casting</option>
                  <option>Collaboration</option>
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
                  placeholder="Tell us a little about your project, collaboration or enquiry..."
                />
              </div>

              <button type="submit" disabled={sending} className="site-button site-button-primary justify-center">
                {sending ? "Sending..." : "Send Message"}
              </button>

              <p className="text-xs leading-5 text-[#777]">
                By sending this message, you provide your contact details so M. Dadu Films can review and respond to your enquiry. See our{" "}
                <Link href="/privacy" className="font-semibold underline">
                  Privacy Policy
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
                  <p className="site-kicker !text-[#ff646b]">Join the Community</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                    Join us as a member and keep opportunities within reach.
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">
                    Build your profile once, use your personal dashboard to stay updated and apply to relevant projects and casting calls.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/signup" className="site-button site-button-primary">
                      Join as a Member
                    </Link>
                    <Link href="/casting" className="site-button site-button-dark-outline">
                      Explore Casting
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {memberBenefits.map((benefit) => (
                    <article key={benefit.title} className="rounded-2xl border border-white/10 bg-white/[.055] p-5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#ff646b]">
                        <ContactIcon name={benefit.icon} />
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
            <p className="site-kicker">Let’s create together</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Good ideas start with a simple conversation.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777]">
              Whether it is production, casting, collaboration or community, reach out and let’s see what we can build together.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
