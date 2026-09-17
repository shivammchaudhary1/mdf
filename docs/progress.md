# M. Dadu Films Digital Platform — Development Progress

**Version:** 1.0.0  
**Checkpoint:** 2026-09-18  
**Deployment:** Stage 18 only  
**Canonical execution plan:** `docs/CODEX_COMPLETION_PLAN.md`

## Checklist rules

- `[ ]` not started / still missing
- `[~]` implemented or partially implemented, but final verification/integration is pending
- `[x]` implemented and verified
- `[!]` blocked by real content, credentials or human approval

Never mark `[x]` from code presence alone.

## Current repository checkpoint

Merged into `master`:
- [x] Public website redesign
- [x] Authentication UI redesign
- [x] Member dashboard UI
- [x] Super Admin dashboard UI
- [x] Admin interactions
- [x] Backend Core V2 modularization
- [x] Mongoose 9 query-filter compile fix
- [x] Secure opaque cookie/session architecture added
- [x] CSRF/origin/rate-limit security foundation added
- [x] ObjectId-based domain relationships added
- [x] Local/S3 media abstraction added

Current known blockers/work:
- [ ] GitHub CI green — currently blocked by two `no-explicit-any` lint errors in `talent.service.ts`
- [ ] Final merged-master integration suite passes
- [ ] Member UI fully connected to real APIs
- [ ] Admin UI fully connected to real APIs
- [ ] All demo dashboard behavior/data removed after real API wiring
- [ ] Stage 17 UAT complete
- [ ] Stage 18 deployment — intentionally not started

---

# Stage 0 — Project Inputs & Asset Collection

- [x] Final logo available
- [!] Company legal name
- [!] GST number
- [!] CIN/registration details
- [!] Official email
- [!] Phone
- [!] Address
- [!] Social links
- [!] YouTube/Instagram links
- [!] Final project/casting content
- [!] Team details/assets
- [!] Gallery/BTS assets
- [!] Blog content
- [!] Privacy/Terms final content

**Stage status:** `[~]` development can continue, but real production content remains blocked.

---

# Stage 1 — Repository & Foundation

- [x] Monorepo
- [x] Next.js + TypeScript frontend
- [x] NestJS + TypeScript backend
- [x] MongoDB + Mongoose
- [x] Swagger
- [x] Validation/error handling
- [x] Request logging
- [x] Environment examples
- [x] Docker MongoDB workflow
- [x] GitHub Actions quality workflow exists

**Stage status:** `[x]` foundation implemented. Current CI must be returned to green as part of completion work.

---

# Stage 2 — Design System & Reusable UI

- [x] Approved visual system implemented
- [x] Shared visual components implemented
- [~] Responsive/manual visual QA still requires human confirmation

**Stage status:** `[~]` UI is now frozen. Codex must not redesign it.

---

# Stage 3 — Public Website

- [x] Public route set implemented
- [x] Approved public UI implemented
- [~] Dynamic API/data verification pending for all relevant domains
- [!] Real GST/CIN/contact/social/company content missing
- [~] Final responsive/browser/manual review pending

**Stage status:** `[~]`

---

# Stage 4 — Authentication

Implemented:
- [x] Registration
- [x] Login
- [x] Logout backend
- [x] Remember session
- [x] Forgot/reset password
- [x] Password hashing
- [x] `USER` and `SUPER_ADMIN`
- [x] Signed `httpOnly` session-cookie architecture
- [x] Server-side session revocation
- [x] CSRF foundation
- [x] Route/role guard foundation

Still verify:
- [ ] Correct final frontend redirects
- [ ] Real logout from current member/admin UI
- [ ] Session/device management end to end
- [ ] Final merged-master integration suite

**Stage status:** `[~]`

---

# Stage 5 — Member Profile & Portfolio

Implemented foundation:
- [x] Profile schema/service/API
- [x] Profile photo/media relationships
- [x] Portfolio media relationships
- [x] Resume/document support
- [x] Profile completion logic
- [x] Verified-member field/admin control foundation

Still complete/verify:
- [ ] Current member UI uses real profile API everywhere
- [ ] Portfolio add/remove flow end to end
- [ ] External video/showreel flow end to end
- [ ] Settings flow end to end
- [ ] Public/private profile privacy review

**Stage status:** `[~]`

---

# Stage 6 — Media Upload & Optimization

Implemented:
- [x] Local storage adapter
- [x] S3-ready adapter
- [x] File size validation
- [x] MIME validation
- [x] Sharp processing
- [x] WebP variants
- [x] Profile/thumb/medium/large variants
- [x] Ownership checks
- [x] Private/public visibility foundation

