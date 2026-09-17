import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import mongoose from "mongoose";

const directory = await mkdtemp(join(tmpdir(), "mdadu-backend-v2-"));
const database = `mdadu_v2_test_${Date.now()}`;
const uri = `mongodb://127.0.0.1:27017/${database}`;
const base = "http://127.0.0.1:18888/api/v1";
const child = spawn(process.execPath, [resolve("apps/api/dist/main.js")], {
  cwd: directory,
  env: {
    ...process.env,
    NODE_ENV: "test",
    PORT: "18888",
    MONGODB_URI: uri,
    FRONTEND_URL: "http://localhost:3333",
    COOKIE_SECRET: "integration_cookie_secret_that_is_long_enough_123456789",
    STORAGE_DRIVER: "local",
    SWAGGER_ENABLED: "false",
    MONGODB_AUTO_INDEX: "true",
    GENERAL_RATE_LIMIT_PER_MINUTE: "1000",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
child.stdout.on("data", (x) => { output += x; });
child.stderr.on("data", (x) => { output += x; });

const jar = () => ({ cookies: new Map(), csrf: null });
function saveCookies(response, state) {
  const values = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie")].filter(Boolean);
  for (const header of values) {
    const pair = header.split(";")[0];
    const i = pair.indexOf("=");
    if (i < 1) continue;
    const name = pair.slice(0, i), value = pair.slice(i + 1);
    if (value) state.cookies.set(name, value); else state.cookies.delete(name);
  }
}
async function request(path, { method = "GET", body, state, csrf = true, origin } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (state?.cookies?.size) headers.Cookie = [...state.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  if (state?.csrf && csrf && !["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = state.csrf;
  if (origin) headers.Origin = origin;
  const response = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (state) saveCookies(response, state);
  const data = (response.headers.get("content-type") ?? "").includes("json") ? await response.json() : await response.arrayBuffer();
  if (state && data && typeof data === "object" && typeof data.csrfToken === "string") state.csrf = data.csrfToken;
  return { status: response.status, data, headers: response.headers };
}

try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error(output);
    try { if ((await request("/health")).status === 200) { ready = true; break; } } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, output);
  await mongoose.connect(uri);

  const member = jar(), admin = jar();
  const memberInput = { name: "Integration Member", email: "member@example.test", mobile: "+919999999999", password: "Integration-pass-123", confirmPassword: "Integration-pass-123" };
  let r = await request("/auth/register", { method: "POST", body: memberInput, state: member });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.ok(r.data.csrfToken);
  const memberId = r.data.id;

  r = await request("/member/profile", { method: "PUT", body: { city: "Indore", profession: "Actor", skills: ["Acting"], languages: ["Hindi"], publicVisible: true }, state: member, csrf: false });
  assert.equal(r.status, 403);
  r = await request("/member/profile", { method: "PUT", body: { city: "Indore", profession: "Actor", skills: ["Acting"], languages: ["Hindi"], publicVisible: true }, state: member });
  assert.equal(r.status, 200, JSON.stringify(r.data));

  r = await request("/auth/register", { method: "POST", body: { ...memberInput, name: "Admin", email: "admin@example.test", mobile: "+918888888888" }, state: admin });
  assert.equal(r.status, 201);
  await mongoose.connection.collection("accounts").updateOne({ _id: new mongoose.Types.ObjectId(r.data.id) }, { $set: { role: "SUPER_ADMIN", verified: true } });

  r = await request("/admin/projects", { method: "POST", state: admin, body: { title: "Integration Project", slug: "integration-project", type: "Short Film", status: "Pre-production", published: true } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const projectId = r.data._id;

  r = await request("/admin/castings", { method: "POST", state: admin, body: { title: "Lead Actor", slug: "lead-actor", projectId, role: "Lead Actor", category: "Acting", status: "Open", published: true, deadline: new Date(Date.now() + 86400000).toISOString() } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const castingId = r.data._id;

  r = await request("/member/applications", { method: "POST", state: member, body: { opportunityId: castingId, opportunityType: "CASTING", coverNote: "I would like to apply for this integration casting opportunity." } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const applicationId = r.data._id;

  r = await request(`/admin/applications/${applicationId}`, { method: "PATCH", state: admin, body: { status: "Shortlisted", adminNotes: "Private note" } });
  assert.equal(r.status, 200);
  r = await request("/member/applications", { state: member });
  assert.equal(r.data.items[0].status, "Shortlisted");
  assert.equal(r.data.items[0].adminNotes, undefined);

  r = await request(`/admin/users/${memberId}`, { method: "PATCH", state: admin, body: { verified: true } });
  assert.equal(r.status, 200);
  r = await request("/talent?city=Indore&profession=Actor");
  assert.equal(r.status, 200);
  assert.ok(r.data.items.some((x) => x.id === memberId));
  assert.equal(r.data.items.find((x) => x.id === memberId).email, undefined);

  r = await request("/admin/dashboard", { state: admin });
  assert.equal(r.status, 200);
  assert.ok(r.data.metrics.applications >= 1);

  console.log("PASS backend V2 integration smoke test");
} finally {
  child.kill("SIGTERM");
  if (child.exitCode === null) await Promise.race([once(child, "exit"), new Promise((r) => setTimeout(r, 3000))]);
  if (child.exitCode === null) child.kill("SIGKILL");
  if (mongoose.connection.readyState === 1) { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); }
  await rm(directory, { recursive: true, force: true });
}
