# Architecture — M. Dadu Films V1.0.0

## Local topology

```text
Browser
  |
  | http://localhost:3333
  v
Next.js Web
  |
  | REST: http://localhost:8888/api/v1
  v
NestJS API
  |
  v
MongoDB
```

### Local ports

| Service | Port |
|---|---:|
| Next.js frontend | `3333` |
| NestJS backend | `8888` |
| MongoDB local Docker | `27017` |

## V1 stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- NestJS
- Node.js 26.10.0
- MongoDB / Mongoose
- REST + Swagger
- Amazon S3 later for production media
- Hostinger SMTP + Nodemailer for V1 email

## Frontend boundaries

```text
apps/web/src/
├── app/                  # routes + composition
├── components/           # reusable application/presentation components
│   └── ui/               # generic UI primitives
├── config/               # stable technical config/constants
├── content/placeholders/ # development fallbacks only
├── providers/
├── services/             # API access
└── types/
```

Business content that an administrator should edit belongs in the API/database, not page source.

Visual rules live in `docs/DESIGN_SYSTEM.md`.
Reference screenshots live in `docs/references/ui/`.

## Backend domain direction

The API is a modular monolith.

Target business domains:

- auth
- users
- profiles
- projects
- castings
- applications
- talent / saved lists
- posts/blog
- media
- gallery/BTS/shows content
- team
- contact
- admin
- settings

### Transitional `platform` module

`src/modules/platform/` currently contains multiple foundation-era concerns. It remains valid while
the product is stabilizing, but it must not become a permanent catch-all.

Rules:
- do not add unrelated new features there by default,
- migrate a concern when that domain is actively developed,
- keep lightweight CMS content generic when appropriate,
- give projects/castings/applications domain-specific models/services when business rules diverge,
- refactor incrementally and keep tests green.

## V1 deployment target — final stage only

```text
Next.js       -> AWS Amplify
NestJS        -> AWS Lightsail 1 GB
Database      -> MongoDB Atlas
Media         -> Amazon S3
Email         -> Hostinger SMTP + Nodemailer
Domain/DNS    -> Hostinger
CI/CD         -> GitHub Actions
```

Do not implement production deployment until Stage 18.

## Roles

Only:

```text
SUPER_ADMIN
USER
```

## Deliberately excluded from V1

- GraphQL
- Redis
- microservices
- Kubernetes
- AWS SES
- native mobile app
- OTP verification for mobile numbers
