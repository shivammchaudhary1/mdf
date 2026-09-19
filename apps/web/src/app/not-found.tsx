import Link from "next/link";

import { PageShell } from "@/components/page-shell";
export default function NotFound() {
  return (
    <PageShell eyebrow="404" title="This scene is missing." description="The page may have moved, or the address may be incorrect.">
      <Link href="/" className="brand-button brand-button-primary mt-8">
        Back to home →
      </Link>
    </PageShell>
  );
}
