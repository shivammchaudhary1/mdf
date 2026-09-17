# V1 completion verification — 2026-09-18

Branch: `chore/codex-completion-plan-v1`, based on `ab9d8ff` (latest completion branch fetched from origin). Changes are uncommitted. No deployment or push was performed.

## Verified results

- `npm ci`: passed, 611 packages installed, audit reported zero vulnerabilities. No dependency or lockfile changes.
- `npm run check`: passed (ESLint, both TypeScript checks, 3 API unit-test suites / 10 tests, Next.js build and NestJS build).
- `$env:INTEGRATION_MONGO_PORT='27018'; npm run verify`: passed, including the quality gate and expanded real-MongoDB integration suite.
- `$env:INTEGRATION_MONGO_PORT='27018'; npm run test:integration`: passed after the final integration assertions.
- `node scripts/verify-ui-freeze.mjs`: passed against `ab9d8ff`. Existing JSX `className` and inline `style` attributes are unchanged; no CSS, Tailwind or Next configuration changes. This is a source regression check, not human visual sign-off.
- `git diff --check`: passed.

The host runs Node **24.12.0**, npm **11.6.2**. The repository and CI retain the required Node **24.11.1** pin; `npm ci` reports that version mismatch as a warning. A CI result on the pinned runtime remains outstanding. One final quality-gate retry encountered a transient Next.js build lock; the subsequent full `npm run check` passed. An independently started development session was observed and left untouched.

`npm run db:up` could not bind port 27017 because an unrelated project's MongoDB already occupies it. That database was not used or stopped. Verification used:

```powershell
docker run -d --name mdadu-v1-integration -p 127.0.0.1:27018:27017 mongo:8
$env:INTEGRATION_MONGO_PORT='27018'
npm run verify
```

Integration runs create a uniquely named database and temporary media directory and clean them up. Browser checks used a separate `mdadu_v1_browser_test` database on this same test MongoDB instance. The browser test database was removed; development web/API servers and the test MongoDB container were stopped after verification. Restart only the test container with `docker start mdadu-v1-integration` for another run.

## Backend audit and changes

Existing dedicated auth, profiles, media, projects, castings, applications, talent, contact, admin and lightweight CMS modules were retained.

| Area | Evidence / changes | Remaining limits |
|---|---|---|
| Auth | Registration, login, remembered cookies, logout, session listing/revocation, forged-cookie rejection, suspension and one-use reset/session revocation tested. Added validated account email/mobile updates and member self-deactivation. | Google identity email changes require a separate verified linking flow and are rejected. Live Google/SMTP credentials unavailable. |
| Cookies/security | Unit tests verify production Secure, signed, httpOnly, SameSite and clearing scope. Integration checks missing/invalid CSRF, foreign origins, role/ownership denial, Helmet header, request IDs and sensitive rate limiting. | Full Stage 16 adversarial and browser matrix remains open. |
| Index startup | Found a real duplicate-application race on a fresh DB. Startup now awaits model initialization when auto-indexing is enabled. Unique application rejection is tested. | Production keeps auto-index disabled; run the existing index utility before accepting traffic in Stage 18. |
| Profiles/media | Tested save/preferences/bookmarks, image upload/access, PDF privacy, ownership, shared image visibility and portfolio removal. PDFs cannot become publicly readable even through a legacy public flag. Image/document types are checked for profile/application references. | Exhaustive concurrent shared-media lifecycle and visual image-quality review remain open. |
| Talent | Replaced both explicit `any` types; public birth dates removed; public search no longer matches private email. Saved-list details batch-load members, lists are paginated, add-member is bounded to 500, purpose and mutation audit events are persisted. | Broader filter boundary, large-data performance, concurrent mutation coverage remains open. |
| Projects/castings | Real CRUD foundations retained. Partial casting updates validate merged age/date values. Admin lists include real application counts. Closed/duplicate application rules tested. | Full CRUD boundary matrix, including duplicate-slug updates and all archive combinations, remains open. |
| Applications | Real member/admin workflows retained; statuses and private notes tested. Existing frontend apply helper now sends `showreelUrl`. | Approved public detail UI currently has no application form. Full browser apply/detail UAT is blocked by that missing approved control. |
| CMS | All seven content domains tested through draft/publish/archive. Added publish dates and exclusion of future-dated content from public lists/details, including search. SEO fields already existed. | Some editing controls are absent from frozen UI; see below. |
| Contact/admin | Contact persistence/status and admin dashboard tested. CI now includes isolated MongoDB integration verification and no deployment steps. | GitHub Actions result has not been observed; no push was performed. |

No schemas were consolidated into a generic platform domain. New fields are additive: profile saved opportunity ObjectIds, saved-list purpose, and CMS `publishedAt`. Existing records without `publishedAt` retain published visibility. Existing unique `(kind, slug)` settings/legal records are reused by frontend saves (`company`, `registration`, `privacy`, `terms`).

## Frontend integration

Existing markup, class names, CSS and visual ordering were preserved. Data changes naturally alter names, counts, rows, statuses, images, charts and empty collections. Existing toast and confirmation components handle feedback; no new visual system was added.

- Member: real dashboard/profile/application/opportunity/blog reads, profile/photo save, portfolio/resume uploads, portfolio removal, bookmarks, account/preferences, logout and deactivation. Unsupported profile-view/matching metrics show an unavailable value instead of fabricated statistics.
- Admin: real identity/role check/logout; dashboard/pipeline/growth/activity; server member/application search and filtering; verification; application review/status/notes; project create/edit; casting creation and applicant reads; CMS create/edit/publish/archive; saved-list create/read; contact resolve; company/legal save. Existing dialogs prevent duplicate form submission while requests are pending.
- Public: projects, castings, blog, gallery, team and talent collections use API data; project/casting/blog details use API data; older BTS/shows helper now reads the paginated envelope; contact submits to the API. Contact details load saved company settings with explicit missing-content placeholders. Unverified marketing counts no longer display fabricated numbers.

