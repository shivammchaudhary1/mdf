import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact M. Dadu Films",
  description:
    "Contact M. Dadu Films for film production, brand films, music videos, corporate shoots, casting and creative collaborations in Lucknow, Noida and beyond.",
  path: "/contact",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
