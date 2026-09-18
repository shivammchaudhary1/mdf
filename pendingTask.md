# M. Dadu Films — Pending Work Master Task List

**Prepared:** 18 September 2026  
**Repository:** `shivammchaudhary1/mdf`  
**Audited branch:** `master`  
**Audited commit:** `57198f451c49131ac1678077d6dcd343aefb3523`  
**Current CI:** latest `master` CI is green (`npm ci`, quality gate, integration tests).  
**Deployment status:** **STOPPED / FROZEN until product completion + UAT approval.**

---

## Working Rules

- Do **not** deploy while this checklist is being completed.
- Work one group at a time.
- Keep the approved UI visually stable unless a missing BRD function genuinely requires a control.
- Do not put real secrets in GitHub or documentation.
- Use only two app roles in V1:
  - `SUPER_ADMIN`
  - `USER`
- Mobile number is required for normal registration, but **no OTP verification** is required in V1.
- Google login remains optional/configurable.
- Careers currently uses secure HTTPS resume/portfolio links rather than anonymous binary resume upload.
- No GraphQL, Redis, microservices, Kubernetes, AWS SES, WhatsApp, self-tape workflow, e-sign/NDA, or native mobile app in V1.

---

# Environment Convention — Mandatory Going Forward

The project must use this exact structure:

```text
apps/api/.env.dev
apps/api/.env.prod

apps/web/.env.dev
apps/web/.env.prod
```

Do not make `.env` or `.env.local` the project source of truth. but keep `.env.example`

### Important implementation task

The current repository does **not** automatically load these custom names:

- NestJS currently relies on default `ConfigModule.forRoot(...)` behavior.
- Next.js does not automatically treat `.env.dev` / `.env.prod` as standard environment filenames.

Therefore we must explicitly wire development and production scripts/config so:

```text
npm run dev        -> backend .env.dev + frontend .env.dev
production build   -> backend .env.prod + frontend .env.prod
seed command       -> backend .env.dev only
```

Production secrets must still remain uncommitted.

---

# GROUP 0 — Database Reset + Dev Seed Foundation

**Do this first because the development database is being deleted.**  
**Recommended batch size: complete this whole group together.**

- [ ] Create a complete **development-only seed script**.
- [ ] Seed script must load `apps/api/.env.dev`.
- [ ] Seed script must refuse to run when `NODE_ENV=production`.
- [ ] Seed script must be **idempotent** so it can safely be re-run.
- [ ] Create at least one deterministic `SUPER_ADMIN`.
- [ ] Create multiple normal `USER` accounts.
- [ ] Create matching member profiles with:
  - mobile
  - profession
  - city
  - gender
  - DOB
  - skills
  - languages
  - experience
  - availability
  - verification status
  - public visibility
- [ ] Seed public/private member combinations for talent-filter testing.
- [ ] Seed projects with mixed statuses and publish states.
- [ ] Seed castings with:
  - open
  - draft
  - closed
  - deadlines
  - age range
  - gender
  - experience
  - compensation
  - requirements
- [ ] Seed applications with every application status:
  - Submitted
  - Under Review
  - Shortlisted
  - Selected
  - Rejected
- [ ] Seed saved talent lists with member associations and project association.
- [ ] Seed blog posts:
  - draft
  - published
  - future-dated
- [ ] Seed Gallery.
- [ ] Seed BTS.
- [ ] Seed Shows/Media.
- [ ] Seed Team.
- [ ] Seed Our Work.
- [ ] Seed Company Settings.
- [ ] Seed legal placeholders/content for Privacy and Terms.
- [ ] Seed sample contact enquiries.
- [ ] Seed sample career applications.
- [ ] Avoid hard dependency on uploaded media so a clean DB can seed without manual S3/local uploads.
- [ ] Run/create all expected indexes after reset.
- [ ] Add clear commands such as:
  - `npm run db:seed:dev`
  - optionally `npm run db:reset:dev`
- [ ] Document dev seed credentials locally without exposing real production credentials.

**Completion criteria:** after deleting the database, one command recreates a usable local test dataset.

---

# GROUP 1 — Environment Loading & Local Developer Workflow

**Recommended batch size: 2–3 related tasks.**

