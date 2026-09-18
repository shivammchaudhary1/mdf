# Development Seed — Group 0

This seed is **development only** and is designed for the new environment convention:

```text
apps/api/.env.dev
apps/api/.env.prod
apps/web/.env.dev
apps/web/.env.prod
```

It does not use `.env` or `.env.local`.

## Accounts

Only two application accounts are seeded:

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | `admin.dev@mdadufilms.com` | `Admin@12345` |
| USER | `member.dev@mdadufilms.com` | `Member@12345` |

These are local/development credentials only.

## Seeded data

- 1 Super Admin
- 1 normal User
- complete member profile
- profile image
- 3 portfolio images
- 4 projects
- 4 castings
- 5 applications covering all application statuses
- 1 saved talent list
- 8 team members
- 4 Our Work items
- 4 blog posts (published, draft and future scheduled cases)
- 8 gallery items
- 4 BTS items
- 4 Shows/Media items
- development Home/About content records
- Company Settings placeholder record
- Privacy/Terms development placeholders
- 3 contact messages
- 3 career applications

The 8 team entries repeat the 3 team-image URLs supplied for development. The supplied hero/media URLs are reused across projects, gallery, BTS, blog and related local development content.

## Media behavior

The seed downloads the supplied external images and processes them with Sharp into the same variants the current backend uses:

```text
thumb.webp
profile.webp
medium.webp
large.webp
```

Files are stored under:

```text
apps/api/.local/uploads/media/<mediaId>/
```

If an external image host cannot be downloaded after retries, the script creates a clearly marked local development fallback image so the seed can still finish.

## Commands

Seed/upsert without deleting existing development data:

```bash
npm run db:seed:dev
```

Reset known dev collections, clear local seeded media, seed everything again, then ensure indexes:

```bash
npm run db:reset:dev
```

`db:reset:dev` refuses to reset a database whose name does not contain `dev`, `local`, or `test`.

## Required backend dev env

At minimum `apps/api/.env.dev` must contain valid local/development values for:

```env
NODE_ENV=development
MONGODB_URI=...
COOKIE_SECRET=...
```

The full `.env.dev` wiring for normal app startup is Group 1. The seed and index commands already load `apps/api/.env.dev` explicitly.

## Production safety

- The seed refuses `NODE_ENV=production`.
- Do not use these credentials in production.
- Do not run this seed against the production database.
- Legal/company values in this seed are placeholders, not real company facts.
