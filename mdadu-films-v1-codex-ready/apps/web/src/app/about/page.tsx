import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { placeholderPages } from "@/content/placeholders/pages";
import { SmartImage } from "@/components/ui/smart-image";
const content = placeholderPages.about;
export const metadata = { title: "About Us", description: content.description };
export default function Page() {
  return (
    <PageShell {...content}>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <SmartImage
          placeholderKind="gallery"
          alt="Production image placeholder"
          width={960}
          height={640}
          className="h-full w-full rounded-2xl object-cover"
        />
        <div className="grid gap-6">
          <article className="card p-7">
            <p className="eyebrow">Our mission</p>
            <p className="font-display mt-4 text-2xl leading-relaxed">
              {content.mission}
            </p>
          </article>
          <article className="rounded-2xl bg-[var(--surface-dark)] p-7 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--brand-gold)]">
              Our vision
            </p>
            <p className="font-display mt-4 text-2xl leading-relaxed">
              {content.vision}
            </p>
          </article>
        </div>
      </div>
      <p className="mt-8 text-sm text-slate-500">{content.note}</p>
      <Link href="/team" className="brand-button brand-button-primary mt-8">
        Meet our team →
      </Link>
    </PageShell>
  );
}
