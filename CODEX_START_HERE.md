# Start Codex Here — M. Dadu Films V1 Completion

Your task is to finish the remaining V1 functional work from the current `master` without changing the approved UI.

## Read in this exact order

1. `AGENTS.md`
2. `docs/CODEX_COMPLETION_PLAN.md`
3. `docs/progress.md`
4. `apps/api/AGENTS.md` before backend edits
5. `apps/web/AGENTS.md` before frontend edits
6. `docs/ARCHITECTURE.md`
7. `docs/CODEX_WORKFLOW.md`
8. `docs/DYNAMIC_CONTENT_RULES.md`

## First action

Create a new branch from the latest `master`:

```bash
git checkout master
git pull --ff-only origin master
git checkout -b feature/complete-v1-functional-integration
```

Do not work directly on `master`.

## UI is frozen

Do not redesign or visually adjust anything.

Do not change:
- CSS,
- colors,
- spacing,
- typography,
- responsive breakpoints,
- visible section ordering,
- card/layout structure,
- visual class names,
- logo,
- approved visual styling.

Functional frontend changes are allowed only when the rendered appearance stays the same.

Member and admin dashboards currently contain demo/fixture-driven data in places. Connect them to the real APIs while mapping backend responses into the existing UI structures.

## Work order

### 1. Make the repository quality gate green

Run:

```bash
npm ci
npm run check
```

Known current CI blocker:
`apps/api/src/modules/talent/talent.service.ts` has two `no-explicit-any` lint errors.

Fix lint/type issues correctly; do not disable ESLint rules or loosen TypeScript.

Continue until:

```bash
npm run check
```

passes.

### 2. Run backend integration verification

Start MongoDB and run:

```bash
npm run db:up
npm run test:integration
```

If the host has the documented MongoDB 8 Docker kernel issue:

```bash
npm run db:local
npm run test:integration
```

Fix real failures. Do not weaken tests merely to obtain green output.

### 3. Audit V1 requirements against existing backend

Before writing endpoints, inspect what already exists.

Check:
- auth/session management,
- account/profile settings,
- media,
- projects,
- castings,
- applications,
- member dashboard,
- admin metrics/activity,
- users/talent,
- verification/suspension,
- saved talent lists,
- blog/CMS,
- gallery/BTS/shows/team,
- contact inbox,
- settings/legal.

Complete only missing V1 behavior.

Pay special attention to:
- privacy of public talent responses,
- partial-update validation,
- pagination and bounded query limits,
- admin-only fields never leaking publicly,
- account suspension/session revocation,
- media ownership/visibility,
- stale or duplicate generic-CMS responsibilities.

### 4. Connect member UI to real APIs without visual changes

Remove demo behavior/data only after equivalent API wiring exists.

Complete and verify:
- real logout,
- member dashboard,
- profile,
- portfolio/media,
- applications,
- opportunities,
- settings/session management.

Preserve existing DOM/class names/styles as much as technically possible.

### 5. Connect admin UI to real APIs without visual changes

Complete and verify:
- dashboard metrics/activity,
- members/talent,
- verify/unverify,
- suspend/reactivate,
- applications/status/admin notes,
- projects,
- castings,
- saved talent lists,
- contacts,
- blog,
- gallery,
- BTS,
- shows,
- team,
- settings/legal.

Do not redesign any admin screen.

### 6. Verify public dynamic content

Ensure public projects, castings, blog, gallery, BTS, shows/team and relevant homepage data use APIs where the backend exists.

Do not invent company data.

Missing real company details must remain `[!]` in the checklist.

### 7. Security and quality verification

Verify the Stage 16 checklist against actual behavior:
- validation,
- secure password/session behavior,
- signed httpOnly cookies,
- CSRF,
- CORS/origin enforcement,
- Helmet,
- rate limiting,
- file restrictions,
- admin authorization,
- ownership checks,
- secret hygiene,
- safe errors/logging.

Add tests for important gaps.

### 8. Update CI where appropriate

After local verification is stable, ensure CI runs the appropriate non-deployment quality checks.

Integration tests may use an isolated MongoDB service in CI if reliable and contained.

Do not add deployment steps.

### 9. Reconcile `docs/progress.md`

After each verified slice:
- `[x]` only when implemented and tested,
- `[~]` when partial or awaiting final verification,
- `[!]` for real content/credential/manual-review blockers.

Do not claim completion from code presence alone.

## Final commands before handing back

```bash
npm run check
npm run db:up
npm run test:integration
git diff --check
git status
```

Or, once the provided scripts are present:

```bash
npm run verify:local
```

Then report:
- what was already present,
- what you changed,
- tests run and exact results,
- remaining `[!]` blockers,
- confirmation that no visual UI changes were made.

Do not deploy. Stage 18 remains last.
