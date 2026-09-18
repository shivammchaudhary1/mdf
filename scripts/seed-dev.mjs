import mongoose, { Types } from "mongoose";
import sharp from "sharp";
import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const apiUploadRoot = resolve(repoRoot, "apps", "api", ".local", "uploads");

const uri = process.env.MONGODB_URI;
const nodeEnv = String(process.env.NODE_ENV ?? "development").toLowerCase();
const reset = process.argv.includes("--reset");

if (!uri) throw new Error("MONGODB_URI is missing. Run this script with apps/api/.env.dev.");
if (nodeEnv === "production") throw new Error("Refusing to seed while NODE_ENV=production.");

const ADMIN_EMAIL = "admin.dev@mdadufilms.com";
const ADMIN_PASSWORD = "Admin@12345";
const USER_EMAIL = "member.dev@mdadufilms.com";
const USER_PASSWORD = "Member@12345";

const TEAM_IMAGE_URLS = [
  "https://static.vecteezy.com/system/resources/thumbnails/031/522/182/small/smiling-young-man-of-asian-descent-dressed-in-suit-on-gray-background-ai-generative-photo.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqG4rPbvHUSLnS1zPfRMujLy45rifoADcfFu1CCKnKcKMSm8SyyJNu_H_U&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFCHISRWkXBRX5bCXCnUaIPeTmio6PzKkwASDloqjGVHX342yhBJm8Y6M&s=10",
];

const HERO_IMAGE_URLS = [
  "https://png.pngtree.com/thumb_back/fh260/background/20240402/pngtree-behind-the-scenes-of-videographer-or-photographer-shooting-video-or-movie-image_15648497.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzZWDlTKDx4mvLyArBpcb7mbyg-RTMMWun-Cn9NLICUuqQMg16ibigvaI&s=10",
  "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg",
  "https://static.vecteezy.com/system/resources/thumbnails/078/585/939/small/film-director-holding-movie-slate-in-front-of-camera-recording-videoblog-for-vlogging-channel-using-professional-streaming-production-equipment-social-media-influencer-filming-review-close-up-photo.jpg",
];

const IMAGE_VARIANTS = {
  thumb: { width: 400, quality: 78 },
  profile: { width: 800, height: 800, quality: 82 },
  medium: { width: 1200, quality: 82 },
  large: { width: 1920, quality: 84 },
};

const oid = (n) => new Types.ObjectId(`65${Number(n).toString(16).padStart(22, "0")}`);
const adminId = oid(1);
const userId = oid(2);

const teamMediaIds = [oid(101), oid(102), oid(103)];
const heroMediaIds = [oid(111), oid(112), oid(113), oid(114)];
const userPhotoMediaId = oid(121);
const userPortfolioMediaIds = [oid(122), oid(123), oid(124)];

const projectIds = [oid(201), oid(202), oid(203), oid(204)];
const castingIds = [oid(301), oid(302), oid(303), oid(304)];
const applicationIds = [oid(401), oid(402), oid(403), oid(404), oid(405)];
const savedListId = oid(451);

const now = new Date();
const daysFromNow = (days) => new Date(Date.now() + days * 86_400_000);
const daysAgo = (days) => new Date(Date.now() - days * 86_400_000);

const contentId = (() => {
  let n = 500;
  return () => oid(n++);
})();

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest();
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, {
      N: 16_384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }, (error, key) => error ? reject(error) : resolve(key));
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return [
    "s1",
    "16384",
    "8",
    "1",
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

function safeDbName() {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\//, "").split("?")[0];
  } catch {
    const match = uri.match(/\/([^/?]+)(?:\?|$)/);
    return match?.[1] ?? "";
  }
}

