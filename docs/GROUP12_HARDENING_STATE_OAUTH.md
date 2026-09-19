# Group 12 — Security, State Management, Google OAuth & Accessibility Hardening

## Scope implemented

### Shared application state and API-call reduction

A single Zustand `app-store` now owns:
- authenticated user
- authentication status
- member profile-photo URL
- bounded in-memory query cache

The query cache:
- deduplicates identical in-flight GET requests
- keeps successful GET results for a short TTL
- is capped at 100 fresh entries
- is cleared on successful mutations
- is cleared when the authenticated session ends
- is never reused on the server, avoiding cross-request/user cache leakage

`fetchPage()` and `allPages()` use the shared query cache. This reduces repeated API calls when:
- public pages remount
- header/footer need the same settings
- admin dashboard and notifications request the same dashboard/application/blog data
- member pages remount during client-side navigation
- React Strict Mode causes development effects to run more than once

Current TTLs:
- general paginated/query data: 30 seconds
- admin dashboard: 15 seconds
- member profile: 60 seconds
- company/footer settings: 5 minutes

Mutations still refresh correctly because the API layer invalidates cached GET data after successful POST/PATCH/PUT/DELETE requests.

### Central authentication state

`/auth/me` is bootstrapped once at application level and reused.

The same shared auth state is now used by:
- public site header
- guest-only auth pages
- admin shell
- login/signup success
- Google sign-in
- logout

This removes independent `/auth/me` calls from UI areas that previously checked the same session separately.

### Logged-in navigation behavior

Authenticated users are redirected away from guest authentication screens.

The public header:
- hides Login / Join Now while authenticated
- shows the member profile image when available
- falls back to account initials
- provides Dashboard and Logout actions
- uses the correct dashboard based on USER vs SUPER_ADMIN
- supports Escape/outside-click dismissal

The mobile navigation follows the same authenticated/anonymous behavior.

### Google OAuth

Google Identity Services is fully wired to the existing secure backend `/auth/google` endpoint.

The backend already:
- verifies Google ID tokens with `google-auth-library`
- verifies the configured audience/client ID
- requires Google to return a verified email
- links a matching verified Google email to an existing account
- requires mobile number and legal consent for a first-time Google account
- creates the same signed HTTP-only session used by password login
- is protected by the existing persistent IP rate limit

Frontend behavior:
- Login: existing Google-linked/matching accounts can sign in.
- First-time Google user: use Create Account once so mobile number and Terms/Privacy consent are supplied.
- Signup: Google sign-up reads name/mobile/consent from the form; password fields are not used for Google.
- If Google is not configured, the existing Google slot remains visible but disabled.

No Google client secret is placed in browser code.

## Google Cloud setup

Create one **OAuth 2.0 Client ID → Web application** in Google Cloud Console.

Use the same client ID in:

`apps/api/.env.dev`
```text
GOOGLE_CLIENT_ID=<your-web-client-id>.apps.googleusercontent.com
```

`apps/web/.env.dev`
```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same-web-client-id>.apps.googleusercontent.com
```

For production use the same pattern in `.env.prod`.

Configure authorised JavaScript origins in Google Cloud:
```text
http://localhost:3333
https://mdadufilms.com
```

Add other real frontend origins only if they are actually used.

This implementation uses the Google Identity Services credential callback and backend ID-token verification, so no Google client secret is required by the browser. Do not commit OAuth secrets or environment-specific `.env.dev` / `.env.prod` files.

The environment checker now rejects a configuration where backend and frontend Google client IDs are inconsistent when both app environments are checked together.

## Accessibility hardening

Admin dialogs now:
- move focus inside when opened
- trap Tab / Shift+Tab within the dialog
- close on Escape
- restore previous focus after close
- use `aria-labelledby` and `aria-describedby`
- have an accessible close-button label

Admin/member navigation toggle buttons also receive explicit accessible labels.

## Security verification added

Integration coverage now also checks:
- a newly created member profile defaults to `publicVisible=false`
- Google auth fails safely with `503` when Google OAuth is not configured

Existing integration coverage already verifies:
- forged session rejection
- USER vs SUPER_ADMIN access
- CSRF rejection
- cross-origin mutation rejection
- private media/document access
- public talent sensitive-field filtering
- session revocation
- logout-all
- suspended account behavior
- single-use password reset
- rate limiting
- invalid pagination bounds
- sanitized errors

## Important deliberate non-removal

No visible product feature was removed in this patch.

In particular, the existing Admin `Duplicate` menu action remains untouched because removal/change was not explicitly approved. It can be implemented or removed separately after product review.

## Recommended validation

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run test:integration
git diff --check
git status
```

With Google OAuth configured, manually test:
1. existing local account → Google sign-in with same verified email
2. new Google user → signup with mobile + Terms/Privacy consent
3. logout
4. authenticated visit to `/login` and `/signup` redirects to dashboard
5. public header changes Login/Join to profile menu
6. member profile-photo change is reflected after navigation

Deployment remains frozen until Group 13 UAT approval.
