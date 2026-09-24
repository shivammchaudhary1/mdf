import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

import mongoose from "mongoose";

const mode = process.argv[2] ?? "dev";
if (!["dev", "prod"].includes(mode)) {
  console.error("Usage: node scripts/migrate-services-to-cms.mjs [dev|prod]");
  process.exit(1);
}

if (mode === "prod" && !process.argv.includes("--confirm-prod")) {
  console.error("Production migration requires --confirm-prod.");
  process.exit(1);
}

const envPath = resolve("apps/api", mode === "dev" ? ".env.dev" : ".env.prod");
if (!existsSync(envPath)) {
  console.error(`Missing environment file: ${envPath}`);
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const uri = String(env.MONGODB_URI ?? "").trim();
if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  console.error("MONGODB_URI is missing or invalid.");
  process.exit(1);
}

const websiteDataPath = resolve("apps/web/src/data/website-data.json");
const websiteData = JSON.parse(readFileSync(websiteDataPath, "utf8"));
const services = Array.isArray(websiteData.services) ? websiteData.services : [];

if (!services.length) {
  console.error("No static services found. Nothing to migrate.");
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

try {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready.");

  const admin = await db.collection("accounts").findOne({
    role: "SUPER_ADMIN",
    suspended: { $ne: true },
  });

  if (!admin?._id) {
    throw new Error("Create/sign in a SUPER_ADMIN account first; migration needs an audit owner.");
  }

  const now = new Date();
  let inserted = 0;
  let existing = 0;

  for (const [index, service] of services.entries()) {
    const modal = service.modal ?? {};
    const result = await db.collection("contents").updateOne(
      { kind: "services", slug: service.slug },
      {
        $setOnInsert: {
          kind: "services",
          slug: service.slug,
          title: service.title,
          category: service.category || "Other",
          description: service.description || "",
          body: Array.isArray(modal.highlights) ? modal.highlights : [],
          status: "Published",
          published: true,
          publishedAt: now,
          archived: false,
          order: index + 1,
          data: {
            image: service.image || "",
            imageAlt: service.title || "M. Dadu Films service",
            modalEyebrow: modal.eyebrow || service.category || "Service",
            modalTitle: modal.title || service.title,
            overview: modal.overview || "",
            idealFor: modal.idealFor || "",
            contactSubject: modal.contactSubject || "Production",
            contactMessage: modal.contactMessage || "",
          },
          createdBy: admin._id,
          updatedBy: admin._id,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount === 1) inserted += 1;
    else existing += 1;
  }

  console.log(`Services CMS migration complete. Inserted: ${inserted}, already existed: ${existing}.`);
  console.log("website-data.json was read only and was not modified.");
} finally {
  await mongoose.disconnect();
}
