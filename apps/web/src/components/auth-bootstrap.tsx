"use client";

import { useEffect } from "react";

import { ensureSession } from "@/services/auth-session";

export function AuthBootstrap() {
  useEffect(() => {
    void ensureSession();
  }, []);

  return null;
}