- [ ] Wire backend development startup to `apps/api/.env.dev`.
- [ ] Wire backend production startup/build path to `apps/api/.env.prod`.
- [ ] Wire frontend development to `apps/web/.env.dev`.
- [ ] Wire frontend production build/runtime to `apps/web/.env.prod`.
- [ ] Decide whether to copy custom env files into standard Next env names during scripts or use an explicit env loader.
- [ ] Keep `.env.dev` and `.env.prod` ignored by Git.
- [ ] Add safe `.env.dev.example` and `.env.prod.example` templates if useful.
- [ ] Update README commands to match the new env convention.
- [ ] Update all seed/index/migration scripts so they use the intended environment explicitly.
- [ ] Verify:
  - local API starts on `8888`
  - local web starts on `3333`
  - local MongoDB connection uses dev DB only
  - production env is never accidentally loaded during development

**Completion criteria:** `npm run dev` works correctly using only `.env.dev` for both applications.

---

# GROUP 2 — Critical Functional Bugs / Data Integrity

**Do immediately after Groups 0–1.**  
**Recommended batch size: maximum 2 bugs at a time.**

## 2.1 CMS edit URL bug

- [ ] Fix `apps/web/src/components/admin/admin-content-view.tsx`.
- [ ] Current broken update path:

```ts
api(id ? `[object Object]/${id}` : path, ...)
```

- [ ] Replace with the correct content endpoint.
- [ ] Test edit for:
  - Our Work
  - Blog
  - Gallery
  - BTS
  - Shows
  - Team

## 2.2 Filtering + pagination consistency

- [ ] Audit all screens where a single fetched page is filtered client-side.
- [ ] Move important filtering to the server query before pagination.
- [ ] Prioritize:
  - admin castings
  - admin projects
  - admin CMS
  - admin members
  - applications
  - public collections where needed
- [ ] Reset page to `1` when search/filter changes.
- [ ] Verify total/pages/meta remain correct after filtering.

## 2.3 Error/loading/empty states

- [ ] Ensure real loading state on all API-heavy pages.
- [ ] Ensure API error is visible and actionable.
- [ ] Ensure empty states are real, not demo text.
- [ ] Ensure failed mutations do not leave false success state.

**Completion criteria:** no known broken edit endpoint or misleading pagination behavior remains.

---

# GROUP 3 — Member Profile / Portfolio Completion

**Recommended batch size: 2–3 controls at a time.**

- [ ] Make **skills editable**.
- [ ] Make **languages editable**.
- [ ] Add Showreel:
  - add
  - edit
  - remove
  - HTTPS URL validation
- [ ] Add Previous Work field if retained in V1 scope.
- [ ] Add/manage social links if retained in public member profile scope.
- [ ] Resume controls:
  - upload
  - replace
  - download/view
  - remove
- [ ] Portfolio:
  - verify max 8 rule
  - add
  - remove
  - duplicate protection
  - ownership protection
- [ ] Profile photo:
  - upload
  - replace
  - media privacy behavior
- [ ] Ensure profile completion calculation includes the final fields consistently.
- [ ] Improve field types:
  - date input for DOB
  - controlled gender options if desired
  - consistent availability values
- [ ] Test verified email lock.
- [ ] Test mobile update.
- [ ] Test deactivate account.

**Completion criteria:** every profile field supported by the backend that is part of V1 can be managed from the member UI.

---

# GROUP 4 — Public Talent Profile + Advanced Talent Filters

**This is a core V1 requirement.**  
**Recommended batch size: filters first, profile detail second.**

## 4.1 Advanced filters

Backend already supports much of this; frontend must expose it.

- [ ] Search by member/name.
- [ ] Profession/category.
- [ ] City.
- [ ] Gender.
- [ ] Age range.
- [ ] Skills.
- [ ] Languages.
- [ ] Experience.
- [ ] Availability.
- [ ] Verified only.
- [ ] Preserve pagination while filtering.
- [ ] Clear/reset filters.
- [ ] Mobile-friendly filter UI.
- [ ] Ensure private email/DOB never leaks from public API.

## 4.2 Public profile detail

- [ ] Add a public talent profile/detail route.
- [ ] Wire member **Preview Public Profile** button.
- [ ] Respect `publicVisible`.
- [ ] Show only approved public fields.
- [ ] Show verified badge.
- [ ] Show portfolio media.
- [ ] Show showreel where present.
- [ ] Do not expose resume/document publicly.
- [ ] Proper 404/not-visible behavior.
- [ ] Link talent cards to public profile where appropriate.

