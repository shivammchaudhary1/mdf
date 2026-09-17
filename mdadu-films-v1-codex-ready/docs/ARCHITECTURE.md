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
- Node.js 24.11.1
- MongoDB / Mongoose
- REST + Swagger
- Amazon S3 later for production media
- Hostinger SMTP later for application email

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

## Business domains

Backend modules are expected to grow around:

- auth
- users
- profiles
- projects
- castings
- applications
- talent / saved lists
- posts/blog
- media/gallery/BTS
- team
- contact
- admin
- settings

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
