# Group 3 — Member Profile / Portfolio Completion

Implemented against `master` commit `f54eeeb02b04025e7fc12e445315485a041a067b`.

## Member profile

- skills editable
- languages editable
- DOB uses date input
- gender uses controlled options
- previous work editable
- social links editable and HTTPS-only
- profile photograph upload / replace / remove
- profile completion now includes 12 consistent profile signals
- existing verified-email lock, mobile update and account deactivation remain intact

## Portfolio

- up to 8 images
- multi-image upload
- duplicate media protection
- backend duplicate portfolio-ID protection
- add / remove
- Showreel add / edit / open / remove
- Showreel HTTPS validation client + server
- Resume PDF upload / replace / download / remove
- ownership validation remains server-side

## AWS / S3 media upload

The browser still uploads to the NestJS API. This is intentional because the API:
1. validates the file,
2. compresses images with Sharp,
3. produces WebP variants,
4. then stores the variants through the configured storage adapter.

With:

```env
STORAGE_DRIVER=s3
AWS_REGION=ap-south-1
S3_BUCKET=mdadu-films-media
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

the same profile / portfolio upload code writes to the private S3 bucket.

S3 objects are not public. Reads continue through `/api/v1/media/...`, so profile
privacy and private PDF authorization remain enforced by the API.

Do not commit AWS credentials.

## Current key layout

Group 3 keeps the existing storage-key contract:

```text
media/<mediaId>/thumb.webp
media/<mediaId>/profile.webp
media/<mediaId>/medium.webp
media/<mediaId>/large.webp
media/<mediaId>/document.pdf
```

The broader logical folder redesign (`assets/...`, `users/...`) remains the
explicit Group 10 architecture task, so Group 3 does not silently change that
contract.

## S3 reliability improvements

- storage failures are no longer reported as invalid image errors
- partial S3 writes are cleaned up
- DB-create failures clean stored objects
- media cannot be deleted while referenced
- detached profile/portfolio/resume media is cleaned when no longer referenced
- private/public media authorization is preserved

## Validation

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:integration
git diff --check
```
