# Asset Guide

Add real M. Dadu Films media here as development progresses.

## Supplied references reviewed — 2026-09-17

The working project is `mdadu-films-v1-codex-ready`; the sibling starter and
ZIP are retained unchanged. Development branch: `codex/mdadu-foundation`.

The shared `../support/` folder contains logo PNG variants and UI reference
screens. Reviewed `public-ui.png`, `user-dashboard.png`, and
`user-dashboard-mobile.png` in `UI-referance/` for public and member layouts.
These are design references, not individual production photographs or
verified company content. Do not extract names, contact details, statistics,
or project records from the mockups as real business data.

Preserve the current white/light editorial foundation, red accents, serif
headings, sans-serif interface text, and cinematic dark image sections.
This agrees with `AGENTS.md`, the canonical checklist, existing CSS, and the
reviewed screens. `../support/UI.md` describes a conflicting dark foundation;
it must not silently replace the existing theme.

The black logo PNG was visually verified. Both supplied PNGs have alpha
channels and are 2498×1404; the existing logo WebP is 1600×900 with alpha.
The existing `public/brand/logo.webp` remains unchanged.

The company input template is unfilled. Separate hero, project, team, and
gallery source photos have not been supplied; use `SmartImage` placeholders.
Legal/company details and final business copy remain pending.

## Existing Logo

The finalized logo is already stored at:

```text
apps/web/public/brand/logo.webp
```

## Recommended Structure

```text
apps/web/public/
├── brand/
│   └── logo.webp
├── images/
│   ├── hero/
│   ├── projects/
│   ├── casting/
│   ├── team/
│   ├── gallery/
│   ├── bts/
│   ├── blog/
│   └── placeholders/
└── icons/
```

## Suggested Inputs

### Company
- Legal company name
- GST number
- CIN / registration number
- Official phone
- Official email
- Office address
- Instagram
- YouTube
- Other social links

### Homepage
- 2–4 strong hero/set images
- Current/running project images
- Upcoming project images
- BTS images
- Show/media thumbnails

### Team
For each member:
- Name
- Role
- Professional photo
- Short bio
- Social/profile links if required

### Projects
For each project:
- Title
- Type
- Status
- Short description
- Full description
- Cover image
- Gallery
- Trailer/video link
- Team/credits

### Important Image Note

Do not manually resize everything before sending it. Keep good-quality source images. Our media pipeline will later generate optimized WebP variants using Sharp and eventually store them in S3.
