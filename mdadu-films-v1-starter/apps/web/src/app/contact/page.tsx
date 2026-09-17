import { PageShell } from "@/components/page-shell";

export default function Page() {
  return (
    <PageShell
      eyebrow="Contact Us"
      title="Let’s Create Together"
      description="Have a project, collaboration idea or question? Start the conversation here."
    >
      <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
        Real content and module implementation will be added in the corresponding development stage.
      </div>
    </PageShell>
  );
}
