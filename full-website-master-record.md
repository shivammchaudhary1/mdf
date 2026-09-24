# M. Dadu Films — Full Website Master Record

**Audit date:** 24 September 2026  
**Repository:** `shivammchaudhary1/mdf`  
**Repository:** https://github.com/shivammchaudhary1/mdf  
**Audited branch:** `master`  
**Audited master SHA:** `38ddb9b3f351d58514f6e4bef4fb76068d4bec9b`  
**Latest audited commit:** `check`  
**Remote branches at audit time:** only `master`

> This file is the current master-level project record. It compares the original M. Dadu Films V1 plan with the code that is actually present in today's `master`, and records remaining work, current CI/Sonar problems, security state, optimization opportunities, scaling direction and launch tasks.

---

## 1. Executive Summary

The platform is now much further ahead than the old September 18 completion checklist suggests. Most of the important V1 product is already implemented in `master`.

### Major V1 areas already present

- public M. Dadu Films website,
- secure authentication and server-side sessions,
- member/talent dashboard,
- member profile, portfolio, resume and showreel,
- public talent network and advanced filters,
- profile visibility and verification,
- projects,
- casting calls,
- applications,
- saved talent lists,
- Super Admin dashboard,
- contact queries,
- career applications,
- Blog CMS with rich text,
- dynamic public Blog,
- Gallery CMS,
- dynamic public Gallery,
- Services admin CMS,
- Team admin CMS,
- Company Settings,
- Legal Content with rich-text editing,
- media optimization,
- local/S3 storage abstraction,
- email foundation,
- SEO foundations,
- CSRF/origin protection,
- rate limiting,
- audit logs,
- automated repository/lint/type/test/build checks.

### But master is not production-ready yet

The main blockers are now release/stability work rather than feature construction:

1. **GitHub Actions is red on the current master.**
   - `npm run check` passes.
   - isolated integration testing fails at `scripts/integration-test.mjs:187`.

2. **SonarQube Cloud is not green.**
   - current master analysis reports failure/cancellation,
   - the major merged PR failed Sonar Quality Gate for duplication, reliability and security.

3. **Full Stage 17 UAT is not complete.**

4. **Production infrastructure has not been deployed.**
   - Amplify,
   - Lightsail,
   - Atlas,
   - S3 production config,
   - Hostinger SMTP/DNS,
   - monitoring,
   - backups.

5. **A few data-source gaps remain.**
   - public Services is still static,
   - About Us Core Team is still static,
   - BTS/Shows admin visibility needs a final product decision.

6. **Master is not protected.**
   - only `master` remains, which is clean,
   - but GitHub currently reports `protected: false`.

The correct phase is:

```text
stabilize master
    ↓
CI green
    ↓
Sonar green
    ↓
remaining CMS/data cleanup
    ↓
security + performance verification
    ↓
full UAT
    ↓
production deployment
```

---

# 2. Original Product Goal

The original requirement was not only a production-house brochure site. The product evolved into a combined website + talent community + casting/project administration platform.

## 2.1 Public website

Planned public areas:

- Home
- About Us
- Services
- Projects
- Casting
- Talents
- Gallery
- Blog
- Contact Us
- Careers
- Team
- Privacy
- Terms
- supporting editorial/content pages

## 2.2 Member / talent community

A registered member should be able to:

- create an account,
- provide mobile number without OTP in V1,
- create/edit a talent profile,
- upload profile photo,
- upload portfolio images,
- upload resume/supporting PDF,
- select skills/languages,
- add profession, experience and previous work,
- add social links,
- add showreel,
- control public profile visibility,
- browse opportunities,
- save opportunities,
- apply to project/casting opportunities,
- track application statuses,
- manage sessions/devices,
- edit settings,
- deactivate account.

## 2.3 Super Admin

Super Admin should manage:

- overview/metrics,
- members,
- verification,
- suspension/reactivation,
- projects,
- casting calls,
- applications,
- admin notes/status,
- saved talent lists,
- contacts,
- career applications,
- Gallery,
- Blog,
- Services,
- Team,
- Company Settings,
- Legal Content.

## 2.4 V1 technical constraints

Current implementation direction remains consistent with the original V1:

- Next.js + React + TypeScript frontend,
- NestJS + TypeScript backend,
- MongoDB/Mongoose,
- REST API + Swagger,
- signed secure server-side cookie sessions,
- no browser JWT architecture,
- no mobile OTP,
- no GraphQL in V1,
- no microservices/Kubernetes in V1,
- no Redis unless later scale actually requires it,
- deployment only after implementation/testing/UAT.

Current code calls the normal account role `MEMBER`. Older planning documents sometimes called it `USER`. Current code is authoritative:

```text
MEMBER
SUPER_ADMIN
```

---

# 3. Audit Basis

The audit used the current GitHub `master`, not an old feature branch.

Current remote state:

```text
branch: master
SHA: 38ddb9b3f351d58514f6e4bef4fb76068d4bec9b
commit: check
remote branches: master only
```

Historical planning was also recovered from repository commit:

```text
ab9d8ffc1ddb60cd9e42f8cf210b6d1f54857791
docs: prepare Codex V1 functional completion plan
```

That historical commit contained the old:

- `docs/CODEX_COMPLETION_PLAN.md`
- `docs/progress.md`
- `CODEX_START_HERE.md`
- `AGENTS.md`

Those old checklists are useful historical evidence, but they are now stale because a large amount of the “pending wiring” was implemented after 18 September.

---

# 4. Current Architecture

## Development

```text
Browser
   |
Next.js Web :3333
   |
REST API
   |
NestJS API :8888
   |
MongoDB
```

## Intended production direction

