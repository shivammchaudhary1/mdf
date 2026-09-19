import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const confirmProduction = process.argv.includes("--confirm-production");
const uri = process.env.MONGODB_URI;
const nodeEnv = process.env.NODE_ENV;

if (!uri) throw new Error("MONGODB_URI is required.");
if (nodeEnv === "production" && apply && !confirmProduction) {
  throw new Error("Production apply requires --confirm-production.");
}

const source = JSON.parse(
  await readFile(resolve(process.cwd(), "docs", "group11-public-content.json"), "utf8"),
);

await mongoose.connect(uri, { appName: "mdadu-group11-content" });
const db = mongoose.connection.db;
if (!db) throw new Error("MongoDB connection is unavailable.");

const accounts = db.collection("accounts");
const content = db.collection("contents");
const admin = await accounts.findOne({ role: "SUPER_ADMIN" }, { projection: { _id: 1 } });
if (!admin) throw new Error("A SUPER_ADMIN account is required before Group 11 content can be applied.");

const now = new Date();

const records = [
  {
    kind: "settings",
    slug: "company",
    title: "Company settings",
    data: source.company,
    status: "Published",
    published: true,
    publishedAt: now,
    archived: false,
    order: 1,
  },
  {
    kind: "settings",
    slug: "registration",
    title: "Company registration",
    data: source.registration,
    status: "Published",
    published: true,
    publishedAt: now,
    archived: false,
    order: 2,
  },
  {
    kind: "legal",
    slug: "privacy",
    title: source.privacy.title,
    description: source.privacy.description,
    body: source.privacy.body,
    status: "Published",
    published: true,
    publishedAt: new Date(source.privacy.publishedAt),
    archived: false,
    order: 1,
  },
  {
    kind: "legal",
    slug: "terms",
    title: source.terms.title,
    description: source.terms.description,
    body: source.terms.body,
    status: "Published",
    published: true,
    publishedAt: new Date(source.terms.publishedAt),
    archived: false,
    order: 2,
  },
];

console.log(`Group 11 content ${apply ? "APPLY" : "DRY RUN"} (${nodeEnv ?? "unknown environment"})`);
for (const record of records) {
  const existing = await content.findOne({ kind: record.kind, slug: record.slug }, { projection: { _id: 1 } });
  console.log(`${existing ? "UPDATE" : "CREATE"} ${record.kind}/${record.slug}`);
  if (!apply) continue;

  await content.updateOne(
    { kind: record.kind, slug: record.slug },
    {
      $set: {
        ...record,
        updatedBy: admin._id,
        updatedAt: now,
      },
      $setOnInsert: {
        createdBy: admin._id,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

console.log("Verified public values included: company name, website, email, two business phone numbers, Lucknow/Noida location, services and legal policy drafts.");
console.log("GST, CIN/registration and unverified social URLs remain intentionally blank.");
if (!apply) console.log("No database changes were made. Re-run with --apply to write these records.");

await mongoose.disconnect();
