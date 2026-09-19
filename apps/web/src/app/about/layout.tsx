import type { Metadata } from "next";
import type { ReactNode } from "react";

import { pageMetadata } from "@/config/seo";

export const metadata: Metadata = pageMetadata({
  title: "About M. Dadu Films",
  description:
    "Learn about M. Dadu Films, a film production house based in Lucknow and Noida creating films, brand stories, music videos, corporate shoots and creative content.",
  path: "/about",
});

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