```text
Hostinger DNS
   |
   +---------------------+
   |                     |
AWS Amplify          API endpoint
Next.js Web               |
                          v
                    AWS Lightsail
                     NestJS API
                     /   |    \
                    v    v     v
                 Atlas   S3   Hostinger SMTP
```

This is a sensible low-cost initial V1 architecture.

It is **not yet a load-balanced API architecture**. A single Lightsail instance would be a single API node.

---

# 5. Full Feature Status Matrix

| Area | Status | Current master reality |
|---|---|---|
| Public website | DONE | Route set and public UI exist |
| Authentication | DONE, VERIFY | Register/login/logout/reset/Google/session architecture exists |
| Member dashboard | DONE, VERIFY | Uses real APIs |
| Member profile | DONE, VERIFY | Real read/update/media flow |
| Portfolio/resume | DONE, VERIFY | Upload/remove/replace paths exist |
| Opportunities | DONE, VERIFY | Real paginated API feed |
| Member applications | DONE, VERIFY | List/detail/status |
| Session management | DONE, VERIFY | list/revoke/logout-all |
| Public talent network | DONE, VERIFY | List/detail/privacy/advanced filters |
| Verification | DONE | Admin controls |
| Public profile visibility | DONE | Privacy-by-default controls |
| Profile views | DONE | Model/index exists |
| Projects | DONE, VERIFY | Admin CRUD + dynamic public list/detail |
| Castings | DONE, VERIFY | Admin CRUD/close/archive + dynamic public |
| Application admin | DONE, VERIFY | Search/detail/status/private notes |
| Saved talent lists | DONE, VERIFY | CRUD/member/project association |
| Contact inbox | DONE | Backend + admin |
| Career applications | DONE | Backend + admin |
| Blog CMS | DONE, VERIFY | Rich editor/scheduling/SEO/public dynamic |
| Gallery CMS | DONE, VERIFY | Admin + public dynamic sections/libraries |
| Services admin CMS | DONE | Full admin/backend CRUD |
| Public Services from CMS | PARTIAL | Still reads `website-data.json` |
| Team admin CMS | DONE | Full admin/backend CRUD |
| Public `/team` | DONE, VERIFY | Uses backend data |
| About Us Core Team | PARTIAL | Still static JSON |
| BTS public content | DONE, VERIFY | Generic content route |
| Shows public content | DONE, VERIFY | Generic content route |
| BTS/Shows admin nav | DECISION PENDING | Generic admin routes exist, sidebar hides them |
| Company Settings | DONE, VERIFY | Admin + backend + public use |
| Legal Content | DONE, VERIFY | Rich editor + Privacy/Terms |
| Email foundation | DONE | Nodemailer/dev outbox |
| Production SMTP | PENDING | Real credentials/delivery test |
| S3 adapter | DONE | Production configuration still pending |
| Atlas production | PENDING | Not deployed |
| Amplify production | PENDING | Not deployed |
| Lightsail production | PENDING | Not deployed |
| GitHub CI | PARTIAL | quality gate passes; integration step fails |
| Sonar Quality Gate | PENDING | Not green |
| Manual UAT | PENDING | Not signed off |
| Load testing | PENDING | No dedicated suite found |
| Browser E2E automation | PENDING | No Playwright/Cypress suite found |
| Monitoring/backups | PENDING | Production/post-launch work |

---

# 6. Completed Areas in More Detail

## 6.1 Authentication/security foundation

Current backend includes:

- registration,
- login,
- logout,
- logout-all,
- Google ID-token path,
- forgot/reset password,
- account update,
- account deactivation,
- session listing,
- session revoke,
- role guards,
- suspension controls.

Password handling uses Node `scrypt` with:

- random salt,
- versioned hash format,
- timing-safe comparison.

Sessions are server-side MongoDB records.

The raw session token is not stored directly. Database session records store a digest/hash and use TTL expiry.

Cookie behavior includes:

- signed session cookie,
- HttpOnly,
- Secure in production,
- SameSite Lax,
- CSRF cookie/token flow.

## 6.2 Member dashboard/profile

Current frontend calls real APIs such as:

```text
/member/profile
/member/dashboard
/member/applications
/member/opportunities
/member/settings
/auth/account
/auth/sessions
/auth/logout-all
/auth/deactivate
```

Profile functionality includes:

- profession,
- city,
- gender,
- birth date,
- skills,
- languages,
- experience,
- availability,
- bio,
- previous work,
- profile photo,
- portfolio,
- resume,
- showreel,
- social links,
- public visibility.

Public talent response intentionally excludes sensitive/private fields such as account email and exact birth date.

## 6.3 Media

Implemented protections/optimization:

- max 10 MB upload,
- JPEG/PNG/WebP only for images,
- valid PDF requirement for resume,
- 40 MP image limit,
- Sharp processing,
- WebP conversion,
- multiple image variants,
- ownership checks,
- media-purpose checks,
- role restrictions,
- private/public visibility,
- local storage adapter,
- S3 adapter,
- controlled storage-key regexes,
- server-side S3 encryption.

Public media API responses currently receive:

