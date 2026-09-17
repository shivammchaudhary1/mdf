# M. Dadu Films Digital Platform — Development Progress

**Version:** 1.0.0  
**Prepared for:** M. Dadu Films  
**Prepared by:** Shivam Chaudhary  
**Status:** Planning → Development  
**Deployment:** Final stage only  
**Primary rule:** Every stage must be testable before moving to the next stage.

---

## Progress Legend

- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked / needs input

---

# Stage 0 — Project Inputs & Asset Collection

## Goal
Collect everything required before coding so development does not stop later.

### Required from M. Dadu Films
- [ ] Final logo files
- [ ] Company legal name
- [ ] GST number
- [ ] Company registration / CIN details
- [ ] Official email address
- [ ] Phone number
- [ ] Office / business address
- [ ] Social media links
- [ ] YouTube channel link
- [ ] Instagram profile link
- [ ] Existing project names and details
- [ ] Running project details
- [ ] Upcoming project details
- [ ] Team member names, roles, photos, bios
- [ ] Gallery / behind-the-scenes images
- [ ] Hero/banner images
- [ ] Casting / vacancy sample data
- [ ] Blog/article sample content
- [ ] Contact details
- [ ] Privacy Policy content or approval to use a basic draft
- [ ] Terms & Conditions content or approval to use a basic draft

### Exit Criteria
- [ ] Core company details received
- [ ] Enough images/content available to build the first frontend version

---

# Stage 1 — Repository & Project Foundation

> Starter monorepo created. Install dependencies and run locally before marking this stage complete.

## Goal
Create a clean development setup for frontend and backend.

### Frontend
- [ ] Create Next.js project
- [ ] Enable TypeScript
- [ ] Configure Tailwind CSS
- [ ] Configure global theme variables
- [ ] Add typography system
- [ ] Add brand colors
- [ ] Add reusable layout structure
- [ ] Add environment configuration
- [ ] Add ESLint / formatting rules

### Backend
- [ ] Create NestJS project
- [ ] Use Node.js 24.11.1
- [ ] Configure TypeScript
- [ ] Configure environment variables
- [ ] Configure MongoDB connection
- [ ] Configure Mongoose
- [ ] Configure Swagger / OpenAPI
- [ ] Add validation pipeline
- [ ] Add global exception handling
- [ ] Add request logging

### Git
- [ ] Create repository structure
- [ ] Add `.gitignore`
- [ ] Add `.env.example`
- [ ] Add README
- [ ] Add branch strategy
- [ ] Add initial commits

### Testing
- [ ] Frontend runs locally
- [ ] Backend runs locally
- [ ] Backend health API works
- [ ] MongoDB connection works
- [ ] Swagger opens correctly

### Exit Criteria
- [ ] Frontend + backend boot successfully
- [ ] Basic development environment is stable

---

# Stage 2 — Design System & Reusable UI

## Goal
Convert the finalized visual direction into reusable components.

### Design System
- [ ] Final logo integration
- [ ] White/light theme foundation
- [ ] Cinematic red accent
- [ ] Black/charcoal text system
- [ ] Serif heading font
- [ ] Sans-serif UI/body font
- [ ] Spacing scale
- [ ] Border radius system
- [ ] Shadow system
- [ ] Button variants
- [ ] Form styles
- [ ] Card styles
- [ ] Badge styles
- [ ] Status colors

### Shared Components
- [ ] Navbar
- [ ] Mobile navbar
- [ ] Footer
- [ ] Section heading
- [ ] CTA buttons
- [ ] Project card
- [ ] Casting card
- [ ] Blog card
- [ ] Team card
- [ ] Gallery card
- [ ] Empty state
- [ ] Loading state
- [ ] Error state
- [ ] Modal / confirmation dialog

### Responsive Testing
- [ ] Mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Desktop

### Exit Criteria
- [ ] Reusable component library is ready
- [ ] Main layouts match approved UI direction

---

# Stage 3 — Public Website

## Goal
Build all public-facing pages first.

### Pages
- [ ] Home
- [ ] About Us
- [ ] Projects
- [ ] Project Details
- [ ] Casting / Vacancies
- [ ] Casting Details
- [ ] Gallery
- [ ] Behind the Scenes
- [ ] Shows / Media
- [ ] Team
- [ ] Blog / Latest Posts
- [ ] Blog Details
- [ ] Contact Us
- [ ] Login
- [ ] Sign Up

### Home Page Sections
- [ ] Hero section
- [ ] Brand message
- [ ] Running / upcoming projects
- [ ] Open casting calls
- [ ] Talent community CTA
- [ ] Behind the scenes
- [ ] Shows / media
- [ ] Latest blog posts
- [ ] Why M. Dadu Films
- [ ] Team preview
- [ ] GST / registration trust section
- [ ] Footer

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
- [ ] SEO metadata added

### Exit Criteria
- [ ] Public website complete with static/sample data
- [ ] Approved visually before backend integration

---

# Stage 4 — Authentication

## Goal
Allow members to securely create accounts and sign in.

