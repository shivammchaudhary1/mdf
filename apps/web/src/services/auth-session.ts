"use client";

import { api, ApiError, cachedApi, invalidateApiCache } from "@/services/api";
import type { MemberProfile } from "@/services/workspace";
import { type SessionAccount, useAppStore } from "@/store/app-store";

let sessionPromise: Promise<SessionAccount | null> | null = null;

async function requestCurrentSession() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    return await api<SessionAccount>("/auth/me", { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function hydrateMemberPhoto(account: SessionAccount, force = false) {
  if (account.role !== "MEMBER") {
    useAppStore.getState().setProfilePhoto("");
    return;
  }

  try {
    const profile = await cachedApi<MemberProfile>("/member/profile", { ttl: 60_000, force });
    useAppStore.getState().setProfilePhoto(profile.profile?.photo ?? "");
  } catch {
    useAppStore.getState().setProfilePhoto("");
  }
}

export async function ensureSession(force = false) {
  const state = useAppStore.getState();

  if (!force && state.authStatus === "authenticated" && state.account) return state.account;
  if (!force && state.authStatus === "anonymous") return null;
  if (sessionPromise) return sessionPromise;

  state.setAuthLoading();

  sessionPromise = requestCurrentSession()
    .then(async (account) => {
      useAppStore.getState().setAuthenticated(account);
      await hydrateMemberPhoto(account, force);
      return account;
    })
    .catch((error) => {
      if (error instanceof ApiError && error.status === 401) {
        useAppStore.getState().setAnonymous();
        return null;
      }

      useAppStore.getState().setAnonymous();
      return null;
    })
    .finally(() => {
      sessionPromise = null;
    });

  return sessionPromise;
}

export async function establishSession(account: SessionAccount) {
  useAppStore.getState().setAuthenticated(account);
  invalidateApiCache();
  await hydrateMemberPhoto(account, true);
}

export async function refreshSession() {
  useAppStore.getState().clearQueries();
  return ensureSession(true);
}

export async function signOut() {
  try {
    await api("/auth/logout", { method: "POST" });
  } finally {
    useAppStore.getState().clearSession();
    invalidateApiCache();
  }
}