```text
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

Private media:

```text
Cache-Control: private, no-store
```

## 6.4 Projects

Admin supports:

- create,
- edit,
- archive,
- title/slug,
- type/status,
- summary/description/body,
- dates,
- location,
- cover,
- gallery,
- credits,
- trailer,
- links,
- tags,
- publish state,
- order.

Public list/detail is dynamic.

## 6.5 Casting

Admin supports:

- project link,
- role/category,
- age range,
- gender,
- location,
- shoot date,
- deadline,
- experience,
- compensation,
- requirements,
- details,
- cover,
- tags,
- publish,
- close,
- archive.

## 6.6 Applications

Application data supports:

- member/opportunity snapshots,
- cover note,
- pitch,
- showreel,
- portfolio media,
- optional document.

Workflow:

```text
Submitted
Under Review
Shortlisted
Selected
Rejected
```

Admin notes are private.

## 6.7 Talent search

Backend supports query-side filtering for:

- search,
- city,
- profession,
- gender,
- age,
- skills,
- languages,
- experience,
- availability,
- verification.

Useful Mongo indexes already exist for these patterns.

## 6.8 Saved Talent Lists

Implemented:

- list CRUD,
- purpose,
- project association,
- member add/remove,
- search,
- summary/detail.

## 6.9 Blog

Admin Blog currently supports:

- CRUD/archive,
- Draft/Published/Scheduled,
- rich text,
- tags,
- category,
- cover,
- featured,
- author/byline,
- publisher,
- summary,
- SEO title/description,
- publish scheduling.

Public Blog is backend-driven.

## 6.10 Gallery

Admin Gallery supports:

- batch uploads,
- image optimization,
- category/tags,
- featured state,
- publishing/scheduling,
- edit/archive/order.

Public Gallery is now backend-driven while preserving its existing design.

Sections:

```text
Featured Images
Behind the Scenes
Others
```

When no real published image exists, the frontend shows a proper empty state instead of fake placeholder cards.

## 6.11 Services

Admin Services CMS is implemented with:

- title,
- category,
- card description,
- image,
- order,
- modal title/eyebrow,
- overview,
- support points,
- ideal-for text,
- contact prefill,
- Draft/Published/Scheduled.

**Remaining:** public `/services` still uses static `website-data.json`.

## 6.12 Team

Admin Team supports:

- name,
- designation,
- group,
- short bio,
- detailed profile,
- focus areas,
- image,
- social links,
- order,
- publishing/scheduling.

Public `/team` can use backend records.

**Remaining:** About Us core-team section still uses `website-data.json`.

## 6.13 Company Settings

Admin manages:

- public name,
- legal name,
- tagline,
- description,
- email,
- phones,
- location,
- website,
- social links.

Public footer/contact/brand data can use these settings with verified static fallbacks.

## 6.14 Legal

Admin Legal manages:

- Privacy Policy,
- Terms,
- rich text,
- Draft/Published,
- effective date,
- version,
- GST,
- registration/CIN,
- registered address,
- jurisdiction,
- copyright.

Public `/privacy` and `/terms` support old seeded text and new rich HTML.

---

# 7. Current GitHub Actions Failure

This is the immediate technical blocker.

## Latest current-master workflow

```text
Workflow: CI
Run: #51
SHA: 38ddb9b3f351d58514f6e4bef4fb76068d4bec9b
Conclusion: failure
```

Run:

https://github.com/shivammchaudhary1/mdf/actions/runs/36003266695

## What passed

The latest workflow successfully passed:

- repository audit,
- ESLint,
- Web TypeScript,
- API TypeScript,
- API unit tests,
- Web build,
- API build.

So current master **does compile/build**.

## What fails

The failure is the isolated integration step:

```text
AssertionError [ERR_ASSERTION]
false !== true
scripts/integration-test.mjs:187
```

Current assertion checks:

```js
/talent?gender=Male
```

and expects the test member to be returned.

But the earlier test profile setup sets:

```text
city
profession
birthDate
skills
languages
publicVisible
```

and does **not** set:

```text
gender: Male
```

The production Talent service correctly filters against `profile.gender`.

Therefore this is most likely a **test fixture inconsistency**, not proof of a broken gender-filter implementation.

### Correct first fix

Add the expected gender to the test member setup, keep the assertion, then rerun:

```bash
npm run verify:local
```

Do not delete/weaken the gender assertion just to make CI green.

---

# 8. Other GitHub CI Warnings

## `glob@10.5.0`

`npm ci` warns about an old/deprecated `glob` version.

At the same time npm audit reports:

```text
found 0 vulnerabilities
```

So this is currently a maintenance/deprecation warning rather than an npm-audit failure.

Investigate with:

```bash
npm explain glob
npm outdated
```

Update the parent dependency safely rather than forcing packages.

## GitHub Actions Node runtime warning

GitHub warns that:

```text
actions/checkout@v4
actions/setup-node@v4
```

target a deprecated Node 20 action runtime and are being forced to a newer runner runtime.

This does not cause the current integration assertion.

Recommended:

- verify the currently supported action major versions,
- upgrade the workflow actions,
- optionally pin actions to full commit SHAs for stronger supply-chain protection.


# 9. SonarQube Cloud / SonarCloud Status

## 9.1 Current master check

For current master SHA:

```text
38ddb9b3f351d58514f6e4bef4fb76068d4bec9b
```

GitHub has a check named:

```text
SonarCloud Code Analysis
```

Current result:

```text
status: completed
conclusion: cancelled
title: SonarQube Cloud analysis failed
```

GitHub points to:

https://sonarcloud.io/dashboard?id=shivammchaudhary1_mdf&branch=master

The Sonar dashboard itself was not accessible through the audit interface, so this record does not invent individual current Sonar findings.

## 9.2 Verified Quality Gate failure on the large merged PR

PR #7:

https://github.com/shivammchaudhary1/mdf/pull/7

was large:

```text
44 commits
209 changed files
+18,278 lines
-4,409 lines
```

Its Sonar Quality Gate definitely failed with:

### New-code duplication

```text
5.3%
required <= 3%
```

### Reliability Rating

```text
E
required A
```

### Security Rating

```text
C
required A
```

Sonar reported 50 annotations.

The exact annotation list must be opened/exported from Sonar before doing broad cleanup.

## 9.3 Correct Sonar workflow from here

1. Make GitHub integration tests green.
2. Trigger a fresh Sonar analysis on that clean master.
3. Open Sonar issues and separate:
   - Security,
   - Reliability/Bugs,
   - Duplication,
   - Maintainability.
4. Fix Security first.
5. Fix Reliability second.
6. Reduce duplication.
7. Re-run the Quality Gate.
8. Only then make Sonar a mandatory master check.

### Visible duplication worth reviewing

Current `platform.service.ts` contains very similar rich-HTML validation for:

- Blog,
- Legal.

That should probably become one shared tested validator.

This is an independent code observation. It is **not being claimed as the exact Sonar duplication finding** until Sonar confirms it.

---

# 10. Security Audit

## 10.1 Security controls already in good shape

### Environment validation

Backend validates:

- `NODE_ENV`,
- port range,
- MongoDB URI,
- allowed frontend origins,
- cookie-secret minimum length,
- storage driver,
- required S3 variables,
- session duration,
- Mongo pool size,
- rate-limit values,
- audit retention,
- proxy mode,
- Swagger mode,
- Mongo auto-index mode.

Production defaults intentionally change important behavior:

```text
TRUST_PROXY = true
SWAGGER_ENABLED = false
MONGODB_AUTO_INDEX = false
```

### Secret hygiene

`.gitignore` currently excludes:

```text
.env
.env.*
```

and keeps:

```text
!.env.example
```

Targeted current-tree searches found no:

- `AKIA` access-key pattern,
- committed `mongodb+srv://` URI,
- AWS secret assignment,
- private-key marker,
- SMTP-password assignment.

