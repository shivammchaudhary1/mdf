"use client";

import { create } from "zustand";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "USER" | "SUPER_ADMIN";
  verified: boolean;
  csrfToken?: string;
};

type QueryEntry = {
  data: unknown;
  expiresAt: number;
};

type AppState = {
  authStatus: "unknown" | "loading" | "authenticated" | "anonymous";
  user: SessionUser | null;
  profilePhoto: string;
  queries: Record<string, QueryEntry>;
  setAuthLoading: () => void;
  setAuthenticated: (user: SessionUser) => void;
  setAnonymous: () => void;
  setProfilePhoto: (value: string) => void;
  setQuery: (key: string, data: unknown, expiresAt: number) => void;
  removeQuery: (key: string) => void;
  clearQueries: (prefix?: string) => void;
  clearSession: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  authStatus: "unknown",
  user: null,
  profilePhoto: "",
  queries: {},
  setAuthLoading: () => set({ authStatus: "loading" }),
  setAuthenticated: (user) => set({ authStatus: "authenticated", user }),
  setAnonymous: () => set({ authStatus: "anonymous", user: null, profilePhoto: "", queries: {} }),
  setProfilePhoto: (profilePhoto) => set({ profilePhoto }),
  setQuery: (key, data, expiresAt) =>
    set((state) => {
      const now = Date.now();
      const fresh = Object.entries(state.queries).filter(([, entry]) => entry.expiresAt > now);
      const next = Object.fromEntries(fresh);
      next[key] = { data, expiresAt };

      const bounded = Object.entries(next)
        .sort(([, left], [, right]) => left.expiresAt - right.expiresAt)
        .slice(-100);

      return { queries: Object.fromEntries(bounded) };
    }),
  removeQuery: (key) =>
    set((state) => {
      const next = { ...state.queries };
      delete next[key];
      return { queries: next };
    }),
  clearQueries: (prefix) =>
    set((state) => {
      if (!prefix) return { queries: {} };
      return {
        queries: Object.fromEntries(Object.entries(state.queries).filter(([key]) => !key.startsWith(prefix))),
      };
    }),
  clearSession: () => set({ authStatus: "anonymous", user: null, profilePhoto: "", queries: {} }),
}));
