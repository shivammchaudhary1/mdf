import { CopyObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required.");

const driver = String(process.env.STORAGE_DRIVER ?? "local").toLowerCase();
if (!["local", "s3"].includes(driver)) throw new Error("STORAGE_DRIVER must be local or s3.");

await mongoose.connect(uri, { appName: "mdadu-media-key-migration" });
const db = mongoose.connection.db;
if (!db) throw new Error("MongoDB connection is unavailable.");

const media = db.collection("media");
const profiles = db.collection("profiles");
const applications = db.collection("applications");
const projects = db.collection("projects");
const castings = db.collection("castings");
const contents = db.collection("contents");

function prefix(ownerId, mediaId, purpose) {
  const owner = String(ownerId);
  const id = String(mediaId);
  switch (purpose) {
    case "website-image": return `assets/website-images/${id}`;
    case "project": return `assets/projects/${id}`;
    case "casting": return `assets/castings/${id}`;
    case "blog": return `assets/blog/${id}`;
    case "gallery": return `assets/gallery/${id}`;
    case "team": return `assets/team/${id}`;
    case "bts": return `assets/bts/${id}`;
    case "show": return `assets/shows/${id}`;
    case "user-profile": return `users/${owner}/profile-pic/${id}`;
    case "user-portfolio": return `users/${owner}/portfolio-images/${id}`;
    case "user-resume": return `users/${owner}/resume/${id}`;
    default: throw new Error(`Unsupported purpose ${purpose}`);
  }
}

function contentPurpose(kind) {
  if (kind === "blog") return "blog";
  if (kind === "gallery") return "gallery";
  if (kind === "team") return "team";
  if (kind === "behind-the-scenes") return "bts";
  if (kind === "shows") return "show";
  return "website-image";
}

async function infer(record) {
  const id = record._id;
  const purposes = new Set();

  if (record.kind === "document") {
    const [profileResume, applicationDocument] = await Promise.all([
      profiles.countDocuments({ resumeMediaId: id }),
      applications.countDocuments({ documentMediaId: id }),
    ]);
    if (profileResume || applicationDocument) purposes.add("user-resume");
  } else {
    const [profilePhoto, profilePortfolio, projectRef, castingRef, contentRefs] = await Promise.all([
      profiles.countDocuments({ photoMediaId: id }),
      profiles.countDocuments({ portfolioMediaIds: id }),
      projects.countDocuments({ $or: [{ coverMediaId: id }, { galleryMediaIds: id }] }),
      castings.countDocuments({ coverMediaId: id }),
      contents.find({ $or: [{ coverMediaId: id }, { mediaIds: id }] }).project({ kind: 1 }).toArray(),
    ]);

    if (profilePhoto) purposes.add("user-profile");
    if (profilePortfolio) purposes.add("user-portfolio");
    if (projectRef) purposes.add("project");
    if (castingRef) purposes.add("casting");
    for (const item of contentRefs) purposes.add(contentPurpose(item.kind));
  }

  return [...purposes];
}

const localRoot = resolve(process.cwd(), ".local", "uploads");
let s3;
let bucket;
if (driver === "s3") {
  const region = process.env.AWS_REGION;
  bucket = process.env.S3_BUCKET;
  if (!region || !bucket) throw new Error("AWS_REGION and S3_BUCKET are required for S3 migration.");
  s3 = new S3Client({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? { credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } }
      : {}),
  });
}

async function copyObject(source, target) {
  if (driver === "local") {
    const from = resolve(localRoot, source);
    const to = resolve(localRoot, target);
    await mkdir(dirname(to), { recursive: true, mode: 0o700 });
    await copyFile(from, to);
    return;
  }

  await s3.send(new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${source}`,
    Key: target,
    ServerSideEncryption: "AES256",
    MetadataDirective: "COPY",
  }));
}

async function deleteObject(key) {
  if (driver === "local") {
    await rm(resolve(localRoot, key), { force: true });
    return;
  }
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

const records = await media.find({
  $or: [
    { purpose: { $exists: false } },
    { storagePrefix: { $exists: false } },
    { storagePrefix: /^media\// },
  ],
}).toArray();

let migratable = 0;
let ambiguous = 0;
let migrated = 0;

for (const record of records) {
  const purposes = await infer(record);
  if (purposes.length !== 1) {
    ambiguous += 1;
    console.log(`SKIP ${record._id}: ${purposes.length ? `ambiguous ${purposes.join(", ")}` : "no reference to infer purpose"}`);
    continue;
  }

  const purpose = purposes[0];
  const targetPrefix = prefix(record.ownerId, record._id, purpose);
  const variants = record.kind === "document" ? ["document.pdf"] : ["thumb.webp", "profile.webp", "medium.webp", "large.webp"];
  migratable += 1;

  console.log(`${apply ? "MIGRATE" : "PLAN"} ${record._id}: media/${record._id} -> ${targetPrefix} (${purpose})`);
  if (!apply) continue;

  for (const file of variants) {
    await copyObject(`media/${record._id}/${file}`, `${targetPrefix}/${file}`);
  }

  await media.updateOne(
    { _id: record._id },
    { $set: { purpose, storagePrefix: targetPrefix } },
  );

  const deletions = await Promise.allSettled(variants.map((file) => deleteObject(`media/${record._id}/${file}`)));
  if (deletions.some((item) => item.status === "rejected")) {
    console.warn(`WARN ${record._id}: database now points to new keys, but one or more legacy objects could not be deleted.`);
  }

  migrated += 1;
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  scanned: records.length,
  migratable,
  ambiguousOrUnreferenced: ambiguous,
  migrated,
}, null, 2));

await mongoose.disconnect();
