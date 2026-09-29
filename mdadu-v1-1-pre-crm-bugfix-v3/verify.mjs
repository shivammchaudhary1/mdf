import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const PATCH = "mdadu-v1-1-pre-crm-bugfix-v3";
const root = process.cwd();

const checks = [
  {
    path: "apps/web/src/components/admin/use-admin-dashboard.ts",
    markers: ["id: item._id,"],
  },
  {
    path: "apps/web/src/components/admin/admin-dashboard-view.tsx",
    markers: ['<div key={x.id}>'],
    forbidden: ['<div key={`${x.title}-${x.time}`}>'],
  },
];

let failed = false;

for (const check of checks) {
  const full = path.join(root, check.path);
  if (!fs.existsSync(full)) {
    console.error(`missing ${check.path}`);
    failed = true;
    continue;
  }
  const content = fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n");
  for (const marker of check.markers ?? []) {
    if (!content.includes(marker)) {
      console.error(`missing marker in ${check.path}: ${marker}`);
      failed = true;
    }
  }
  for (const marker of check.forbidden ?? []) {
    if (content.includes(marker)) {
      console.error(`obsolete marker still present in ${check.path}: ${marker}`);
      failed = true;
    }
  }
  if (!failed) console.log(`ok ${check.path}`);
}

try {
  execFileSync("git", ["diff", "--check"], { cwd: root, stdio: "inherit" });
} catch {
  failed = true;
}

if (failed) {
  console.error(`\n[${PATCH}] VERIFY FAILED`);
  process.exit(1);
}

console.log(`\n[${PATCH}] Static verification passed.`);
console.log("No database operation was performed.");
console.log("Now run:");
console.log("  npm run typecheck");
console.log("  npm run lint");
console.log("  git diff --check");
