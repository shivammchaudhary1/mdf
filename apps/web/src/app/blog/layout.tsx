import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Film Production & Casting Blog",
  description: "Production insights, casting guidance, creative stories and updates from M. Dadu Films.",
  path: "/blog",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
