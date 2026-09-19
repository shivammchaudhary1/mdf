import "./globals.css";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { PUBLIC_COMPANY } from "@/config/company";
import { runtimeConfig } from "@/config/runtime";
import { AppProviders } from "@/providers/app-providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(runtimeConfig.siteUrl),
  applicationName: PUBLIC_COMPANY.name,
  title: {
    default: "M. Dadu Films | Film Production House in Lucknow & Noida",
    template: "%s | M. Dadu Films",
  },
  description: PUBLIC_COMPANY.description,
  keywords: [
    "M. Dadu Films",
    "film production house",
    "film production Lucknow",
    "film production Noida",
    "short film production",
    "advertisement film production",
    "brand films",
    "music video production",
    "corporate shoots",
    "casting opportunities",
    "film talent community",
  ],
  category: "Film production",
  alternates: { canonical: "/" },
  icons: {
    icon: "/brand/logo.webp",
    shortcut: "/brand/logo.webp",
    apple: "/brand/logo.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: PUBLIC_COMPANY.name,
    title: "M. Dadu Films | Film Production House in Lucknow & Noida",
    description: PUBLIC_COMPANY.description,
    images: [{ url: "/brand/logo.webp", alt: "M. Dadu Films" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "M. Dadu Films | Film Production House in Lucknow & Noida",
    description: PUBLIC_COMPANY.description,
    images: ["/brand/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <OrganizationJsonLd />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
