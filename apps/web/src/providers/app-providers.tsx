"use client";

import { type ReactNode } from "react";

import { AuthBootstrap } from "@/components/auth-bootstrap";
import { GlobalUploadIndicator } from "@/components/global-upload-indicator";
import { ToastProvider } from "@/components/ui/toast-provider";
import { VisitorTracker } from "@/components/visitor-tracker";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthBootstrap />
      <VisitorTracker />
      {children}
      <GlobalUploadIndicator />
    </ToastProvider>
  );
}
