M. Dadu Films — Hostinger Email Final v1

BASE REVIEWED
-------------
Remote parent:
  feature/node26-visitor-analytics
  92ec00bde6446caf41cba8ee188535e5a2e1fd9c

Local working branch expected:
  feature/hostinger-smtp

The remote feature/hostinger-smtp branch does not exist yet, so this patch
expects the local branch to still be based on the parent SHA above.

IMPORTANT SEMANTICS
-------------------
The existing Account `verified` field means EMAIL VERIFIED.

This patch does NOT create:
  emailVerified
  emailVerifiedAt
  admin verification badges

Admin can see/filter email verification state, but cannot manually mark an
email verified or unverified.

SMTP CONFIRMED
--------------
Host: smtp.hostinger.com
Port: 465
Security: SSL/TLS
Username: hello@mdadufilms.com
Password: hello@ mailbox password

Your direct Node/Nodemailer SMTP test already passed.

ALIASES
-------
contact@mdadufilms.com
careers@mdadufilms.com
production@mdadufilms.com
noreply@mdadufilms.com

SMTP authenticates and sends from hello@mdadufilms.com.
The aliases above can route into the same hello@ inbox.

IMPLEMENTED EMAIL FLOW
----------------------
1. Local signup
   - account starts verified=false
   - 24-hour verification link sent automatically
   - verification link sets existing verified=true
   - verification success welcome email
   - resend verification endpoint/page

2. Google auth
   - backend already requires Google's email_verified claim
   - new/existing Google account becomes verified=true

3. Forgot password
   - one-hour reset link with branded CTA button
   - successful password reset sends security confirmation

4. Contact
   - visitor receives confirmation
   - contact@ receives enquiry
   - Reply-To points to visitor email

5. Careers
   - applicant receives confirmation
   - careers@ receives full application notification
   - status changes continue to email applicant

6. Casting / Project applications
   - member receives confirmation
   - production@ receives application notification
   - application status changes continue to email member

7. Admin Members
   - Verified means Email Verified
   - Verified / Unverified filters remain
   - manual Verify Member / Remove Verification action is removed
   - Suspend / Reactivate remains untouched

EMAIL THEME
-----------
Uses the existing website palette:
  black:      #0b0b0b
  text:       #111111
  surface:    #f7f7f5
  border:     #e9e9e6
  brand red:  #ea2f3c
  brand gold: #c8a36a

Every MailService email gets both:
  plain text
  branded HTML

SECURITY
--------
- Verification tokens are random and only their SHA-256 digest is stored.
- Verification token expires after 24 hours.
- Password-reset token behavior remains one hour.
- Verify/resend routes have IP/email rate limits.
- Existing CSRF/origin architecture remains.
- SMTP errors do not expose SMTP credentials.
- .env.dev/.env.prod are not modified by the patch.

LOCAL ENV
---------
Keep these values in apps/api/.env.dev:

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@mdadufilms.com
SMTP_PASSWORD=<real hello mailbox password>
SMTP_FROM="M. Dadu Films <hello@mdadufilms.com>"
CONTACT_EMAIL=contact@mdadufilms.com
CAREERS_EMAIL=careers@mdadufilms.com
PRODUCTION_EMAIL=production@mdadufilms.com

Use the same keys later in production secrets/.env.prod.

Never commit real SMTP_PASSWORD.

APPLY
-----
cd ~/Desktop/mdf

git status --short
git rev-parse HEAD
git branch --show-current

# Expected:
# feature/hostinger-smtp
# 92ec00bde6446caf41cba8ee188535e5a2e1fd9c

# If an old untracked verify-email page exists from the reverted attempt:
rm -rf apps/web/src/app/verify-email

rm -rf mdadu-hostinger-email-final-v1
unzip -o ~/Downloads/mdadu-hostinger-email-final-v1.zip -d .
node mdadu-hostinger-email-final-v1/apply.mjs

VALIDATE
--------
git diff --check
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build

MANUAL EMAIL TESTS
------------------
Start:
npm run dev

A. Signup
- Use a NEW real email address.
- Account should be created.
- Verification email should arrive.
- Click Verify Email.
- /verify-email should report success.
- Mongo account.verified should become true.
- Admin Members should show Email verified.
- No admin verify button should exist.

B. Forgot password
- Request reset.
- Branded reset email should arrive.
- Reset password.
- Password-changed confirmation should arrive.

C. Contact
- Submit with a real email.
- Sender gets confirmation.
- hello@ inbox receives mail addressed to contact@.

D. Careers
- Submit a career application.
- Applicant gets confirmation.
- hello@ inbox receives mail addressed to careers@.
- Change status in admin; applicant should receive update.

E. Casting / Project application
- Apply as member.
- Member gets confirmation.
- hello@ inbox receives mail addressed to production@.
- Change application status in admin; member should receive update.

NOTE
----
noreply@ is kept as an alias for later use. We are not using it as SMTP From
until alias-as-sender is separately verified in Hostinger, which avoids a
deliverability regression.

Do not merge to master yet.
