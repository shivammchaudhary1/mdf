# M. Dadu Films Digital Platform — V1.0.0

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
├── AGENTS.md
├── CODEX_START_HERE.md
├── apps/
│   ├── web/
│   │   ├── AGENTS.md
│   │   ├── public/
│   │   │   ├── brand/
│   │   │   └── placeholders/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── config/
│   │       ├── content/placeholders/
│   │       ├── providers/
│   │       └── ...
│   └── api/
│       ├── AGENTS.md
│       └── src/
├── docs/
│   ├── progress.md
│   ├── ARCHITECTURE.md
│   ├── CODEX_WORKFLOW.md
│   ├── DYNAMIC_CONTENT_RULES.md
│   ├── ASSET_GUIDE.md
│   └── CONTENT_INPUT_TEMPLATE.md
├── docker-compose.yml
└── package.json
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

## Development and deployment

The project is developed and tested stage-by-stage.

Production deployment is intentionally postponed until Stage 18.

V1 deployment target later:
- AWS Amplify — frontend
- AWS Lightsail 1 GB — backend
- MongoDB Atlas — database
- Amazon S3 — media
- Hostinger — DNS/email
- GitHub Actions — CI/CD
