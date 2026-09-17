# M. Dadu Films V1.0.0 — Codex Repository Instructions

This repository is the source of truth for the M. Dadu Films Digital Platform.

## Read first

Before changing code, read these in order:

1. `CODEX_START_HERE.md`
2. `docs/CODEX_COMPLETION_PLAN.md`
3. `docs/progress.md`
4. `docs/ARCHITECTURE.md`
5. `docs/CODEX_WORKFLOW.md`
6. `docs/DYNAMIC_CONTENT_RULES.md`
7. the nearest nested `AGENTS.md`

For the current completion phase, visual reference files are for regression comparison only. Do not redesign the UI.

## Current checkpoint — 2026-09-18

The approved frontend UI is now **frozen**.

Already merged into `master`:
- public website redesign,
- authentication UI,
- member dashboard UI,
- Super Admin dashboard UI,
- admin interactions,
- Backend Core V2,
- Mongoose 9 query-filter compile fix.

The current task is to finish functionality, integration, tests, security verification and documentation **without changing the approved UI**.

Known first blocker at this checkpoint:
- GitHub Actions `npm run check` is failing on two `@typescript-eslint/no-explicit-any` errors in
  `apps/api/src/modules/talent/talent.service.ts`.

Member/admin screens still contain demo/fixture-driven data in places. Replace demo behavior/data with real API data while preserving the exact visual structure.

## Absolute UI freeze

Unless the user explicitly asks for a visual change, Codex MUST NOT:

- edit CSS files for visual purposes,
- alter colors, spacing, typography, borders, shadows, radii, imagery or responsive breakpoints,
- redesign components,
- reorder visible sections,
- rename or remove existing visual `className` values,
- change the visible layout,
- replace the logo,
- change approved visual copy merely for style,
- introduce a new component library or design system,
- make dashboard/public/auth screens look different.

Allowed frontend work:
- API calls,
- loading/error/data state wiring using existing components/classes,
- form submission logic,
- authentication/session logic,
- type definitions,
- service functions,
- state management,
- mapping API responses into the existing view models,
- accessibility/semantic fixes only when they do not alter visual appearance,
- removing demo fixtures after equivalent real API data is connected.

If a functional fix appears to require a visual change, stop and document the blocker instead of changing the UI.

## Product constraints

- Version: `1.0.0`.
- Roles: only `SUPER_ADMIN` and `USER`.
- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: NestJS + Node.js `24.11.1`.
- API: REST only.
- Database: MongoDB + Mongoose.
- Auth: opaque server-side sessions in signed `httpOnly` cookies.
- CSRF protection is required for authenticated mutations.
- Frontend local port: `3333`.
- Backend local port: `8888`.
- No Redis in V1.
- No AWS SES in V1.
- No GraphQL in V1.
- No microservices/Kubernetes in V1.
- No mobile OTP in V1.
- Production deployment is Stage 18 only.

## Current implementation direction

Backend is a NestJS modular monolith.

Dedicated domains:
- auth,
- profiles,
- media,
- projects,
- castings,
- applications,
- talent/saved lists,
- contact,
- admin.

`platform/` is only lightweight CMS infrastructure for:
- pages,
- blog,
- team,
- gallery,
- behind-the-scenes,
- shows,
- settings,
- legal.

Do not move projects, castings, applications, profiles or talent lists back into one generic mega-schema.

Use:
- MongoDB `ObjectId` relationships,
- pagination for list APIs,
- bounded arrays/string lengths,
- `.lean()` for read-only Mongoose reads where appropriate,
- DTO validation,
- role/ownership guards,
- audit logs for meaningful admin mutations,
- rate limiting on sensitive routes,
- `MediaService`/`StorageAdapter` for media.

## Mandatory completion loop

For each remaining checklist item:

1. Read `docs/CODEX_COMPLETION_PLAN.md`.
2. Read the corresponding section in `docs/progress.md`.
3. Inspect current implementation before editing.
4. Confirm whether it is:
   - already implemented and only needs verification,
   - partially implemented,
   - genuinely missing.
5. Do not rewrite working code just because the checklist was stale.
6. Implement the smallest safe functional slice.
7. Preserve current rendered UI.
8. Add or update tests.
9. Run the relevant checks.
10. Mark `[x]` only after implementation + verification pass.
11. Use `[~]` for implemented/partial work awaiting verification.
12. Use `[!]` when blocked by real company content, credentials or human visual approval.
13. Continue to another independent task when blocked.
14. Do not start Stage 18 deployment.

## Quality gates

Before calling a technical slice complete, run the relevant subset.

Full repository quality gate:

```bash
npm run check
```

With MongoDB already running, full local verification:

```bash
npm run verify
```

Convenience local verification with default Docker MongoDB:

```bash
npm run verify:local
```

MongoDB 7 fallback for hosts where MongoDB 8 Docker cannot start:

```bash
npm run db:local
npm run verify
```

Do not mark Stage 17 complete until the integration suite and manual UAT checklist are complete.

## Dependency and license policy

Avoid new dependencies when the platform or existing dependency can do the job.

If a new dependency is truly needed:
- prefer permissive licenses such as MIT, Apache-2.0, BSD-2-Clause or BSD-3-Clause,
- do not add GPL/AGPL/SSPL/proprietary dependencies without explicit user approval,
- verify the package license and maintenance state before adding it,
- document the dependency and license in `docs/THIRD_PARTY_LICENSE_POLICY.md`,
- never use `--force` or `--legacy-peer-deps`.

This dependency policy does **not** relicense the M. Dadu Films source repository itself.

## Security

Never:
- commit `.env` or real credentials,
- expose password hashes/session digests/Google subject IDs/IP hashes/internal notes,
- log cookies, auth tokens or request bodies containing secrets,
- weaken TypeScript strictness,
- bypass validation,
- use destructive Git commands,
- force-push.

Preserve:
- signed `httpOnly` cookies,
- CSRF,
- origin/CORS checks,
- Helmet,
- session revocation,
- ownership/admin guards,
- upload restrictions,
- rate limiting.

## Git workflow

Start completion work from the latest `master` on a new feature branch.

Recommended Codex branch:

```text
feature/complete-v1-functional-integration
```

Do not commit directly to `master`.
Do not deploy.
Do not delete old feature branches as part of this work.

## Definition of done

V1 technical completion before deployment means:

- GitHub CI is green,
- `npm run check` passes,
- `npm run test:integration` passes with MongoDB running,
- member screens use real APIs instead of demo behavior/data,
- admin screens use real APIs instead of demo behavior/data,
- public dynamic domains are verified against real APIs,
- all required V1 backend APIs exist and are tested,
- security checklist is verified,
- real-content/credential blockers are clearly marked `[!]`,
- `docs/progress.md` accurately reflects reality,
- README commands are accurate,
- no approved UI has been visually changed,
- Stage 18 remains untouched.
