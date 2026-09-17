export function EmptyState({
  title = "More stories are on their way.",
  description = "Please check back soon for new updates.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-slate-600">{description}</p>
    </div>
  );
}
export function LoadingState() {
  return (
    <div role="status" className="container-shell py-20">
      <span className="sr-only">Loading content…</span>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className="h-72 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
export function DemoNotice() {
  return (
    <p className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Development preview · Company copy and original photographs are pending.
      Published content will appear as it is added.
    </p>
  );
}
