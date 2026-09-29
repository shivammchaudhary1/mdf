# M. Dadu Films Digital Platform

Production-ready web platform for **M. Dadu Films** covering the public website, member/talent community, castings and applications, media/content management, and the Super Admin dashboard.

**Created & developed by Shivam Chaudhary.**

## Live

| Service       | URL                                      |
| ------------- | ---------------------------------------- |
| Website       | https://mdadufilms.com                   |
| Website (www) | https://www.mdadufilms.com               |
| API Base      | https://api.mdadufilms.com/api/v1        |
| API Health    | https://api.mdadufilms.com/api/v1/health |

> Swagger is intentionally disabled in production.

---

## What the platform includes

- Public production-house website
- Projects, services, blogs, gallery and shows/content
- Member registration, login and Google sign-in
- Member/talent profiles, portfolio, resume and showreel
- Castings/opportunities and applications
- Saved opportunities and profile visibility
- Super Admin dashboard / CMS
- Email verification, password reset and transactional email
- Private S3-backed media storage with optimized image variants
- Visitor/application/admin analytics

Roles:

```text
MEMBER
SUPER_ADMIN
```

---

## Tech stack

### Frontend

| Technology       | Purpose                                   |
| ---------------- | ----------------------------------------- |
| Next.js 16.3.5   | Web application / SSR                     |
| React 19.3       | UI                                        |
| TypeScript 5.9   | Type safety                               |
| Tailwind CSS 4.3 | Styling                                   |
| Zustand 5        | Shared client state + bounded query cache |

The main Zustand store keeps authentication state, current account, profile photo and reusable GET-query cache.

### Backend

| Technology          | Purpose                               |
| ------------------- | ------------------------------------- |
| Node.js 26.10.0     | Runtime                               |
| NestJS 12           | REST API                              |
| MongoDB Atlas       | Production database                   |
| Mongoose 9          | MongoDB ODM                           |
| Sharp               | Image validation/compression/variants |
| Nodemailer          | Email delivery                        |
| Google Auth Library | Google ID-token verification          |
| Swagger             | Local/dev API docs                    |

### Infrastructure

| Service                  | Usage                                   |
| ------------------------ | --------------------------------------- |
| AWS Lightsail            | Production frontend + backend runtime   |
| Amazon S3                | Private media storage                   |
| MongoDB Atlas            | Production database                     |
| Hostinger                | Domain, DNS and SMTP mailbox            |
| Google Identity Services | Google sign-in                          |
| Nginx                    | Reverse proxy                           |
| PM2                      | Node process manager                    |
| Let's Encrypt / Certbot  | HTTPS certificates                      |
| GitHub Actions           | CI/CD, production builds and deployment |

---

## Repository structure

```text
mdf/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS API
├── docs/                     # Architecture/design/implementation notes
├── scripts/                  # Env checks, integration tests, repo audit
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-production.yml
├── package.json
└── package-lock.json
```

This is an **npm workspaces monorepo**.

---

# Local setup

## Requirements

```text
Node.js 26.10.0
npm
Git
Docker Desktop (for local MongoDB)
```

Clone and install:

```bash
git clone https://github.com/shivammchaudhary1/mdf.git
cd mdf
npm ci
```

## Environment files

Only these environment filenames are used:

```text
apps/api/.env.dev
apps/api/.env.prod
apps/api/.env.example

apps/web/.env.dev
apps/web/.env.prod
apps/web/.env.example
```

Do **not** create `.env`, `.env.local`, `.env.development` or `.env.production`.

Create development files:

```bash
cp apps/api/.env.example apps/api/.env.dev
cp apps/web/.env.example apps/web/.env.dev
npm run env:check:dev
```

## Local database

```bash
npm run db:up
```

Local MongoDB:

```text
mongodb://127.0.0.1:27017/mdf-dev
```

Stop it with:

```bash
npm run db:down
```

## Run locally

```bash
npm run dev
```

```text
Frontend    http://localhost:3333
API         http://localhost:8888/api/v1
Swagger     http://localhost:8888/docs
MongoDB     localhost:27017
```

Run individually if needed:

```bash
npm run dev:web
npm run dev:api
```

---

# Environment configuration

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8888/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3333
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Production values:

