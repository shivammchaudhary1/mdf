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
  data?: Record<string, string>;
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

function legacySection(value: string) {
  const normalized = value.trim();
  const lines = normalized.split(/\r?\n/).map((line) => line.trim());
  const first = lines[0] ?? "";
  const title = first.startsWith("## ") ? first.slice(3).trim() : "";
  const body = (title ? lines.slice(1) : lines).join("\n").trim();
  return { title, body };
}

function hasRichHtml(body: string[]) {
  return body.some((value) => /<(?:p|h2|h3|ul|ol|li|blockquote|strong|b|em|i|u|a|br|div)\b/i.test(value));
}

function effectiveLabel(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export async function LegalPageView({ slug, fallbackTitle }: { slug: "privacy" | "terms"; fallbackTitle: string }) {
  const policy = await loadPolicy(slug);
  const body = policy?.body ?? [];
  const rich = hasRichHtml(body);
  const sections = rich ? [] : body.map(legacySection).filter((item) => item.title || item.body);
  const fallbackVersion = slug === "privacy" ? PUBLIC_COMPANY.privacyVersion : PUBLIC_COMPANY.termsVersion;
  const effective = effectiveLabel(policy?.data?.effectiveDate || fallbackVersion);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-[#fafafa]">
        <section className="site-shell py-16 sm:py-20">
          <p className="site-kicker">Legal</p>
          <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">{policy?.title || fallbackTitle}</h1>
          <p className="mt-3 text-sm text-[#777]">Effective / last updated: {effective}</p>

          <div className="mt-8 max-w-4xl rounded-3xl border border-black/6 bg-white p-7 sm:p-10">
            {body.length ? (
              <div className="grid gap-8">
                {policy?.description && <p className="text-sm leading-7 text-[#555]">{policy.description}</p>}

                {rich ? (
                  <div
                    className="text-sm leading-7 text-[#555]
                      [&_p]:mb-4
                      [&_h2]:font-display [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#171717]
                      [&_h3]:font-display [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#222]
                      [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
                      [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
                      [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--brand-red)] [&_blockquote]:bg-[#fafafa] [&_blockquote]:px-5 [&_blockquote]:py-4
                      [&_a]:font-semibold [&_a]:text-[var(--brand-red)] [&_a]:underline"
                  >
                    {body.map((block, index) => (
                      <div key={`${index}-${block.slice(0, 24)}`} dangerouslySetInnerHTML={{ __html: block }} />
                    ))}
                  </div>
                ) : (
                  sections.map((item, index) => (
                    <section key={`${item.title}-${index}`}>
                      {item.title && <h2 className="font-display text-xl font-semibold text-[#171717]">{item.title}</h2>}
                      {item.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#555]">{item.body}</p>}
                    </section>
                  ))
                )}
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
