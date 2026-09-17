import { PageShell } from "@/components/page-shell";
import { AccountForm } from "@/components/account-form";
import { siteConfig } from "@/config/site";
export const metadata = {
  title: "Contact Us",
  description: "Get in touch with M. Dadu Films.",
};
export default function Page() {
  return (
    <PageShell
      eyebrow="Let's talk"
      title="Let's create together."
      description="Have a project, collaboration or question in mind? We would love to hear from you."
    >
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="grid content-start gap-5">
          {[
            ["Email", siteConfig.contact.email],
            ["Phone", siteConfig.contact.phone],
            ["Address", siteConfig.contact.address],
          ].map(([label, value]) => (
            <div key={label} className="card p-6">
              <h2 className="font-semibold">{label}</h2>
              <p className="mt-3 break-words text-slate-500">{value}</p>
            </div>
          ))}
        </div>
        <div className="card p-6 sm:p-8">
          <AccountForm mode="contact" />
        </div>
      </div>
    </PageShell>
  );
}
