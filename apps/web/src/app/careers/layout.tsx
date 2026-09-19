import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Careers at M. Dadu Films",
  description: "Share your profile for production, creative, operational and platform opportunities with M. Dadu Films.",
  path: "/careers",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
