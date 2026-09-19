import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Casting Calls & Creative Opportunities",
  description: "Discover current casting calls and creative production opportunities from M. Dadu Films.",
  path: "/casting",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
