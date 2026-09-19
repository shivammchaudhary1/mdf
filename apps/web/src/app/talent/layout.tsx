import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Talent Network",
  description: "Discover actors, writers, crew and creative professionals in the M. Dadu Films talent community.",
  path: "/talent",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
