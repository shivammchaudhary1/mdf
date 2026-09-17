# Backend Instructions

These rules apply to `apps/api`.

## Architecture

Use a NestJS modular monolith.

Each business module should normally contain:
- controller,
- service,
- module,
- DTOs,
- schemas/models,
- tests where meaningful.

Controllers validate/route requests and delegate business logic to services.

## Current refactor direction

`src/modules/platform/` is a transitional consolidation layer created during the foundation build.
It is not the desired destination for every future feature.

Do not add new unrelated responsibilities to `platform/` by default.

When a domain is actively developed, prefer moving/adding its logic under:
- `users/`
- `profiles/`
- `projects/`
- `castings/`
- `applications/`
- `talent/`
- `posts/`
- `team/`
- `contact/`
- `settings/`
- `admin/`

Refactor incrementally as a domain is touched. Do not perform a big-bang rewrite merely to make
folders look perfect.

Generic content infrastructure may remain useful for lightweight CMS domains such as gallery,
behind-the-scenes and shows/media. Projects, castings and applications must be allowed to have
domain-specific schemas/services when their rules require it.

## API

- Prefix: `/api/v1`.
- Local server: `http://localhost:8888`.
- REST only in V1.
- Keep Swagger decorators/documentation current.
- Return consistent error structures.
- Use DTO validation and whitelist unknown fields.

## Roles

Only:
- `SUPER_ADMIN`
- `USER`

Do not add extra roles without explicit user approval.

## Dynamic data

MongoDB is the source of truth for administrator-editable business content.
Do not hide editable business content in server constants.

## Authentication

- Hash passwords securely.
- Use secure httpOnly cookie/token handling.
- Enforce ownership and role guards.
- Mobile number is required but no OTP is required in V1.
- Never expose password hashes.

## Media

Keep storage behind the existing adapter/service boundary.
Local storage is valid for development; Amazon S3 remains the production target in the media/
deployment stages.

## Errors and logs

- Never leak stack traces or secrets in production responses.
- Use meaningful HTTP status codes.
- Log server-side failures with enough context for debugging.
