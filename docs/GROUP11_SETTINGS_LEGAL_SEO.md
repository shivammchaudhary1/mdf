# Group 11 — Settings, Legal, SEO & Real Public Content

## Verified public company information used

The implementation uses only company information already supplied for the project:
- Brand/public name: M. Dadu Films
- Website: https://mdadufilms.com
- Email: m.dadufilms@gmail.com
- Public phones: +91 92116 19085 and +91 96281 80620
- Locations: Lucknow and Noida, Uttar Pradesh, India
- Public tagline: Transforming Visions into Cinematic Reality
- Public services: film production, short films, advertisement/brand films, music videos, corporate shoots and creative content development

The legal/registered entity name, GST number, CIN/registration number and exact official social-profile URLs were not verified in the supplied project information. Those fields are intentionally left blank instead of inventing values.

## Company settings

Admin Company Settings now supports:
- public company name
- legal/registered name
- tagline
- description
- email
- primary and alternate phone
- location
- website
- Instagram / YouTube / LinkedIn / Facebook URLs

Known values are used as safe defaults. Social URLs stay empty until a real full `https://` URL is entered.

Public site fallback content is also updated so an API outage does not expose fake email, phone, location or placeholder business details.

## Privacy and Terms

A tailored Privacy Policy and Terms & Conditions are included in `docs/group11-public-content.json` and can be safely upserted with the Group 11 content script.

The policy covers:
- account information
- public talent visibility
- profile photos and portfolios
- private resumes/documents
- project/casting applications
- careers/contact submissions
- essential session cookies/security records
- sharing and service providers
- retention/security
- user choices
- third-party links
- minors/authorised submissions
- policy changes and contact

Terms cover:
- accounts and accurate information
- talent visibility
- casting/project applications
- career/contact submissions
- user content licence limited to platform operation
- prohibited use
- intellectual property
- third-party links
- platform availability
- verification limitations
- disclaimers
- suspension/termination
- Indian governing law

These are production-oriented platform drafts, but final publication should still receive professional legal review before launch.

## Consent / privacy-by-default

- Registration now requires explicit Terms acceptance and Privacy acknowledgement.
- Acceptance timestamp and policy version are stored on the account.
- Google first-account creation also requires equivalent acceptance.
- New member profiles default to `publicVisible=false`.
- Enabling public profile visibility records a consent timestamp.
- Member Settings explains exactly what becomes public and what remains private.
- Contact and Careers forms display short privacy notices linking to the Privacy Policy.

## SEO

Implemented:
- metadata base and canonical URLs
- page-specific title/description/canonical metadata
- OpenGraph
- Twitter card metadata
- large image preview directives
- dynamic Project metadata
- dynamic Blog metadata using CMS SEO title/description
- dynamic Casting metadata
- dynamic public Talent metadata
- dynamic sitemap entries for public projects/blogs/castings/talent
- `robots.ts`
- noindex/no-follow for admin/member/auth routes
- Organization JSON-LD
- existing brand logo used as site/social icon fallback
- real public company/service keywords
- `en-IN` document language

## Safe content deployment

`npm run db:content:dev` is dry-run.
`npm run db:content:dev:apply` writes development content.

`npm run db:content:prod` is dry-run.
`npm run db:content:prod:apply` requires the explicit production confirmation flag embedded in the command.

Production deployment itself remains frozen until Group 13 UAT approval.