async function fetchImage(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (M. Dadu Films development seed)",
          "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error("empty response");
      if (bytes.length > 20 * 1024 * 1024) throw new Error("image exceeds 20 MB");
      return bytes;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 700));
    }
  }

  console.warn(`[seed] WARN: could not download ${label}. Using generated local fallback.`, lastError?.message ?? lastError);
  const svg = `
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#191919"/>
          <stop offset="100%" stop-color="#555"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#g)"/>
      <text x="80" y="820" fill="white" font-size="58" font-family="Arial, sans-serif">${label.replace(/[<>&]/g, "")}</text>
      <text x="80" y="890" fill="#ddd" font-size="28" font-family="Arial, sans-serif">Development seed fallback image</text>
    </svg>`;
  return Buffer.from(svg);
}

async function writeImageVariants(id, sourceBuffer) {
  const dir = resolve(apiUploadRoot, "media", String(id));
  await mkdir(dir, { recursive: true, mode: 0o700 });

  const input = sharp(sourceBuffer, {
    limitInputPixels: 40_000_000,
    sequentialRead: true,
  }).rotate();

  const metadata = await input.metadata();

  for (const [variant, settings] of Object.entries(IMAGE_VARIANTS)) {
    const processed = await input
      .clone()
      .resize(settings.width, settings.height, {
        fit: settings.height ? "cover" : "inside",
        withoutEnlargement: true,
        position: "attention",
      })
      .webp({
        quality: settings.quality,
        smartSubsample: true,
      })
      .toBuffer();

    await writeFile(resolve(dir, `${variant}.webp`), processed, { mode: 0o600 });
  }

  return metadata;
}

const imageCache = new Map();

