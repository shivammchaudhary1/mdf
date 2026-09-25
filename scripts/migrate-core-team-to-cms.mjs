import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

import mongoose from "mongoose";

const mode = process.argv[2] ?? "dev";
if (!["dev", "prod"].includes(mode)) {
  console.error("Usage: node scripts/migrate-core-team-to-cms.mjs [dev|prod]");
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
const team = Array.isArray(websiteData.aboutUs?.coreTeam) ? websiteData.aboutUs.coreTeam : [];

if (!team.length) {
  console.error("No static Core Team records found. Nothing to migrate.");
  process.exit(1);
}

function slugFor(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 130) || "team-member";
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

  const contents = db.collection("contents");
  const now = new Date();
  let inserted = 0;
  let existing = 0;

  for (const [index, member] of team.entries()) {
    const slug = slugFor(member.name);
    const found = await contents.findOne({
      kind: "team",
      archived: { $ne: true },
      $or: [{ slug }, { title: member.name }],
    });

    if (found) {
      existing += 1;
      continue;
    }

    await contents.insertOne({
      kind: "team",
      slug,
      title: member.name,
      category: "Core Team",
      description: member.shortBio || "",
      body: Array.isArray(member.focus) ? member.focus : [],
      role: member.designation || "",
      status: "Published",
      published: true,
      publishedAt: now,
      archived: false,
      order: index + 1,
      data: {
        group: "Core Team",
        details: member.details || "",
        image: member.image || "",
        imageAlt: member.name || "M. Dadu Films team member",
        instagram: member.instagram || "",
        facebook: member.facebook || "",
        x: member.x || "",
        linkedin: member.linkedin || "",
        youtube: member.youtube || "",
      },
      createdBy: admin._id,
      updatedBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    inserted += 1;
  }

  console.log(`Core Team CMS migration complete. Inserted: ${inserted}, already existed: ${existing}.`);
  console.log("website-data.json was read only and was not modified.");
} finally {
  await mongoose.disconnect();
}
