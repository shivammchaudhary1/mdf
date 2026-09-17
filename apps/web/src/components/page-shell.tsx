import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <>
      <PublicHeader light />
      <main id="main-content" className="min-h-[70vh] bg-white">
        <section className="relative overflow-hidden border-b border-slate-100">
          <div
            aria-hidden="true"
            className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-red-50 blur-3xl"
          />
          <div className="container-shell relative py-16 md:py-24 lg:py-28">
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.025em] md:text-7xl lg:text-[5rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              {description}
            </p>
          </div>
        </section>

        <section className="container-shell section-pad">{children}</section>
      </main>
      <PublicFooter />
    </>
  );
}
