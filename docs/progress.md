# M. Dadu Films Digital Platform â€” Development Progress

**Version:** 1.0.0  
**Prepared for:** M. Dadu Films  
**Prepared by:** Shivam Chaudhary  
**Status:** Planning â†’ Development  
**Deployment:** Final stage only  
**Primary rule:** Every stage must be testable before moving to the next stage.

> **Codex checklist rule:** This file is the canonical checklist. Codex may mark an item `[x]` only after implementation and relevant verification pass. If blocked by missing real content, use `[!]` plus a reason and continue another independent task. Do not mark deployment work before Stage 18.


---

## Progress Legend

- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked / needs input

---

# Stage 0 â€” Project Inputs & Asset Collection

> 2026-09-17 UI alignment checkpoint: repository cleanup/flattening is complete.
> The active priority is Stage 2–3 visual alignment and responsive QA using
> docs/DESIGN_SYSTEM.md plus docs/references/ui/.
> Preserve working auth/profile/media/API behavior while refining presentation.
> Do not continue into later feature stages unless explicitly requested.
> Human visual approval must not be marked complete by Codex.
## Goal
Collect everything required before coding so development does not stop later.

### Required from M. Dadu Films
- [x] Final logo files
- [!] Company legal name â€” blocked: input template unfilled; verified legal name not supplied.
- [!] GST number â€” blocked: real GST number not supplied.
- [!] Company registration / CIN details â€” blocked: verified registration details not supplied.
- [!] Official email address â€” blocked: verified production content not supplied.
- [!] Phone number â€” blocked: verified production content not supplied.
- [!] Office / business address â€” blocked: verified production content not supplied.
- [!] Social media links â€” blocked: verified production content not supplied.
- [!] YouTube channel link â€” blocked: verified production content not supplied.
- [!] Instagram profile link â€” blocked: verified production content not supplied.
- [!] Existing project names and details â€” blocked: verified production content not supplied.
- [!] Running project details â€” blocked: verified production content not supplied.
- [!] Upcoming project details â€” blocked: verified production content not supplied.
- [!] Team member names, roles, photos, bios â€” blocked: verified production content not supplied.
- [!] Gallery / behind-the-scenes images â€” blocked: verified production content not supplied.
- [!] Hero/banner images â€” blocked: verified production content not supplied.
- [!] Casting / vacancy sample data â€” blocked: verified production content not supplied.
- [!] Blog/article sample content â€” blocked: verified production content not supplied.
- [!] Contact details â€” blocked: verified production content not supplied.
- [!] Privacy Policy content or approval to use a basic draft â€” blocked: verified production content not supplied.
- [!] Terms & Conditions content or approval to use a basic draft â€” blocked: verified production content not supplied.

### Exit Criteria
- [ ] Core company details received
- [x] Enough images/content available to build the first frontend version

---

# Stage 1 â€” Repository & Project Foundation

> Starter monorepo created. Install dependencies and run locally before marking this stage complete.

## Goal
Create a clean development setup for frontend and backend.

### Frontend
- [x] Create Next.js project
- [x] Enable TypeScript
- [x] Configure Tailwind CSS
- [x] Configure global theme variables
- [x] Add typography system
- [x] Add brand colors
- [x] Add reusable layout structure
- [x] Add environment configuration
- [x] Add ESLint / formatting rules

### Backend
- [x] Create NestJS project
- [x] Use Node.js 24.11.1
- [x] Configure TypeScript
- [x] Configure environment variables
- [x] Configure MongoDB connection
- [x] Configure Mongoose
- [x] Configure Swagger / OpenAPI
- [x] Add validation pipeline
- [x] Add global exception handling
- [x] Add request logging

### Git
- [x] Create repository structure
- [x] Add `.gitignore`
- [x] Add `.env.example`
- [x] Add README
- [x] Add branch strategy
- [x] Add initial commits

### Testing
- [x] Frontend runs locally
- [x] Backend runs locally
- [x] Backend health API works
- [x] MongoDB connection works
- [x] Swagger opens correctly

