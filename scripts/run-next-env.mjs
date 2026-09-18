import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateEnvironmentFiles } from "./check-env-files.mjs";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const webRoot = resolve(repoRoot, "apps", "web");

const mode = process.argv[2];
const args = process.argv.slice(3);

if (!["dev", "prod"].includes(mode ?? "")) {
  console.error("Usage: node scripts/run-next-env.mjs <dev|prod> <next-command> [...args]");
  process.exit(1);
}

if (!args.length) {
  console.error("A Next.js command is required.");
  process.exit(1);
}

validateEnvironmentFiles(mode, "web");

const envFile = resolve(webRoot, mode === "dev" ? ".env.dev" : ".env.prod");
process.loadEnvFile(envFile);

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: webRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("Unable to start Next.js:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
