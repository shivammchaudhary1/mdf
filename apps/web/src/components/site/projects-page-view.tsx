import Link from "next/link";
import data from "@/data/public-site.json";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageIntro } from "@/components/site/page-intro";
import { SiteMedia } from "@/components/site/site-media";

export function ProjectsPageView() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <PageIntro
          eyebrow="Our Projects"
          title="Stories Moving From Idea to Screen"
          description="A selection of films, series, music and visual work being developed, produced and released through M. Dadu Films."
          mediaAlt="Film project placeholder"
          mediaKind="project"
        />

        <section className="site-section bg-[#fafafa]">
          <div className="site-shell grid gap-6 md:grid-cols-2">
            {data.projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="site-card group overflow-hidden"
              >
                <SiteMedia
                  src={project.image}
                  alt={project.title}
                  kind="project"
                  className="aspect-[16/9]"
                  imageClassName="transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[.12em] text-[#888]">
                    <span>{project.category}</span>
                    <span>•</span>
                    <span>{project.status}</span>
                  </div>
                  <h2 className="font-display mt-3 text-2xl font-semibold">{project.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#707070]">{project.summary}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-[#888]">
                    <span>{project.location}</span>
                    <span className="font-semibold text-[var(--brand-red)]">View project →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
