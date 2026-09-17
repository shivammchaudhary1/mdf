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
        <section className="container-shell py-16 md:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
            {eyebrow}
          </p>
          <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[1.05] md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {description}
          </p>
          {children}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
