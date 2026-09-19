import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

const allowedModes = new Set(["dev", "prod"]);
const allowedScopes = new Set(["all", "api", "web"]);

function envPath(app, mode) {
  return resolve(repoRoot, "apps", app, mode === "dev" ? ".env.dev" : ".env.prod");
}

function standardEnvFiles(app) {
  const root = resolve(repoRoot, "apps", app);
  return [
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
    ".env.production",
    ".env.production.local",
    ".env.test",
    ".env.test.local",
  ].map((name) => resolve(root, name));
}

function loadFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required environment file: ${path}`);
  }
  return parseEnv(readFileSync(path, "utf8"));
}

function boolValue(value, key) {
  if (!["true", "false"].includes(String(value ?? "").toLowerCase())) {
    throw new Error(`${key} must be true or false.`);
  }
  return String(value).toLowerCase() === "true";
}

function validateOriginList(value, key, { httpsOnly = false } = {}) {
  const values = String(value ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  if (!values.length) throw new Error(`${key} must contain at least one origin.`);
  for (const raw of values) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      throw new Error(`${key} contains an invalid URL origin.`);
    }
    if (url.origin !== raw || !["http:", "https:"].includes(url.protocol)) {
      throw new Error(`${key} must contain origins only (no path/query/hash).`);
    }
    if (httpsOnly && url.protocol !== "https:") {
      throw new Error(`${key} must use HTTPS in production.`);
    }
  }
  return values;
}

function databaseName(uri) {
  const value = String(uri ?? "");
  if (!value) return "";
  try {
    const withoutQuery = value.split("?")[0];
    const match = withoutQuery.match(/\/([^/]+)$/);
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

function assertNoLegacyFiles(scope) {
  const apps = scope === "all" ? ["api", "web"] : [scope];
  const found = apps.flatMap((app) =>
    standardEnvFiles(app).filter((path) => existsSync(path)),
  );
  if (found.length) {
    const relative = found.map((p) => p.replace(repoRoot + "/", "").replaceAll("\\", "/"));
    throw new Error(
      `Legacy/default env files found: ${relative.join(", ")}. ` +
      "Back them up if needed, then remove/rename them. This project uses only .env.dev and .env.prod.",
    );
  }
}

function validateApi(values, mode) {
  const expectedNodeEnv = mode === "dev" ? "development" : "production";
  if (values.NODE_ENV !== expectedNodeEnv) {
    throw new Error(`apps/api/.env.${mode} must set NODE_ENV=${expectedNodeEnv}.`);
  }

  const uri = String(values.MONGODB_URI ?? "");
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(`apps/api/.env.${mode}: MONGODB_URI must be a MongoDB URI.`);
  }

  validateOriginList(values.FRONTEND_URL, "FRONTEND_URL", { httpsOnly: mode === "prod" });

  if (String(values.COOKIE_SECRET ?? "").length < 32) {
    throw new Error(`apps/api/.env.${mode}: COOKIE_SECRET must contain at least 32 characters.`);
  }

  const storage = String(values.STORAGE_DRIVER ?? "").toLowerCase();
  if (!["local", "s3"].includes(storage)) {
    throw new Error(`apps/api/.env.${mode}: STORAGE_DRIVER must be local or s3.`);
  }

  if (mode === "dev" && storage !== "local") {
    throw new Error("apps/api/.env.dev must use STORAGE_DRIVER=local for the current local-development workflow.");
  }

  if (mode === "prod" && storage === "s3") {
    if (!values.AWS_REGION || !values.S3_BUCKET) {
      throw new Error("apps/api/.env.prod: AWS_REGION and S3_BUCKET are required when STORAGE_DRIVER=s3.");
    }
  }

  const autoIndex = boolValue(values.MONGODB_AUTO_INDEX, "MONGODB_AUTO_INDEX");
  const trustProxy = boolValue(values.TRUST_PROXY, "TRUST_PROXY");
  const swagger = boolValue(values.SWAGGER_ENABLED, "SWAGGER_ENABLED");

  if (mode === "dev") {
    if (!autoIndex) throw new Error("apps/api/.env.dev must use MONGODB_AUTO_INDEX=true.");
    if (trustProxy) throw new Error("apps/api/.env.dev must use TRUST_PROXY=false.");
    if (!swagger) throw new Error("apps/api/.env.dev must use SWAGGER_ENABLED=true.");
    if (String(values.COOKIE_DOMAIN ?? "").trim()) {
      throw new Error("apps/api/.env.dev must leave COOKIE_DOMAIN empty for localhost.");
    }
  } else {
    if (autoIndex) throw new Error("apps/api/.env.prod must use MONGODB_AUTO_INDEX=false.");
    if (!trustProxy) throw new Error("apps/api/.env.prod must use TRUST_PROXY=true.");
    if (swagger) throw new Error("apps/api/.env.prod must use SWAGGER_ENABLED=false.");
  }

  return {
    database: databaseName(uri) || "(database name not visible in URI)",
    googleClientId: String(values.GOOGLE_CLIENT_ID ?? "").trim(),
  };
}

function validateWeb(values, mode) {
  const api = String(values.NEXT_PUBLIC_API_URL ?? "");
  const site = String(values.NEXT_PUBLIC_SITE_URL ?? "");

  let apiUrl;
  let siteUrl;
  try {
    apiUrl = new URL(api);
    siteUrl = new URL(site);
  } catch {
    throw new Error(`apps/web/.env.${mode}: NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL must be valid URLs.`);
  }

  if (mode === "dev") {
    if (apiUrl.origin !== "http://localhost:8888" || !apiUrl.pathname.startsWith("/api/v1")) {
      throw new Error("apps/web/.env.dev must point NEXT_PUBLIC_API_URL to http://localhost:8888/api/v1.");
    }
    if (siteUrl.origin !== "http://localhost:3333") {
      throw new Error("apps/web/.env.dev must point NEXT_PUBLIC_SITE_URL to http://localhost:3333.");
    }
  } else {
    if (apiUrl.protocol !== "https:" || siteUrl.protocol !== "https:") {
      throw new Error("apps/web/.env.prod public URLs must use HTTPS.");
    }
  }

  return {
    apiOrigin: apiUrl.origin,
    siteOrigin: siteUrl.origin,
    googleClientId: String(values.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim(),
  };
}

export function validateEnvironmentFiles(mode = "dev", scope = "all") {
  if (!allowedModes.has(mode)) throw new Error(`Mode must be one of: ${[...allowedModes].join(", ")}.`);
  if (!allowedScopes.has(scope)) throw new Error(`Scope must be one of: ${[...allowedScopes].join(", ")}.`);

  assertNoLegacyFiles(scope);

  const result = {};

  if (scope === "all" || scope === "api") {
    result.api = validateApi(loadFile(envPath("api", mode)), mode);
  }

  if (scope === "all" || scope === "web") {
    result.web = validateWeb(loadFile(envPath("web", mode)), mode);
  }

  if (scope === "all" && result.api && result.web) {
    const apiGoogle = result.api.googleClientId;
    const webGoogle = result.web.googleClientId;
    if ((apiGoogle || webGoogle) && apiGoogle !== webGoogle) {
      throw new Error(
        "GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_CLIENT_ID must both be set to the same OAuth 2.0 Web Client ID.",
      );
    }
  }

  if (scope === "all" && mode === "prod") {
    const devApi = loadFile(envPath("api", "dev"));
    const prodApi = loadFile(envPath("api", "prod"));
    const devDb = databaseName(devApi.MONGODB_URI);
    const prodDb = databaseName(prodApi.MONGODB_URI);
    if (devDb && prodDb && devDb === prodDb) {
      throw new Error(`Development and production MONGODB_URI resolve to the same database name "${devDb}". Use separate databases.`);
    }
  }

  return result;
}

const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(__filename);

if (invokedDirectly) {
  const mode = process.argv[2] ?? "dev";
  const scope = process.argv[3] ?? "all";
  try {
    const result = validateEnvironmentFiles(mode, scope);
    console.log(`Environment check passed: ${mode.toUpperCase()} / ${scope}`);
    if (result.api) console.log(`API database: ${result.api.database}`);
    if (result.web) {
      console.log(`Web API origin: ${result.web.apiOrigin}`);
      console.log(`Web site origin: ${result.web.siteOrigin}`);
    }
  } catch (error) {
    console.error(`Environment check failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