Still verify:
- [ ] Large-image end-to-end upload
- [ ] Visual quality
- [ ] Published/shared visibility edge cases
- [ ] S3 production configuration later in Stage 18

**Stage status:** `[~]`

---

# Stage 7 — Projects & Casting Management

Backend implementation exists:
- [~] Project create/edit/archive
- [~] Project status/cover/gallery/description/credits/trailer
- [~] Casting create/edit/close/archive
- [~] Casting role/category/age/gender/location/shoot date/experience/compensation/deadline/requirements
- [~] Public list/detail APIs

Still complete:
- [ ] Admin UI wired to real project APIs
- [ ] Admin UI wired to real casting APIs
- [ ] Public list/detail behavior verified
- [ ] Partial-update validation edge cases verified
- [ ] Closed casting application rule verified on final master

**Stage status:** `[~]`

---

# Stage 8 — Application Workflow

Backend implementation exists:
- [~] Apply to project/casting
- [~] Cover note
- [~] Portfolio media
- [~] Showreel
- [~] Pitch
- [~] Optional document
- [~] Submitted/Under Review/Shortlisted/Selected/Rejected statuses
- [~] Member list/detail
- [~] Admin list/detail/update
- [~] Duplicate application rule

Still complete:
- [ ] Member UI wired to real application API
- [ ] Admin UI wired to real application API
- [ ] Status changes reflected end to end
- [ ] Email behavior verified

**Stage status:** `[~]`

---

# Stage 9 — Member Dashboard

- [x] Approved member-dashboard UI exists
- [~] Backend member-dashboard endpoint exists
- [ ] Replace demo JSON/dashboard values with real API data
- [ ] Replace demo logout with real logout
- [ ] Real recent applications
- [ ] Real opportunities
- [ ] Real profile completion/verification
- [ ] Final desktop/mobile functional verification

**Stage status:** `[~]`

---

# Stage 10 — Super Admin Dashboard

- [x] Approved Super Admin UI exists
- [~] Backend dashboard metrics/activity exists
- [~] Backend users/applications/projects/castings management APIs exist
- [ ] Replace admin demo JSON/fixture values with real APIs
- [ ] Verify/unverify wired
- [ ] Suspend/reactivate wired
- [ ] Application review/status/notes wired
- [ ] Project/casting management wired
- [ ] Final desktop/mobile functional verification

**Stage status:** `[~]`

---

# Stage 11 — Talent Search & Saved Lists

Backend implementation exists:
- [~] Search/name
- [~] City
- [~] Gender
- [~] Age range
- [~] Profession
- [~] Skills
- [~] Languages
- [~] Experience
- [~] Availability
- [~] Verified
- [~] Saved-list CRUD
- [~] Add/remove member
- [~] Optional project association

Current blocker:
- [ ] Remove two `no-explicit-any` lint errors in `talent.service.ts`

Still verify:
- [ ] Public privacy response
- [ ] Multiple-filter correctness
- [ ] Saved-list persistence
- [ ] Admin UI wiring
- [ ] Large-list query efficiency

**Stage status:** `[~]`

---

# Stage 12 — Blog / News CMS

- [~] Lightweight CMS backend includes blog
- [x] Admin blog UI exists
- [x] Public blog UI exists
- [ ] Wire admin blog UI to real API
- [ ] Verify create/edit/draft/publish/archive
- [ ] Verify cover/excerpt/rich content/tags/categories
- [ ] Verify SEO title/description
- [ ] Verify publish-date requirement
- [ ] Verify public list/detail/latest posts

**Stage status:** `[~]`

---

# Stage 13 — Gallery / BTS / Shows / Team CMS

- [~] Lightweight CMS backend foundation exists
- [x] Admin UI sections exist
- [x] Public UI sections exist
- [ ] Wire admin sections to real APIs
- [ ] Verify gallery upload/category/reorder/delete
- [ ] Verify BTS category/project relation
- [ ] Verify shows external links/thumbnails
- [ ] Verify team CRUD/social/order
- [ ] Verify public rendering from published API data

**Stage status:** `[~]`

---

# Stage 14 — Contact / Notifications / Email

Implemented:
- [~] Contact persistence/API
- [~] Admin contact workflow/API
- [x] Nodemailer service foundation
- [~] Password reset email path
- [~] Application received/status email path
- [~] Contact notification path

Blocked/remaining:
- [!] Hostinger SMTP credentials
- [ ] Real SMTP delivery test
- [ ] Admin contact UI real API wiring
- [ ] Welcome email only if still required by product scope

**Stage status:** `[~]`

---

# Stage 15 — Settings / Legal / Trust

