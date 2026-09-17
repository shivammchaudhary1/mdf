# Codex V1 Functional Completion Plan

Date: 2026-09-18  
Scope: finish remaining V1 functionality without changing the approved UI.

## Non-negotiable rule

The visual UI is frozen.

Codex may change logic, services, API calls, types, tests, backend code and data mapping, but must not change the appearance of the public website, auth pages, member dashboard or admin dashboard.

If a visual change seems necessary, leave it as a documented blocker instead.

## Current repository reality

Already implemented and merged:
- public website UI,
- authentication UI,
- member dashboard UI,
- Super Admin dashboard UI,
- admin interactions,
- Backend Core V2 modular backend,
- secure opaque cookie/session auth,
- CSRF/origin protection,
- Mongo-backed sensitive rate limiting,
- media local/S3 abstraction,
- projects/castings/applications/profiles/talent/contact/admin/CMS modules,
- Mongoose 9 compile fix.

Known remaining realities:
- current GitHub CI is red on two `no-explicit-any` lint errors in `talent.service.ts`,
- member/admin UI still uses demo JSON/fixture data in places,
- integration verification has not yet been re-run successfully against the final merged master,
- real SMTP, Google credentials and S3 production configuration are not available,
- real company/legal/contact content is still missing,
- full Stage 17 UAT is not complete,
- Stage 18 deployment must not begin.

## Phase A — quality gate

- [ ] Fix current lint errors without disabling rules.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] API unit tests pass.
- [ ] Web + API builds pass.
- [ ] `npm run check` passes.
- [ ] `git diff --check` passes.
- [ ] GitHub Actions quality workflow is green.

## Phase B — backend integration verification

- [ ] Start isolated local MongoDB.
- [ ] Run `npm run test:integration`.
- [ ] Fix integration failures caused by Backend V2.
- [ ] Verify registration/login/logout/remember session.
- [ ] Verify CSRF failure on missing/invalid token for authenticated mutations.
- [ ] Verify cross-origin mutation denial.
- [ ] Verify password reset is one-use and revokes sessions.
- [ ] Verify suspension revokes active sessions.
- [ ] Verify media ownership/private/public access.
- [ ] Verify projects/castings CRUD rules.
- [ ] Verify closed casting cannot accept applications.
- [ ] Verify duplicate application blocking.
- [ ] Verify admin notes are never public/member-visible.
- [ ] Verify talent filters and saved lists.
- [ ] Verify contact persistence/admin workflow.
- [ ] Verify admin dashboard metrics/activity.

## Phase C — backend requirement audit

Codex must compare existing endpoints with `docs/progress.md` before adding new APIs.

### Auth/account
- [ ] Confirm all required session-management endpoints exist.
- [ ] Confirm member can manage account settings required by V1.
- [ ] Confirm password change/reset behavior is complete.
- [ ] Confirm no raw bearer/session/reset token is stored in MongoDB.

### Profiles/media
- [ ] Confirm profile CRUD contract matches frontend needs.
- [ ] Confirm portfolio/media references are ObjectIds.
- [ ] Confirm public profile response does not leak private/sensitive fields.
- [ ] Confirm exact birth date is not exposed publicly unless product requirements explicitly require it.
- [ ] Confirm resume/document remains private.
- [ ] Confirm shared/published media visibility cannot be accidentally broken by unrelated profile updates.

### Projects/castings
- [ ] Confirm create/update/archive/close behavior.
- [ ] Confirm partial casting updates validate age/date ranges using existing values when only one side changes.
- [ ] Confirm public list/detail contracts are stable and paginated.
- [ ] Confirm legacy compatibility only where current frontend/public routes still depend on it.

### Applications
- [ ] Confirm user apply/list/detail flows.
- [ ] Confirm admin list/detail/status/notes flows.
- [ ] Confirm snapshots preserve historical applicant/opportunity information.
- [ ] Confirm list endpoints are paginated.

### Talent/saved lists
- [ ] Remove all explicit `any` lint errors.
- [ ] Confirm public talent response exposes only approved public fields.
- [ ] Confirm advanced filters use indexed/query-side filtering rather than loading hundreds of users into memory.
- [ ] Confirm saved lists persist and support project association.
- [ ] Avoid N+1 queries for large saved lists where practical.

### CMS/contact/settings/legal
- [ ] Confirm lightweight CMS supports blog/team/gallery/BTS/shows/settings/legal.
- [ ] Confirm blog publish date/SEO fields required by V1 are represented.
- [ ] Confirm admin contact inbox/status workflow.
- [ ] Confirm settings/legal can be managed without duplicate singleton-like records where appropriate.
- [ ] Do not invent real company or legal content.

## Phase D — member frontend real API wiring

Preserve exact existing visual structure.

