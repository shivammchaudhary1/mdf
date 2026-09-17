# M. Dadu Films V1.0.0 — Codex Repository Instructions

This repository is the source of truth for the M. Dadu Films Digital Platform.

## Read first

Before changing code, read:

1. `docs/progress.md` — canonical development checklist and stage order.
2. `docs/ARCHITECTURE.md` — technical boundaries and ports.
3. `docs/CODEX_WORKFLOW.md` — exact execution and verification workflow.
4. `docs/DYNAMIC_CONTENT_RULES.md` — what may be static vs database-driven.
5. The nearest nested `AGENTS.md` for the code you are editing.

## Product constraints

- Version: `1.0.0`.
- Roles: only `SUPER_ADMIN` and `USER`.
- Frontend: Next.js + TypeScript + Tailwind CSS.
- Backend: NestJS + Node.js `24.11.1`.
- API: REST only. Do not introduce GraphQL in V1.
- Database: MongoDB + Mongoose.
- Frontend local port: `3333`.
- Backend local port: `8888`.
- No Redis in V1.
- No AWS SES in V1.
- No microservices/Kubernetes in V1.
- Production deployment is Stage 18 only. Do not deploy early.
- User mobile number is collected but is not OTP-verified in V1.

## Mandatory work loop

For every task:

1. Inspect `docs/progress.md`.
2. Work on the current active stage before later stages unless the user explicitly asks otherwise.
3. Pick the next unchecked, non-blocked item.
4. Inspect existing code before editing; reuse established patterns.
5. Implement the smallest complete slice.
6. Run relevant typechecks/tests/build checks.
7. Mark an item `[x]` in `docs/progress.md` only when its implementation exists and verification passed.
8. If blocked by missing user content, mark `[!]` with a short reason and continue another independent item.
9. Do not mark work complete merely because code was written.
10. Continue with the next independent unchecked item when the requested scope permits.

## Content and data rules

- Business content that the Super Admin should be able to change must become dynamic and database-driven.
- Do not hardcode production projects, castings, team members, blog posts, gallery items, GST, registration details, phone numbers, addresses, social links, or homepage marketing copy inside page components.
- Stable technical constants belong in `config/`, `constants/`, or enums.
- Development/demo content belongs only in clearly named placeholder/demo files.
- When a real image has not been supplied, use the shared placeholder system. Do not block development waiting for an image.
- Never invent legal/company data. Use visible placeholders such as `ADD_GST_NUMBER`.

## UI/UX rules

- Preserve the finalized M. Dadu Films logo.
- Preserve the approved light/white editorial-cinematic visual direction with red accent and generous whitespace.
- Build mobile and desktop together.
- Do not create cramped layouts.
- Reuse shared components; do not duplicate button/card/form styles.
- Every async user action must provide visible feedback.
- Use non-blocking toast notifications for success/error/info/warning feedback.
- Example auth messages: `Login successful.` and `Login failed. Check your email and password.`
- Use confirmation dialogs for destructive actions.
- Do not use `window.alert()` or `window.confirm()` for application UX.
- Show inline validation errors near invalid fields.
- All loading, empty, success and error states must be intentionally designed.

## Safety and quality

- Never commit `.env` files or secrets.
- Do not weaken TypeScript strictness to silence errors.
- Do not use `any` unless unavoidable and documented.
- Do not bypass dependency conflicts using `--force` or `--legacy-peer-deps`.
- Do not delete or overwrite user work unnecessarily.
- Avoid destructive Git commands.
- Keep API controllers thin; business logic belongs in services.
- Add/adjust tests for business logic and important flows.
- Keep Swagger/API documentation current as endpoints are added.

## Definition of done

A checklist item is complete only when:

- code is implemented,
- responsive behavior is handled where relevant,
- errors/loading/empty states are handled,
- relevant tests/typechecks pass,
- no obvious hardcoded production data was introduced,
- documentation/checklist is updated.

If any of those are missing, the item remains incomplete.
