"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/ui/feedback";
import { ensureSession } from "@/services/auth-session";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    void ensureSession().then((account) => {
      if (!account) {
        router.replace("/login");
        return;
      }

      router.replace(account.role === "SUPER_ADMIN" ? "/admin" : "/member");
    });
  }, [router]);

  return <LoadingState label="Opening your dashboard…" />;
}