- [ ] Replace demo member data with `/member/dashboard`.
- [ ] Real profile read/save.
- [ ] Real portfolio/media upload/select/remove.
- [ ] Real opportunities feed.
- [ ] Real applications list/detail/apply.
- [ ] Real application statuses.
- [ ] Real member settings.
- [ ] Real session/device list where current UI supports it.
- [ ] Real logout instead of demo redirect.
- [ ] Remove member demo JSON only after equivalent API data is wired.
- [ ] Existing loading/error/empty visuals remain unchanged.

## Phase E — admin frontend real API wiring

Preserve exact existing visual structure.

- [ ] Dashboard metrics/activity use real admin API.
- [ ] Members/talent list uses real API.
- [ ] Search/filter uses real API.
- [ ] Verify/unverify uses real API.
- [ ] Suspend/reactivate uses real API.
- [ ] Applications list/filter/detail/status/admin notes use real API.
- [ ] Projects CRUD/archive uses real API.
- [ ] Castings CRUD/close/archive uses real API.
- [ ] Saved talent lists use real API.
- [ ] Contact inbox/status uses real API.
- [ ] Blog CMS uses real API.
- [ ] Gallery CMS uses real API.
- [ ] BTS CMS uses real API.
- [ ] Shows/media CMS uses real API.
- [ ] Team CMS uses real API.
- [ ] Settings/legal use real API.
- [ ] Remove admin demo JSON only after equivalent API data is wired.

## Phase F — public dynamic-data verification

- [ ] Projects list/detail use API.
- [ ] Castings list/detail use API.
- [ ] Blog list/detail use API.
- [ ] Gallery/BTS/shows/team use API where backend exists.
- [ ] Homepage dynamic sections use API where appropriate.
- [ ] Missing real company content stays blocked, not invented.
- [ ] No public route leaks draft/private content.

## Phase G — security and quality

- [ ] DTO/input validation reviewed.
- [ ] Password/session security reviewed.
- [ ] Signed `httpOnly` cookie behavior reviewed.
- [ ] `Secure` production cookie behavior reviewed.
- [ ] SameSite behavior reviewed.
- [ ] CSRF reviewed.
- [ ] CORS/origin reviewed.
- [ ] Helmet/security headers reviewed.
- [ ] General/sensitive rate limits reviewed.
- [ ] Upload MIME/size/pixel limits reviewed.
- [ ] Admin authorization reviewed.
- [ ] Ownership checks reviewed.
- [ ] Error payloads do not expose stacks/secrets.
- [ ] Request logs do not expose cookies/bodies/secrets.
- [ ] No real secrets committed.
- [ ] Pagination limits are bounded.
- [ ] MongoDB indexes match common query patterns.
- [ ] Production auto-index plan is documented.

## Phase H — automated testing and CI

- [ ] Unit tests cover meaningful business rules.
- [ ] Integration suite covers final V1 flows.
- [ ] CI runs `npm ci`.
- [ ] CI runs `npm run check`.
- [ ] Add isolated MongoDB integration job/service if reliable.
- [ ] CI does not deploy.
- [ ] No tests are weakened merely to pass.

## Phase I — documentation/checklist

- [ ] Update `docs/progress.md` after verified work.
- [ ] Keep real-content blockers as `[!]`.
- [ ] README commands match package scripts.
- [ ] Swagger remains accurate.
- [ ] Document any migration/index steps actually required.
- [ ] Record added third-party dependencies/licenses.
- [ ] Confirm no UI/CSS redesign was introduced.

## External blockers that should NOT stop independent coding

These should be marked `[!]`, not fabricated:
- official company legal name if still unavailable,
- GST/CIN,
- production address/phone/email,
- social links,
- final privacy/terms text,
- Hostinger SMTP credentials,
- Google Client ID,
- AWS/S3 production credentials/config,
- final real projects/team/gallery/blog content,
- human visual approval,
- final UAT sign-off.

## Commands

Fast code-quality gate:

```bash
npm run check
```

Full local verification when MongoDB is already running:

```bash
npm run verify
```

Full local verification using default Docker MongoDB:

```bash
npm run verify:local
```

Fallback MongoDB 7 flow:

```bash
npm run db:local
npm run verify
```

Development:

```bash
npm run dev
```

Individual apps:

```bash
npm run dev:web
npm run dev:api
```

Build only:

```bash
npm run build
```

Unit tests only:

```bash
npm run test
```

Integration only:

```bash
npm run test:integration
```

## Codex handoff format

When Codex stops, it must report:

1. branch and latest commit,
2. files changed,
3. checklist items completed,
4. exact commands run,
5. exact pass/fail result,
6. remaining blockers,
7. confirmation that approved UI was not visually changed,
8. confirmation that deployment was not performed.
