import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

import mongoose from "mongoose";

const GROUPS = new Set(["Core Team", "Creative Team", "Advisors"]);
const STATUSES = new Set(["Draft", "Published", "Scheduled"]);

const mode = process.argv[2] ?? "dev";
if (!["dev", "prod"].includes(mode)) {
  console.error("Usage: node scripts/repair-team-cms-state.mjs [dev|prod]");
  process.exit(1);
}

if (mode === "prod" && !process.argv.includes("--confirm-prod")) {
  console.error("Production repair requires --confirm-prod.");
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

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

try {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready.");

  const contents = db.collection("contents");
  const now = new Date();
  const records = await contents.find({ kind: "team", archived: { $ne: true } }).toArray();

  let changed = 0;

  for (const record of records) {
    let status = STATUSES.has(record.status) ? record.status : record.published ? "Published" : "Draft";
    const data = record.data && typeof record.data === "object" ? { ...record.data } : {};
    const rawGroup =
      typeof data.group === "string" && GROUPS.has(data.group)
        ? data.group
        : typeof record.category === "string" && GROUPS.has(record.category)
          ? record.category
          : "Core Team";

    if (status === "Scheduled" && !(record.publishedAt instanceof Date)) {
      status = "Draft";
    }

    const published = status === "Published" || status === "Scheduled";
    const set = {
      status,
      published,
      category: rawGroup,
      data: { ...data, group: rawGroup },
    };
    const unset = {};

    if (status === "Published") {
      if (!(record.publishedAt instanceof Date) || record.publishedAt.getTime() > now.getTime()) {
        set.publishedAt = now;
      }
    } else if (status === "Draft") {
      unset.publishedAt = "";
    }

    const result = await contents.updateOne(
      { _id: record._id },
      {
        $set: set,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
    );

    if (result.modifiedCount) changed += 1;
  }

  const visible = await contents
    .find({
      kind: "team",
      archived: { $ne: true },
      $and: [
        {
          $or: [
            { status: "Published" },
            { status: "Scheduled", published: true },
            {
              $and: [
                { $or: [{ status: { $exists: false } }, { status: null }] },
                { published: true },
              ],
            },
          ],
        },
        {
          $or: [
            { publishedAt: { $exists: false } },
            { publishedAt: null },
            { publishedAt: { $lte: now } },
          ],
        },
      ],
    })
    .sort({ order: 1, createdAt: -1, _id: -1 })
    .project({ title: 1, status: 1, published: 1, category: 1, publishedAt: 1 })
    .toArray();

  console.log(`Team CMS state repaired. Records checked: ${records.length}; changed: ${changed}.`);
  console.log(`Publicly visible now: ${visible.length}.`);
  for (const item of visible) {
    console.log(`- ${item.title} | ${item.category} | ${item.status} | published=${item.published}`);
  }
} finally {
  await mongoose.disconnect();
}
