import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const requiredRoutes = [
  "apps/web/src/app/page.tsx",
  "apps/web/src/app/about/page.tsx",
  "apps/web/src/app/services/page.tsx",
  "apps/web/src/app/projects/page.tsx",
  "apps/web/src/app/projects/[slug]/page.tsx",
  "apps/web/src/app/our-work/page.tsx",
  "apps/web/src/app/talent/page.tsx",
  "apps/web/src/app/talent/[id]/page.tsx",
  "apps/web/src/app/casting/page.tsx",
  "apps/web/src/app/casting/[slug]/page.tsx",
  "apps/web/src/app/blog/page.tsx",
  "apps/web/src/app/blog/[slug]/page.tsx",
  "apps/web/src/app/contact/page.tsx",
  "apps/web/src/app/careers/page.tsx",
  "apps/web/src/app/gallery/page.tsx",
  "apps/web/src/app/behind-the-scenes/page.tsx",
  "apps/web/src/app/shows/page.tsx",
  "apps/web/src/app/team/page.tsx",
  "apps/web/src/app/privacy/page.tsx",
  "apps/web/src/app/terms/page.tsx",
  "apps/web/src/app/login/page.tsx",
  "apps/web/src/app/signup/page.tsx",
  "apps/web/src/app/forgot-password/page.tsx",
  "apps/web/src/app/reset-password/page.tsx",
  "apps/web/src/app/dashboard/page.tsx",
  "apps/web/src/app/member/page.tsx",
  "apps/web/src/app/member/[section]/page.tsx",
  "apps/web/src/app/admin/page.tsx",
  "apps/web/src/app/admin/[section]/page.tsx",
];

const requiredRuntime = [
  "apps/web/src/components/account-form.tsx",
  "apps/web/src/components/auth-page.tsx",
  "apps/web/src/components/guest-only.tsx",
  "apps/web/src/components/google-auth-button.tsx",
  "apps/web/src/components/member-workspace.tsx",
  "apps/web/src/components/admin/admin-workspace.tsx",
  "apps/web/src/components/site/site-header.tsx",
  "apps/web/src/services/api.ts",
  "apps/web/src/services/auth-session.ts",
  "apps/web/src/store/app-store.ts",
];

for (const path of [...requiredRoutes, ...requiredRuntime]) {
  assert.ok(existsSync(path), `Required route/runtime file is missing: ${path}`);
}

const siteHeader = readFileSync("apps/web/src/components/site/site-header.tsx", "utf8");
assert.match(siteHeader, /href="\/login"/, "Anonymous Login action is missing from SiteHeader.");
assert.match(siteHeader, /href="\/signup"/, "Anonymous Join/Signup action is missing from SiteHeader.");
assert.match(siteHeader, /Dashboard/, "Authenticated dashboard action is missing from SiteHeader.");
assert.match(siteHeader, /Logout/, "Authenticated logout action is missing from SiteHeader.");
assert.match(siteHeader, /user\?\.role === "SUPER_ADMIN" \? "\/admin" : "\/member"/, "Role-aware dashboard routing is missing.");

const guestOnly = readFileSync("apps/web/src/components/guest-only.tsx", "utf8");
assert.match(guestOnly, /router\.replace\(user\.role === "SUPER_ADMIN" \? "\/admin" : "\/member"\)/, "Guest auth-page redirect is missing.");

const dashboard = readFileSync("apps/web/src/app/dashboard/page.tsx", "utf8");
assert.match(dashboard, /ensureSession/, "/dashboard compatibility route must resolve the current session.");
assert.match(dashboard, /"\/login"/, "/dashboard must send anonymous visitors to login.");
assert.match(dashboard, /"\/admin" : "\/member"/, "/dashboard must route by role.");

const adminPage = readFileSync("apps/web/src/app/admin/page.tsx", "utf8");
const adminSection = readFileSync("apps/web/src/app/admin/[section]/page.tsx", "utf8");
for (const [name, source] of [
  ["admin/page.tsx", adminPage],
  ["admin/[section]/page.tsx", adminSection],
]) {
  assert.match(source, /@\/components\/admin\/admin-workspace/, `${name} is not using the canonical admin workspace.`);
}

assert.ok(!existsSync("apps/web/src/components/admin-workspace.tsx"), "Duplicate top-level AdminWorkspace still exists.");
assert.ok(!existsSync("apps/web/src/data/admin-dashboard.json"), "Legacy admin fixture dataset still exists.");
assert.ok(!existsSync("apps/web/src/data/member-dashboard.json"), "Legacy member fixture dataset still exists.");

for (const legacyFile of [
  "scripts/seed-dev.mjs",
  "scripts/seed-our-work.mjs",
  "docs/DEV_SEED.md",
  "scripts/migrate-backend-v2.mjs",
  "scripts/migrate-media-storage.mjs",
  "scripts/upsert-group11-content.mjs",
]) {
  assert.ok(!existsSync(legacyFile), `Legacy database helper still exists: ${legacyFile}`);
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of ["dev", "build", "typecheck", "test", "test:integration", "check", "verify", "audit:repo"]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Root package script missing: ${script}`);
}

console.log(`PASS repository audit: ${requiredRoutes.length} critical routes and ${requiredRuntime.length} runtime files are present.`);
console.log("PASS auth navigation: anonymous Login/Signup and authenticated Dashboard/Logout paths are present.");
console.log("PASS cleanup invariants: canonical admin workspace is active; legacy dashboard fixture datasets are removed.");
