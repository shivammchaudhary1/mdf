# Group 10 — Production Media Architecture

## Final storage design

New uploads no longer use `media/<mediaId>/...`.

```text
assets/
  website-images/<mediaId>/
  projects/<mediaId>/
  castings/<mediaId>/
  blog/<mediaId>/
  gallery/<mediaId>/
  team/<mediaId>/
  bts/<mediaId>/
  shows/<mediaId>/

users/
  <userId>/
    profile-pic/<mediaId>/
    portfolio-images/<mediaId>/
    resume/<mediaId>/
```

Images keep deterministic derivatives inside their destination:
- `thumb.webp` — max width 400, quality 78
- `profile.webp` — 800×800 crop, quality 82
- `medium.webp` — max width 1200, quality 82
- `large.webp` — max width 1920, quality 84

PDF documents use `document.pdf`.

## Production rules

- S3 stays private with Block Public Access enabled.
- Object upload uses SSE-S3 (`AES256`).
- The browser never supplies an arbitrary S3 key. It supplies only a controlled media `purpose`.
- Website/production asset purposes require `SUPER_ADMIN`.
- Member photo, portfolio and resume paths are automatically scoped under the authenticated user ID.
- MongoDB stores media metadata plus `purpose` and `storagePrefix`.
- Domain services enforce purpose when attaching media, so a portfolio upload cannot be attached as a project cover and vice versa.
- JPEG/PNG/WebP are validated and re-encoded through Sharp; metadata is not carried into derivatives.
- Images above 40 megapixels or 10 MB are rejected.
- Processing writes one derivative at a time to reduce memory pressure; partial failures clean up written derivatives.
- Documents remain private. Public images are still delivered through the application media endpoint; the S3 bucket itself is never made public.
- No Cloudinary is required. CloudFront is intentionally deferred until traffic justifies CDN complexity/cost.

## Legacy migration

The application continues to read/delete legacy `media/<mediaId>/...` records when `storagePrefix` is absent, so rollout is backward compatible.

A migration script is included. It is **dry-run by default** and only migrates records whose purpose can be inferred unambiguously from current database references. Ambiguous/shared or unreferenced legacy records are skipped rather than guessed.

Development:
```bash
npm run db:migrate:media:dev
npm run db:migrate:media:dev:apply
```

Production (only after backup and UAT):
```bash
npm run db:migrate:media:prod
npm run db:migrate:media:prod:apply
```

Deployment remains frozen until Group 13 approval.
