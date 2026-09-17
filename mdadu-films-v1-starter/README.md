# M. Dadu Films Digital Platform — V1 Starter

Monorepo starter for the M. Dadu Films Version 1.0.0 platform.

## Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- App Router

### Backend
- NestJS 12
- Node.js 24.11.1
- MongoDB + Mongoose
- REST API
- Swagger
- Validation + Helmet + CORS

### Local Development
- npm workspaces
- Optional local MongoDB through Docker Compose
- GitHub Actions CI included
- No production deployment workflow yet

## Repository Structure

```text
mdadu-films-v1-starter/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── docs/
│   ├── ASSET_GUIDE.md
│   └── progress.md
├── .github/workflows/ci.yml
├── docker-compose.yml
└── package.json
```

## Requirements

- Node.js `24.11.1`
- npm
- Docker Desktop (optional, only if using local MongoDB)

Check:

```bash
node -v
npm -v
```

## First Setup

### 1. Install packages

```bash
npm install
```

### 2. Create environment files

macOS/Linux:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

### 3. Start MongoDB

If using Docker:

```bash
npm run db:up
```

Or replace `MONGODB_URI` in `apps/api/.env` with your MongoDB Atlas URL.

### 4. Start frontend + backend together

```bash
npm run dev
```

## Local URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/v1/health
- Swagger: http://localhost:4000/docs

## Individual Apps

Frontend only:

```bash
npm run dev:web
```

Backend only:

```bash
npm run dev:api
```

## Build

```bash
npm run build
```

## Where to Add Assets

See `docs/ASSET_GUIDE.md`.

The finalized M. Dadu Films logo is already included at:

```text
apps/web/public/brand/logo.webp
```

## Current Scope

This starter intentionally contains only the project foundation and representative placeholder routes/components. Authentication, member profile, applications, admin CMS, S3 integration and other V1 modules will be implemented stage-by-stage and tested before proceeding.

Production deployment remains the final project stage.
