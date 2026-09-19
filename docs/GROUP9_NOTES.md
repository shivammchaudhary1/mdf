# Group 9 — Applications, Careers, Contact & Email Product Behavior

## Applications
- Project and casting submissions remain server-validated against publish/status/deadline state.
- Public apply form now supports cover note, showreel URL, pitch, selection of existing member portfolio images, and an optional PDF upload.
- Duplicate application protection remains enforced by the unique application index.
- Member application screen now has real loading/empty states plus a detail view showing what was submitted.
- Admin application review now loads the full application record: contact snapshot, cover note, pitch, showreel, optional PDF and selected portfolio media.
- Private admin notes remain hidden from the member API.
- Status updates remain immediately visible to members and continue through the email notification path.

## Careers
- V1 stays with general career applications rather than adding a separate job-opening CMS.
- Public career submissions keep HTTPS resume/portfolio/LinkedIn links.
- Added rate limiting to public career submissions.
- Existing admin search/filter/pagination/detail/notes workflow retained.
- Candidate receives an acknowledgement email and an email when the application status changes.

## Contact
- Added rate limiting to public contact submissions.
- Sender receives an acknowledgement email.
- Configured contact inbox recipient still receives the internal notification when CONTACT_EMAIL is configured.
- Admin inbox now has search, pagination and New/Open/Replied/Resolved/Spam filters.
- Reply is a real external email-client workflow using mailto; opening it marks the query Replied.
- Open/Resolved/Spam actions are functional and audited.

## Email scope
- SMTP infrastructure is not being deployed in this group.
- Development continues to use the private local mail outbox when SMTP is absent.
- Production SMTP remains an environment/deployment concern after product/UAT approval.
