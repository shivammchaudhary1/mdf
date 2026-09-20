import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Run this script through the repository migration commands.");
await mongoose.connect(process.env.MONGODB_URI, { appName: "mdadu-backend-v2-migration", serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db;
if (!db) throw new Error("MongoDB connection is not ready.");
const OID = mongoose.Types.ObjectId;
const has = async (name) => (await db.listCollections({ name }, { nameOnly: true }).toArray()).length > 0;
const count = async (name) => (await has(name)) ? db.collection(name).countDocuments() : 0;
const oid = (value) => value && OID.isValid(String(value)) ? new OID(String(value)) : undefined;
const mediaId = (value) => {
  if (!value) return undefined;
  if (OID.isValid(String(value))) return new OID(String(value));
  const match = String(value).match(/\/media\/([a-f0-9]{24})\//i);
  return match ? new OID(match[1]) : undefined;
};
const mediaIds = (values) => [...new Map((Array.isArray(values) ? values : []).map(mediaId).filter(Boolean).map((id) => [String(id), id])).values()];

const collections = ["accounts", "sessions", "passwordresets", "contents", "profiles", "applications", "savedlists", "contacts", "media"];
const counts = Object.fromEntries(await Promise.all(collections.map(async (name) => [name, await count(name)])));
console.log("Detected V1 data:"); console.table(counts);
if (!apply) {
  console.log("DRY RUN ONLY. No database data changed.");
  console.log("Apply only after reviewing counts: node scripts/migrate-backend-v2.mjs --apply");
  await mongoose.disconnect(); process.exit(0);
}

for (const name of collections) {
  if (!(await count(name))) continue;
  const backup = `_backup_v1_${name}_${stamp}`;
  console.log(`Backup ${name} -> ${backup}`);
  await db.collection(name).aggregate([{ $match: {} }, { $out: backup }]).toArray();
}

const accounts = await db.collection("accounts").find().toArray();
const actor = accounts.find((x) => x.role === "SUPER_ADMIN")?._id ?? accounts[0]?._id ?? new OID();
const accountById = new Map(accounts.map((x) => [String(x._id), x]));
await db.collection("accounts").updateMany({ authProvider: { $exists: false } }, { $set: { authProvider: "local", loginCount: 0 } });

const contents = await db.collection("contents").find().toArray();
const projects = contents.filter((x) => x.kind === "projects");
const castings = contents.filter((x) => x.kind === "casting");
const opportunity = new Map([...projects, ...castings].map((x) => [String(x._id), x]));
const castingIds = new Set(castings.map((x) => String(x._id)));

for (const x of projects) {
  await db.collection("projects").updateOne({ _id: x._id }, { $set: {
    slug: x.slug, title: x.title, type: x.category || undefined, summary: x.description || undefined,
    description: x.description || undefined, body: x.body?.length ? x.body : undefined, creditsText: x.credits || undefined,
    status: x.status === "Completed" ? "Completed" : x.status === "Running" ? "In Production" : x.status === "Upcoming" ? "Pre-production" : "Development",
    location: x.location || undefined, coverMediaId: mediaId(x.image), galleryMediaIds: mediaIds(x.images), trailerUrl: x.videoUrl || undefined,
    tags: x.tags?.length ? x.tags : undefined, published: !!x.published, archived: !!x.archived, order: Number(x.order ?? 0),
    createdBy: oid(x.createdBy) ?? actor, updatedBy: oid(x.updatedBy) ?? actor, createdAt: x.createdAt ?? new Date(), updatedAt: x.updatedAt ?? x.createdAt ?? new Date()
  } }, { upsert: true });
}
for (const x of castings) {
  await db.collection("castings").updateOne({ _id: x._id }, { $set: {
    projectId: oid(x.projectId), slug: x.slug, title: x.title, role: x.role || undefined, category: x.category || undefined,
    summary: x.description || undefined, description: x.description || undefined, details: x.body?.length ? x.body : undefined,
    status: x.status === "Open" ? "Open" : x.status === "Closed" ? "Closed" : "Draft", published: !!x.published, archived: !!x.archived,
    location: x.location || undefined, shootDate: x.shootDate || undefined, deadline: x.deadline || undefined, ageMin: x.ageMin, ageMax: x.ageMax,
    gender: x.gender || undefined, experience: x.experience || undefined, compensation: x.compensation || undefined, requirements: x.requirements || undefined,
    coverMediaId: mediaId(x.image), tags: x.tags?.length ? x.tags : undefined, createdBy: oid(x.createdBy) ?? actor, updatedBy: oid(x.updatedBy) ?? actor,
    createdAt: x.createdAt ?? new Date(), updatedAt: x.updatedAt ?? x.createdAt ?? new Date()
  } }, { upsert: true });
}
if (projects.length || castings.length) await db.collection("contents").deleteMany({ kind: { $in: ["projects", "casting"] } });

for await (const p of db.collection("profiles").find()) {
  const userId = oid(p.userId); if (!userId) continue;
  await db.collection("profiles").updateOne({ _id: p._id }, { $set: {
    userId, photoMediaId: mediaId(p.photo), portfolioMediaIds: mediaIds(p.portfolio), resumeMediaId: mediaId(p.resume),
    publicVisible: p.publicVisible ?? false, emailCastingAlerts: p.emailCastingAlerts ?? true, emailUpdates: p.emailUpdates ?? true
  }, $unset: { photo: "", portfolio: "", resume: "" } });
}

for await (const a of db.collection("applications").find()) {
  const userId = oid(a.userId), opportunityId = oid(a.opportunityId); if (!userId || !opportunityId) continue;
  const source = opportunity.get(String(opportunityId)); const type = castingIds.has(String(opportunityId)) ? "CASTING" : "PROJECT"; const account = accountById.get(String(userId));
  await db.collection("applications").updateOne({ _id: a._id }, { $set: {
    userId, opportunityType: type, opportunityId, projectId: type === "CASTING" ? oid(source?.projectId) : opportunityId,
    opportunityTitle: a.opportunityTitle ?? source?.title ?? "Opportunity", opportunitySlug: source?.slug, roleSnapshot: source?.role,
    applicant: { name: account?.name ?? "Member", email: account?.email ?? "", mobile: account?.mobile ?? "" },
    portfolioMediaIds: mediaIds(a.portfolio), showreelUrl: a.showreel || undefined, documentMediaId: mediaId(a.document)
  }, $unset: { portfolio: "", showreel: "", document: "" } });
}

if (await has("savedlists")) for await (const list of db.collection("savedlists").find()) {
  const ownerId = oid(list.ownerId); if (!ownerId) continue;
  await db.collection("savedtalentlists").updateOne({ _id: list._id }, { $set: { ownerId, name: list.name, memberIds: (list.memberIds ?? []).map(oid).filter(Boolean), projectId: oid(list.projectId), createdAt: list.createdAt ?? new Date(), updatedAt: list.updatedAt ?? list.createdAt ?? new Date() } }, { upsert: true });
}
if (await has("contacts")) {
  await db.collection("contacts").updateMany({ status: { $exists: false }, read: true }, { $set: { status: "Open" }, $unset: { read: "" } });
  await db.collection("contacts").updateMany({ status: { $exists: false } }, { $set: { status: "New" }, $unset: { read: "" } });
}
// Hardened session tokens intentionally require fresh sign-in after migration.
if (await has("sessions")) await db.collection("sessions").deleteMany({});
if (await has("passwordresets")) await db.collection("passwordresets").deleteMany({});
console.log("Backend V2 migration complete. Keep _backup_v1_* collections until manual verification is finished.");
await mongoose.disconnect();
