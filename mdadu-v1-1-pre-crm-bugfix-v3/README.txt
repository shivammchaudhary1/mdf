M. Dadu Films — V1.1 pre-CRM bugfix V3 delta
=================================================

Purpose
-------
Fix the React duplicate-key console error on the Super Admin dashboard Recent activity list.

Observed error
--------------
Encountered two children with the same key, `Production-Sep 29, 2026`.

Cause
-----
The dashboard rendered Recent activity rows using:
  `${x.title}-${x.time}`

Two different audit records can legitimately have the same title and displayed date, so React can receive duplicate keys.

Fix
---
V2 already carries each audit record's stable Mongo/audit `_id` into `recentActivity` as `x.id`.

V3 changes the dashboard row key to:
  key={x.id}

No database operation is performed.

Prerequisite
------------
mdadu-v1-1-pre-crm-bugfix-v2 must already be applied.
The apply script checks this before changing anything.

One-command install from Downloads
----------------------------------
Run from the repository root:

PATCH="$(ls -t ~/Downloads/mdadu-v1-1-pre-crm-bugfix-v3*.zip 2>/dev/null | head -n1)" && test -n "$PATCH" && rm -rf mdadu-v1-1-pre-crm-bugfix-v3 && unzip -qo "$PATCH" -d . && node mdadu-v1-1-pre-crm-bugfix-v3/apply.mjs && node mdadu-v1-1-pre-crm-bugfix-v3/verify.mjs

Then run:
  npm run typecheck
  npm run lint
  git diff --check

After browser testing, remove patch helper folders before commit/push.
Do not commit mdadu-v1-1-pre-crm-bugfix-v1/, v2/, or v3/.