async function seedMedia(db, { id, ownerId, url, label }) {
  let source = imageCache.get(url);
  if (!source) {
    source = await fetchImage(url, label);
    imageCache.set(url, source);
  }

  const metadata = await writeImageVariants(id, source);
  await db.collection("media").updateOne(
    { _id: id },
    {
      $set: {
        ownerId,
        kind: "image",
        visibility: "public",
        originalName: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`.slice(0, 150),
        sourceMime: "image/jpeg",
        sourceBytes: source.length,
        width: metadata.width,
        height: metadata.height,
        contentHash: sha256(source),
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

async function upsertById(db, collection, id, document) {
  const { _id, ...rest } = document;
  await db.collection(collection).updateOne(
    { _id: id },
    { $set: rest, $setOnInsert: { _id: id } },
    { upsert: true },
  );
}

async function upsertContent(db, document) {
  const id = document._id ?? contentId();
  const doc = { ...document, _id: id };
  await db.collection("contents").updateOne(
    { kind: doc.kind, slug: doc.slug },
    {
      $set: {
        ...doc,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

async function resetKnownData(db) {
  const dbName = db.databaseName;
  if (!/(dev|local|test)/i.test(dbName)) {
    throw new Error(`Refusing --reset because database "${dbName}" does not look like a development/test database.`);
  }

  console.log(`[seed] Resetting known development collections in ${dbName}...`);
  const collections = [
    "sessions",
    "passwordresets",
    "applications",
    "savedtalentlists",
    "profiles",
    "castings",
    "projects",
    "careerapplications",
    "contacts",
    "contents",
    "media",
    "auditlogs",
    "ratelimitbuckets",
    "accounts",
  ];

  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }

  await rm(apiUploadRoot, { recursive: true, force: true });
}

async function main() {
  console.log(`[seed] NODE_ENV=${nodeEnv}`);
  console.log(`[seed] Target database from URI: ${safeDbName() || "(Mongo default)"}`);
  await mongoose.connect(uri, { appName: "mdadu-films-dev-seed" });

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB is unavailable.");

    if (reset) await resetKnownData(db);

    const [adminPasswordHash, userPasswordHash] = await Promise.all([
      hashPassword(ADMIN_PASSWORD),
      hashPassword(USER_PASSWORD),
    ]);

    await upsertById(db, "accounts", adminId, {
      _id: adminId,
      name: "M. Dadu Films Admin",
      email: ADMIN_EMAIL,
      mobile: "+919000000001",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      authProvider: "local",
      verified: true,
      suspended: false,
      loginCount: 0,
      createdAt: daysAgo(90),
      updatedAt: now,
    });

    await upsertById(db, "accounts", userId, {
      _id: userId,
      name: "Aarav Demo",
      email: USER_EMAIL,
      mobile: "+919000000002",
      passwordHash: userPasswordHash,
      role: "USER",
      authProvider: "local",
      verified: true,
      suspended: false,
      loginCount: 0,
      createdAt: daysAgo(60),
      updatedAt: now,
    });

    console.log("[seed] Downloading/processing development images...");

    for (let index = 0; index < TEAM_IMAGE_URLS.length; index += 1) {
      await seedMedia(db, {
        id: teamMediaIds[index],
        ownerId: adminId,
        url: TEAM_IMAGE_URLS[index],
        label: `Team Image ${index + 1}`,
      });
    }

    for (let index = 0; index < HERO_IMAGE_URLS.length; index += 1) {
      await seedMedia(db, {
        id: heroMediaIds[index],
        ownerId: adminId,
        url: HERO_IMAGE_URLS[index],
        label: `Hero Image ${index + 1}`,
      });
    }

    await seedMedia(db, {
      id: userPhotoMediaId,
      ownerId: userId,
      url: TEAM_IMAGE_URLS[0],
      label: "Member Profile Image",
    });

    for (let index = 0; index < userPortfolioMediaIds.length; index += 1) {
      await seedMedia(db, {
        id: userPortfolioMediaIds[index],
        ownerId: userId,
        url: HERO_IMAGE_URLS[index],
        label: `Member Portfolio ${index + 1}`,
      });
    }

    await upsertById(db, "profiles", oid(151), {
      _id: oid(151),
      userId,
      bio: "Development seed profile for testing the M. Dadu Films member and talent workflows.",
      city: "Indore",
      profession: "Actor",
      gender: "Male",
      birthDate: new Date("1998-05-15T00:00:00.000Z"),
      skills: ["Acting", "Improvisation", "Voice Over"],
      languages: ["Hindi", "English"],
      experience: "3 years of development/demo experience",
      availability: "Available",
      photoMediaId: userPhotoMediaId,
      portfolioMediaIds: userPortfolioMediaIds,
      videos: ["https://www.youtube.com/"],
      showreel: "https://www.youtube.com/",
      previousWork: "Short films, digital campaigns and workshop performances — development seed data.",
      socialLinks: ["https://www.instagram.com/", "https://www.linkedin.com/"],
      publicVisible: true,
      savedOpportunityIds: [castingIds[0], projectIds[0]],
      emailCastingAlerts: true,
      emailUpdates: true,
      createdAt: daysAgo(60),
      updatedAt: now,
    });

    const projects = [
      {
        _id: projectIds[0],
        slug: "the-last-frame",
        title: "The Last Frame",
        type: "Short Film",
        summary: "A cinematographer races to finish one final image before a fading memory disappears.",
        description: "Development seed project used to test public project pages, applications and admin management.",
        body: [
          "The Last Frame is seeded development content for the M. Dadu Films platform.",
          "It exists to exercise project detail, gallery, application and administrative workflows.",
        ],
        creditsText: "Development Seed Credits",
        credits: [
          { name: "M. Dadu Films Admin", role: "Producer" },
          { name: "Demo Director", role: "Director" },
        ],
        status: "In Production",
        location: "Mumbai",
        startDate: daysAgo(15),
        endDate: daysFromNow(30),
        coverMediaId: heroMediaIds[0],
        galleryMediaIds: [heroMediaIds[0], heroMediaIds[2]],
        trailerUrl: "https://www.youtube.com/",
        tags: ["Drama", "Short Film"],
        published: true,
        archived: false,
        order: 1,
      },
      {
        _id: projectIds[1],
        slug: "city-after-rain",
        title: "City After Rain",
        type: "Feature Film",
        summary: "An urban drama about two strangers whose paths keep crossing after the monsoon.",
        description: "Development seed project.",
        body: ["Development seed content for feature-film project testing."],
        status: "Pre-production",
        location: "Indore",
        startDate: daysFromNow(20),
        coverMediaId: heroMediaIds[1],
        galleryMediaIds: [heroMediaIds[1]],
        tags: ["Drama", "Feature"],
        published: true,
        archived: false,
        order: 2,
      },
      {
        _id: projectIds[2],
        slug: "beyond-the-stage",
        title: "Beyond the Stage",
        type: "Web Series",
        summary: "A backstage ensemble story following artists preparing for their biggest performance.",
        description: "Development seed web-series project.",
        status: "Development",
        location: "Delhi",
        coverMediaId: heroMediaIds[3],
        tags: ["Series", "Artists"],
        published: false,
        archived: false,
        order: 3,
      },
      {
        _id: projectIds[3],
        slug: "one-more-take",
        title: "One More Take",
        type: "Brand Film",
        summary: "A completed development seed brand-film project.",
        description: "Used for completed-project and historical application testing.",
        status: "Completed",
        location: "Pune",
        startDate: daysAgo(120),
        endDate: daysAgo(90),
        coverMediaId: heroMediaIds[2],
        tags: ["Brand Film"],
        published: true,
        archived: false,
        order: 4,
      },
    ];

    for (const project of projects) {
      await upsertById(db, "projects", project._id, {
        ...project,
        createdBy: adminId,
        updatedBy: adminId,
        createdAt: daysAgo(45),
        updatedAt: now,
      });
    }

    const castings = [
      {
        _id: castingIds[0],
        projectId: projectIds[0],
        slug: "lead-actor-the-last-frame",
        title: "Lead Actor — The Last Frame",
        role: "Lead Actor",
        category: "Acting",
        summary: "Seeking a lead performer for a character-driven short film.",
        description: "Development seed casting call.",
        details: ["Audition material will be shared with shortlisted applicants."],
        status: "Open",
        published: true,
        archived: false,
        location: "Mumbai",
        shootDate: daysFromNow(30),
        deadline: daysFromNow(15),
        ageMin: 22,
        ageMax: 35,
        gender: "Any",
        experience: "1+ years preferred",
        compensation: "Paid",
        requirements: "Current portfolio and showreel preferred.",
        coverMediaId: heroMediaIds[0],
        tags: ["Lead", "Actor"],
      },
      {
        _id: castingIds[1],
        projectId: projectIds[1],
        slug: "supporting-actor-city-after-rain",
        title: "Supporting Actor — City After Rain",
        role: "Supporting Actor",
        category: "Acting",
        summary: "Supporting role for an urban drama.",
        description: "Development seed casting call.",
        status: "Open",
        published: true,
        archived: false,
        location: "Indore",
        shootDate: daysFromNow(45),
        deadline: daysFromNow(20),
        ageMin: 25,
        ageMax: 45,
        gender: "Any",
        experience: "Screen experience preferred",
        compensation: "Paid",
        requirements: "Share a recent introduction and portfolio.",
        coverMediaId: heroMediaIds[1],
        tags: ["Supporting", "Actor"],
      },
      {
        _id: castingIds[2],
        projectId: projectIds[0],
        slug: "featured-performer-last-frame",
        title: "Featured Performer — The Last Frame",
        role: "Featured Performer",
        category: "Acting",
        summary: "Historical closed casting for status testing.",
        description: "Development seed closed casting.",
        status: "Closed",
        published: true,
        archived: false,
        location: "Mumbai",
        shootDate: daysAgo(10),
        deadline: daysAgo(25),
        ageMin: 20,
        ageMax: 40,
        gender: "Any",
        experience: "Open",
        compensation: "Paid",
        requirements: "Development seed requirements.",
        coverMediaId: heroMediaIds[2],
        tags: ["Closed"],
      },
      {
        _id: castingIds[3],
        projectId: projectIds[2],
        slug: "assistant-director-beyond-stage",
        title: "Assistant Director — Beyond the Stage",
        role: "Assistant Director",
        category: "Crew",
        summary: "Draft crew requirement for admin workflow testing.",
        description: "Development seed draft casting.",
        status: "Draft",
        published: false,
        archived: false,
        location: "Delhi",
        shootDate: daysFromNow(60),
        deadline: daysFromNow(40),
        gender: "Any",
        experience: "Production experience preferred",
        compensation: "Paid",
        requirements: "Strong scheduling and set coordination skills.",
        coverMediaId: heroMediaIds[3],
        tags: ["Crew", "AD"],
      },
    ];

    for (const casting of castings) {
      await upsertById(db, "castings", casting._id, {
        ...casting,
        createdBy: adminId,
        updatedBy: adminId,
        createdAt: daysAgo(35),
        updatedAt: now,
      });
    }

    const applicationRows = [
      {
        _id: applicationIds[0],
        opportunityType: "PROJECT",
        opportunityId: projectIds[0],
        projectId: projectIds[0],
        opportunityTitle: "The Last Frame",
        opportunitySlug: "the-last-frame",
        roleSnapshot: "Project Application",
        status: "Selected",
        createdAt: daysAgo(20),
      },
      {
        _id: applicationIds[1],
        opportunityType: "PROJECT",
        opportunityId: projectIds[1],
        projectId: projectIds[1],
        opportunityTitle: "City After Rain",
        opportunitySlug: "city-after-rain",
        roleSnapshot: "Project Application",
        status: "Submitted",
        createdAt: daysAgo(5),
      },
      {
        _id: applicationIds[2],
        opportunityType: "CASTING",
        opportunityId: castingIds[0],
        projectId: projectIds[0],
        opportunityTitle: "Lead Actor — The Last Frame",
        opportunitySlug: "lead-actor-the-last-frame",
        roleSnapshot: "Lead Actor",
        status: "Under Review",
        createdAt: daysAgo(4),
      },
      {
        _id: applicationIds[3],
        opportunityType: "CASTING",
        opportunityId: castingIds[1],
        projectId: projectIds[1],
        opportunityTitle: "Supporting Actor — City After Rain",
        opportunitySlug: "supporting-actor-city-after-rain",
        roleSnapshot: "Supporting Actor",
        status: "Shortlisted",
        createdAt: daysAgo(3),
      },
      {
        _id: applicationIds[4],
        opportunityType: "CASTING",
        opportunityId: castingIds[2],
        projectId: projectIds[0],
        opportunityTitle: "Featured Performer — The Last Frame",
        opportunitySlug: "featured-performer-last-frame",
        roleSnapshot: "Featured Performer",
        status: "Rejected",
        createdAt: daysAgo(30),
      },
    ];

    for (const row of applicationRows) {
      await upsertById(db, "applications", row._id, {
        ...row,
        userId,
        applicant: {
          name: "Aarav Demo",
          email: USER_EMAIL,
          mobile: "+919000000002",
          city: "Indore",
        },
        coverNote: "Development seed application used for end-to-end workflow testing.",
        portfolioMediaIds: userPortfolioMediaIds.slice(0, 2),
        showreelUrl: "https://www.youtube.com/",
        pitch: "Development seed pitch.",
        ...(row.status !== "Submitted" ? {
          adminNotes: `Development seed admin note for ${row.status}.`,
          reviewedBy: adminId,
          reviewedAt: daysAgo(1),
        } : {}),
        updatedAt: now,
      });
    }

    await upsertById(db, "savedtalentlists", savedListId, {
      _id: savedListId,
      ownerId: adminId,
      name: "Lead Actor Options",
      purpose: "Development seed shortlist",
      memberIds: [userId],
      projectId: projectIds[0],
      createdAt: daysAgo(10),
      updatedAt: now,
    });

    const team = [
      ["Aarav Mehta", "Producer", "Core Team"],
      ["Riya Sharma", "Creative Producer", "Core Team"],
      ["Kabir Malhotra", "Director", "Creative Team"],
      ["Ananya Rao", "Writer", "Creative Team"],
      ["Dev Kapoor", "Director of Photography", "Creative Team"],
      ["Meera Singh", "Production Designer", "Creative Team"],
      ["Arjun Nair", "Editor", "Creative Team"],
      ["Isha Verma", "Production Coordinator", "Core Team"],
    ];

    for (let i = 0; i < team.length; i += 1) {
      const [name, role, group] = team[i];
      await upsertContent(db, {
        _id: contentId(),
        kind: "team",
        slug: `dev-team-${i + 1}`,
        title: name,
        role,
        category: "Team",
        description: `${role} — development-only seeded teammate.`,
        coverMediaId: teamMediaIds[i % teamMediaIds.length],
        status: "Published",
        published: true,
        publishedAt: daysAgo(15 - i),
        archived: false,
        order: i + 1,
        data: {
          group,
          sourceImageUrl: TEAM_IMAGE_URLS[i % TEAM_IMAGE_URLS.length],
        },
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    const workRows = [
      ["feature-films", "Feature Films", "Production", "Feature-film development and production from concept through delivery."],
      ["short-films", "Short Films", "Production", "Focused short-form storytelling for festivals, digital and branded platforms."],
      ["brand-films", "Advertisements & Brand Films", "Commercial", "Campaign and brand films built around a clear audience and message."],
      ["music-videos", "Music Videos", "Music", "Performance and concept-led music video production."],
    ];
    for (let i = 0; i < workRows.length; i += 1) {
      const [slug, title, category, description] = workRows[i];
      await upsertContent(db, {
        _id: contentId(),
        kind: "our-work",
        slug,
        title,
        category,
        description,
        coverMediaId: heroMediaIds[i % heroMediaIds.length],
        status: "Published",
        published: true,
        publishedAt: daysAgo(20 - i),
        archived: false,
        order: i + 1,
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    const blogs = [
      {
        slug: "preparing-for-your-first-audition",
        title: "Preparing for Your First Audition",
        category: "Casting",
        description: "A development seed article about arriving prepared and presenting your work clearly.",
        body: [
          "This is development seed content for testing the M. Dadu Films blog.",
          "Use it to verify article rendering, pagination, publication state and editing.",
        ],
        coverMediaId: heroMediaIds[0],
        published: true,
        publishedAt: daysAgo(8),
        order: 1,
      },
      {
        slug: "behind-a-small-film-set",
        title: "Behind a Small Film Set",
        category: "Production",
        description: "A development seed look at collaboration behind the camera.",
        body: [
          "Every department contributes to the final frame.",
          "This development article exists only for local testing.",
        ],
        coverMediaId: heroMediaIds[3],
        published: true,
        publishedAt: daysAgo(3),
        order: 2,
      },
      {
        slug: "portfolio-basics-draft",
        title: "Portfolio Basics for Performers",
        category: "Talent",
        description: "Draft development article.",
        body: ["Draft content must not appear publicly."],
        coverMediaId: heroMediaIds[2],
        published: false,
        order: 3,
      },
      {
        slug: "future-production-note",
        title: "Future Production Note",
        category: "News",
        description: "Future-dated development post used to test scheduled visibility.",
        body: ["This post should remain hidden until its future publication date."],
        coverMediaId: heroMediaIds[1],
        published: true,
        publishedAt: daysFromNow(14),
        order: 4,
      },
    ];

    for (const blog of blogs) {
      await upsertContent(db, {
        _id: contentId(),
        kind: "blog",
        ...blog,
        status: blog.published ? "Published" : "Draft",
        archived: false,
        tags: ["Development", blog.category],
        seoTitle: `${blog.title} | M. Dadu Films`,
        seoDescription: blog.description,
        data: { author: "Editorial Team" },
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    for (let i = 0; i < 8; i += 1) {
      await upsertContent(db, {
        _id: contentId(),
        kind: "gallery",
        slug: `dev-gallery-${i + 1}`,
        title: `Development Gallery ${i + 1}`,
        category: ["BTS", "Projects", "Events", "Talent"][i % 4],
        description: `Development-only gallery item ${i + 1}.`,
        coverMediaId: heroMediaIds[i % heroMediaIds.length],
        status: "Published",
        published: true,
        publishedAt: daysAgo(12 - i),
        archived: false,
        order: i + 1,
        data: { sourceImageUrl: HERO_IMAGE_URLS[i % HERO_IMAGE_URLS.length] },
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    for (let i = 0; i < 4; i += 1) {
      await upsertContent(db, {
        _id: contentId(),
        kind: "behind-the-scenes",
        slug: `dev-bts-${i + 1}`,
        title: `Behind the Scenes ${i + 1}`,
        category: ["Production", "On Set", "Team", "Location"][i],
        description: `Development-only BTS item ${i + 1}.`,
        coverMediaId: heroMediaIds[i],
        projectId: projectIds[i % projectIds.length],
        status: "Published",
        published: true,
        publishedAt: daysAgo(10 - i),
        archived: false,
        order: i + 1,
        data: { sourceImageUrl: HERO_IMAGE_URLS[i] },
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    const shows = [
      ["dev-show-youtube", "Director's Table", "YouTube", "https://www.youtube.com/"],
      ["dev-show-instagram", "On Set Moments", "Instagram", "https://www.instagram.com/"],
      ["dev-show-vimeo", "Production Reel", "Vimeo", "https://vimeo.com/"],
      ["dev-show-media", "Studio Update", "Other", "https://example.com/"],
    ];
    for (let i = 0; i < shows.length; i += 1) {
      const [slug, title, platform, videoUrl] = shows[i];
      await upsertContent(db, {
        _id: contentId(),
        kind: "shows",
        slug,
        title,
        category: "Media",
        description: "Development-only external media item.",
        videoUrl,
        coverMediaId: heroMediaIds[i],
        status: "Published",
        published: true,
        publishedAt: daysAgo(6 - i),
        archived: false,
        order: i + 1,
        data: { platform },
        createdBy: adminId,
        updatedBy: adminId,
      });
    }

    await upsertContent(db, {
      _id: contentId(),
      kind: "pages",
      slug: "home",
      title: "M. Dadu Films — Development Home",
      description: "Development seed page content.",
      body: ["Development-only homepage content record."],
      coverMediaId: heroMediaIds[0],
      status: "Published",
      published: true,
      publishedAt: daysAgo(30),
      archived: false,
      order: 1,
      createdBy: adminId,
      updatedBy: adminId,
    });

    await upsertContent(db, {
      _id: contentId(),
      kind: "pages",
      slug: "about",
      title: "About M. Dadu Films — Development",
      description: "Development seed page content.",
      body: ["Development-only About content. Replace with approved real company copy before launch."],
      coverMediaId: heroMediaIds[1],
      status: "Published",
      published: true,
      publishedAt: daysAgo(30),
      archived: false,
      order: 2,
      createdBy: adminId,
      updatedBy: adminId,
    });

    await upsertContent(db, {
      _id: contentId(),
      kind: "settings",
      slug: "company",
      title: "Company Settings",
      description: "Development-only settings. Do not use these as real legal/company facts.",
      published: true,
      publishedAt: now,
      archived: false,
      order: 1,
      data: {
        companyName: "M. Dadu Films",
        email: ADMIN_EMAIL,
        phone: "+91 90000 00001",
        location: "DEV_ONLY_ADDRESS",
        gst: "ADD_GST_NUMBER",
        cin: "ADD_COMPANY_REGISTRATION",
        linkedin: "https://www.linkedin.com/",
        instagram: "https://www.instagram.com/",
        youtube: "https://www.youtube.com/",
        facebook: "https://www.facebook.com/",
      },
      createdBy: adminId,
      updatedBy: adminId,
    });

    await upsertContent(db, {
      _id: contentId(),
      kind: "legal",
      slug: "privacy",
      title: "Privacy Policy — Development Placeholder",
      body: [
        "Development placeholder only. This is not the final reviewed Privacy Policy.",
        "Replace this record with approved legal content before production launch.",
      ],
      status: "Published",
      published: true,
      publishedAt: now,
      archived: false,
      order: 1,
      createdBy: adminId,
      updatedBy: adminId,
    });

    await upsertContent(db, {
      _id: contentId(),
      kind: "legal",
      slug: "terms",
      title: "Terms & Conditions — Development Placeholder",
      body: [
        "Development placeholder only. This is not the final reviewed Terms & Conditions.",
        "Replace this record with approved legal content before production launch.",
      ],
      status: "Published",
      published: true,
      publishedAt: now,
      archived: false,
      order: 2,
      createdBy: adminId,
      updatedBy: adminId,
    });

    const contacts = [
      ["General production enquiry", "New"],
      ["Casting collaboration", "Open"],
      ["Previous enquiry", "Resolved"],
    ];
    for (let i = 0; i < contacts.length; i += 1) {
      const [subject, status] = contacts[i];
      await upsertById(db, "contacts", oid(701 + i), {
        _id: oid(701 + i),
        name: `Development Contact ${i + 1}`,
        email: `contact${i + 1}.dev@example.com`,
        subject,
        message: "Development seed contact message for admin inbox testing.",
        status,
        createdAt: daysAgo(5 - i),
        updatedAt: now,
      });
    }

    const careers = [
      ["Demo Assistant Director", "Assistant Director", "Submitted"],
      ["Demo Editor", "Editor", "In Review"],
      ["Demo Production Coordinator", "Production Coordinator", "Shortlisted"],
    ];
    for (let i = 0; i < careers.length; i += 1) {
      const [name, role, status] = careers[i];
      await upsertById(db, "careerapplications", oid(751 + i), {
        _id: oid(751 + i),
        name,
        email: `career${i + 1}.dev@example.com`,
        mobile: `+91900000010${i}`,
        role,
        city: ["Indore", "Mumbai", "Delhi"][i],
        coverNote: "Development seed career application used for admin workflow testing.",
        resumeUrl: "https://example.com/resume.pdf",
        portfolioUrl: "https://example.com/portfolio",
        linkedinUrl: "https://www.linkedin.com/",
        status,
        ...(status !== "Submitted" ? {
          adminNotes: `Development seed review note: ${status}.`,
          reviewedBy: adminId,
          reviewedAt: daysAgo(1),
        } : {}),
        createdAt: daysAgo(4 - i),
        updatedAt: now,
      });
    }

    console.log("");
    console.log("=========================================================");
    console.log(" M. DADU FILMS DEVELOPMENT SEED COMPLETE");
    console.log("=========================================================");
    console.log(` Database : ${db.databaseName}`);
    console.log(` Admin    : ${ADMIN_EMAIL}`);
    console.log(` Password : ${ADMIN_PASSWORD}`);
    console.log(` User     : ${USER_EMAIL}`);
    console.log(` Password : ${USER_PASSWORD}`);
    console.log(" Accounts : exactly 1 SUPER_ADMIN + 1 USER");
    console.log(" Team     : 8 teammates (3 supplied images repeated)");
    console.log(" Media    : supplied team/hero URLs processed into local WebP variants");
    console.log(" Projects, castings, applications, saved list, CMS, contact and careers seeded");
    console.log("=========================================================");
    console.log("");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] FAILED:", error);
  process.exitCode = 1;
});