**Completion criteria:** talent discovery works as designed rather than only Actor/Crew/Writer tabs.

---

# GROUP 5 — Saved Talent Lists Completion

**Core V1 requirement.**  
**Recommended batch size: list membership first, association/reorder second.**

- [ ] Add talent picker/search inside a saved list.
- [ ] Reuse advanced talent filters in the picker where practical.
- [ ] Add member to list.
- [ ] Remove member from list.
- [ ] Delete list.
- [ ] Edit list:
  - name
  - purpose
- [ ] Add/change/remove associated `projectId`.
- [ ] Show project association in UI.
- [ ] Decide whether reorder/prioritization is required.
- [ ] If required, add ordering data + UI.
- [ ] Prevent duplicate members.
- [ ] Enforce backend max 500 members.
- [ ] Preserve ownership restrictions.
- [ ] Verify audit events where applicable.
- [ ] Test large-list pagination/performance.

**Completion criteria:** saved talent lists are actually usable for casting/production shortlisting.

---

# GROUP 6 — Projects & Casting Management Completion

**Recommended batch size: Projects first, Castings second.**

## 6.1 Projects

Already present: title, type, status, location, start date, cover, gallery, summary, publish.

Pending fields/work:

- [ ] Full description.
- [ ] Rich/body sections if required.
- [ ] End date.
- [ ] Credits.
- [ ] Credits text if retained.
- [ ] Trailer URL.
- [ ] Tags.
- [ ] Order/sort priority.
- [ ] Improve gallery replacement/retention behavior.
- [ ] Clear publish/unpublish action.
- [ ] Archive behavior.
- [ ] Verify duplicate slug handling.
- [ ] Public project detail renders all final fields.

## 6.2 Castings

Already present: title, project, role, category, location, deadline, age, gender, compensation, status, cover, description.

Pending:

- [ ] Shoot date.
- [ ] Experience requirement.
- [ ] Requirements.
- [ ] Tags.
- [ ] Summary/details if retained separately.
- [ ] Better project selector instead of exact project-name text matching.
- [ ] Publish/unpublish clarity.
- [ ] Close/reopen.
- [ ] Archive.
- [ ] Closed/deadline application prevention end-to-end.
- [ ] Public casting detail renders all final fields.
- [ ] Admin applicant workflow fully tested.

**Completion criteria:** project/casting admin forms expose the fields the backend and BRD actually expect.

---

# GROUP 7 — CMS Completion

**Recommended batch size: Blog first, then media CMS, then Team/Our Work.**

## 7.1 Blog / News

- [ ] Article body editor/input.
- [ ] Tags.
- [ ] SEO title.
- [ ] SEO description.
- [ ] Cover image.
- [ ] Optional additional media.
- [ ] Draft.
- [ ] Publish.
- [ ] Scheduled/future publish behavior.
- [ ] Archive.
- [ ] Edit existing post.
- [ ] Public list/detail.
- [ ] Weekly publishing workflow must be practical for admin.

## 7.2 Gallery

- [ ] Add image.
- [ ] Edit metadata/caption.
- [ ] Category.
- [ ] Ordering.
- [ ] Archive/delete behavior.
- [ ] Public rendering.
- [ ] Verify media visibility.

## 7.3 Behind the Scenes

- [ ] Add/edit media.
- [ ] Category.
- [ ] Associate with project.
- [ ] Caption/description.
- [ ] Ordering if required.
- [ ] Publish/archive.
- [ ] Public rendering.

## 7.4 Shows / Media

- [ ] External URL.
- [ ] Thumbnail/cover image if required.
- [ ] Platform.
- [ ] Publish date/scheduling.
- [ ] Ordering.
- [ ] Public rendering.

## 7.5 Team

- [ ] Photo.
- [ ] Name.
- [ ] Role.
- [ ] Group.
- [ ] Bio.
- [ ] Social links if required.
- [ ] Ordering.
- [ ] Publish/archive.
- [ ] Public rendering.

## 7.6 Our Work

- [ ] Confirm final fields/categories.
- [ ] Edit existing seeded records.
- [ ] Upload media.
- [ ] Ordering.
- [ ] Publish/archive.
- [ ] Public rendering.