This is useful, but it is not a complete scan of all historical commits.

Because the repository is public, production should still use:

- GitHub secret scanning,
- push protection,
- credential rotation for anything ever exposed elsewhere.

### HTTP hardening

Current API:

- disables `x-powered-by`,
- uses Helmet,
- enables HSTS in production,
- limits JSON body to 256 KB,
- limits URL-encoded body to 64 KB,
- uses global DTO validation,
- strips/rejects unknown DTO fields,
- uses exact configured CORS origins.

### Error handling

500-level errors return a generic message rather than stack traces.

Responses include request IDs.

### Request logging

Logger records:

```text
request ID
method
path
status
duration
```

It does not log:

- cookies,
- request body,
- password,
- session token.

### Session security

Current design uses:

- signed cookie,
- HttpOnly session cookie,
- Secure in production,
- SameSite Lax,
- hashed server-side token record,
- session TTL,
- revoke-one,
- logout-all,
- suspension/session invalidation.

### CSRF/origin

Authenticated mutations are protected by:

- origin rules,
- Sec-Fetch-Site check,
- CSRF cookie/header comparison.

### Rate limiting

Two levels are present:

1. general in-memory IP limiting,
2. shared Mongo-backed persistent limiting for sensitive endpoints.

Sensitive persistent limits cover:

- login,
- Google login,
- register,
- forgot password,
- reset password,
- contact,
- careers,
- media upload.

### Media security

Current code includes:

- media-purpose allow-list,
- role checks,
- ownership checks,
- 10 MB limit,
- MIME checking,
- PDF signature check,
- 40 MP image guard,
- Sharp re-encoding,
- safe storage-key allow-list,
- private/public visibility controls.

### Database indexes

Important current indexes include:

- account email/member code,
- session token/expiry/account,
- password-reset token/expiry,
- profile profession/city/public visibility,
- skills/public visibility,
- languages/public visibility,
- gender/birth date/public visibility,
- project slug/publish/status/type/tags,
- casting slug/status/deadline/project/category/tags,
- application uniqueness/member/opportunity/status,
- saved-list owner/project/name,
- profile-view dedupe and TTL,
- media owner/purpose/hash/visibility,
- contacts/careers status and date,
- CMS kind/slug/published/category/order,
- audit TTL,
- rate-limit TTL.

That is a solid starting point for a Mongo-backed V1.

---

# 11. Security Work Still Recommended

## 11.1 Content Security Policy is missing

Current Helmet configuration explicitly sets:

```ts
contentSecurityPolicy: false
```

Current Next config does not add a CSP.

This is important because Blog and Legal eventually render stored rich HTML.

The backend HTML allow-list is useful, but defense in depth should add:

- a deliberate CSP,
- a centralized safe-rich-text validator/sanitizer,
- malicious HTML regression tests.

Do not paste a generic CSP before final domains are known. The final policy must account for:

- web origin,
- API origin,
- image/media origin,
- Google Identity domains if Google login is enabled.

## 11.2 Centralize rich-text validation

Blog and Legal validation are very similar.

Recommended structure:

```text
apps/api/src/common/content/safe-rich-text.ts
```

Tests should reject:

- `<script>`,
- iframe/embed/object,
- inline `onclick`,
- `onerror`,
- arbitrary style,
- `javascript:` links,
- `data:` links,
- unsupported attributes,
- unsupported tags.

And allow only the required safe:

- paragraph,
- headings,
- bold/italic/underline,
- lists,
- blockquote,
- HTTPS/mailto links,
- line break/div if really needed.

This improves:

- security consistency,
- maintainability,
- Sonar duplication.

## 11.3 Master branch protection

Current GitHub metadata reports:

```text
master protected: false
```

This is now one of the biggest process risks.

Recommended GitHub Ruleset:

- require PR before master update,
- require `quality` check,
- require Sonar when Sonar becomes stable,
- block force push,
- block branch deletion,
- require branch up-to-date before merge.

You can still keep the repository clean.

Workflow:

```text
master
  |
  +-- fix/ci-integration
        |
        +-- PR
        +-- merge
        +-- delete branch
```

At rest, only master remains again.

## 11.4 Secret scanning

Since the repo is public:

- enable GitHub secret scanning,
- enable push protection,
- keep production env files out of Git,
- rotate any credential that has ever been shared insecurely.

## 11.5 General rate limit and multiple API instances

The sensitive limiter is shared in Mongo.

The general limiter is held in process memory.

One API instance:

```text
limit = configured limit
```