### Exit Criteria
- [x] Frontend + backend boot successfully
- [x] Basic development environment is stable

---

# Stage 2 â€” Design System & Reusable UI

## Goal
Convert the finalized visual direction into reusable components.

### Design System
- [x] Final logo integration
- [x] White/light theme foundation
- [x] Cinematic red accent
- [x] Black/charcoal text system
- [x] Serif heading font
- [x] Sans-serif UI/body font
- [x] Spacing scale
- [x] Border radius system
- [x] Shadow system
- [x] Button variants
- [x] Form styles
- [x] Card styles
- [x] Badge styles
- [x] Status colors

### Shared Components
- [x] Navbar
- [x] Mobile navbar
- [x] Footer
- [x] Section heading
- [x] CTA buttons
- [x] Project card
- [x] Casting card
- [x] Blog card
- [x] Team card
- [x] Gallery card
- [x] Empty state
- [x] Loading state
- [x] Error state
- [x] Modal / confirmation dialog

### Responsive Testing
- [ ] Mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Desktop

### Exit Criteria
- [ ] Reusable component library is ready
- [ ] Main layouts match approved UI direction

---

# Stage 3 â€” Public Website

## Goal
Build all public-facing pages first.

### Pages
- [x] Home
- [x] About Us
- [x] Projects
- [x] Project Details
- [x] Casting / Vacancies
- [x] Casting Details
- [x] Gallery
- [x] Behind the Scenes
- [x] Shows / Media
- [x] Team
- [x] Blog / Latest Posts
- [x] Blog Details
- [x] Contact Us
- [x] Login
- [x] Sign Up

### Home Page Sections
- [x] Hero section
- [x] Brand message
- [x] Running / upcoming projects
- [x] Open casting calls
- [x] Talent community CTA
- [x] Behind the scenes
- [x] Shows / media
- [x] Latest blog posts
- [x] Why M. Dadu Films
- [x] Team preview
- [x] GST / registration trust section
- [x] Footer

### Content
- [ ] GST details displayed
- [ ] Company registration details displayed
- [ ] Social links
- [ ] Official contact details

### Testing
- [ ] All routes work
- [ ] No broken links
- [ ] Responsive layouts work
- [ ] Forms visually validate
- [ ] Images load efficiently
- [x] SEO metadata added

### Exit Criteria
- [ ] Public website complete with static/sample data
- [~] Visual alignment in progress — final human review is still required

---

# Stage 4 â€” Authentication

## Goal
Allow members to securely create accounts and sign in.

### Features
- [x] User registration
- [x] Full name
- [x] Email
- [x] Mobile number
- [x] Password
- [x] Confirm password
- [x] Login
- [x] Logout
- [x] Remember session
- [x] Forgot password
- [x] Reset password
- [x] Secure cookies / token handling
- [x] Password hashing
- [x] Route protection
- [x] Role support

### Roles
- [x] `SUPER_ADMIN`
- [x] `USER`

### Notes
- [x] Mobile number is required
- [x] Mobile OTP verification is NOT required in V1

### Testing
- [x] Registration success
- [x] Duplicate email blocked
- [x] Invalid login blocked
- [x] Protected routes blocked when logged out
- [ ] Correct redirect after login
- [x] Logout clears session

### Exit Criteria
- [ ] Authentication flow stable
- [ ] Super Admin and User roles work correctly

---

# Stage 5 â€” Member Profile & Portfolio

## Goal
Allow a registered member to become part of the M. Dadu Films community.

### Profile
- [x] Profile photo
- [x] Full name
- [x] Mobile number
- [x] Email
- [x] Bio
- [x] City / location
- [x] Profession / category
- [x] Skills
- [x] Languages
- [x] Experience
- [x] Availability
- [x] Social links
- [x] YouTube / Vimeo links
- [x] Optional resume/document

### Portfolio
- [x] Portfolio photos
- [x] Portfolio videos via external links
- [x] Showreel link
- [x] Previous work
- [x] Profile completion percentage
- [x] Edit profile
- [x] Manage portfolio

