"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

import { runtimeConfig } from "@/config/runtime";

export type PlaceholderKind = "generic" | "project" | "team" | "gallery" | "blog";

const placeholders: Record<PlaceholderKind, string> = {
  generic: "/placeholders/generic.svg",
  project: "/placeholders/project.svg",
  team: "/placeholders/team.svg",
  gallery: "/placeholders/gallery.svg",
  blog: "/placeholders/blog.svg",
};

type SmartImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  placeholderKind?: PlaceholderKind;
};

export function SmartImage({ src, placeholderKind = "generic", alt, ...props }: SmartImageProps) {
  const fallback = placeholders[placeholderKind];
  const initialSource = useMemo(() => (src && src.trim().length > 0 ? src : fallback), [src, fallback]);
  const [currentSource, setCurrentSource] = useState(initialSource);

  useEffect(() => {
    setCurrentSource(initialSource);
  }, [initialSource]);

  return (
    <Image
      {...props}
      src={currentSource.startsWith("/api/v1/media/") ? `${new URL(runtimeConfig.apiUrl).origin}${currentSource}` : currentSource}
      unoptimized={currentSource.startsWith("/api/v1/media/")}
      alt={alt}
      onError={() => {
        if (currentSource !== fallback) {
          setCurrentSource(fallback);
        }
      }}
    />
  );
}
