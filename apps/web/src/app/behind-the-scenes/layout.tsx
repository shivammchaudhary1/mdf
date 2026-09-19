import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "Behind the Scenes",
  description: "See production-process stories and behind-the-scenes moments from M. Dadu Films.",
  path: "/behind-the-scenes",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
