import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import sharp from "sharp";
import mongoose from "mongoose";

const directory = await mkdtemp(join(tmpdir(), "mdadu-backend-v2-"));
const database = `mdadu_v2_test_${Date.now()}`;
const uri = `mongodb://127.0.0.1:${process.env.INTEGRATION_MONGO_PORT ?? "27017"}/${database}`;
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
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state?.cookies?.size) headers.Cookie = [...state.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  if (state?.csrf && csrf && !["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = state.csrf;
  if (origin) headers.Origin = origin;
  const response = await fetch(base + path, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
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
  assert.match(r.headers.getSetCookie().find(x => x.startsWith("mdadu_session=")), /HttpOnly/);
  assert.match(r.headers.getSetCookie().find(x => x.startsWith("mdadu_session=")), /SameSite=Lax/);
  assert.equal(r.data.passwordHash, undefined);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.ok(r.headers.get("x-request-id"));
  const forged = { cookies: new Map([["mdadu_session", "unsigned-forged-session"]]), csrf: null };
  assert.equal((await request("/auth/me", { state: forged })).status, 401);
  assert.equal((await request("/admin/dashboard", { state: member })).status, 403);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, origin: "https://evil.example", body: { city: "Denied" } })).status, 403);
  const invalidCsrf = { cookies: member.cookies, csrf: "invalid-token" };
  assert.equal((await request("/member/profile", { method: "PUT", state: invalidCsrf, body: { city: "Denied" } })).status, 403);

  r = await request("/member/profile", { method: "PUT", body: { city: "Indore", profession: "Actor", skills: ["Acting"], languages: ["Hindi"], publicVisible: true }, state: member, csrf: false });
  assert.equal(r.status, 403);
  r = await request("/member/profile", { method: "PUT", body: { city: "Indore", profession: "Actor", birthDate: "1995-04-20", skills: ["Acting"], languages: ["Hindi"], publicVisible: true }, state: member });
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
  r = await request("/admin/castings?closingSoon=true&limit=1", { state: admin });
  assert.equal(r.status, 200);
  assert.equal(r.data.meta.total, 1);
  assert.equal(r.data.items[0]._id, castingId);
  assert.equal((await request("/member/settings", { method: "PATCH", state: member, body: { savedOpportunityIds: [castingId] } })).status, 200);
  assert.deepEqual((await request("/member/profile", { state: member })).data.profile.savedOpportunityIds, [castingId]);

  r = await request("/member/applications", { method: "POST", state: member, body: { opportunityId: castingId, opportunityType: "CASTING", coverNote: "I would like to apply for this integration casting opportunity." } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const applicationId = r.data._id;
  assert.equal((await request("/member/applications", { method: "POST", state: member, body: { opportunityId: castingId, opportunityType: "CASTING", coverNote: "Duplicate application must be rejected." } })).status, 409);

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
  assert.equal(r.data.items.find((x) => x.id === memberId).profile.birthDate, undefined);
  assert.equal((await request(`/talent/${memberId}`)).data.profile.birthDate, undefined);
  assert.equal((await request("/talent?city=NoSuchCity")).data.meta.total, 0);
  assert.equal((await request("/talent?skills=Acting")).data.items.some((x) => x.id === memberId), true);
  assert.equal((await request("/talent?languages=Hindi")).data.items.some((x) => x.id === memberId), true);
  assert.equal((await request("/talent?gender=Male")).data.items.some((x) => x.id === memberId), true);
  assert.equal((await request("/talent?ageMin=20&ageMax=40")).data.items.some((x) => x.id === memberId), true);
  assert.equal((await request("/talent?search=Acting")).data.items.some((x) => x.id === memberId), true);
  assert.equal((await request("/talent?limit=10000")).status, 400);

  r = await request(`/admin/castings/${castingId}`, { method: "PATCH", state: admin, body: { ageMin: 20, ageMax: 40, shootDate: new Date(Date.now() + 3 * 86400000).toISOString() } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await request("/auth/account", { method: "PATCH", state: member, body: { mobile: "+917777777777" } })).status, 200);
  assert.equal((await request("/auth/me", { state: member })).data.mobile, "+917777777777");
  assert.equal((await request("/auth/account", { method: "PATCH", state: member, body: { mobile: "invalid" } })).status, 400);
  assert.equal((await request("/member/settings", { method: "PATCH", state: member, body: { emailUpdates: false } })).status, 200);
  assert.equal((await request("/member/profile", { state: member })).data.profile.emailUpdates, false);
  assert.equal((await request(`/admin/castings/${castingId}`, { method: "PATCH", state: admin, body: { ageMin: 50 } })).status, 400);
  assert.equal((await request(`/admin/castings/${castingId}`, { method: "PATCH", state: admin, body: { deadline: new Date(Date.now() + 4 * 86400000).toISOString() } })).status, 400);

  r = await request("/admin/lists", { method: "POST", state: admin, body: { name: "Integration shortlist", projectId, memberIds: [memberId] } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const listId = r.data._id;
  assert.equal((await request("/admin/lists?limit=1", { state: admin })).data.meta.total, 1);
  r = await request(`/admin/lists/${listId}`, { state: admin });
  assert.equal(r.data.projectId, projectId);
  assert.equal(r.data.members[0].id, memberId);
  assert.equal((await request(`/admin/lists/${listId}`, { method: "PUT", state: admin, body: { name: "Renamed shortlist", purpose: "Integration review" } })).status, 200);
  assert.equal((await request(`/admin/lists/${listId}/members/${memberId}`, { method: "DELETE", state: admin })).data.members.length, 0);
  assert.equal((await request(`/admin/lists/${listId}/members`, { method: "POST", state: admin, body: { memberId } })).data.members.length, 1);
  assert.equal((await request(`/admin/lists/${listId}`, { state: admin })).data.purpose, "Integration review");

  r = await request("/contact", { method: "POST", body: { name: "Test Contact", email: "contact@example.test", subject: "Integration inquiry", message: "Please verify contact persistence." } });
  assert.equal(r.status, 201);
  r = await request("/admin/contacts", { state: admin });
  assert.equal(r.data.items.length, 1);
  assert.equal((await request(`/admin/contacts/${r.data.items[0]._id}`, { method: "PATCH", state: admin, body: { status: "Open" } })).status, 200);

  const image = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: "#555555" } }).png().toBuffer();
  const upload = new FormData();
  upload.append("file", new Blob([image], { type: "image/png" }), "test.png");
  r = await request("/media", { method: "POST", state: member, body: upload });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const mediaId = r.data.id;
  assert.equal((await request(`/media/${mediaId}/medium`)).status, 401);
  assert.equal((await request(`/media/${mediaId}/medium`, { state: member })).status, 200);
  assert.equal((await request("/member/profile", { method: "PUT", state: admin, body: { photoMediaId: mediaId } })).status, 400);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { photoMediaId: mediaId } })).status, 200);
  assert.equal((await request(`/media/${mediaId}/medium`)).status, 200);

  const documentUpload = new FormData();
  documentUpload.append("file", new Blob(["%PDF-1.4\nIntegration document"], { type: "application/pdf" }), "resume.pdf");
  r = await request("/media", { method: "POST", state: member, body: documentUpload });
  assert.equal(r.status, 201);
  const documentId = r.data.id;
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [documentId] } })).status, 400);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { resumeMediaId: documentId } })).status, 200);
  assert.equal((await request(`/media/${documentId}/document`)).status, 401);
  assert.equal((await request(`/media/${documentId}/document`, { state: member })).status, 200);

  // The same administrator-owned image may appear in a profile and a published project.
  const adminImageUpload = new FormData();
  adminImageUpload.append("file", new Blob([image], { type: "image/png" }), "admin.png");
  r = await request("/media", { method: "POST", state: admin, body: adminImageUpload });
  const sharedId = r.data.id;
  assert.equal((await request(`/admin/projects/${projectId}`, { method: "PATCH", state: admin, body: { coverMediaId: sharedId } })).status, 200);
  assert.equal((await request("/member/profile", { method: "PUT", state: admin, body: { photoMediaId: sharedId, publicVisible: false } })).status, 200);
  assert.equal((await request(`/media/${sharedId}/medium`)).status, 200);
  const portfolioUpload = new FormData();
  portfolioUpload.append("file", new Blob([await sharp(image).resize(500).png().toBuffer()], { type: "image/png" }), "portfolio.png");
  r = await request("/media", { method: "POST", state: member, body: portfolioUpload });
  assert.equal(r.status, 201);
  const portfolioId = r.data.id;
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [portfolioId] } })).status, 200);
  assert.equal((await request(`/media/${portfolioId}/medium`)).status, 200);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [] } })).status, 200);
  assert.equal((await request(`/media/${portfolioId}/medium`)).status, 404);

  r = await request("/member/profile", { method: "PUT", state: member, body: {
    skills: ["Acting", "Voice", "Acting"],
    languages: ["Hindi", "English", "Hindi"],
    gender: "Male",
    previousWork: "Short films and theatre",
    socialLinks: ["https://example.com/member"],
    showreel: "https://example.com/showreel"
  } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.deepEqual(r.data.profile.skills, ["Acting", "Voice"]);
  assert.deepEqual(r.data.profile.languages, ["Hindi", "English"]);
  assert.equal(r.data.profile.previousWork, "Short films and theatre");
  assert.equal(r.data.profile.showreel, "https://example.com/showreel");
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { showreel: "http://example.com/not-secure" } })).status, 400);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { showreel: null } })).status, 200);
  assert.equal((await request("/member/profile", { state: member })).data.profile.showreel, undefined);

  const duplicatePortfolioUpload = new FormData();
  duplicatePortfolioUpload.append("file", new Blob([await sharp(image).resize(480).png().toBuffer()], { type: "image/png" }), "duplicate-portfolio.png");
  r = await request("/media", { method: "POST", state: member, body: duplicatePortfolioUpload });
  assert.equal(r.status, 201);
  const duplicatePortfolioId = r.data.id;
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [duplicatePortfolioId, duplicatePortfolioId] } })).status, 400);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [duplicatePortfolioId] } })).status, 200);
  assert.equal((await request(`/media/${duplicatePortfolioId}`, { method: "DELETE", state: member })).status, 409);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { portfolioMediaIds: [] } })).status, 200);
  assert.equal((await request(`/media/${duplicatePortfolioId}/medium`, { state: member })).status, 404);

  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { resumeMediaId: null } })).status, 200);
  assert.equal((await request("/member/profile", { state: member })).data.profile.resumeMediaId, undefined);
  assert.equal((await request(`/media/${documentId}/document`, { state: member })).status, 404);

  const other = jar();
  assert.equal((await request("/auth/register", { method: "POST", state: other, body: { ...memberInput, email: "other@example.test" } })).status, 201);
  assert.equal((await request(`/member/applications/${applicationId}`, { state: other })).status, 404);
  assert.equal((await request(`/media/${documentId}/document`, { state: other })).status, 404);
  assert.equal((await request(`/admin/castings/${castingId}/close`, { method: "PATCH", state: admin })).status, 200);
  assert.equal((await request("/member/applications", { method: "POST", state: other, body: { opportunityId: castingId, opportunityType: "CASTING", coverNote: "Cannot apply to a closed casting." } })).status, 400);

  for (const kind of ["blog", "team", "gallery", "behind-the-scenes", "shows", "settings", "legal"]) {
    r = await request(`/admin/content/${kind}`, { method: "POST", state: admin, body: { title: `Integration ${kind}`, slug: `integration-${kind}`, published: false, seoTitle: "Test SEO", body: ["Test content"] } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    const contentId = r.data._id;
    assert.equal((await request(`/content/${kind}/integration-${kind}`)).status, 404);
    assert.equal((await request(`/admin/content/${kind}/${contentId}`, { method: "PATCH", state: admin, body: { published: true } })).status, 200);
    r = await request(`/admin/content/${kind}?status=Published&limit=1`, { state: admin });
    assert.equal(r.status, 200);
    assert.ok(r.data.meta.total >= 1);
    assert.equal((await request(`/content/${kind}/integration-${kind}`)).status, 200);
    assert.equal((await request(`/admin/content/${kind}/${contentId}`, { method: "DELETE", state: admin })).status, 200);
    assert.equal((await request(`/content/${kind}/integration-${kind}`)).status, 404);
  }
  r = await request("/admin/content/blog", { method: "POST", state: admin, body: { title: "Scheduled story", slug: "scheduled-story", status: "Scheduled", published: true, publishedAt: new Date(Date.now()+86400000).toISOString() } });
  assert.equal(r.status, 201);
  assert.equal((await request("/content/blog/scheduled-story")).status, 404);
  assert.equal((await request("/content/blog?search=Scheduled")).data.items.length, 0);
  r = await request("/admin/content/blog?status=Scheduled", { state: admin });
  assert.equal(r.status, 200);
  assert.equal(r.data.meta.total, 1);
  assert.equal(r.data.items[0].slug, "scheduled-story");
  assert.equal((await request("/admin/content/blog", { method: "POST", state: admin, body: { title: "Duplicate slug", slug: "scheduled-story" } })).status, 409);
  assert.equal((await request(`/admin/projects/${projectId}`, { state: admin })).status, 200);
  assert.equal((await request("/projects/integration-project")).status, 200);
  assert.equal((await request(`/admin/projects/${projectId}`, { method: "DELETE", state: admin })).status, 200);
  assert.equal((await request("/projects/integration-project")).status, 404);
  assert.equal((await request(`/admin/castings/${castingId}`, { method: "DELETE", state: admin })).status, 200);
  assert.equal((await request("/castings/lead-actor")).status, 404);
  assert.equal((await request(`/admin/lists/${listId}`, { method: "DELETE", state: admin })).status, 200);
  assert.equal((await request(`/admin/lists/${listId}`, { state: admin })).status, 404);
  assert.equal((await request("/member/profile", { method: "PUT", state: member, body: { bio: "Updated biography" } })).status, 200);
  assert.equal((await request(`/media/${mediaId}/medium`)).status, 200);

  const remembered = jar();
  r = await request("/auth/login", { method: "POST", state: remembered, body: { email: memberInput.email, password: memberInput.password, remember: true } });
  assert.equal(r.status, 201);
  assert.match(r.headers.getSetCookie().find(x => x.startsWith("mdadu_session=")), /Max-Age=/);
  r = await request("/auth/sessions", { state: remembered });
  assert.equal(r.data.length, 2);
  assert.equal(r.data[0].tokenHash, undefined);
  const oldSession = r.data.find(x => !x.current);
  assert.equal((await request(`/auth/sessions/${oldSession.id}`, { method: "DELETE", state: remembered })).status, 200);
  assert.equal((await request("/auth/me", { state: member })).status, 401);
  assert.equal((await request("/auth/logout", { method: "POST", state: remembered })).status, 201);
  assert.equal((await request("/auth/me", { state: remembered })).status, 401);

  assert.equal((await request("/auth/login", { method: "POST", state: member, body: { email: memberInput.email, password: memberInput.password } })).status, 201);
  assert.equal((await request(`/admin/users/${memberId}`, { method: "PATCH", state: admin, body: { suspended: true } })).status, 200);
  assert.equal((await request("/auth/me", { state: member })).status, 401);
  assert.equal((await request("/auth/login", { method: "POST", body: { email: memberInput.email, password: memberInput.password } })).status, 401);
  assert.equal((await request(`/admin/users/${memberId}`, { method: "PATCH", state: admin, body: { suspended: false } })).status, 200);
  assert.equal((await request("/auth/login", { method: "POST", state: member, body: { email: memberInput.email, password: memberInput.password } })).status, 201);
  const token = randomBytes(32).toString("base64url");
  await mongoose.connection.collection("passwordresets").insertOne({ userId: new mongoose.Types.ObjectId(memberId), tokenHash: createHash("sha256").update(token).digest(), expiresAt: new Date(Date.now() + 60000) });
  const resetBody = { token, password: "New-integration-pass-123", confirmPassword: "New-integration-pass-123" };
  assert.equal((await request("/auth/reset-password", { method: "POST", body: resetBody })).status, 201);
  assert.equal((await request("/auth/reset-password", { method: "POST", body: resetBody })).status, 400);
  assert.equal((await request("/auth/me", { state: member })).status, 401);

  r = await request("/admin/dashboard", { state: admin });
  assert.equal(r.status, 200);
  assert.ok(r.data.metrics.applications >= 1);
  assert.equal((await request("/auth/login", { method: "POST", state: member, body: { email: memberInput.email, password: resetBody.password } })).status, 201);
  assert.equal((await request("/auth/deactivate", { method: "POST", state: member })).status, 201);
  assert.equal((await request("/auth/me", { state: member })).status, 401);
  assert.equal((await request("/auth/deactivate", { method: "POST", state: admin })).status, 400);
  for (let attempt=0; attempt<5; attempt++) assert.equal((await request("/auth/forgot-password", { method: "POST", body: { email: "missing@example.test" } })).status, 201);
  r = await request("/auth/forgot-password", { method: "POST", body: { email: "missing@example.test" } });
  assert.equal(r.status, 429);
  assert.equal(r.data.stack, undefined);

  console.log("PASS V1 integration: auth/session/CSRF/origin, profile/settings, media/privacy, projects/castings/applications, talent/lists, contact, CMS and admin dashboard");
} finally {
  child.kill("SIGTERM");
  if (child.exitCode === null) await Promise.race([once(child, "exit"), new Promise((r) => setTimeout(r, 3000))]);
  if (child.exitCode === null) child.kill("SIGKILL");
  if (mongoose.connection.readyState === 1) { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); }
  await rm(directory, { recursive: true, force: true });
}
