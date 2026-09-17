# M. Dadu Films Digital Platform

M. Dadu Films V1 combines:

- public production-house website,
- member/talent community,
- casting/project applications,
- Super Admin management/CMS.

## Current development checkpoint

The approved UI is frozen while the remaining V1 functionality is completed.

Current technical focus:

1. make CI/quality checks green,
2. re-run backend integration tests,
3. finish backend requirement gaps,
4. connect member/admin screens to real APIs without changing appearance,
5. finish security/testing/UAT,
6. deploy only at Stage 18.

Read:

```text
CODEX_START_HERE.md
docs/CODEX_COMPLETION_PLAN.md
docs/progress.md
```

## Technology

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand

### Backend

- NestJS
- Node.js `24.11.1`
- MongoDB + Mongoose
- REST + Swagger
- opaque server-side sessions in signed `httpOnly` cookies
- CSRF protection
- Nodemailer
- Sharp
- local/S3 storage abstraction

## Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3333` |
| API | `http://localhost:8888/api/v1` |
| Health | `http://localhost:8888/api/v1/health` |
| Swagger | `http://localhost:8888/docs` |
| MongoDB | `mongodb://localhost:27017/mdadu_films` |

## Requirements

Use Node:

```bash
node -v
# v24.11.1
```

Install dependencies:

```bash
npm ci
```

For normal development after the lockfile is already installed, `npm install` is also acceptable.

Create local environment files:

### Git Bash / macOS / Linux

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Do not commit `.env` files.

## Start MongoDB

Default Docker MongoDB:

```bash
npm run db:up
```

Stop:

```bash
npm run db:down
```

Logs:

```bash
npm run db:logs
```

### MongoDB 7 fallback

If MongoDB 8 Docker cannot start on the current host/kernel:

```bash
npm run db:local
```

This uses the isolated `docker-compose.local.yml` development setup.

Do not point MongoDB 7 at an existing MongoDB 8 data volume.

## Run the application

Run frontend + backend together:

```bash
npm run dev
```

Run only frontend:

```bash
npm run dev:web
```

Run only backend:

```bash
npm run dev:api
```

## Build

Build both frontend and backend:

```bash
npm run build
```

Build only frontend:

```bash
npm run build -w @mdadu/web
```

Build only backend:

```bash
npm run build -w @mdadu/api
```

## Type checking

Both applications:

```bash
npm run typecheck
```

API only:

```bash
npm run typecheck -w @mdadu/api
```

Web only:

```bash
npm run typecheck -w @mdadu/web
```

## Tests

API unit tests:

```bash
npm run test
```

Integration tests require MongoDB:

```bash
npm run test:integration
```

## Lint

```bash
npm run lint
```

## One-command code quality gate

This runs:

1. lint,
2. TypeScript checks,
3. unit tests,
4. frontend build,
5. backend build.

Command:

```bash
npm run check
```

Equivalent sequence:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## One-command full local verification

When MongoDB is already running:

```bash
npm run verify
```

This runs:

```text
npm run check
+
npm run test:integration
```

Using default Docker MongoDB in one command:

```bash
npm run verify:local
```

If the default MongoDB container is not compatible with the host:

```bash
npm run db:local
npm run verify
```

## Recommended verification before a merge

```bash
npm ci
npm run verify:local
git diff --check
git status
```

If using the MongoDB 7 fallback:

```bash
npm ci
npm run db:local
npm run verify
git diff --check
git status
```

## Backend database/index utilities

Create/update indexes:

```bash
npm run db:indexes -w @mdadu/api
```

Backend V2 migration script:

```bash
node scripts/migrate-backend-v2.mjs
```

The migration command above is dry-run unless the script explicitly receives its apply flag.

Review migration output and backups before applying database changes.

## Authentication model

V1 does not use browser JWT access/refresh tokens.

Flow:

```text
login
  -> secure random opaque session token
  -> signed httpOnly browser cookie
  -> only token digest stored in MongoDB
  -> server validates session on requests
```

Benefits for this product:

- immediate session revocation,
- logout all devices,
- individual session removal,
- account suspension can invalidate sessions,
- raw bearer token is not stored in MongoDB.

## UI freeze during functional completion

Until the user explicitly asks for visual changes:

- do not redesign public pages,
- do not redesign auth pages,
- do not redesign member/admin dashboards,
- do not change CSS/design tokens,
- do not change colors/spacing/typography/layout,
- preserve existing visual class names where possible.

Current work should replace demo behavior/data with real API behavior while preserving appearance.

## Codex workflow

Codex should start with:

```text
CODEX_START_HERE.md
```

The active execution plan is:

```text
docs/CODEX_COMPLETION_PLAN.md
```

The canonical stage/checklist status is:

```text
docs/progress.md
```

Codex must work on a new branch from `master`.

Recommended:

```bash
git checkout master
git pull --ff-only origin master
git checkout -b feature/complete-v1-functional-integration
```

Do not deploy as part of completion work.

## Dependency license policy

For new third-party dependencies, prefer permissive licenses such as:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause

Read:

```text
docs/THIRD_PARTY_LICENSE_POLICY.md
```

The application repository itself remains `UNLICENSED` unless the owner explicitly chooses a different source-code license.

## Deployment

Production deployment is intentionally the final stage.

Planned V1 production direction:

- AWS Amplify — frontend
- AWS Lightsail — backend
- MongoDB Atlas — database
- Amazon S3 — media
- Hostinger — DNS/email
- GitHub Actions — CI/CD

Do not deploy before Stage 17 testing/UAT is approved.