### Verification
- [x] Verified member badge
- [x] Badge controlled only by Super Admin

### Testing
- [x] Create profile
- [x] Edit profile
- [x] Upload profile photo
- [ ] Add portfolio images
- [ ] Add external video links
- [x] Profile completion calculation works

### Exit Criteria
- [ ] User profile + portfolio fully usable

---

# Stage 6 â€” Media Upload & Image Optimization

## Goal
Store media efficiently while keeping image quality high.

### Storage
- [x] Local development storage adapter
- [x] S3-ready storage abstraction
- [x] Secure upload validation
- [x] File size validation
- [x] MIME validation

### Image Processing
- [x] Sharp integration
- [x] WebP conversion
- [x] Profile image optimization
- [x] Thumbnail generation
- [x] Medium image generation
- [x] Large image generation
- [ ] Preserve good visual quality
- [x] Remove unnecessary metadata where appropriate

### Target Sizes
- [x] Profile: approx. 800Ã—800
- [x] Thumbnail: approx. 400px
- [x] Portfolio medium: approx. 1200px
- [x] Gallery large: approx. 1600â€“1920px

### Testing
- [ ] Large image uploads successfully
- [x] Compressed version is generated
- [ ] Output image remains visually high quality
- [x] Database stores correct media references

### Exit Criteria
- [ ] Media workflow ready for local development and future S3 deployment

---

# Stage 7 â€” Projects & Casting Management

## Goal
Create the core film/project opportunity system.

### Projects
- [ ] Create project
- [ ] Edit project
- [ ] Delete/archive project
- [ ] Running project
- [ ] Upcoming project
- [ ] Completed project
- [ ] Cover image
- [ ] Gallery images
- [ ] Description
- [ ] Project status
- [ ] Team / credits
- [ ] Trailer link

### Casting Calls
- [ ] Create casting call
- [ ] Edit casting call
- [ ] Close casting call
- [ ] Role name
- [ ] Category
- [ ] Age range
- [ ] Gender preference
- [ ] Location
- [ ] Shoot date
- [ ] Experience
- [ ] Compensation text
- [ ] Application deadline
- [ ] Requirements

### Testing
- [ ] Public projects list
- [ ] Public project details
- [ ] Public casting list
- [ ] Public casting details
- [ ] Closed casting cannot accept applications

### Exit Criteria
- [ ] Project and casting modules are fully functional

---

# Stage 8 â€” Project Application Workflow

## Goal
Allow members to apply to film projects and casting opportunities.

### User Application
- [ ] Apply to project
- [ ] Apply to casting role
- [ ] Cover note
- [ ] Select portfolio images
- [ ] Add showreel/video link
- [ ] Script pitch if applicable
- [ ] Optional document upload
- [ ] Submit application

### Statuses
- [ ] Submitted
- [ ] Under Review
- [ ] Shortlisted
- [ ] Selected
- [ ] Rejected

### Member Dashboard
- [ ] My Applications
- [ ] Application details
- [ ] Application status
- [ ] Recent applications
- [ ] Recommended opportunities

### Testing
- [ ] User can apply
- [ ] Duplicate application rules work
- [ ] Admin receives application in dashboard
- [ ] Status changes show to user

### Exit Criteria
- [ ] Complete user-to-admin application flow works

---

# Stage 9 â€” Member Dashboard

## Goal
Create the approved member dashboard experience.

### Dashboard
- [ ] Welcome section
- [ ] Profile completion
- [ ] Verification status
- [ ] Profile summary
- [ ] Portfolio preview
- [ ] Showreel preview
- [ ] Recent applications
- [ ] Recommended projects
- [ ] Latest M. Dadu Films posts
- [ ] Quick actions

### Navigation
- [ ] Dashboard
- [ ] Explore opportunities
- [ ] My Profile
- [ ] My Portfolio
- [ ] My Applications
- [ ] Settings

