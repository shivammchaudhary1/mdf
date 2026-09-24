"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { LoadingState } from "@/components/ui/feedback";
import { ensureSession } from "@/services/auth-session";
import { useAppStore } from "@/store/app-store";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAppStore((state) => state.authStatus);
  const account = useAppStore((state) => state.account);

  useEffect(() => {
    if (status === "unknown") void ensureSession();
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && account) {
      router.replace(account.role === "SUPER_ADMIN" ? "/admin" : "/member");
    }
  }, [router, status, account]);

  if (status === "unknown" || status === "loading" || status === "authenticated") {
    return <LoadingState label="Checking your session…" />;
  }

  return children;
}
