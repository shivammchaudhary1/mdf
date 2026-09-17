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

Controllers should validate/route requests and delegate business logic to services.

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
Do not hide business content in server constants when it should be editable in the admin UI.

## Authentication

When Stage 4 is implemented:
- hash passwords securely,
- use secure httpOnly cookie/token handling,
- enforce ownership and role guards,
- mobile number is required but no OTP is required in V1,
- never expose password hashes.

## Media

S3 arrives in the media stage.
Keep storage behind a service/adapter boundary so local development can work before production AWS setup.

## Errors and logs

- Never leak stack traces or secrets in production responses.
- Use meaningful HTTP status codes.
- Log server-side failures with enough context for debugging.