### Mobile
- [ ] Bottom navigation
- [ ] Mobile profile UI
- [ ] Mobile applications UI
- [ ] Mobile portfolio UI

### Exit Criteria
- [ ] Member experience works on desktop and mobile

---

# Stage 10 â€” Super Admin Dashboard

## Goal
Create the management system for the entire platform.

### Dashboard Metrics
- [ ] Total users
- [ ] Verified members
- [ ] New members
- [ ] Open projects
- [ ] Open casting calls
- [ ] Total applications
- [ ] Pending reviews
- [ ] Recent activity

### User Management
- [ ] View all users
- [ ] Search users
- [ ] View member details
- [ ] Verify / unverify member
- [ ] Suspend / reactivate user if required

### Applications
- [ ] View all applications
- [ ] View project-wise applications
- [ ] Filter by status
- [ ] Update application status
- [ ] Internal admin notes

### Project Management
- [ ] Add project
- [ ] Edit project
- [ ] Archive project
- [ ] Manage castings

### Mobile Admin
- [ ] Admin dashboard mobile view
- [ ] Users mobile view
- [ ] Applications mobile view
- [ ] Projects mobile view

### Exit Criteria
- [ ] Super Admin can manage the platform without database access

---

# Stage 11 â€” Talent Search, Filters & Saved Lists

## Goal
Make the database useful for casting and production decisions.

### Talent Filters
- [ ] Name
- [ ] City
- [ ] Gender
- [ ] Age / age range
- [ ] Profession / category
- [ ] Skills
- [ ] Languages
- [ ] Experience
- [ ] Availability
- [ ] Verified only

### Saved Talent Lists
- [ ] Create list
- [ ] Rename list
- [ ] Delete list
- [ ] Add member to list
- [ ] Remove member from list
- [ ] Associate list with project optionally

### Testing
- [ ] Filters return correct users
- [ ] Multiple filters work together
- [ ] Saved talent lists persist correctly

### Exit Criteria
- [ ] Admin talent database is usable for real casting work

---

# Stage 12 â€” Blog / News / Content Management

## Goal
Allow M. Dadu Films to publish weekly content.

### Blog
- [ ] Create post
- [ ] Edit post
- [ ] Draft
- [ ] Publish
- [ ] Archive
- [ ] Cover image
- [ ] Excerpt
- [ ] Rich content
- [ ] Tags / categories
- [ ] SEO title
- [ ] SEO description
- [ ] Publish date

### Public
- [ ] Blog listing
- [ ] Blog details
- [ ] Latest posts on homepage
- [ ] Share-friendly URLs

### Exit Criteria
- [ ] Super Admin can publish weekly content without developer help

---

# Stage 13 â€” Gallery, BTS, Shows & Team CMS

## Goal
Make all major public content manageable through admin.

### Gallery
- [ ] Upload images
- [ ] Categories
- [ ] Reorder
- [ ] Delete
- [ ] Gallery page

### Behind the Scenes
- [ ] BTS media
- [ ] BTS categories
- [ ] Related project

### Shows & Media
- [ ] YouTube links
- [ ] Vimeo links
- [ ] Instagram links/embeds where technically appropriate
- [ ] Media thumbnails

### Team
- [ ] Add member
- [ ] Edit member
- [ ] Role
- [ ] Photo
- [ ] Bio
- [ ] Social links
- [ ] Display order

### Exit Criteria
- [ ] Public media/team content manageable from Super Admin

---

# Stage 14 â€” Contact, Notifications & Email

## Goal
Complete communication flows without AWS SES in V1.

### Contact
- [ ] Contact form
- [ ] Save submissions in database
- [ ] Admin contact queries view

### Email
- [ ] Nodemailer
- [ ] Hostinger SMTP
- [ ] Welcome email
- [ ] Password reset email
- [ ] Application received email
- [ ] Application status update email
- [ ] Contact form notification

### Email Aliases
Suggested:
- [ ] info@mdadufilms.com
- [ ] casting@mdadufilms.com
- [ ] applications@mdadufilms.com
- [ ] contact@mdadufilms.com