**Completion criteria:** CMS is usable without editing source files.

---

# GROUP 8 — Member Sessions, Notifications & Admin UX Cleanup

**Recommended batch size: sessions + dead UI cleanup together.**

## 8.1 Session/device management

Backend APIs already exist.

- [ ] Show active sessions/devices in member settings.
- [ ] Mark current session.
- [ ] Revoke another session.
- [ ] Revoke current session safely.
- [ ] Logout all devices.
- [ ] Confirm cookie clearing behavior.

## 8.2 Member notification bell

Choose one:

- [ ] Implement real notifications, unread state and list.

**or**

- [ ] Remove/neutralize misleading notification UI from V1.

Do not leave a fake functional control.

## 8.3 Admin Add Member

Current UI opens a form but backend intentionally does not create members.

Choose one:

- [ ] Implement secure admin invitation/member creation.

**or**

- [ ] Remove/rename the Add Member control for V1.

Also remove production-inappropriate copy such as:

```text
Create a temporary member record for UI review.
```

**Completion criteria:** no visible control promises functionality that does not exist.

---

# GROUP 9 — Applications, Careers, Contact & Email Product Behavior

**Recommended batch size: Applications first; Careers/Contact second.**

## 9.1 Applications

- [ ] Project application end-to-end.
- [ ] Casting application end-to-end.
- [ ] Cover note.
- [ ] Portfolio selection.
- [ ] Showreel URL.
- [ ] Pitch.
- [ ] Optional document.
- [ ] Duplicate application protection.
- [ ] Deadline/closed opportunity rejection.
- [ ] Member list/detail.
- [ ] Admin list/detail.
- [ ] Status update.
- [ ] Private admin notes.
- [ ] Member status reflected immediately.
- [ ] Email behavior tested later with SMTP.

## 9.2 Careers

Current intentional design is URL-based CV/portfolio input.

- [ ] Validate all fields.
- [ ] Rate-limit test.
- [ ] Admin list/detail.
- [ ] Search/filter/pagination.
- [ ] Status update.
- [ ] Admin notes.
- [ ] Confirmation email path.
- [ ] Decide whether job openings themselves need a CMS or only general applications.

## 9.3 Contact

- [ ] Public contact submission.
- [ ] Admin inbox.
- [ ] Search/filter.
- [ ] Status:
  - New
  - Open
  - Replied
  - Resolved
  - Spam
- [ ] Reply workflow decision:
  - external mail client
  - or in-app SMTP composer
- [ ] Contact notification email.

**Completion criteria:** application/career/contact workflows are complete independent of deployment infrastructure.

---

# GROUP 10 — Media Architecture & Storage Alignment

**Recommended batch size: architecture decision first, implementation second.**

Current code stores:

```text
media/<mediaId>/thumb.webp
media/<mediaId>/profile.webp
media/<mediaId>/medium.webp
media/<mediaId>/large.webp
media/<mediaId>/document.pdf
```

Earlier desired logical structure was:

```text
assets/
  website-images/
  projects/
  castings/
  blog/
  gallery/
  team/
  bts/
  shows/

users/
  <userId>/
    profile-pic/
    portfolio-images/
    resume/
```

- [ ] Decide which storage-key design is the final V1 design.
- [ ] Make HLD/LLD and code match exactly.
- [ ] If folder/prefix design is retained:
  - update key generation
  - update validation
  - update delete/read behavior
  - define migration for existing media if required
- [ ] Keep S3 objects private.
- [ ] Keep API authorization for private documents.
- [ ] Confirm image variants:
  - thumb 400px
  - profile 800×800
  - medium 1200px
  - large 1920px
- [ ] Visual compression-quality test.
- [ ] Test:
  - JPEG
  - PNG
  - WebP
  - PDF
  - corrupt image
  - over 10 MB
  - over 40 megapixels
- [ ] Test several concurrent large uploads on a low-memory machine.
- [ ] Verify cleanup when image processing partially fails.
- [ ] Ensure no orphaned DB/media references after removals.

**Completion criteria:** media behavior and architecture documentation are consistent and tested.

---

# GROUP 11 — Settings, Legal, SEO & Real Content

**Recommended batch size: company/settings + legal; SEO separately.**

## 11.1 Company settings

