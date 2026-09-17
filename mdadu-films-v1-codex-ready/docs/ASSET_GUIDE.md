# Asset Guide

Add real M. Dadu Films media here as development progresses.

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