### Exit Criteria
- [ ] Important platform emails work in testing

---

# Stage 15 â€” Settings, Legal & Company Trust Information

## Goal
Centralize site/company settings.

### Settings
- [ ] Company name
- [ ] Logo
- [ ] GST number
- [ ] CIN / company registration
- [ ] Email
- [ ] Phone
- [ ] Address
- [ ] Social links
- [ ] YouTube
- [ ] Instagram

### Legal
- [ ] Privacy Policy
- [ ] Terms & Conditions
- [ ] Application / portfolio consent text
- [ ] Copyright footer

### Exit Criteria
- [ ] Legal/business details are consistently displayed

---

# Stage 16 â€” Security & Quality Hardening

## Goal
Prepare the application for production-level use.

### Security
- [ ] Input validation
- [ ] Output sanitization
- [ ] Password security
- [ ] Secure cookies
- [ ] CORS rules
- [ ] Helmet/security headers
- [ ] Rate limiting
- [ ] File upload restrictions
- [ ] Admin authorization checks
- [ ] Ownership checks
- [ ] Secrets not committed to Git

### Quality
- [ ] Remove console/debug logs
- [ ] Error messages reviewed
- [ ] Empty states
- [ ] Loading states
- [ ] 404 page
- [ ] Error page
- [ ] Accessibility review

### Exit Criteria
- [ ] No major known security or UX blockers

---

# Stage 17 â€” Full Testing & UAT

## Goal
Test the entire platform before deployment.

### Functional Testing
- [ ] Registration
- [ ] Login/logout
- [ ] Password reset
- [ ] Profile
- [ ] Portfolio
- [ ] Project application
- [ ] Application status
- [ ] Admin users
- [ ] Admin projects
- [ ] Admin castings
- [ ] Talent filters
- [ ] Saved talent lists
- [ ] Verification badge
- [ ] Blog
- [ ] Gallery
- [ ] Team
- [ ] Contact
- [ ] Emails

### Responsive Testing
- [ ] Mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Large desktop

### Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Performance
- [ ] Image optimization
- [ ] Lazy loading
- [ ] API response review
- [ ] Lighthouse review
- [ ] SEO review

### UAT
- [ ] M. Dadu Films reviews complete site
- [ ] Final content corrections completed
- [ ] Final approval received

### Exit Criteria
- [ ] Production release approved

---

# Stage 18 â€” Production Deployment â€” LAST STAGE

## Goal
Deploy only after development and testing are complete.

### Production Infrastructure
- [ ] AWS Amplify for Next.js frontend
- [ ] AWS Lightsail 1 GB for NestJS backend
- [ ] Lightsail static IP
- [ ] MongoDB Atlas production database
- [ ] Amazon S3 for media storage
- [ ] Hostinger domain/DNS
- [ ] Hostinger SMTP
- [ ] SSL/HTTPS

### CI/CD
- [ ] GitHub Actions frontend workflow
- [ ] GitHub Actions backend workflow
- [ ] Build in GitHub Actions
- [ ] Deploy built backend artifact
- [ ] Backend restart via PM2/systemd
- [ ] Production environment secrets configured

### Production Validation
- [ ] Domain works
- [ ] API domain works
- [ ] SSL works
- [ ] Login works
- [ ] Upload works
- [ ] Email works
- [ ] Applications work
- [ ] Admin dashboard works
- [ ] Mobile works
- [ ] Monitoring/logs checked

### Exit Criteria
- [ ] M. Dadu Films Version 1.0.0 is live

---

# Stage 19 â€” Post-Launch Stabilization

## Goal
Fix real-world issues after launch without adding unnecessary new features.

- [ ] Monitor errors
- [ ] Monitor Lightsail memory/CPU
- [ ] Review S3 usage
- [ ] Review MongoDB usage
- [ ] Review application logs
- [ ] Fix launch bugs
- [ ] Take database backup
- [ ] Document support procedures
- [ ] Collect future feature requests

---

