M. Dadu Films — Email Alias Sender Routing v1

This is a SMALL follow-up patch for the already-working Hostinger SMTP/email
implementation. It only changes sender routing. It does not change verification,
password-reset, contact, careers, application, DB, auth or session behavior.

Sender rules
------------
SMTP authentication:
  hello@mdadufilms.com

Transactional/account/security:
  noreply@mdadufilms.com

Careers:
  careers@mdadufilms.com

Production / casting / project applications:
  production@mdadufilms.com

Contact:
  contact@mdadufilms.com

hello@ remains the SMTP fallback and can be used later for personal/specific
mail. No automatic flow added by this patch uses hello@ as its intended From.

Important
---------
The SMTP username/password remain those of the real hello@ mailbox.
Only the visible From header changes to the Hostinger aliases.

Add this one missing env value to BOTH apps/api/.env.dev and later .env.prod:

NOREPLY_EMAIL=noreply@mdadufilms.com

Keep:
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@mdadufilms.com
SMTP_PASSWORD=<hello mailbox password>
SMTP_FROM="M. Dadu Films <hello@mdadufilms.com>"
CONTACT_EMAIL=contact@mdadufilms.com
CAREERS_EMAIL=careers@mdadufilms.com
PRODUCTION_EMAIL=production@mdadufilms.com

Apply
-----
cd ~/Desktop/mdf

rm -rf mdadu-email-alias-sender-routing-v1
unzip -o ~/Downloads/mdadu-email-alias-sender-routing-v1.zip -d .
node mdadu-email-alias-sender-routing-v1/apply.mjs

Validate
--------
git diff --check
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build

Manual sender test
------------------
Use real emails and inspect the From address:

1. Signup verification:
   From: noreply@mdadufilms.com

2. Forgot password:
   From: noreply@mdadufilms.com

3. Contact confirmation:
   From: contact@mdadufilms.com

4. Career confirmation/status:
   From: careers@mdadufilms.com

5. Project/casting application confirmation/status:
   From: production@mdadufilms.com

Hostinger requirement
---------------------
All aliases must be attached to the hello@ mailbox and permitted as sending
aliases. If Hostinger rejects an alias From during SMTP send, confirm the alias
is present under the hello@ mailbox in hPanel/Webmail. SMTP authentication still
uses hello@.
