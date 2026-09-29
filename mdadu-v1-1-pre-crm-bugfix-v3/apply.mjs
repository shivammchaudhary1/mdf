import fs from "node:fs";
import path from "node:path";

const PATCH = "mdadu-v1-1-pre-crm-bugfix-v3";
const root = process.cwd();

const dashboardPath = "apps/web/src/components/admin/admin-dashboard-view.tsx";
const hookPath = "apps/web/src/components/admin/use-admin-dashboard.ts";

function abs(rel) {
  return path.join(root, rel);
}

function read(rel) {
  return fs.readFileSync(abs(rel), "utf8");
}

function normalize(value) {
  return value.replace(/\r\n/g, "\n");
}

function preserveEol(original, normalized) {
  return original.includes("\r\n") ? normalized.replace(/\n/g, "\r\n") : normalized;
}

for (const rel of [dashboardPath, hookPath]) {
  if (!fs.existsSync(abs(rel))) {
    console.error(`[${PATCH}] Missing expected file: ${rel}`);
    process.exit(1);
  }
}

const hook = normalize(read(hookPath));
if (!hook.includes("id: item._id,")) {
  console.error(
    `[${PATCH}] V2 prerequisite is missing in ${hookPath}. Apply mdadu-v1-1-pre-crm-bugfix-v2 first. No files were changed.`,
  );
  process.exit(1);
}

const original = read(dashboardPath);
const source = normalize(original);
const oldText = '                <div key={`${x.title}-${x.time}`}>';
const newText = '                <div key={x.id}>';

if (source.includes(newText)) {
  console.log(`[${PATCH}] Already applied: ${dashboardPath}`);
  console.log(`[${PATCH}] No database operation was performed.`);
  process.exit(0);
}

if (!source.includes(oldText)) {
  console.error(
    `[${PATCH}] Cannot safely update ${dashboardPath}; expected old React key was not found. No files were changed.`,
  );
  process.exit(1);
}

const backupDir = path.join(
  root,
  ".local",
  "patch-backups",
  `${PATCH}-${new Date().toISOString().replace(/[:.]/g, "-")}`,
);
fs.mkdirSync(path.dirname(path.join(backupDir, dashboardPath)), { recursive: true });
fs.copyFileSync(abs(dashboardPath), path.join(backupDir, dashboardPath));

const updated = source.replace(oldText, newText);
fs.writeFileSync(abs(dashboardPath), preserveEol(original, updated), "utf8");

console.log(`updated ${dashboardPath}`);
console.log("  - use stable audit id for Recent activity React keys");
console.log("");
console.log(`[${PATCH}] Applied 1 file.`);
console.log(`[${PATCH}] Backup: ${backupDir}`);
console.log(`[${PATCH}] No database operation was performed.`);
console.log(`Next: node ${PATCH}/verify.mjs`);