Three instances behind an ALB can effectively allow more requests because each process has its own bucket.

This is **not a blocker for one Lightsail V1 instance**.

When horizontal scaling is introduced, either:

- enforce broad limits at AWS WAF/edge,
- or use a shared limiter store such as Redis,
- or implement another centralized limiter.

Do not add Redis today only for a future problem.

---

# 12. Performance and Optimization Audit

## 12.1 Already optimized

### Mongo connection pool

Default backend configuration:

```text
maxPoolSize = 20
minPoolSize = 0
maxIdleTimeMS = 60000
serverSelectionTimeoutMS = 10000
socketTimeoutMS = 45000
```

This is reasonable for one small API instance.

### Frontend data cache

The frontend API layer includes:

- TTL query cache,
- Zustand-backed query state,
- in-flight GET deduplication,
- cache invalidation after mutations.

### Images

Images are not simply stored and served in their original size.

They are:

- decoded,
- resized,
- converted to WebP,
- stored in multiple variants.

### Public media caching

Public media is browser/cache friendly for one hour with stale revalidation.

---

## 12.2 Admin dashboard over-fetch

`useAdminDashboard()` currently requests:

- `/admin/dashboard`,
- every page of `/admin/applications`,
- every page of `/admin/content/blog`.

But the dashboard only needs:

- latest few applications,
- draft count,
- high-level metrics.

That is unnecessary at scale.

### Recommended change

Return these directly from the dashboard API:

```text
metrics
pipeline
growth
activity
latestApplications[3]
draftBlogCount
```

Then the Overview page does not download entire collections.

**Priority:** high before significant traffic/data growth.

---

## 12.3 Gallery currently loads all public Gallery rows

The dynamic public Gallery helper currently:

1. fetches Gallery in pages of 100,
2. fetches all remaining pages,
3. combines them,
4. classifies Featured/BTS/Others,
5. finally slices/paginates for the UI.

Fine with small data.

Poor with thousands of images.

### Better long-term API

Landing page:

```text
/content/gallery?tag=Featured&page=1&limit=20
/content/gallery?tag=Behind%20the%20Scenes&page=1&limit=20
/content/gallery?section=others&page=1&limit=20
```

Library:

```text
/content/gallery?section=featured-images&page=2&limit=20
```

Let MongoDB filter/paginate.

---

## 12.4 `allPages()` usage

Some admin flows load all Projects to populate selectors.

That is fine with dozens of projects.

When the collection grows, create a small options/search API returning only:

```text
id
title
status
```

instead of full records.

Audit all `allPages()` usages before scaling.

---

## 12.5 Regex search

Several CMS/admin searches use regex.

For V1-sized datasets this is acceptable.

At larger scale:

- Atlas Search is a better fit,
- indexed prefix queries may be enough for certain fields.

Do not add Elasticsearch for a small content database.

---

## 12.6 Public content caching

Some server-side content fetches use:

```text
cache: no-store
```

That guarantees freshness but produces an API/database request on every page request.

After UAT, consider revalidation for editorial/public content:

```text
30–300 seconds
```

or tag-based revalidation after publishing.

Good candidates:

- Blog,
- Team,
- Gallery,
- Services,
- relatively stable public Projects.

Do not add caching before confirming publishing behavior in UAT.

---

# 13. Remaining Data-Source Gaps

## 13.1 Public Services

Current state:

```text
Admin Services -> backend CMS
Public /services -> website-data.json
```

This was intentional earlier, but if the CMS should now control the live site, connect it.

Requirements:

- Published only,
- `order`,
- current UI unchanged,
- current modal behavior unchanged,
- good empty/fallback state.

## 13.2 About Us Core Team

Current state:

```text
/team -> backend-capable
About Us core team -> website-data.json
```

This can create duplicate content maintenance.

Recommended:

- use the published Team CMS as the people source for About Us,
- keep static section headings/copy in website JSON if desired.

## 13.3 BTS / Shows

Current code has:

- public generic content pages,
- generic admin content routing.

Current admin sidebar intentionally does **not** show BTS or Shows.

Make a final product decision:

1. keep hidden but supported,
2. restore admin navigation,
3. remove from V1 scope later.

This is not an urgent technical bug.

---

# 14. Media Delivery and Future CDN

Current public-media flow:

```text
Browser
   |
   v
NestJS /api/v1/media/...
   |
   v
Local disk or S3
```

This is simple and secure.

But even with S3, NestJS still reads/sends each public image.

At high traffic that makes the API a media bandwidth bottleneck.

## V1

Keep current behavior if traffic is low.

## Growth

Public images:

```text
Browser
   |
CloudFront
   |
private S3 + OAC
```

Private resumes/documents:

- keep authenticated API delivery,
- or use short-lived signed access later.

Do not expose the entire S3 bucket publicly.

---

# 15. Load Balancing

## Do we need an AWS load balancer now?

**No, not for the initial low-traffic V1.**

The simplest sensible launch is:

```text
Amplify Web
   |
one Lightsail API
   |
Atlas + S3
```

## Why the app can scale later

Important state already lives outside the API process:

- sessions -> MongoDB,
- persistent sensitive rate-limit buckets -> MongoDB,
- data -> MongoDB,
- production media -> S3.

Therefore multiple API nodes are possible later.

## Scaling stages

### Stage A — initial launch

- Amplify,
- one Lightsail API,
- Atlas,
- S3,
- Hostinger SMTP,
- HTTPS,
- monitoring,
- process restart,
- backups.

### Stage B — vertical scale

Before adding complexity:

- increase Lightsail CPU/RAM,
- tune queries,
- tune pool size,
- optimize Admin/Gallery over-fetch.

### Stage C — horizontal scale

When availability/traffic actually requires it:

