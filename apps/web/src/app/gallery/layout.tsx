import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description: "Explore production, project and behind-the-scenes imagery from M. Dadu Films.",
  path: "/gallery",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
