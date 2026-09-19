# Group 4 — Public Talent Profiles + Advanced Filters

Implemented against master `3f050a6541157d5b2e7d17ade12ba044927a3d69`.

- Public `/talent` remains restricted to verified, non-suspended accounts whose profile is public.
- Advanced server-side filters: group, search, city, profession, gender, skill, language, availability, experience, min/max age.
- Filtering occurs before pagination, so totals/pages reflect the filtered dataset.
- Public search includes name, profession, city, skills and languages; email/mobile remain private.
- Talent cards link to `/talent/[id]`.
- Public detail shows only the existing public-safe profile fields: photo, bio, city, profession, gender, skills, languages, experience, availability, portfolio, videos, showreel, previous work and social links.
- Birth date, email, mobile, resume, account internals and admin notes are not exposed.
- Loading and empty states added.
- Profile completion now reuses Group 3's shared completion calculation.
- Group 5 saved-list UI is intentionally not implemented here.
