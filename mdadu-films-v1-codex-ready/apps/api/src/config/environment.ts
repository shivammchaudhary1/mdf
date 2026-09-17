export function validateEnvironment(input: Record<string, unknown>) {
  const port = Number(input.PORT ?? 8888);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  const uri = String(input.MONGODB_URI ?? "");
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must be a MongoDB connection URI.");
  }
  const origins = String(input.FRONTEND_URL ?? "http://localhost:3333");
  for (const origin of origins.split(",")) {
    const url = new URL(origin.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== origin.trim()
    ) {
      throw new Error(
        "FRONTEND_URL must contain HTTP(S) origins without paths.",
      );
    }
  }
  return { ...input, PORT: port, MONGODB_URI: uri, FRONTEND_URL: origins };
}
