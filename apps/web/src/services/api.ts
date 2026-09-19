import { runtimeConfig } from "@/config/runtime";
import { type SessionUser, useAppStore } from "@/store/app-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requestId?: string,
  ) {
    super(message);
  }
}

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;
const inFlight = new Map<string, Promise<unknown>>();
const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
const EXEMPT = new Set(["/auth/login", "/auth/google", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/contact"]);

async function loadCsrf() {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = fetch(`${runtimeConfig.apiUrl}/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      csrfToken = typeof data?.csrfToken === "string" ? data.csrfToken : null;
      return csrfToken;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

export function clearApiSecurityState() {
  csrfToken = null;
  csrfPromise = null;
}

export function invalidateApiCache(prefix?: string) {
  if (typeof window === "undefined") return;
  useAppStore.getState().clearQueries(prefix);
  for (const key of [...inFlight.keys()]) {
    if (!prefix || key.startsWith(prefix)) inFlight.delete(key);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = String(options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!SAFE.has(method) && !EXEMPT.has(path)) {
    const token = await loadCsrf();
    if (token) headers.set("X-CSRF-Token", token);
  }

  const response = await fetch(`${runtimeConfig.apiUrl}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (data && typeof data === "object" && typeof data.csrfToken === "string") {
    csrfToken = data.csrfToken;
  }

  const endsSession =
    response.ok &&
    (path === "/auth/logout" ||
      path === "/auth/logout-all" ||
      path === "/auth/deactivate" ||
      (data && typeof data === "object" && data.currentSessionRevoked === true));

  if (response.status === 401 || endsSession) {
    clearApiSecurityState();
    if (typeof window !== "undefined") useAppStore.getState().clearSession();
  }

  if (!response.ok) {
    const message = data?.message;
    throw new ApiError(
      Array.isArray(message) ? message.join(" ") : typeof message === "string" ? message : "Something went wrong. Please try again.",
      response.status,
      response.headers.get("x-request-id") ?? data?.requestId,
    );
  }

  if (!SAFE.has(method)) {
    invalidateApiCache();
  }

  return data as T;
}

export async function cachedApi<T>(
  path: string,
  options: {
    ttl?: number;
    force?: boolean;
  } = {},
): Promise<T> {
  if (typeof window === "undefined") return api<T>(path);

  const ttl = Math.max(0, options.ttl ?? 30_000);
  const key = path;
  const now = Date.now();
  const state = useAppStore.getState();
  const cached = state.queries[key];

  if (!options.force && cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  if (!options.force) {
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T>;
  }

  const request = api<T>(path)
    .then((data) => {
      useAppStore.getState().setQuery(key, data, Date.now() + ttl);
      return data;
    })
    .finally(() => {
      if (inFlight.get(key) === request) inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

export type CurrentUser = SessionUser;
