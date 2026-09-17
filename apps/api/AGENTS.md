# Backend Instructions

Use a NestJS modular monolith. Projects, castings, applications, profiles, talent, contact, media, auth and admin are dedicated domains. `platform/` is only lightweight CMS (`pages`, `blog`, `team`, `gallery`, `behind-the-scenes`, `shows`, `settings`, `legal`).

Use REST under `/api/v1`, DTO validation, pagination, ObjectId relationships, bounded arrays, `.lean()` for read-only queries, signed httpOnly session cookies, CSRF on authenticated mutations, ownership/role guards, and rate limiting on sensitive public endpoints. Never log cookies, request bodies or secrets. Never expose password hashes, session digests, Google subject IDs, internal notes or IP hashes.

Store media ObjectIds, not full media URLs. Use `MediaService`/`StorageAdapter`. Local storage is development-only; S3 is the production target.

Only roles are `USER` and `SUPER_ADMIN`. Deployment remains the final project stage.