- [~] Generic CMS supports `settings` and `legal`
- [x] Admin settings/legal UI exists
- [ ] Wire settings/legal UI to API
- [ ] Ensure singleton-like settings behavior where appropriate
- [!] Real company name/GST/CIN/email/phone/address/socials
- [!] Final Privacy Policy
- [!] Final Terms & Conditions
- [!] Final consent text

**Stage status:** `[~]`

---

# Stage 16 — Security & Quality Hardening

Security foundation implemented:
- [~] Input validation
- [~] Password security
- [~] Signed secure-cookie architecture
- [~] CSRF
- [~] CORS/origin rules
- [~] Helmet/security headers
- [~] Rate limiting
- [~] Upload restrictions
- [~] Admin authorization
- [~] Ownership checks
- [~] Session revocation
- [~] Audit logs
- [~] Safe request IDs/error filtering

Still verify:
- [ ] `npm run check` green
- [ ] No public sensitive-field leaks
- [ ] No unsafe debug/body/cookie logging
- [ ] Pagination/query bounds
- [ ] Accessibility regression review without visual redesign
- [ ] Error/loading/empty functional behavior
- [ ] Final security test coverage

**Stage status:** `[~]`

---

# Stage 17 — Full Testing & UAT

Automated:
- [ ] `npm run check`
- [ ] `npm run test:integration`
- [ ] GitHub Actions green
- [ ] Auth/session flows
- [ ] Profile/portfolio
- [ ] Projects/castings
- [ ] Applications
- [ ] Admin users
- [ ] Talent/saved lists
- [ ] CMS
- [ ] Contact/email local path

Manual:
- [ ] Chrome
- [ ] Edge
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] 360 / 768 / 1024 / 1440 functional review
- [ ] M. Dadu Films UAT
- [ ] Final content corrections
- [ ] Final approval

**Stage status:** `[ ]` not complete.

---

# Stage 18 — Production Deployment — LAST STAGE

Do not start until Stage 17 is approved.

- [ ] Amplify frontend
- [ ] Lightsail backend
- [ ] Atlas production DB
- [ ] S3
- [ ] Hostinger DNS/SMTP
- [ ] HTTPS
- [ ] Production secrets
- [ ] CI/CD deployment
- [ ] Production validation

**Stage status:** `[ ]` intentionally not started.

---

# Stage 19 — Post-Launch Stabilization

- [ ] Monitoring
- [ ] Usage review
- [ ] Logs
- [ ] Backups
- [ ] Bug fixes
- [ ] Support docs
- [ ] Future backlog

**Stage status:** `[ ]` not started.

---

# Deferred — Not V1

- [ ] Self-tape request workflow
- [ ] Advanced reel builder
- [ ] NDA/e-signature
- [ ] Script lock
- [ ] WhatsApp notifications
- [ ] Native mobile application
- [ ] GraphQL
- [ ] Redis
- [ ] Microservices
- [ ] Kubernetes
- [ ] AWS SES unless later requested

---

# Current stage summary

| Stage | Status |
|---|---|
| 0 Inputs | `[~]` real content blocked |
| 1 Foundation | `[x]` |
| 2 Design System | `[~]` UI frozen; manual QA remains |
| 3 Public Website | `[~]` dynamic/content verification remains |
| 4 Authentication | `[~]` final integration verification |
| 5 Profile/Portfolio | `[~]` real UI/API wiring verification |
| 6 Media | `[~]` implementation present; QA remains |
| 7 Projects/Casting | `[~]` backend present; frontend/test wiring remains |
| 8 Applications | `[~]` backend present; frontend/test wiring remains |
| 9 Member Dashboard | `[~]` UI present; real API wiring remains |
| 10 Admin Dashboard | `[~]` UI/backend present; real API wiring remains |
| 11 Talent | `[~]` backend present; lint/UI/tests remain |
| 12 Blog | `[~]` CMS/UI present; wiring/tests remain |
| 13 Gallery/BTS/Shows/Team | `[~]` CMS/UI present; wiring/tests remain |
| 14 Contact/Email | `[~]` backend present; SMTP/UI verification remains |
| 15 Settings/Legal | `[~]` foundation present; content/wiring remains |
| 16 Security | `[~]` major foundation present; final verification remains |
| 17 Testing/UAT | `[ ]` |
| 18 Deployment | `[ ]` |
| 19 Stabilization | `[ ]` |

## Current Codex priority

Follow `docs/CODEX_COMPLETION_PLAN.md` in order.

The immediate order is:

1. make `npm run check` green,
2. make integration tests green,
3. audit backend requirement gaps,
4. wire member UI to real APIs without visual changes,
5. wire admin UI to real APIs without visual changes,
6. verify public dynamic data,
7. finish security/testing/docs,
8. stop before Stage 18.
