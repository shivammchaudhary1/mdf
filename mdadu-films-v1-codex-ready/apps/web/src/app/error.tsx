"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="container-shell flex min-h-[70vh] flex-col items-center justify-center py-20 text-center"
    >
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-display mt-4 text-4xl">
        We couldn't load this page.
      </h1>
      <p className="mt-5 text-slate-600">Please try again in a moment.</p>
      <button
        onClick={reset}
        className="brand-button brand-button-primary mt-8"
      >
        Try again
      </button>
    </main>
  );
}
