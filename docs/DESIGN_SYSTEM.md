# M. Dadu Films — Design System & Visual Source of Truth

This document is the implementation guide for the approved UI direction.

## 1. Source-of-truth priority

When implementation and an older screen disagree, use this order:

1. Final M. Dadu Films logo assets.
2. Approved screenshots in `docs/references/ui/`.
3. This document.
4. Existing code patterns that already match 1–3.

The screenshots are **visual references only**. Do not render those screenshots as website content.

## 2. Brand character

The product should feel:

- cinematic,
- premium,
- creative,
- calm,
- trustworthy,
- editorial,
- modern without looking like a generic SaaS template.

The experience should not feel overly corporate, overly flashy or uniformly dark.

## 3. Page families

### Homepage

The homepage is the most expressive page.

Use:
- a cinematic hero,
- strong editorial typography,
- selective dark sections,
- image-led/story-led composition,
- alternating visual rhythm,
- stronger CTA moments.

Avoid rendering Projects, Casting, BTS, Shows, Blog and Team as six identical equal-card grids.

### Public inner pages

About, Projects, Casting, Gallery, Team, Blog and Contact should primarily use:
- white/light backgrounds,
- generous vertical spacing,
- strong type hierarchy,
- restrained borders,
- image-led content where available,
- dark footer/occasional cinematic contrast.

### Authentication

Keep the approved split experience:
- brand/cinematic panel on larger screens,
- focused white form panel,
- single-column mobile form,
- visible inline validation and toast feedback.

### Member/Admin workspace

Use:
- light canvas,
- white elevated cards,
- calm navigation,
- red for active/action state,
- compact use of charcoal for emphasis,
- clear hierarchy over decoration.

Do not make the entire dashboard dark.

## 4. Core palette

| Token | Value | Use |
|---|---|---|
| `--background` | `#FBFBFC` | app/page canvas |
| `--foreground` | `#111318` | primary text |
| `--surface-elevated` | `#FFFFFF` | cards/forms |
| `--surface` | `#F6F7F9` | secondary sections |
| `--surface-dark` | `#0B0B0F` | cinematic contrast |
| `--charcoal` | `#131722` | secondary dark |
| `--muted` | `#667085` | body metadata |
| `--border` | `#E5E7EB` | soft borders |
| `--brand-red` | `#E53945` | primary CTA/accent |
| `--brand-red-hover` | `#C92D38` | CTA hover |
| `--brand-gold` | `#C9A35D` | restrained premium accent |

Red is the action color, not a background for every section.
Gold should stay subtle.

## 5. Typography

- Editorial/hero headings: **Playfair Display**
- Body, navigation, forms, dashboard UI: **Inter**

Guidance:
- Hero: `clamp(3.5rem, 8vw, 7rem)` depending on composition.
- Section heading: roughly `2.25rem–3.5rem`.
- Body: `1rem–1.125rem`.
- Small labels: `0.75rem–0.875rem`.

Use line-height and whitespace to create premium pacing.

## 6. Spacing and containers

Main content container:
- roughly 1180–1240px max,
- 16px mobile edge,
- 24px+ tablet edge,
- 32px+ desktop edge.

Typical section spacing:
- mobile: 64–80px,
- desktop: 96–128px for major editorial sections.

Avoid cramped 24–32px section spacing on public pages.

## 7. Component behavior

### Buttons

Primary:
- red fill,
- white text,
- minimum 46–48px height,
- restrained radius,
- no excessive glow.

Secondary:
- outlined/quiet,
- high contrast for its background.

### Cards

Cards should use:
- soft border,
- controlled shadow,
- generous internal spacing,
- content-specific image ratio.

Use hover lift only for interactive cards.

### Content-specific treatment

**Projects**
- cinematic image ratio,
- status/category metadata,
- stronger title treatment.

**Casting**
- information-first,
- clear role/location/deadline,
- less image dependency.

**Blog**
- editorial image + headline,
- calmer card styling.

**Team**
- portrait-led,
- name/role hierarchy.

**Gallery/BTS**
- image-led,
- minimal copy,
- stronger visual rhythm.

## 8. Homepage rhythm

Recommended sequence:

1. Cinematic hero
2. Brand/manifesto strip
3. Featured projects
4. Community CTA
5. Casting opportunities
6. BTS visual band
7. Shows/media
8. Journal/blog
9. Why M. Dadu Films
10. Team preview
11. Footer

Not every section needs the same background, card count or image ratio.

## 9. Responsive rules

Every visual change must be checked at approximately:

- 360px
- 768px
- 1024px
- 1440px

Watch specifically for:
- hero headline wrapping,
- header navigation collisions,
- horizontal dashboard navigation,
- card image crop,
- button wrapping,
- form width,
- bottom mobile navigation safe-area.

## 10. Reference mapping

Key files under `docs/references/ui/`:

- `public-ui.png` — public website direction.
- `auth-mobileandweb.png` — authentication direction.
- `user-dashboard.png` — member dashboard desktop.
- `user-dashboard-mobile.png` — member dashboard mobile.
- `dahboard.png` — dashboard/admin visual reference.
- remaining `ChatGPT Image ...` files — supporting public/admin/page references.

If a filename is unclear, inspect the image before coding.

## 11. Things Codex must not do

- Do not declare a screen visually approved by itself.
- Do not use random stock/remote images.
- Do not use UI reference screenshots as live content.
- Do not create a new color system inside individual components.
- Do not duplicate button/input/card CSS for each page.
- Do not make every section a three-card grid.
- Do not sacrifice accessibility for cinematic styling.
- Do not postpone mobile responsiveness until the end.

## 12. Human approval gate

Implementation can be marked complete after code + checks.

The following require explicit user approval before being marked complete:
- “matches approved UI direction”
- “approved visually”
- final responsive visual acceptance.