Need real production values before launch:

- [ ] Legal company name.
- [ ] GST.
- [ ] CIN / registration details.
- [ ] Official email.
- [ ] Phone.
- [ ] Address.
- [ ] LinkedIn.
- [ ] Instagram.
- [ ] YouTube.
- [ ] Facebook if used.
- [ ] Final About/company content.
- [ ] Ensure header/footer/contact use database settings consistently.

## 11.2 Legal

- [ ] Final reviewed Privacy Policy.
- [ ] Final reviewed Terms & Conditions.
- [ ] Public-profile/talent visibility consent wording.
- [ ] Registration consent wording.
- [ ] Contact-form privacy wording.
- [ ] Legal pages load from CMS.
- [ ] No fake legal data.

## 11.3 SEO

- [ ] Page metadata audit.
- [ ] Canonical URLs.
- [ ] `robots.txt` / `robots.ts`.
- [ ] Sitemap validation.
- [ ] OpenGraph.
- [ ] Twitter metadata if desired.
- [ ] Favicon/site icons.
- [ ] Dynamic project/blog metadata.
- [ ] `noindex` where appropriate:
  - admin
  - member
  - login/reset/private pages
- [ ] Structured organization metadata if required.

## 11.4 Real public content

- [ ] Projects.
- [ ] Team.
- [ ] Gallery.
- [ ] BTS.
- [ ] Shows.
- [ ] Our Work.
- [ ] Blog posts.

**Completion criteria:** production content no longer depends on placeholders.

---

# GROUP 12 — Security, Quality, Accessibility & Final Code Audit

**Recommended batch size: security audit, then quality/accessibility.**

- [ ] Review Sonar findings from the latest code.
- [ ] Classify by:
  - bug
  - vulnerability
  - code smell
  - duplication
- [ ] Fix meaningful high/medium issues before launch.
- [ ] Verify no public sensitive-field leaks.
- [ ] Verify no passwords/tokens/cookies in logs.
- [ ] Verify request-body logging is safe.
- [ ] CSRF matrix.
- [ ] CORS/origin matrix.
- [ ] Role authorization.
- [ ] Ownership checks.
- [ ] ID guessing / unauthorized record access.
- [ ] Session revocation.
- [ ] Suspended-user behavior.
- [ ] Password reset single-use behavior.
- [ ] Rate limits.
- [ ] Upload restrictions.
- [ ] Private PDF access.
- [ ] Pagination/query bounds.
- [ ] 404/error response sanitization.
- [ ] Accessibility:
  - keyboard
  - focus
  - form labels
  - modal focus
  - contrast review
- [ ] Remove stale/demo/development wording.
- [ ] Remove dead imports/data dependencies where safe.
- [ ] Re-run:
  - `npm ci`
  - `npm run check`
  - `npm run test:integration`
  - `git diff --check`

**Completion criteria:** no known critical product/security blocker remains.

---

# GROUP 13 — Full Local / Pre-Production UAT

**Do not start deployment until this group is signed off.**

## Public routes

- [ ] Home.
- [ ] About.
- [ ] Our Work.
- [ ] Projects list/detail.
- [ ] Casting list/detail.
- [ ] Apply.
- [ ] Talent list/detail.
- [ ] Blog list/detail.
- [ ] Gallery.
- [ ] BTS.
- [ ] Shows.
- [ ] Team.
- [ ] Contact.
- [ ] Careers.
- [ ] Privacy.
- [ ] Terms.
- [ ] Sitemap.

## Member

- [ ] Signup.
- [ ] Login.
- [ ] Google login if enabled.
- [ ] Forgot/reset.
- [ ] Profile.
- [ ] Skills/languages.
- [ ] Profile photo.
- [ ] Portfolio.
- [ ] Resume.
- [ ] Showreel.
- [ ] Applications.
- [ ] Opportunities.
- [ ] Saved opportunities.
- [ ] Settings.
- [ ] Sessions.
- [ ] Logout.
- [ ] Account deactivation.

## Admin

- [ ] Dashboard.
- [ ] Members.
- [ ] Verify/unverify.
- [ ] Suspend/reactivate.
- [ ] Applications.
- [ ] Projects.
- [ ] Castings.
- [ ] Applicant review.
- [ ] Talent filters.
- [ ] Saved lists.
- [ ] Careers.
- [ ] Contacts.
- [ ] Blog.
- [ ] Gallery.
- [ ] BTS.
- [ ] Shows.
- [ ] Team.
- [ ] Our Work.
- [ ] Settings.
- [ ] Legal.

