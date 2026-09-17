# M. Dadu Films Digital Platform â€” V1.0.0

Codex-ready monorepo starter for the M. Dadu Films production-house website,
member community, casting/application platform and Super Admin CMS.

## Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3333 |
| Backend API | http://localhost:8888/api/v1 |
| Health | http://localhost:8888/api/v1/health |
| Swagger | http://localhost:8888/docs |
| Local MongoDB | mongodb://localhost:27017/mdadu_films |

## Technology

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive web/mobile from one codebase

### Backend
- NestJS
- Node.js `24.11.1`
- MongoDB + Mongoose
- REST
- Swagger

## Repository layout

```text
.
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ CODEX_START_HERE.md
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/
â”‚   â”‚   â”œâ”€â”€ AGENTS.md
â”‚   â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â”‚   â”œâ”€â”€ brand/
â”‚   â”‚   â”‚   â””â”€â”€ placeholders/
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ app/
â”‚   â”‚       â”œâ”€â”€ components/
â”‚   â”‚       â”œâ”€â”€ config/
â”‚   â”‚       â”œâ”€â”€ content/placeholders/
â”‚   â”‚       â”œâ”€â”€ providers/
â”‚   â”‚       â””â”€â”€ ...
â”‚   â””â”€â”€ api/
â”‚       â”œâ”€â”€ AGENTS.md
â”‚       â””â”€â”€ src/
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ progress.md
â”‚   â”œâ”€â”€ ARCHITECTURE.md
â”‚   â”œâ”€â”€ CODEX_WORKFLOW.md
â”‚   â”œâ”€â”€ DYNAMIC_CONTENT_RULES.md
â”‚   â”œâ”€â”€ ASSET_GUIDE.md
â”‚   â””â”€â”€ CONTENT_INPUT_TEMPLATE.md
â”œâ”€â”€ docker-compose.yml
â””â”€â”€ package.json
```

## First setup

Required Node version:

```bash
node -v
# v24.11.1
```

Install:

```bash
npm install
```

Create environments on macOS/Linux:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start local MongoDB:

```bash
npm run db:up
```

Start frontend and backend together:

```bash
npm run dev
```

## Codex

Codex should read `AGENTS.md` automatically in repository scope. The repository
keeps the root instructions short and points to structured project docs.

For a manual starting prompt, open:

```text
CODEX_START_HERE.md
```

Canonical task state:

```text
docs/progress.md
```

## Placeholder images

Real media is not required to unblock UI development.

Use the shared `SmartImage` component:

```tsx
<SmartImage
  src={project.coverImage}
  placeholderKind="project"
  alt={project.title}
  width={1200}
  height={800}
/>
```

Available placeholder kinds:

```text
generic
project
team
gallery
blog
```

## Notifications and dialogs

Reusable foundations are included:

```text
src/components/ui/toast-provider.tsx
src/components/ui/confirm-dialog.tsx
```

All async mutations should expose explicit success/error/loading feedback.
Do not use browser `alert()` or `confirm()` for product UX.

## Static vs dynamic

Read:

```text
docs/DYNAMIC_CONTENT_RULES.md
```

Administrator-editable business content must become API/database-driven.
Technical constants stay separated in config/enums.

## Design source of truth

Before frontend visual work, read:

`	ext
docs/DESIGN_SYSTEM.md
docs/references/ui/
`

Reference screenshots define visual direction but are not production website assets.

## Development and deployment

The project is developed and tested stage-by-stage.

Production deployment is intentionally postponed until Stage 18.

V1 deployment target later:
- AWS Amplify â€” frontend
- AWS Lightsail 1 GB â€” backend
- MongoDB Atlas â€” database
- Amazon S3 â€” media
- Hostinger â€” DNS/email
- GitHub Actions â€” CI/CD

## Branch strategy

master is the clean baseline branch. For future feature work, create a short-lived branch such as
codex/<scope>, run 
pm run check, review the diff, then merge back into master.

There is no sibling starter project/archive anymore; the repository root is the working application.
Production deployment remains Stage 18 only.

### Local Docker kernel compatibility

If MongoDB 8 exits with `SERVER-121912` on Docker Linux kernels 6.19+,
use the isolated MongoDB 7 development database:

```bash
docker compose stop mongo
npm run db:local
```

This uses a **different volume** and binds only to `127.0.0.1`. Never point
MongoDB 7 at an existing MongoDB 8 data volume. The default Compose file and
production database choice are unchanged. Stop the fallback with:

```bash
docker compose -p mdadu-local -f docker-compose.local.yml stop
```

### Build tools

The API builds with TypeScript and uses Node's watch mode with ts-node during
development. This avoids the Nest CLI 12 scaffolding dependency's higher Node
minimum while retaining NestJS 12 and the required Node 24.11.1 runtime.
Jest uses VM modules for NestJS 12's ESM packages.

## Current manual review checkpoint

The public pages read published content through the REST API. Empty collections
show empty states. Company copy/legal placeholders remain until real content is
supplied. Demo fixtures are retained for design reference only, not returned as
live API records.

Create your own local account at `http://localhost:3333/signup`, then check:

1. Sign up, sign out, sign in, and the remember-session checkbox.
2. Member profile editing and profile completion.
3. Profile/portfolio photo uploads and saving/removing portfolio selections.
4. Password reset. Without SMTP, the reset email is written to the private
   `apps/api/.local/mail/` directory. Open its link locally; these files are
   ignored by Git and must not be shared or committed.
5. Public navigation, empty results, and mobile layouts.

SMTP delivery is not yet verified. Admin management screens and the remaining
stages are not complete; the current admin page only verifies administrator
access. No default administrator credentials are included.

Validation:

```bash
npm run check
npm run test:integration
```

Integration checks use a disposable `mdadu_test_*` database, a temporary file
storage/outbox directory, and a short-lived API on port 18888. They do not modify
the development database or member accounts. MongoDB must already be running.
The product remains on frontend 3333 and backend 8888.

