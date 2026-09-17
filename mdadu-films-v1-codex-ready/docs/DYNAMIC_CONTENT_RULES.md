# Static vs Dynamic Content Rules

The platform must feel configurable rather than hardcoded.

## Dynamic — database/admin controlled

The following should eventually be editable without code changes:

- homepage hero heading, supporting copy and CTA text,
- company About content,
- contact information,
- GST number,
- company registration/CIN details,
- social links,
- projects,
- project statuses and media,
- casting/vacancy entries,
- team member profiles,
- blog/news posts,
- gallery items,
- behind-the-scenes items,
- YouTube/Vimeo/Instagram media entries,
- application content/statuses,
- member verification state,
- member profiles/portfolios,
- saved talent lists.

Until a corresponding backend module is ready, use data from `apps/web/src/content/placeholders/`.

## Static — code/config controlled

Stable technical concepts may stay in code:

- frontend route paths,
- API route helpers,
- design tokens,
- role identifiers,
- allowed application status identifiers,
- allowed project status identifiers,
- file-size/type limits,
- shared notification wording,
- pagination defaults.

Keep them in `config/`, `constants/` or enums instead of scattering them across components.

## Never invent company facts

If GST/CIN/address/phone/etc. are not provided, keep explicit placeholders:
- `ADD_GST_NUMBER`
- `ADD_COMPANY_REGISTRATION`
- `ADD_REAL_PHONE`

Do not generate realistic-looking fake legal details.

## Image fallback rule

If an image has not been provided:
1. use `SmartImage`,
2. select the closest placeholder category,
3. continue development,
4. replace with real media later without redesigning the component.
