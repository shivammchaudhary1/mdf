# Frontend Instructions

These rules apply to `apps/web`.

## Current phase: approved UI freeze

The user has approved the current visual direction and explicitly requested **no UI disturbance** while V1 functionality is completed.

Unless the user explicitly requests a visual change, do not alter:
- CSS files for styling,
- colors,
- typography,
- spacing,
- sizing,
- card/layout structure,
- breakpoints,
- shadows/borders/radii,
- logo/brand presentation,
- visible section order,
- existing visual `className` values.

The current task is functional API integration, not redesign.

When connecting real APIs:
- preserve the existing rendered structure,
- preserve class names and existing CSS,
- map API results into the current view-model shape when practical,
- use existing loading/error/empty UI,
- do not introduce new styling,
- remove demo fixtures only after equivalent real data is connected.

If a functional requirement appears to require a visible redesign, stop and document it instead.

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

When a backend module exists, use the API instead of demo production-like data.

Dynamic domains include:
- projects/castings,
- team,
- blog,
- gallery/BTS,
- shows/media,
- member profiles,
- applications,
- member/admin dashboards,
- contact/settings/legal where applicable.

Static technical values include:
- route paths,
- role identifiers,
- status display maps,
- validation limits,
- design tokens.

## Feedback and mutations

Reuse existing UI behavior:
- `useToast()` for mutation feedback,
- existing confirmation dialog for destructive actions,
- existing loading/error/empty states.

Never use browser `alert()` or `confirm()`.

## Security

Use the shared API helper so requests preserve:
- `credentials: "include"`,
- CSRF token handling,
- consistent API errors,
- request IDs where available.

Do not place auth tokens in localStorage/sessionStorage.

## Next.js rule

This repository may use a newer Next.js version than model training knowledge. Read the relevant installed guide under `node_modules/next/dist/docs/` before using version-sensitive APIs.

## Verification

Functional frontend changes must pass:

```bash
npm run typecheck -w @mdadu/web
npm run build -w @mdadu/web
```

The absence of visual changes must be confirmed in the handoff summary.
