"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { useToast } from "@/components/ui/toast-provider";
import websiteData from "@/data/website-data.json";
import { api } from "@/services/api";

export default function CareersPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const pageContent = websiteData.careerPage;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setSaving(true);

    try {
      await api("/careers", {
        method: "POST",
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          mobile: String(data.get("mobile") ?? ""),
          role: String(data.get("role") ?? ""),
          city: String(data.get("city") ?? "") || undefined,
          coverNote: String(data.get("coverNote") ?? ""),
          resumeUrl: String(data.get("resumeUrl") ?? "") || undefined,
          portfolioUrl: String(data.get("portfolioUrl") ?? "") || undefined,
          linkedinUrl: String(data.get("linkedinUrl") ?? "") || undefined,
        }),
      });

      form.reset();
      toast.success(
        "Application received.",
        "Thank you. The team will contact you if your profile matches an opening.",
      );
    } catch (error) {
      toast.error(
        "Unable to submit application.",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-black/6 bg-white">
          <div className="site-shell py-3 sm:py-4">
            <nav
              className="flex items-center gap-3 text-[11px] font-semibold text-[#888]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#444]">Careers</span>
            </nav>
          </div>

          <div className="grid overflow-hidden bg-[#f7f6f3] lg:grid-cols-2">
            <div className="flex justify-end">
              <div className="flex w-full max-w-[590px] flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-16">
                <div className="flex items-center gap-3">
                  <p className="site-kicker">{pageContent.hero.eyebrow}</p>
                  <span
                    className="h-px w-12 bg-[var(--brand-red)]"
                    aria-hidden="true"
                  />
                </div>

                <h1 className="font-display mt-5 max-w-xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#111]">
                  {pageContent.hero.title}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#666] sm:text-[15px]">
                  {pageContent.hero.description}
                </p>

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
          <div className="site-shell grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
            <aside className="site-card h-fit p-7 sm:p-8">
              <p className="site-kicker">Before you apply</p>
              <h2 className="font-display mt-3 text-3xl font-semibold">
                Show us how you like to work.
              </h2>
              <p className="mt-5 text-sm leading-6 text-[#666]">
                Use shareable HTTPS resume and portfolio links. Applications are
                reviewed against current and upcoming openings.
              </p>
            </aside>

            <form onSubmit={submit} className="site-card grid gap-5 p-7 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Full Name
                  <input className="field" name="name" required minLength={2} />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Email
                  <input className="field" name="email" type="email" required />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Mobile
                  <input className="field" name="mobile" required />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  City
                  <input className="field" name="city" />
                </label>

                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  Role / Area of Interest
                  <input className="field" name="role" required />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Resume URL
                  <input
                    className="field"
                    name="resumeUrl"
                    type="url"
                    placeholder="https://..."
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Portfolio URL
                  <input
                    className="field"
                    name="portfolioUrl"
                    type="url"
                    placeholder="https://..."
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  LinkedIn URL
                  <input
                    className="field"
                    name="linkedinUrl"
                    type="url"
                    placeholder="https://..."
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  Tell us about yourself
                  <textarea
                    className="field min-h-36"
                    name="coverNote"
                    required
                    minLength={20}
                    maxLength={5000}
                  />
                </label>
              </div>

              <button
                disabled={saving}
                className="site-button site-button-primary justify-self-start"
                type="submit"
              >
                {saving ? "Submitting…" : "Submit Application"}
              </button>

              <p className="text-xs leading-5 text-[#777]">
                By submitting, you provide these details for recruitment and
                opportunity review. Please only share links you are authorised to
                provide. See our{" "}
                <Link href="/privacy" className="font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
