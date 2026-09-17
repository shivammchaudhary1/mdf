# Frontend Instructions

These rules apply to `apps/web`.

## Read first for UI changes

Before changing visual code, read:
- `../../docs/DESIGN_SYSTEM.md`
- the relevant image(s) in `../../docs/references/ui/`
- this file

The reference screenshots define composition and visual character. They are not website content.

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

## Visual direction

Use four page families:

1. **Homepage** — cinematic and expressive, with deliberate dark sections, editorial rhythm and
   stronger imagery/composition.
2. **Public inner pages** — white/light, spacious, editorial, strong typography, restrained borders.
3. **Authentication** — clean split layout; dark brand panel plus focused white form area.
4. **Member/Admin workspaces** — light functional canvas, calm cards, clear navigation and red active
   states. Do not turn the entire dashboard into a dark theme.

Avoid the template look:
- do not render every section as the same three equal cards,
- vary image ratios and composition according to content type,
- keep casting opportunity cards more informational,
- keep gallery/BTS visually led,
- keep blog editorial,
- keep team portrait-led.

## Tokens and CSS

Use semantic variables from `src/app/globals.css` before introducing one-off values.

Preferred variables include:
- `--background`
- `--foreground`
- `--surface`
- `--surface-elevated`
- `--surface-dark`
- `--muted`
- `--border`
- `--brand-red`
- `--brand-red-hover`
- `--brand-gold`
- radius/shadow tokens

Do not scatter new hex values through components unless the value is a deliberate visual effect that
does not belong in the token system.

## Dynamic content

When a backend module exists, fetch dynamic content from the API. Placeholder content is allowed
only until the corresponding API exists and must live in `src/content/placeholders/`.

Dynamic examples:
- hero/homepage CMS copy,
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
Never add random remote imagery just to make a screen look finished.
Use the correct placeholder category until real media is supplied.
Never use the UI-reference screenshots as live website imagery.

## Feedback

Use `useToast()` for mutation feedback.
Use `ConfirmDialog` before destructive actions.
Never use browser `alert()` / `confirm()`.

## Responsive design

Every screen must be usable at roughly:
- 360px mobile,
- 768px tablet,
- 1024px laptop,
- 1440px desktop.

Build responsive behavior with the component, not as a later cleanup step.
Do not mark visual/responsive checklist items complete without actually checking those widths.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your
training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's
directory; in monorepos the `next` package may not be visible from the repo root) before writing any
code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates
the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