```text
          ALB
       /       \
    API-1     API-2
       \       /
         Atlas
           |
           S3
```

At this point:

- move general rate limiting to shared/edge layer,
- re-check Atlas connection limits,
- consider CloudFront for public media.

### Stage D — larger operation

Only if usage justifies it:

- ECS/Fargate,
- autoscaling,
- WAF,
- CloudFront,
- Redis/shared cache.

Kubernetes is still unnecessary for this product unless operations grow dramatically.

---

# 16. MongoDB Scaling

Current default:

```text
MONGODB_MAX_POOL_SIZE = 20
```

One API instance:

```text
potential application pool ≈ 20
```

Four API replicas:

```text
potential application pools ≈ 80
```

plus Atlas/admin/background connections.

Therefore, when horizontally scaling:

```text
replicas × maxPoolSize
```

must stay within the Atlas tier's connection capacity.

Do not copy the same max pool blindly into many replicas.

---

# 17. Production Infrastructure Still Missing

The repo has local Docker database setup but no full production infrastructure-as-code or server config.

No current production setup was found for:

- Terraform,
- CloudFormation/CDK,
- Nginx,
- PM2,
- systemd,
- ALB,
- ECS,
- WAF,
- CloudFront,
- autoscaling.

That matches the original rule that deployment is the last stage.

## Stage 18 work

### Amplify

- connect master,
- production web env,
- custom domain,
- build verification,
- rollback plan.

### Lightsail API

- provision,
- install correct Node,
- deploy API,
- service/process manager,
- environment secrets,
- HTTPS/reverse proxy,
- firewall,
- health check,
- logs,
- restart policy.

### Atlas

- production cluster/project,
- least-privilege user,
- network rules,
- backups,
- restore test,
- indexes,
- region planning.

### S3

- private bucket,
- Block Public Access,
- encryption,
- IAM,
- upload/read/delete test.

### Hostinger

- DNS,
- SMTP,
- SPF,
- DKIM,
- DMARC where supported.

---

# 18. Email Readiness

Email foundation exists for:

- welcome/registration,
- password reset,
- application received,
- application status,
- contact acknowledgement,
- contact internal notification,
- career submission/status.

Development can write messages to a local private outbox.

Production needs real SMTP testing.

Required production checks:

1. SMTP auth,
2. From address,
3. password reset,
4. welcome,
5. contact confirmation,
6. internal contact notification,
7. application confirmation,
8. application status,
9. career confirmation/status,
10. deliverability/spam review.

---

# 19. Google Sign-In Readiness

Google flow exists.

Production needs:

- real Google Web Client ID,
- same ID frontend/backend,
- approved production JavaScript origin,
- production domain,
- real live sign-in test.

The current browser credential flow does not require a Google client secret in frontend code.

---

# 20. Testing State

## Unit tests currently found

- `auth.spec.ts`
- `cookie-policy.spec.ts`
- `foundation.spec.ts`
- `media-storage.spec.ts`
- `profile-limits.spec.ts`

These cover important foundations but not each domain independently.

## Integration coverage

The single large `scripts/integration-test.mjs` covers many system flows.

It is valuable, but one failed assertion stops the later sequence.

Longer term:

- keep the full smoke integration script,
- split key domains into smaller integration suites.

## Browser automation

No Playwright/Cypress suite was found.

Useful smoke tests before launch:

1. anonymous site load,
2. login,
3. profile save,
4. member application,
5. admin login,
6. project/casting CRUD,
7. Blog/Gallery publish,
8. verify published content appears publicly.

---

# 21. Manual UAT Checklist

Full manual UAT is still mandatory.

## Browsers

- Chrome desktop
- Edge desktop
- Safari desktop
- Chrome Android
- Safari iPhone

## Widths

```text
360
768
1024
1440
```

## Public

- Home
- About
- Services
- Projects list/detail
- Casting list/detail
- Talent list/detail
- Gallery
- Blog list/detail
- Contact
- Careers
- Privacy
- Terms
- Team
- Login/Signup

## Member

- register,
- login,
- logout,
- profile edit,
- profile photo,
- portfolio upload,
- portfolio replace/remove,
- resume,
- showreel,
- visibility,
- opportunities,
- saved opportunity,
- application,
- application status,
- settings,
- sessions.

## Admin

- dashboard,
- member search,
- verify/unverify,
- suspend/reactivate,
- applications,
- Projects,
- Castings,
- Saved Talent Lists,
- Contact Queries,
- Career Applications,
- Gallery,
- Blog,
- Services,
- Team,
- Company Settings,
- Legal.

## Error states

Test:

- API unavailable,
- empty state,
- invalid form,
- expired session,
- invalid CSRF,
- rate limit,
- invalid upload,
- slow/network error,
- archive confirmation,
- draft not public,
- scheduled content not public early.

---

# 22. Security Tests Still Worth Adding

Add or verify tests for:

- malicious Blog HTML,
- malicious Legal HTML,
- unsafe link schemes,
- unsupported rich-text attributes,
- admin route accessed by member,
- another member trying to read private resume,
- public media after content unpublish,
- session after suspension,
- current-session revoke,
- casting partial age/date update,
- public talent privacy,
- huge pagination limits,
- duplicate application,
- invalid ObjectId,
- scheduled-content visibility.

---

# 23. Documentation Problems Found

Some docs survived repository cleanup with commands that no longer exist.

## `docs/ENVIRONMENTS.md`

Still references old commands such as:

```text
db:reset:dev
db:seed:dev
```

Current `package.json` does not have them.

## `docs/BACKEND_V2.md`

Still references:

```text
scripts/migrate-backend-v2.mjs
```

That script is no longer in the current scripts directory.

## `docs/GROUP10_MEDIA_ARCHITECTURE.md`

Contains rollout/migration commands that no longer match current package scripts.

