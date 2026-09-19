import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "Read the terms governing use of the M. Dadu Films website, talent community, casting and project features.",
  path: "/terms",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
