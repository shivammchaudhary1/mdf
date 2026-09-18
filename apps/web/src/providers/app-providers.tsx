"use client";
import { type ReactNode } from "react";
import { GlobalUploadIndicator } from "@/components/global-upload-indicator";
import { ToastProvider } from "@/components/ui/toast-provider";

export function AppProviders({children}:{children:ReactNode}){return <ToastProvider>{children}<GlobalUploadIndicator/></ToastProvider>}