## `docs/GROUP11_SETTINGS_LEGAL_SEO.md`

References old content deployment scripts such as:

```text
db:content:dev
db:content:prod
```

which are not current root package scripts.

## Old progress checklist

The September 18 checklist says many member/admin API connections were still missing.

Current code shows they were subsequently implemented.

Therefore the old progress file must not be used as today's status without reconciliation.

## Role naming

Old docs use `USER`; actual current role model uses `MEMBER`.

Standardize documentation.

## Stale admin copy

Some text in admin screens still describes later-dynamic public content as static.

Examples worth cleaning:

- Blog admin static-public wording,
- Team admin wording around `/team` vs About core team.

---

# 24. Real-World Content Blockers

Do not invent these just to mark the platform done:

- official registered/legal company name,
- GST,
- CIN/registration,
- registered address,
- official social links unless verified,
- final lawyer-reviewed Privacy Policy,
- final lawyer-reviewed Terms,
- final legal consent wording,
- final real portfolio/project/casting content.

The current system correctly allows optional legal fields to remain blank.

---

# 25. Repository Governance Going Forward

The branch cleanup succeeded: only `master` remains remotely.

Keep that cleanliness, but use temporary branches for changes.

Recommended:

```text
master
  |
  +-- fix/ci-integration
      -> PR
      -> merge
      -> delete
```

Then:

```text
master
  |
  +-- fix/sonar-security
      -> PR
      -> merge
      -> delete
```

This keeps only master after work is merged but prevents direct broken updates.

---

# 26. Priority Task Plan

## P0 — Release blockers

### 1. Fix integration fixture

Make the test profile contain the gender the test expects.

### 2. Run full verification

```bash
npm ci
npm run verify:local
git diff --check
```

### 3. GitHub CI must be green

No release work before this.

### 4. Run clean Sonar analysis

Get exact issue list.

### 5. Fix Sonar Security C

Do not suppress findings blindly.

### 6. Fix Sonar Reliability E

Actual bugs before code-smell cleanup.

### 7. Duplication below 3%

Refactor only tested duplicated logic.

### 8. Protect master

Require CI/Sonar PR checks.

---

## P1 — Functional consistency

### 9. Connect public Services to CMS

If you now want Services controlled by admin.

### 10. Connect About core team to Team CMS

Avoid duplicate people data.

### 11. Decide BTS/Shows admin visibility

Keep hidden, expose in nav, or remove from V1.

### 12. Clean stale docs and admin copy

Make operations/documentation match current code.

---

## P1 — Security/optimization

### 13. Add CSP

After final domains are known.

### 14. Shared rich-text validator

Blog + Legal.

### 15. Remove Admin Overview over-fetch

Return summaries/latest items directly.

### 16. Audit `allPages()`

Avoid full-collection downloads where unnecessary.

### 17. Optimize Gallery API later

Server-side section filtering/pagination.

---

## P2 — Release validation

### 18. Performance baseline

Measure:

```text
p50
p95
p99
error rate
CPU
memory
Mongo latency
```

Test:

- Home,
- public content,
- talent filters,
- Gallery,
- media,
- login.

### 19. Browser UAT

Complete Section 21.

### 20. Real external integrations

- Hostinger SMTP,
- Google production auth,
- Atlas,
- S3.

---

## P3 — Deployment

Only after:

```text
GitHub CI green
Sonar green
UAT signed off
real content reviewed
legal content reviewed
backup plan ready
monitoring plan ready
```

Then deploy:

```text
Amplify
Lightsail
Atlas
S3
Hostinger DNS/SMTP
HTTPS
```

---

# 27. Initial Production Architecture Recommendation

For the likely initial traffic, use:

```text
Frontend  : AWS Amplify
Backend   : one monitored Lightsail API
Database  : MongoDB Atlas
Media     : private S3
Email     : Hostinger SMTP
DNS       : Hostinger
CI        : GitHub Actions
```

Do not add an ALB simply to make the architecture look more “enterprise”.

Add load balancing when:

- uptime requires redundancy,
- API CPU is consistently high,
- memory is constrained,
- concurrency grows,
- rolling/zero-downtime deployment is needed.

Before adding multiple API nodes, fix:

- shared general rate limit,
- pool-size math,
- observability,
- public-media CDN strategy.

---

# 28. Monitoring Required for Launch

## API

- health endpoint,
- uptime,
- restart alert,
- 5xx rate,
- p95 latency,
- CPU,
- RAM,
- disk,
- request IDs.

## Atlas

- connection count,
- CPU,
- slow queries,
- storage,
- backups.

## S3

- request errors,
- usage,
- unusual traffic.

## Email

- SMTP failures,
- delivery review.

## Product

- registrations,
- applications,
- uploads,
- contact messages,
- login/rate-limit failures.

---

# 29. Backups / Recovery

Before production:

## MongoDB

- enable Atlas backup,
- document recovery,
- perform a restore test.

## Media

For S3 decide:

- versioning,
- lifecycle,
- accidental-deletion recovery.

## Application

GitHub is source-code history, not a database/media backup.

---

# 30. Risk Register

| Risk | Severity | State | Action |
|---|---|---|---|
| Current master CI red | Critical for release | Open | Fix integration fixture |
| Sonar Security/Reliability gate | Critical for release | Open | Review exact Sonar issues |
| Master not protected | High | Open | Add ruleset |
| Production external integrations untested | High | Open | Stage 18 prep |
| Full UAT absent | High | Open | Complete Stage 17 |
| CSP absent | Medium/High | Open | Add final CSP |
| Public media traverses API | Medium at scale | Acceptable V1 | CDN later |
| General rate limiter local per API | Medium when multi-node | Acceptable single node | shared/WAF later |
| Services static/public split | Medium | Open | Connect if desired |
| About Team dual source | Medium | Open | Unify |
| Stale docs | Medium | Open | Reconcile |
| No load baseline | Medium | Open | Run load test |
| No browser E2E | Medium | Open | Add smoke tests if feasible |
| Legal/company final values | Launch/content blocker | Blocked by real data | Do not invent |

