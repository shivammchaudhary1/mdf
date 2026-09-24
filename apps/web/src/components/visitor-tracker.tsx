"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { runtimeConfig } from "@/config/runtime";

const TRACKED_AT_KEY = "mdadu:visitor:last-tracked-at";
const TRACK_WINDOW_MS = 24 * 60 * 60 * 1000;

function shouldSkip(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/member") || pathname.startsWith("/dashboard");
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (shouldSkip(pathname)) return;

    const now = Date.now();

    try {
      const previous = Number(window.localStorage.getItem(TRACKED_AT_KEY));
      if (Number.isFinite(previous) && previous > 0 && now - previous < TRACK_WINDOW_MS) return;
    } catch {
      // Storage can be unavailable in privacy-restricted browsers. Tracking still remains best-effort.
    }

    void fetch(`${runtimeConfig.apiUrl}/analytics/visit`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) return;

        try {
          window.localStorage.setItem(TRACKED_AT_KEY, String(now));
        } catch {
          // A signed HttpOnly visitor cookie still deduplicates the browser on the backend.
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
