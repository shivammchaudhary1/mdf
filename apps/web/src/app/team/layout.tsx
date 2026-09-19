import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Team",
  description: "Meet the people behind M. Dadu Films and its production and creative work.",
  path: "/team",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
