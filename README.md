# M. Dadu Films Digital Platform

M. Dadu Films V1 includes the public production-house website, member/talent community, project and casting applications, and the Super Admin dashboard/CMS.

## Current stage

Groups 0–12 are merged. The project is in **pre-UAT cleanup and verification**.

Production deployment remains frozen until UAT is explicitly approved.

## Stack

- Next.js 16 / React 19 / TypeScript / Tailwind CSS / Zustand
- NestJS 12 / Node.js 24.11.1
- MongoDB + Mongoose
- REST API
- signed opaque `httpOnly` sessions + CSRF/origin protection
- local/S3 media abstraction
- Nodemailer + Hostinger SMTP direction

## Environment convention

Exactly three environment files are used per app:

```text
apps/api/.env.dev
apps/api/.env.prod
apps/api/.env.example

apps/web/.env.dev
apps/web/.env.prod
apps/web/.env.example
```

Create local development files:

```bash
cp apps/api/.env.example apps/api/.env.dev
cp apps/web/.env.example apps/web/.env.dev
npm run env:check:dev
```

Do not create `.env`, `.env.local`, `.env.development`, or `.env.production`.

## Development

```bash
npm ci
npm run db:up
npm run dev
```

Individual apps:

```bash
npm run dev:web
npm run dev:api
```

Web: `http://localhost:3333`  
API: `http://localhost:8888/api/v1`

## Quality and verification

Repository structure/auth-route audit:

```bash
npm run audit:repo
```

Quality gate:

```bash
npm run check
```

Integration tests:

```bash
npm run test:integration
```

Full verification:

```bash
npm run verify
```

With local Docker MongoDB:

```bash
npm run verify:local
```

Before merge:

```bash
npm run audit:repo
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run test:integration
git diff --check
git status
```

## Dashboard routes

Canonical dashboards are:

```text
/member   -> USER dashboard
/admin    -> SUPER_ADMIN dashboard
```

`/dashboard` is kept as a compatibility route and redirects according to the active session. Anonymous visitors are redirected to `/login`.

Authentication pages remain:

```text
/login
/signup
/forgot-password
/reset-password
```

When a user/admin is already authenticated, those guest pages intentionally redirect to the appropriate dashboard.

## Google sign-in

Use the same Google OAuth 2.0 Web Client ID in:

```text
apps/api/.env.dev  -> GOOGLE_CLIENT_ID
apps/web/.env.dev  -> NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

The browser never receives a Google client secret.

## Database utilities

MongoDB indexes:

```bash
npm run db:indexes:dev
npm run db:indexes:prod
```

Legacy development seed, backend migration, media migration and Group 11 content-upsert scripts have been removed. A fresh database seed/bootstrap workflow will be created separately for the current manual-UAT requirements.

## Stable documentation

Keep operational/current documentation such as:

```text
docs/ARCHITECTURE.md
docs/DESIGN_SYSTEM.md
docs/ENVIRONMENTS.md
docs/DYNAMIC_CONTENT_RULES.md
docs/GROUP10_MEDIA_ARCHITECTURE.md
docs/GROUP11_SETTINGS_LEGAL_SEO.md
docs/GROUP12_HARDENING_STATE_OAUTH.md
docs/THIRD_PARTY_LICENSE_POLICY.md
docs/references/ui/
```

## Planned production direction

- AWS Amplify — web
- AWS Lightsail — API
- MongoDB Atlas — database
- Amazon S3 — media
- Hostinger SMTP — email
- Hostinger — DNS/domain
- GitHub Actions — CI

Do not deploy before final UAT approval.
