import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Film Production Services",
  description:
    "Explore M. Dadu Films services across film production, short films, advertisements, brand films, music videos and creative production.",
  path: "/our-work",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