```env
NEXT_PUBLIC_API_URL=https://api.mdadufilms.com/api/v1
NEXT_PUBLIC_SITE_URL=https://mdadufilms.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<Google Web Client ID>
```

## Backend

```env
NODE_ENV=
PORT=
FRONTEND_URL=

MONGODB_URI=
MONGODB_MAX_POOL_SIZE=
MONGODB_MIN_POOL_SIZE=
MONGODB_MAX_IDLE_MS=
MONGODB_SERVER_SELECTION_TIMEOUT_MS=
MONGODB_AUTO_INDEX=

COOKIE_SECRET=
COOKIE_DOMAIN=
SESSION_SHORT_HOURS=
SESSION_REMEMBER_DAYS=
SESSION_MAX_PER_ACCOUNT=

GENERAL_RATE_LIMIT_PER_MINUTE=

GOOGLE_CLIENT_ID=

STORAGE_DRIVER=
AWS_REGION=
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
NOREPLY_EMAIL=
CONTACT_EMAIL=
CAREERS_EMAIL=
PRODUCTION_EMAIL=

TRUST_PROXY=
AUDIT_RETENTION_DAYS=
SWAGGER_ENABLED=
```

Important production values:

```text
NODE_ENV=production
PORT=8888
FRONTEND_URL=https://mdadufilms.com
MONGODB_AUTO_INDEX=false
COOKIE_DOMAIN=.mdadufilms.com
STORAGE_DRIVER=s3
AWS_REGION=ap-south-1
S3_BUCKET=mdadu-films-media
TRUST_PROXY=true
SWAGGER_ENABLED=false
```

Never commit real secrets.

---

# Authentication & security

- Local email/password authentication
- Google Identity Services sign-in
- Google ID token verified on the backend
- Google Client ID is shared between frontend/backend
- **Google Client Secret is not required by the current flow**
- Signed opaque `httpOnly` session cookies
- CSRF + origin protection
- CORS restricted to configured frontend origins
- Helmet security headers
- Persistent rate limiting
- Session revocation / logout-all support
- Password-reset and email-verification tokens are hashed
- Production cookies work across `mdadufilms.com` subdomains using `.mdadufilms.com`

For a new Google account, the backend currently creates a verified `MEMBER` account from the verified Google identity and records the current Terms/Privacy acceptance.

---

# Media storage

Production media uses the private S3 bucket:

```text
mdadu-films-media
Region: ap-south-1
```

Important rules:

- S3 Block Public Access stays enabled
- Files are served through the application, not a public bucket
- Images are validated/re-encoded with Sharp
- Upload limit is 10 MB
- Optimized WebP variants are generated
- Member documents remain private
- Failed uploads are cleaned up
- Existing successful media is retained during replacement workflows

Production storage driver:

```env
STORAGE_DRIVER=s3
```

---

# Quality checks

Before merging:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:integration
git diff --check
```

Full verification:

```bash
npm run verify
```

Mongo indexes:

```bash
npm run db:indexes:dev
npm run db:indexes:prod
```

Production keeps:

```text
MONGODB_AUTO_INDEX=false
```

---

# Production deployment

## Architecture

```text
                    GitHub
                       |
                 push/merge master
                       |
                       v
                GitHub Actions
              CI -> Build -> Deploy
                       |
                       | SCP release artifact
                       v
                AWS Lightsail
                       |
              +--------+--------+
              |                 |
         Next.js :3333      NestJS :8888
              |                 |
              +--------+--------+
                       |
                     Nginx
              +--------+--------+
              |                 |
      mdadufilms.com    api.mdadufilms.com
              |
             HTTPS
```

Both frontend and backend **build on GitHub Actions**. The Lightsail server does **not** compile the application.

## Deployment flow

Production deploy occurs only after a successful CI run for a push/merge to `master`:

```text
master push/merge
      ↓
CI succeeds
      ↓
Deploy Production
      ↓
GitHub builds frontend + backend
      ↓
Release artifact uploaded to Lightsail
      ↓
PM2 reload + health checks
      ↓
