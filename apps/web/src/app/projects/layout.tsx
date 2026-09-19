import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Film Projects",
  description: "Explore films, short films and production work from M. Dadu Films.",
  path: "/projects",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
