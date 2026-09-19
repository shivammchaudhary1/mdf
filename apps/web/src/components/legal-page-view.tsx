import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PUBLIC_COMPANY } from "@/config/company";
import { runtimeConfig } from "@/config/runtime";

type LegalRecord = {
  title: string;
  body?: string[];
  description?: string;
  published?: boolean;
  publishedAt?: string;
};

async function loadPolicy(slug: "privacy" | "terms") {
  try {
    const response = await fetch(`${runtimeConfig.apiUrl}/content/legal/${slug}`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) return null;

    return (await response.json()) as LegalRecord;
  } catch {
    return null;
  }
}

function section(value: string) {
  const normalized = value.trim();
  const lines = normalized.split(/\r?\n/).map((line) => line.trim());
  const first = lines[0] ?? "";
  const title = first.startsWith("## ") ? first.slice(3).trim() : "";
  const body = (title ? lines.slice(1) : lines).join("\n").trim();
  return { title, body };
}

export async function LegalPageView({ slug, fallbackTitle }: { slug: "privacy" | "terms"; fallbackTitle: string }) {
  const policy = await loadPolicy(slug);
  const sections = (policy?.body ?? []).map(section).filter((item) => item.title || item.body);
  const version = slug === "privacy" ? PUBLIC_COMPANY.privacyVersion : PUBLIC_COMPANY.termsVersion;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#fafafa]">
        <section className="site-shell py-16 sm:py-20">
          <p className="site-kicker">Legal</p>
          <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">{policy?.title || fallbackTitle}</h1>
          <p className="mt-3 text-sm text-[#777]">Effective / last updated: {version}</p>

          <div className="mt-8 max-w-4xl rounded-3xl border border-black/6 bg-white p-7 sm:p-10">
            {sections.length ? (
              <div className="grid gap-8">
                {policy?.description && <p className="text-sm leading-7 text-[#555]">{policy.description}</p>}
                {sections.map((item, index) => (
                  <section key={`${item.title}-${index}`}>
                    {item.title && <h2 className="font-display text-xl font-semibold text-[#171717]">{item.title}</h2>}
                    {item.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#555]">{item.body}</p>}
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 text-sm leading-7 text-[#666]">
                <p>The requested legal policy is not currently published.</p>
                <p>
                  Contact {PUBLIC_COMPANY.name} at{" "}
                  <a className="font-semibold underline" href={`mailto:${PUBLIC_COMPANY.email}`}>
                    {PUBLIC_COMPANY.email}
                  </a>{" "}
                  for the latest reviewed information.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
