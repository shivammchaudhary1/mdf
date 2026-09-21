"use client";

import { api, ApiError, cachedApi, invalidateApiCache } from "@/services/api";
import type { MemberProfile } from "@/services/workspace";
import { type SessionUser, useAppStore } from "@/store/app-store";

let sessionPromise: Promise<SessionUser | null> | null = null;

async function requestCurrentSession() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    return await api<SessionUser>("/auth/me", { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function hydrateMemberPhoto(user: SessionUser, force = false) {
  if (user.role !== "USER") {
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

  if (!force && state.authStatus === "authenticated" && state.user) return state.user;
  if (!force && state.authStatus === "anonymous") return null;
  if (sessionPromise) return sessionPromise;

  state.setAuthLoading();

  sessionPromise = requestCurrentSession()
    .then(async (user) => {
      useAppStore.getState().setAuthenticated(user);
      await hydrateMemberPhoto(user, force);
      return user;
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

export async function establishSession(user: SessionUser) {
  useAppStore.getState().setAuthenticated(user);
  invalidateApiCache();
  await hydrateMemberPhoto(user, true);
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