Browser checks in the Codex in-app browser passed for login, project creation, profile saving, account setting save, blog publication, public blog list/detail and logout. These checks do not constitute Chrome/Edge/Safari/mobile UAT or final visual approval.

## UI-freeze blockers — approval required before adding missing controls

The current approved screens do not provide all controls required by the checklist. These remain incomplete; the UI was not redesigned to add them:

- Member application submission/detail controls on the approved public detail page; the separate existing `ApplyForm` is not mounted there.
- Member skills/languages editing, showreel URL entry, resume removal and a public single-profile preview; session/device management controls.
- Admin suspend/reactivate controls; member invitation/creation workflow. Add Member now reports its unavailable backend workflow rather than inventing a record.
- Project publish/archive controls and cover/gallery/credits/trailer inputs; casting edit/close controls.
- Saved-list talent picker/remove/reorder/project-association controls. Existing list preview loads actual saved names; creation persists the list and purpose under the authenticated owner.
- CMS file-selection control (the approved upload box is only a static div), rich article body/tags/SEO inputs, gallery ordering, BTS project association and team social/order fields.
- Legal public reading routes/links and final reviewed content; footer subscription workflow.

Some old explanatory copy still refers to demo/backend work because approved copy was preserved. Fixture JSON files remain for existing type shapes/static configuration; active dashboard records are fetched from APIs. Unsupported generic duplicate actions report unavailable instead of false success. Archive is wired where an existing CMS/casting archive action is available; other domain archive actions remain incomplete.

## Other remaining work

- Full frontend loading/error/empty and mutation coverage, all browser routes, responsive matrix, accessibility and human visual review.
- Remaining backend audit/test edges noted in the table; performance/load testing and exhaustive rate-limit/upload/error-path verification.
- Real company/legal/contact/social facts and actual projects/team/media/editorial content.
- Hostinger SMTP, Google Client ID, S3 configuration and corresponding real-service verification.
- GitHub CI on Node 24.11.1, final UAT and approval. Stage 17 is **not complete**.

Stage 18 deployment remains untouched. No force push, `--force`, `--legacy-peer-deps`, new dependencies or real credentials were added.

## Changed files

- `.github/workflows/ci.yml`
- `README.md`
- `apps/api/src/main.ts`
- `apps/api/src/modules/applications/application.service.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.dto.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/castings/casting.service.ts`
- `apps/api/src/modules/media/media.service.ts`
- `apps/api/src/modules/platform/platform.dto.ts`
- `apps/api/src/modules/platform/platform.models.ts`
- `apps/api/src/modules/platform/platform.service.ts`
- `apps/api/src/modules/profiles/profile.dto.ts`
- `apps/api/src/modules/profiles/profile.model.ts`
- `apps/api/src/modules/profiles/profile.service.ts`
- `apps/api/src/modules/projects/project.service.ts`
- `apps/api/src/modules/talent/saved-list.model.ts`
- `apps/api/src/modules/talent/talent.controller.ts`
- `apps/api/src/modules/talent/talent.dto.ts`
- `apps/api/src/modules/talent/talent.service.ts`
- `apps/api/test/cookie-policy.spec.ts`
- `apps/web/src/components/admin/admin-applications-view.tsx`
- `apps/web/src/components/admin/admin-casting-view.tsx`
- `apps/web/src/components/admin/admin-contacts-view.tsx`
- `apps/web/src/components/admin/admin-content-view.tsx`
- `apps/web/src/components/admin/admin-dashboard-view.tsx`
- `apps/web/src/components/admin/admin-dialog.tsx`
- `apps/web/src/components/admin/admin-lists-view.tsx`
- `apps/web/src/components/admin/admin-members-view.tsx`
- `apps/web/src/components/admin/admin-notifications.tsx`
- `apps/web/src/components/admin/admin-projects-view.tsx`
- `apps/web/src/components/admin/admin-settings-view.tsx`
- `apps/web/src/components/admin/admin-shared.tsx`
- `apps/web/src/components/admin/admin-shell.tsx`
- `apps/web/src/components/admin/use-admin-dashboard.ts`
- `apps/web/src/components/admin/use-admin-records.ts`
- `apps/web/src/components/apply-form.tsx`
- `apps/web/src/components/member-data.tsx`
- `apps/web/src/components/member-workspace.tsx`
- `apps/web/src/components/site/about-page-view.tsx`
- `apps/web/src/components/site/blog-page-view.tsx`
- `apps/web/src/components/site/casting-page-view.tsx`
- `apps/web/src/components/site/contact-page-view.tsx`
- `apps/web/src/components/site/gallery-page-view.tsx`
- `apps/web/src/components/site/home-page-view.tsx`
- `apps/web/src/components/site/projects-page-view.tsx`
- `apps/web/src/components/site/static-detail-view.tsx`
- `apps/web/src/components/site/talent-page-view.tsx`
- `apps/web/src/components/site/team-page-view.tsx`
- `apps/web/src/components/site/use-public-data.ts`
- `apps/web/src/services/admin-workspace.ts`
- `apps/web/src/services/content.ts`
- `apps/web/src/services/workspace.ts`
- `apps/web/src/store/member-dashboard-store.ts`
- `docs/CODEX_COMPLETION_PLAN.md`
- `docs/V1_COMPLETION_VERIFICATION.md`
- `docs/progress.md`
- `scripts/integration-test.mjs`
- `scripts/verify-ui-freeze.mjs`
