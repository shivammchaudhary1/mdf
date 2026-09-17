# M. Dadu Films V1.0.0 — Codex Repository Instructions

This repository is the source of truth for the M. Dadu Films Digital Platform.

## Read first

Before changing code, read these in order:

1. `docs/progress.md` — canonical development checklist and stage order.
2. `docs/DESIGN_SYSTEM.md` — visual source of truth and reference mapping.
3. `docs/ARCHITECTURE.md` — technical boundaries, module direction and ports.
4. `docs/CODEX_WORKFLOW.md` — execution and verification workflow.
5. `docs/DYNAMIC_CONTENT_RULES.md` — static vs database-driven content.
6. The nearest nested `AGENTS.md` for the code being edited.
7. For UI work, inspect the relevant images in `docs/references/ui/`.

## Current checkpoint

The repository has been flattened and cleaned. The active priority is UI/design alignment and
foundation hardening before later business-feature stages continue.

Do not jump to Stage 7+ simply because routes or backend primitives already exist. Finish the
open responsive/visual QA items in Stages 2–3 first unless the user explicitly requests a later
stage.

Visual approval is a human review gate. Codex must never mark a visual-approval checklist item
complete on its own.

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

## Design source of truth

Use this priority order:

1. Final logo assets.
2. Approved screenshots in `docs/references/ui/`.
3. `docs/DESIGN_SYSTEM.md`.
4. Existing components that already match those references.

Do not treat an older implementation as visually correct merely because it already exists.
Preserve working behavior/data contracts while improving presentation.

The intended visual system is:
- cinematic, high-impact homepage,
- white/light editorial inner pages with generous whitespace,
- clean light member/admin workspaces,
- dark contrast used deliberately, not across every screen,
- cinematic red as the primary action/accent,
- subtle warm gold only as a premium secondary accent,
- Playfair Display for editorial headings and Inter for body/UI.

Do not:
- repeat the same three-card grid for every homepage section,
- invent stock/remote imagery,
- use reference screenshots as production website imagery,
- add arbitrary colors when a design token exists,
- make dashboards dense or overly dark,
- use decorative effects that reduce readability.

## Mandatory work loop

For every task:

1. Inspect `docs/progress.md`.
2. Work on the current active stage before later stages unless explicitly instructed otherwise.
3. Pick the next unchecked, non-blocked item.
4. Inspect existing code and relevant UI references before editing.
5. Preserve working business logic and API contracts unless the task requires changing them.
6. Implement the smallest complete slice.
7. Run relevant lint/typecheck/tests/build checks.
8. Mark an item `[x]` only when implementation and verification both exist.
9. Mark missing real content `[!]` with a short reason; do not invent it.
10. Never mark human visual approval as complete without user confirmation.

## Content and data rules

- Administrator-editable business content must become dynamic/database-driven.
- Do not hardcode production projects, castings, team members, blog posts, gallery items, GST,
  registration details, phone numbers, addresses, social links, or homepage marketing copy inside
  route components.
- Stable technical constants belong in `config/`, constants or enums.
- Development content belongs only in clearly named placeholder/demo files.
- When real imagery is missing, use the shared placeholder system.
- Never invent legal/company data.

## Backend direction

The backend is a NestJS modular monolith.

`platform/` is a transitional consolidation layer from the foundation build. Do not keep adding
unrelated business responsibilities to it indefinitely.

When new domain functionality is implemented, prefer the appropriate domain module:
- users,
- profiles,
- projects,
- castings,
- applications,
- talent/saved lists,
- posts/blog,
- team,
- contact,
- settings,
- admin.

Simple CMS-like content (for example gallery/BTS/shows) may share generic content infrastructure
when that genuinely reduces duplication. Projects, castings and applications should not be forced
into a generic CMS model when their business rules diverge.

Refactor incrementally while touching a domain; do not perform a risky big-bang backend rewrite.

## UI/UX implementation rules

- Preserve the finalized logo.
- Build mobile and desktop together.
- Prefer semantic design tokens from `globals.css`.
- Reuse shared UI primitives.
- Every async action must expose loading/success/error feedback.
- Use toast notifications for mutation feedback.
- Use confirmation dialogs for destructive actions.
- Do not use browser `alert()` or `confirm()`.
- Show inline validation near invalid fields.
- Intentionally design loading, empty and error states.
- Keep accessibility focus states and reduced-motion behavior.

## Safety and quality

- Never commit `.env` files or secrets.
- Do not weaken TypeScript strictness.
- Avoid `any`; document unavoidable use.
- Do not bypass dependency conflicts with `--force` or `--legacy-peer-deps`.
- Do not delete user work unnecessarily.
- Avoid destructive Git commands.
- Keep controllers thin and business logic in services.
- Add/adjust tests for meaningful business logic.
- Keep Swagger current.

## Definition of done

A checklist item is complete only when:
- code exists,
- responsive behavior is handled where relevant,
- loading/error/empty states are handled,
- relevant checks pass,
- no fake production data was introduced,
- documentation/checklist state is accurate.

A visual-approval item additionally requires explicit user approval.
