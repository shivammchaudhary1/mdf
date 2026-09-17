import { PageShell } from "@/components/page-shell";

export default function Page() {
  return (
    <PageShell
      eyebrow="Journal"
      title="Stories, Insights & Updates"
      description="Weekly updates from projects, production, talent and the filmmaking process."
    >
      <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
        Real content and module implementation will be added in the corresponding development stage.
      </div>
    </PageShell>
  );
}
