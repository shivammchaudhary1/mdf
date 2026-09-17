# Frontend Instructions

These rules apply to `apps/web`.

## Structure

- `src/app/` — route composition only.
- `src/components/` — reusable presentational/application components.
- `src/components/ui/` — generic UI primitives.
- `src/config/` — technical/static configuration, routes and message constants.
- `src/content/placeholders/` — development fallback copy/data only.
- `src/lib/` — pure utilities and infrastructure helpers.
- `src/services/` — API calls.
- `src/types/` — shared frontend types.

Do not put large data arrays or production business content directly into page files.

## Dynamic content

When a backend module exists, fetch dynamic content from the API. Placeholder content is allowed only until the corresponding API exists, and must come from `src/content/placeholders/`.

Dynamic examples:
- hero/homepage CMS content,
- company contact/legal details,
- projects/castings,
- team,
- blog,
- gallery/BTS,
- shows/media,
- member profiles,
- applications.

Static examples:
- route paths,
- role identifiers,
- status-display maps,
- validation limits,
- design tokens.

## Images

Use `SmartImage` for business/content images where a source may be missing.
Never add a random remote image simply to make a screen look finished.
Use the correct placeholder category until a real image is provided.

## Feedback

Use `useToast()` for mutation feedback.
Use `ConfirmDialog` before destructive actions.
Never use browser `alert()` / `confirm()`.

Suggested messages:
- Login success: `Login successful.`
- Login error: `Login failed. Check your email and password.`
- Saved: `Changes saved successfully.`
- Application submitted: `Application submitted successfully.`
- Generic error: `Something went wrong. Please try again.`

## Responsive design

Every screen must be usable at roughly:
- 360px mobile,
- 768px tablet,
- 1024px laptop,
- 1440px desktop.

Do not finish desktop first and postpone mobile.