Production live
```

The workflow:

1. Checks out the exact CI-tested commit.
2. Creates production env files from GitHub Environment values.
3. Builds Next.js + NestJS on GitHub.
4. Packages Next.js standalone + backend runtime.
5. Uploads the release using SSH/SCP.
6. Creates `/var/www/mdadu-api/releases/<commit-sha>`.
7. Switches `/var/www/mdadu-api/current` to the new release.
8. Reloads PM2.
9. Checks frontend + API health.
10. Rolls back to the previous release automatically if health checks fail.
11. Retains recent releases and removes older ones.

Do not manually build production on Lightsail.

---

## GitHub production configuration

```text
Settings -> Environments -> production
```

### Environment Secrets

```text
MONGODB_URI
COOKIE_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SMTP_PASSWORD
```

### Environment Variables

```text
NODE_ENV
PORT
FRONTEND_URL

MONGODB_MAX_POOL_SIZE
MONGODB_MIN_POOL_SIZE
MONGODB_MAX_IDLE_MS
MONGODB_SERVER_SELECTION_TIMEOUT_MS
MONGODB_AUTO_INDEX

COOKIE_DOMAIN
SESSION_SHORT_HOURS
SESSION_REMEMBER_DAYS
SESSION_MAX_PER_ACCOUNT
GENERAL_RATE_LIMIT_PER_MINUTE

GOOGLE_CLIENT_ID

STORAGE_DRIVER
AWS_REGION
S3_BUCKET

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_FROM
NOREPLY_EMAIL
CONTACT_EMAIL
CAREERS_EMAIL
PRODUCTION_EMAIL

TRUST_PROXY
AUDIT_RETENTION_DAYS
SWAGGER_ENABLED

NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

### Deployment SSH secrets

```text
LIGHTSAIL_HOST
LIGHTSAIL_USER
LIGHTSAIL_SSH_KEY
```

Never commit or expose these values.

---

# Production server notes

Runtime:

```text
Ubuntu 24.04
Node.js 26.10.0
Nginx
PM2
2 GB swap configured
```

PM2 processes:

```text
mdadu-web    -> 127.0.0.1:3333
mdadu-api    -> 127.0.0.1:8888
```

Public firewall should expose only:

```text
22   SSH
80   HTTP
443  HTTPS
```

Ports `3333` and `8888` must remain private.

Nginx config:

```text
/etc/nginx/sites-available/mdadu-films
```

Release paths:

```text
/var/www/mdadu-api/releases/<commit-sha>
/var/www/mdadu-api/current
/var/www/mdadu-api/shared/.env.prod
```

HTTPS is managed by Certbot / Let's Encrypt.

Useful checks:

```bash
pm2 status
pm2 monit
free -h
df -h /
sudo nginx -t
sudo systemctl status nginx
sudo certbot certificates
curl -I https://mdadufilms.com
curl https://api.mdadufilms.com/api/v1/health
```

Logs:

```bash
pm2 logs mdadu-web
pm2 logs mdadu-api
sudo tail -f /var/log/nginx/error.log
```

---

# External services

### MongoDB Atlas

```text
Production DB: mdf-production
```

### Amazon S3

```text
Bucket: mdadu-films-media
Region: ap-south-1
Access: private
```

### Hostinger

Used for domain/DNS and SMTP.

```text
hello@mdadufilms.com
contact@mdadufilms.com
careers@mdadufilms.com
production@mdadufilms.com
noreply@mdadufilms.com
```

### Google

Google Identity Services uses one OAuth 2.0 **Web Application** client.

Authorized frontend origins include:

```text
http://localhost:3333
https://mdadufilms.com
```

---

# Branch & release rule

```text
feature branches
      ↓
testing / review
      ↓
master
      ↓
production
```

`master` is the production branch. A push/merge to `master` can trigger deployment, so unfinished work must not be pushed directly to it.

---

# Important developer rules

- Use Node `26.10.0`.
- Keep `package-lock.json` committed.
- Prefer `npm ci` for clean installs.
- Use only `.env.dev`, `.env.prod`, `.env.example`.
- Never commit credentials, tokens, SSH keys or production env files.
- Never make the S3 bucket public.
- Never expose ports `3333` / `8888` publicly.
- Do not build on Lightsail; GitHub Actions builds production artifacts.
- Keep Swagger disabled in production.
- Keep `MONGODB_AUTO_INDEX=false` in production.
- Verify the health endpoint after deployment.
- Rotate any credential immediately if it is exposed.

---

## Author

**Shivam Chaudhary**  
Full Stack Developer  
Creator & developer of the **M. Dadu Films Digital Platform**.
