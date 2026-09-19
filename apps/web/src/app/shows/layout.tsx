import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shows & Media",
  description: "Explore shows, media appearances and external releases from M. Dadu Films.",
  path: "/shows",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
