"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";

import { usePublicData } from "./use-public-data";

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

  const contacts = [
    ["Email", data.brand.email],
    ["Phone", data.brand.phone],
    ["Location", data.brand.location],
    ["Business Inquiries", data.brand.email],
  ];

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
            <div className="grid gap-3">
              {contacts.map(([label, value]) => (
                <div key={label} className="site-card flex items-start gap-4 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-red)] text-white">•</span>
                  <div>
                    <p className="text-xs font-bold text-[#222]">{label}</p>
                    <p className="mt-1 text-sm text-[#777]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="site-card grid gap-4 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="site-label" htmlFor="contact-name">
                    Your Name
                  </label>
                  <input id="contact-name" name="name" required className="site-input" />
                </div>
                <div>
                  <label className="site-label" htmlFor="contact-email">
                    Your Email
                  </label>
                  <input id="contact-email" name="email" type="email" required className="site-input" />
                </div>
              </div>

              <div>
                <label className="site-label" htmlFor="contact-subject">
                  Subject
                </label>
                <select id="contact-subject" name="subject" className="site-input">
                  <option>General Inquiry</option>
                  <option>Production</option>
                  <option>Casting</option>
                  <option>Collaboration</option>
                </select>
              </div>

              <div>
                <label className="site-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea id="contact-message" name="message" rows={7} required className="site-input resize-y" />
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

          <div className="mt-8 rounded-[20px] bg-[#0d0d0d] p-7 text-white sm:p-9">
            <p className="site-kicker !text-[#ff646b]">Let’s create together</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Good ideas start with a simple conversation.</h2>
            <p className="mt-3 text-sm text-white/55">Reach out and let’s make something meaningful.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