## Browsers / viewport matrix

- [ ] Chrome.
- [ ] Edge.
- [ ] Safari.
- [ ] Mobile Chrome.
- [ ] Mobile Safari.
- [ ] 360px.
- [ ] 768px.
- [ ] 1024px.
- [ ] 1440px.

**Completion criteria:** explicit human approval to begin deployment work.

---

# DEPLOYMENT WORK — FROZEN UNTIL GROUPS 0–13 ARE APPROVED

Everything below remains part of the master plan, but **we will not execute it now**.

---

# GROUP D1 — Production Database Preparation

- [ ] Create/confirm separate production MongoDB Atlas database.
- [ ] Use production-specific DB user.
- [ ] Generate strong production password.
- [ ] Rotate any credential previously exposed in chat or development.
- [ ] Apply least privilege.
- [ ] Restrict Atlas Network Access to the backend server IP where practical.
- [ ] Create required indexes before traffic.
- [ ] Use:

```env
MONGODB_AUTO_INDEX=false
```

in production.
- [ ] Confirm backup/snapshot/restore process.
- [ ] Create controlled first `SUPER_ADMIN`.
- [ ] Do not seed fake development data into production.

---

# GROUP D2 — Production Email / Google Identity

## Hostinger SMTP

- [ ] Official mailbox.
- [ ] SMTP host.
- [ ] SMTP port.
- [ ] SMTP username.
- [ ] SMTP password.
- [ ] `SMTP_FROM`.
- [ ] `CONTACT_EMAIL`.
- [ ] SPF.
- [ ] DKIM.
- [ ] DMARC.
- [ ] Real delivery test.

## Google Identity

If Google login is enabled:

- [ ] Production Google Client ID.
- [ ] Authorized UAT origin.
- [ ] Authorized production origin.
- [ ] Test first-time Google signup with required mobile flow.
- [ ] Test linked/verified email rules.

---

# GROUP D3 — AWS Infrastructure

Already prepared:

- [x] AWS account.
- [x] Root MFA.
- [x] IAM Identity Center admin.
- [x] AWS monthly budget.
- [x] Cost anomaly monitoring.
- [x] S3 bucket `mdadu-films-media`.
- [x] S3 public access blocked.
- [x] S3 encryption.
- [x] Scoped S3 IAM policy.
- [x] Programmatic S3 IAM credentials generated.
- [x] Lightsail instance.
- [x] Lightsail static IPv4 `15.252.229.24`.
- [x] HTTP 80 firewall.
- [x] HTTPS 443 firewall.
- [x] Application port `8888` is intended to remain private.

Still required:

- [ ] Review/rotate S3 access key before final launch if necessary.
- [ ] Confirm final IAM least privilege after storage-key decision.
- [ ] Server OS update.
- [ ] Node.js `24.11.1`.
- [ ] Nginx.
- [ ] systemd service.
- [ ] Production server directories/permissions.
- [ ] Production secret file permissions.
- [ ] Log rotation.
- [ ] Health checks.

---

# GROUP D4 — Backend Deployment Design

- [ ] Final production API env uses `apps/api/.env.prod`.
- [ ] Do not commit `.env.prod`.
- [ ] Configure:
  - `NODE_ENV=production`
  - `TRUST_PROXY=true`
  - `SWAGGER_ENABLED=false`
  - `MONGODB_AUTO_INDEX=false`
  - `STORAGE_DRIVER=s3`
- [ ] API process listens internally on `8888`.
- [ ] Do not expose port `8888` publicly.
- [ ] Nginx reverse proxy:
  - 80/443 public
  - proxy to API
- [ ] Forward:
  - Host
  - X-Real-IP
  - X-Forwarded-For
  - X-Forwarded-Proto
- [ ] Add release/versioned deployment layout.
- [ ] Add rollback strategy.
- [ ] Restart only after successful build.
- [ ] Health check after restart.

---

# GROUP D5 — Frontend / AWS Amplify

