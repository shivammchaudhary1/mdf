# M. Dadu Films Backend V2

Backend V2 keeps the V1 product scope while hardening security and separating high-value domains.

## Security
- opaque random server-side sessions, hashed in MongoDB
- signed `httpOnly` cookie, `Secure` in production, `SameSite=Lax`
- CSRF token on authenticated mutations plus exact-origin checks
- Mongo-backed sensitive-endpoint rate limiting + per-instance general limiter
- session list/revoke/logout-all and max sessions per user
- single-use password reset; resets revoke active sessions
- Google Identity Services ID-token verification
- request IDs and sanitized production errors
- audit logs with TTL

## Data model
Dedicated collections: accounts, sessions, passwordresets, profiles, projects, castings, applications, savedtalentlists, media, contacts, auditlogs, ratelimitbuckets.
`contents` remains only for lightweight CMS: pages, blog, team, gallery, BTS, shows, settings and legal.
Relationships use `ObjectId`; media URLs are derived at the API boundary.

## Migration
`node scripts/migrate-backend-v2.mjs` is dry-run only.
`node scripts/migrate-backend-v2.mjs --apply` creates `_backup_v1_*` collections before conversion and revokes old sessions so users sign in with the hardened session format.
Do not remove backups until manual verification is complete.

## Production
Use Atlas least-privilege credentials, HTTPS, `TRUST_PROXY=true` behind one Nginx/Lightsail proxy, `MONGODB_AUTO_INDEX=false`, `SWAGGER_ENABLED=false`, and S3 with public access blocked.
