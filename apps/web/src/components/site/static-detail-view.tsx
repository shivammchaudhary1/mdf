import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentItem } from "@/services/content";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteMedia } from "@/components/site/site-media";
import { ApplyForm } from "@/components/apply-form";

type DetailKind = "projects" | "blogs" | "castings";

export async function StaticDetailView({
  kind,
  slug
}: {
  kind: DetailKind;
  slug: string;
}) {
  const item = await getContentItem(kind==="blogs"?"blog":kind==="castings"?"casting":"projects",slug);

  if (!item) notFound();

  const title = String(item.title ?? "");
  const summary = String(item.description ?? "");
  const category = String(item.category ?? "");
  const image = String(item.image ?? "");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="site-shell py-9 lg:py-14">
          <Link
            href={kind === "blogs" ? "/blog" : `/${kind==="castings"?"casting":kind}`}
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
              {item.body?.[0]??item.description??""}
            </p>
            <p className="mt-5">
              {item.body?.slice(1).join("\n\n")??""}
            </p>
          </article>
          {kind!=="blogs"&&<div className="mx-auto max-w-3xl pb-12"><ApplyForm opportunityId={String(item._id)} opportunityType={kind==="castings"?"CASTING":"PROJECT"} closed={kind==="castings"?item.acceptingApplications===false:["Completed","Archived"].includes(String(item.status??""))}/></div>}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
