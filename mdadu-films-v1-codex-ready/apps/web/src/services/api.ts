import { runtimeConfig } from "@/config/runtime";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${runtimeConfig.apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message;
    throw new ApiError(
      Array.isArray(message)
        ? message.join(" ")
        : typeof message === "string"
          ? message
          : "Something went wrong. Please try again.",
      response.status,
    );
  }
  return data as T;
}
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "USER" | "SUPER_ADMIN";
  verified: boolean;
};
