import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { runtimeConfig } from "@/config/runtime";
type LegalRecord = { title: string; body?: string[]; published?: boolean };
async function loadPolicy(slug: "privacy" | "terms") {
  const r = await fetch(`${runtimeConfig.apiUrl}/content/legal/${slug}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("Legal content is temporarily unavailable.");
  return (await r.json()) as LegalRecord;
}
export async function LegalPageView({ slug, fallbackTitle }: { slug: "privacy" | "terms"; fallbackTitle: string }) {
  const policy = await loadPolicy(slug);
  const paragraphs =
    policy?.body?.flatMap((section) =>
      section
        .split(/\n{2,}/)
        .map((x) => x.trim())
        .filter(Boolean),
    ) ?? [];
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#fafafa]">
        <section className="site-shell py-16 sm:py-20">
          <p className="site-kicker">Legal</p>
          <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">{policy?.title || fallbackTitle}</h1>
          <div className="mt-8 max-w-3xl rounded-3xl border border-black/6 bg-white p-7 sm:p-10">
            {paragraphs.length ? (
              <div className="grid gap-5 text-sm leading-7 text-[#555]">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[#666]">
                This policy has not been published yet. Please contact M. Dadu Films for the latest reviewed legal information.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