### Features
- [ ] User registration
- [ ] Full name
- [ ] Email
- [ ] Mobile number
- [ ] Password
- [ ] Confirm password
- [ ] Login
- [ ] Logout
- [ ] Remember session
- [ ] Forgot password
- [ ] Reset password
- [ ] Secure cookies / token handling
- [ ] Password hashing
- [ ] Route protection
- [ ] Role support

### Roles
- [ ] `SUPER_ADMIN`
- [ ] `USER`

### Notes
- [ ] Mobile number is required
- [ ] Mobile OTP verification is NOT required in V1

### Testing
- [ ] Registration success
- [ ] Duplicate email blocked
- [ ] Invalid login blocked
- [ ] Protected routes blocked when logged out
- [ ] Correct redirect after login
- [ ] Logout clears session

### Exit Criteria
- [ ] Authentication flow stable
- [ ] Super Admin and User roles work correctly

---

# Stage 5 — Member Profile & Portfolio

## Goal
Allow a registered member to become part of the M. Dadu Films community.

### Profile
- [ ] Profile photo
- [ ] Full name
- [ ] Mobile number
- [ ] Email
- [ ] Bio
- [ ] City / location
- [ ] Profession / category
- [ ] Skills
- [ ] Languages
- [ ] Experience
- [ ] Availability
- [ ] Social links
- [ ] YouTube / Vimeo links
- [ ] Optional resume/document

### Portfolio
- [ ] Portfolio photos
- [ ] Portfolio videos via external links
- [ ] Showreel link
- [ ] Previous work
- [ ] Profile completion percentage
- [ ] Edit profile
- [ ] Manage portfolio

### Verification
- [ ] Verified member badge
- [ ] Badge controlled only by Super Admin

### Testing
- [ ] Create profile
- [ ] Edit profile
- [ ] Upload profile photo
- [ ] Add portfolio images
- [ ] Add external video links
- [ ] Profile completion calculation works

### Exit Criteria
- [ ] User profile + portfolio fully usable

---

# Stage 6 — Media Upload & Image Optimization

## Goal
Store media efficiently while keeping image quality high.

### Storage
- [ ] Local development storage adapter
- [ ] S3-ready storage abstraction
- [ ] Secure upload validation
- [ ] File size validation
- [ ] MIME validation

### Image Processing
- [ ] Sharp integration
- [ ] WebP conversion
- [ ] Profile image optimization
- [ ] Thumbnail generation
- [ ] Medium image generation
- [ ] Large image generation
- [ ] Preserve good visual quality
- [ ] Remove unnecessary metadata where appropriate

### Target Sizes
- [ ] Profile: approx. 800×800
- [ ] Thumbnail: approx. 400px
- [ ] Portfolio medium: approx. 1200px
- [ ] Gallery large: approx. 1600–1920px

### Testing
- [ ] Large image uploads successfully
- [ ] Compressed version is generated
- [ ] Output image remains visually high quality
- [ ] Database stores correct media references

### Exit Criteria
- [ ] Media workflow ready for local development and future S3 deployment

---

# Stage 7 — Projects & Casting Management

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

# Stage 8 — Project Application Workflow

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

# Stage 9 — Member Dashboard

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

# Stage 10 — Super Admin Dashboard

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

# Stage 11 — Talent Search, Filters & Saved Lists

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

# Stage 12 — Blog / News / Content Management

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

# Stage 13 — Gallery, BTS, Shows & Team CMS

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

# Stage 14 — Contact, Notifications & Email

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

# Stage 15 — Settings, Legal & Company Trust Information

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

# Stage 16 — Security & Quality Hardening

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

# Stage 17 — Full Testing & UAT

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

# Stage 18 — Production Deployment — LAST STAGE

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

# Stage 19 — Post-Launch Stabilization

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

# Deferred Features — Not Part of V1.0.0

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
| Stage 0 — Inputs & Assets | [~] In Progress |
| Stage 1 — Project Foundation | [~] Starter Created / Local Verification Pending |
| Stage 2 — Design System | [ ] Not Started |
| Stage 3 — Public Website | [ ] Not Started |
| Stage 4 — Authentication | [ ] Not Started |
| Stage 5 — Member Profile | [ ] Not Started |
| Stage 6 — Media Processing | [ ] Not Started |
| Stage 7 — Projects & Casting | [ ] Not Started |
| Stage 8 — Applications | [ ] Not Started |
| Stage 9 — Member Dashboard | [ ] Not Started |
| Stage 10 — Admin Dashboard | [ ] Not Started |
| Stage 11 — Talent Search | [ ] Not Started |
| Stage 12 — Blog | [ ] Not Started |
| Stage 13 — Gallery/BTS/Team | [ ] Not Started |
| Stage 14 — Contact & Email | [ ] Not Started |
| Stage 15 — Settings & Legal | [ ] Not Started |
| Stage 16 — Security | [ ] Not Started |
| Stage 17 — Testing / UAT | [ ] Not Started |
| Stage 18 — Deployment | [ ] Not Started |
| Stage 19 — Stabilization | [ ] Not Started |

---

## Development Rule

**We complete one stage, test it locally, confirm it works, update this file, and only then move to the next stage. Production deployment stays at the very end.**