- [ ] Connect GitHub repository.
- [ ] Configure monorepo build.
- [ ] Build correct `apps/web` workspace.
- [ ] Make frontend production build use `apps/web/.env.prod`.
- [ ] Configure:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SITE_URL`
- [ ] Add UAT custom domain.
- [ ] Later attach final root/www domain.
- [ ] Verify redirects and HTTPS.
- [ ] Ensure admin/member routes work after refresh/direct URL.

---

# GROUP D6 — DNS / HTTPS / Cookie Architecture

Recommended UAT structure:

```text
uat.mdadufilms.com
api.mdadufilms.com
```

Final:

```text
mdadufilms.com
www.mdadufilms.com
api.mdadufilms.com
```

- [ ] API DNS A record -> Lightsail static IP.
- [ ] Amplify custom domain.
- [ ] TLS certificate.
- [ ] HTTP -> HTTPS redirect.
- [ ] Cookie domain decision.
- [ ] CORS origins.
- [ ] `FRONTEND_URL`.
- [ ] Validate signed secure cookie over HTTPS.
- [ ] Validate CSRF under real domains.
- [ ] Do not switch the current live root domain before UAT approval.

---

# GROUP D7 — CI/CD

Current GitHub Actions is CI only.

- [ ] Decide deployment trigger:
  - manual approved workflow
  - release/tag
  - protected production branch
- [ ] Keep CI mandatory before deployment.
- [ ] Build artifact/release.
- [ ] Backend deploy automation.
- [ ] Frontend Amplify deployment.
- [ ] Secrets management.
- [ ] Prefer short-lived/secure deployment auth over broad long-lived admin credentials.
- [ ] Health check.
- [ ] Automated or documented rollback.

---

# GROUP D8 — Production Monitoring / Backup / Operations

- [ ] API health monitoring.
- [ ] Nginx logs.
- [ ] API logs.
- [ ] disk usage.
- [ ] CPU/RAM review.
- [ ] MongoDB alerts.
- [ ] S3 failures.
- [ ] SMTP failures.
- [ ] AWS budget alerts.
- [ ] Cost anomaly alerts.
- [ ] Atlas backups.
- [ ] S3 recovery/versioning decision.
- [ ] Lightsail snapshot decision.
- [ ] Incident/rollback checklist.

---

# GROUP D9 — Production UAT & Go-Live

- [ ] Deploy to final infrastructure without public root-domain cutover.
- [ ] Test UAT hostname.
- [ ] Run all Group 13 UAT cases again against production infrastructure.
- [ ] Test real:
  - Atlas
  - S3
  - SMTP
  - Google login if enabled
- [ ] Fix production-only issues.
- [ ] Owner approval.
- [ ] Switch live root/www DNS.
- [ ] Re-run smoke tests.
- [ ] Monitor errors/costs after launch.

---

# Post-Launch

- [ ] Monitor first 24 hours.
- [ ] Monitor first 7 days.
- [ ] Review AWS cost.
- [ ] Review Atlas usage.
- [ ] Review media storage growth.
- [ ] Review SMTP delivery.
- [ ] Fix launch bugs.
- [ ] Maintain backup/restore notes.
- [ ] Move deferred features to V2 backlog.

---

# Recommended Execution Order From Now

```text
GROUP 0   Database reset + seed
    ↓
GROUP 1   .env.dev / .env.prod loading
    ↓
GROUP 2   Critical bugs
    ↓
GROUP 3   Member profile/portfolio
    ↓
GROUP 4   Advanced talent + public profile
    ↓
GROUP 5   Saved talent lists
    ↓
GROUP 6   Projects/castings
    ↓
GROUP 7   CMS
    ↓
GROUP 8   Sessions / notification / dead controls
    ↓
GROUP 9   Applications / Careers / Contact
    ↓
GROUP 10  Media architecture
    ↓
GROUP 11  Settings / legal / SEO / real content
    ↓
GROUP 12  Security / quality
    ↓
GROUP 13  Full UAT
    ↓
OWNER APPROVAL
    ↓
D1–D9     Deployment preparation + deployment
```

---

# Immediate Next Work

**Start only with GROUP 0.**

The next implementation should produce:

1. final dev seed dataset definition,
2. `seed-dev` script,
3. reset/seed command,
4. fixed test credentials,
5. validation that a fresh empty development database becomes fully usable.

Do not begin deployment work while any earlier product/UAT group remains open.
