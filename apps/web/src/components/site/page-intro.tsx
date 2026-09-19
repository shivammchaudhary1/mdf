import Link from "next/link";

import { SiteMedia } from "@/components/site/site-media";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  mediaKind?: "generic" | "project" | "team" | "gallery" | "blog";
  mediaAlt: string;
  image?: string;
};

export function PageIntro({ eyebrow, title, description, mediaKind = "generic", mediaAlt, image }: PageIntroProps) {
  return (
    <section className="site-shell py-8 sm:py-10 lg:py-12">
      <div className="mb-7 text-[11px] text-[#8a8a8a]">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{eyebrow.replace(/^Our |^Let's /, "")}</span>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
        <div className="max-w-xl">
          <p className="site-kicker">{eyebrow}</p>
          <h1 className="site-display mt-3">{title}</h1>
          <p className="site-lead mt-5">{description}</p>
        </div>

        <SiteMedia src={image} alt={mediaAlt} kind={mediaKind} className="aspect-[16/8.2] rounded-[18px]" />
      </div>
    </section>
  );
}