# Deferred Features â€” Not Part of V1.0.0

- [ ] Self-tape request workflow
- [ ] Advanced digital reel builder beyond current portfolio
- [ ] NDA / e-signature workflow
- [ ] Script-lock workflow
- [ ] WhatsApp notifications
- [ ] Native mobile application
- [ ] GraphQL
- [ ] Redis
- [ ] Microservices
- [ ] Kubernetes
- [ ] AWS SES unless later required

---

# Current Development Status

| Stage | Status |
|---|---|
| Stage 0 â€” Inputs & Assets | [~] In Progress |
| Stage 1 â€” Project Foundation | [~] Starter Created / Local Verification Pending |
| Stage 2 â€” Design System | [~] Partial implementation; review pending |
| Stage 3 â€” Public Website | [~] Partial implementation; review pending |
| Stage 4 â€” Authentication | [~] Partial implementation; review pending |
| Stage 5 â€” Member Profile | [~] Partial implementation; review pending |
| Stage 6 â€” Media Processing | [~] Partial implementation; review pending |
| Stage 7 â€” Projects & Casting | [~] Partial implementation; review pending |
| Stage 8 â€” Applications | [~] Partial implementation; review pending |
| Stage 9 â€” Member Dashboard | [~] Partial implementation; review pending |
| Stage 10 â€” Admin Dashboard | [~] Partial implementation; review pending |
| Stage 11 â€” Talent Search | [~] Partial implementation; review pending |
| Stage 12 â€” Blog | [~] Partial implementation; review pending |
| Stage 13 â€” Gallery/BTS/Team | [~] Partial implementation; review pending |
| Stage 14 â€” Contact & Email | [~] Partial implementation; review pending |
| Stage 15 â€” Settings & Legal | [ ] Not Started |
| Stage 16 â€” Security | [ ] Not Started |
| Stage 17 â€” Testing / UAT | [ ] Not Started |
| Stage 18 â€” Deployment | [ ] Not Started |
| Stage 19 â€” Stabilization | [ ] Not Started |

---

## Development Rule

**We complete one stage, test it locally, confirm it works, update this file, and only then move to the next stage. Production deployment stays at the very end.**


## Checkpoint evidence â€” 2026-09-17

- Required Node 24.11.1 installed; npm workspace lockfile committed-ready.
- Foundation lint, strict TypeScript, both builds, and 13 unit tests passed.
- Fifteen isolated integration checks cover registration, duplicate/injected roles,
  invalid login, sessions, admin denial, cross-origin denial, profile persistence,
  image variants, upload ownership, invalid files, publishing visibility,
  duplicate/closed applications, private admin notes, contact persistence,
  one-use password resets, session revocation and logout.
- Public design direction was approved in this task. Browser interaction,
  responsive layout and cross-browser sign-off remain pending manual review.
- MongoDB 8 cannot start on this host's Docker kernel; verified MongoDB 7 local
  fallback uses a separate named volume. Default production decisions unchanged.
- API build/watch uses TypeScript + Node watch instead of Nest CLI 12 because
  its scaffolding dependencies require a newer Node than the specified runtime.
- Public collections now fetch the API. Empty databases display intentional
  empty states. Hero/about/company copy remains explicitly provisional.
- Application, CMS, talent-list and contact API groundwork exists. Their full
  admin screens, broader tests and stage exit criteria are **not complete**.
- SMTP delivery, real assets/company details, production settings, full security
  review, UAT and deployment are **not complete**. Local email is private outbox
  only. No default administrator account was created.
- User requested a pause after this account/profile checkpoint. Resume only
  after their manual feedback; no deployment has been performed.

- HTTP smoke checks returned 200 for 21 implemented page routes. Missing
  routes render the custom not-found UI with `noindex`; Next.js streamed
  not-found responses use HTTP 200, as documented by the installed framework.
- Final manual-review focus: signup â†’ profile â†’ portfolio â†’ logout â†’ login.
  Desktop/mobile interaction review is intentionally left to the user here.

