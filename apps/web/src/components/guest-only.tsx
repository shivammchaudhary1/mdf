"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { LoadingState } from "@/components/ui/feedback";
import { ensureSession } from "@/services/auth-session";
import { useAppStore } from "@/store/app-store";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAppStore((state) => state.authStatus);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (status === "unknown") void ensureSession();
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(user.role === "SUPER_ADMIN" ? "/admin" : "/member");
    }
  }, [router, status, user]);

  if (status === "unknown" || status === "loading" || status === "authenticated") {
    return <LoadingState label="Checking your session…" />;
  }

  return children;
}