---

# 31. Things We Should Not Add Right Now

Do not distract the V1 with:

- GraphQL,
- Kubernetes,
- microservices,
- service mesh,
- event bus,
- Redis purely for appearance,
- Elasticsearch for a small CMS,
- native mobile app,
- complicated autoscaling before traffic exists,
- SES unless Hostinger SMTP becomes inadequate.

Finish and prove the current modular monolith first.

---

# 32. Exact Immediate Next Sequence

The next work should be:

```text
1. create temporary fix/ci-integration branch
2. fix gender fixture in integration test
3. npm run verify:local
4. push PR
5. confirm GitHub Actions green
6. merge/delete branch
7. rerun Sonar on clean master
8. collect exact Sonar issues
9. fix Security + Reliability
10. reduce duplication
11. protect master
12. remaining CMS/data-source cleanup
13. full UAT
14. production deployment
```

Do not start AWS deployment while CI and Sonar are red.

---

# 33. Useful Commands

Full verification:

```bash
npm ci
npm run verify:local
git diff --check
git status
```

Individual checks:

```bash
npm run audit:repo
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:up
npm run test:integration
```

Environment:

```bash
npm run env:check:dev
npm run env:check:prod
```

Indexes:

```bash
npm run db:indexes:dev
npm run db:indexes:prod
```

Dependency investigation:

```bash
npm explain glob
npm outdated
```

---

# 34. Important Links

Repository:

https://github.com/shivammchaudhary1/mdf

Current failing CI run:

https://github.com/shivammchaudhary1/mdf/actions/runs/36003266695

Current Sonar master dashboard referenced by GitHub:

https://sonarcloud.io/dashboard?id=shivammchaudhary1_mdf&branch=master

Large merged PR with verified failed Sonar Quality Gate:

https://github.com/shivammchaudhary1/mdf/pull/7

---

# 35. Important Current Files

## Architecture/ops

```text
README.md
package.json
.github/workflows/ci.yml
docs/ARCHITECTURE.md
docs/ENVIRONMENTS.md
docs/BACKEND_V2.md
docs/GROUP10_MEDIA_ARCHITECTURE.md
docs/GROUP11_SETTINGS_LEGAL_SEO.md
docs/GROUP12_HARDENING_STATE_OAUTH.md
```

## Security

```text
apps/api/src/main.ts
apps/api/src/config/environment.ts
apps/api/src/common/middleware/security.middleware.ts
apps/api/src/common/middleware/request-logger.middleware.ts
apps/api/src/common/filters/http-exception.filter.ts
apps/api/src/common/security/rate-limit.service.ts
apps/api/src/modules/auth/*
apps/api/src/modules/media/*
```

## Member

```text
apps/web/src/components/member-data.tsx
apps/web/src/components/member-workspace.tsx
apps/web/src/components/member/*
```

## Admin

```text
apps/web/src/components/admin/admin-dashboard-view.tsx
apps/web/src/components/admin/admin-members-view.tsx
apps/web/src/components/admin/admin-applications-view.tsx
apps/web/src/components/admin/admin-projects-view.tsx
apps/web/src/components/admin/admin-casting-view.tsx
apps/web/src/components/admin/admin-lists-view.tsx
apps/web/src/components/admin/admin-contacts-view.tsx
apps/web/src/components/admin/admin-careers-view.tsx
apps/web/src/components/admin/admin-blog-view.tsx
apps/web/src/components/admin/admin-gallery-view.tsx
apps/web/src/components/admin/admin-services-view.tsx
apps/web/src/components/admin/admin-team-view.tsx
apps/web/src/components/admin/admin-company-settings-view.tsx
apps/web/src/components/admin/admin-legal-view.tsx
```

## Public data

```text
apps/web/src/components/site/projects-page-view.tsx
apps/web/src/components/site/casting-page-view.tsx
apps/web/src/components/site/blog-page-view.tsx
apps/web/src/components/site/gallery-page-view.tsx
apps/web/src/components/site/gallery-library-view.tsx
apps/web/src/components/site/team-page-view.tsx
apps/web/src/components/site/services-page-view.tsx
apps/web/src/components/site/core-team-section.tsx
apps/web/src/components/site/use-public-data.ts
apps/web/src/services/content.ts
apps/web/src/services/gallery-content.ts
```

## Testing

```text
scripts/pre-uat-repo-audit.mjs
scripts/integration-test.mjs
apps/api/test/auth.spec.ts
apps/api/test/cookie-policy.spec.ts
apps/api/test/foundation.spec.ts
apps/api/test/media-storage.spec.ts
apps/api/test/profile-limits.spec.ts
```

---

# 36. Final Conclusion

The project is no longer in the “build the whole platform” phase.

Most of the intended V1 exists in the current master.

The remaining work is now primarily:

```text
integration stability
     ↓
Sonar/security quality
     ↓
repository governance
     ↓
small CMS/data-source consistency gaps
     ↓
performance/security verification
     ↓
manual UAT
     ↓
production infrastructure
     ↓
launch
     ↓
monitoring/stabilization
```

The most important thing from this point is **not adding unnecessary architecture**.

Finish the current system, prove it is green, secure the repository, test it with real production credentials/content, then deploy the simplest infrastructure that meets real traffic.

---

# 37. Master Record Maintenance Rule

After every major merge, update this file with:

```text
Audit date
Master SHA
Current CI status
Current Sonar status
Completed tasks
Remaining tasks
Production blockers
```

That gives the project one current source of truth even after temporary branches and older planning documents are removed.
