import type { Metadata } from "next";

import { PUBLIC_COMPANY } from "@/config/company";
import { runtimeConfig } from "@/config/runtime";

const site = runtimeConfig.siteUrl.replace(/\/$/, "");

export function absoluteSiteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site}${normalized === "/" ? "" : normalized}`;
}

export function absoluteMediaUrl(value?: string) {
  if (!value) return undefined;
  if (/^https:\/\//i.test(value)) return value;

  try {
    const api = new URL(runtimeConfig.apiUrl);
    return new URL(value, api.origin).toString();
  } catch {
    return undefined;
  }
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const canonical = absoluteSiteUrl(path);
  const socialImage = absoluteMediaUrl(image) ?? absoluteSiteUrl("/brand/logo.webp");

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url: canonical,
      siteName: PUBLIC_COMPANY.name,
      title,
      description,
      images: [{ url: socialImage, alt: title }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
