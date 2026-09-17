import Link from "next/link";
import { notFound } from "next/navigation";
import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteMedia } from "@/components/site/site-media";

type DetailKind = "projects" | "blogs" | "castings";

export function StaticDetailView({
  kind,
  slug
}: {
  kind: DetailKind;
  slug: string;
}) {
  const collection = data[kind] as Array<Record<string, unknown>>;
  const item = collection.find((entry) => entry.slug === slug);

  if (!item) notFound();

  const title = String(item.title ?? "");
  const summary = String(item.summary ?? "");
  const category = String(item.category ?? "");
  const image = String(item.image ?? "");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-shell py-9 lg:py-14">
          <Link
            href={kind === "blogs" ? "/blog" : `/${kind}`}
            className="text-xs font-semibold text-[#777] hover:text-black"
          >
            ← Back
          </Link>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="site-kicker">{category}</p>
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6f6f]">
              {summary}
            </p>
          </div>

          <SiteMedia
            src={image}
            alt={title}
            kind={kind === "blogs" ? "blog" : kind === "castings" ? "team" : "project"}
            className="mx-auto mt-10 aspect-[16/7] max-w-5xl rounded-[20px]"
          />

          <article className="mx-auto max-w-3xl py-10 text-[15px] leading-8 text-[#555]">
            <p>
              This page currently uses temporary front-end content so the public experience can be designed and approved before backend CMS integration.
            </p>
            <p className="mt-5">
              The final version will keep this visual structure while loading real content from the API and administrator-managed database records.
            </p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
