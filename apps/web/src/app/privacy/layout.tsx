import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Read how M. Dadu Films handles account, talent profile, application, career and contact information.",
  path: "/privacy",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
