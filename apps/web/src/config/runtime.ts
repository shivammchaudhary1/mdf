export const runtimeConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8888/api/v1",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3333",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "",
} as const;
