import type { ReactNode } from "react";

export const metadata = {
  title: "Services",
  robots: { index: false, follow: true },
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
