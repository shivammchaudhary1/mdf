# V1 Product Completion Patch

Implemented in this patch:
- max 8 member portfolio photographs across DTO/schema/UI/application attachments
- reusable server-side pagination primitives (hook + controls; wire page controls into long screens during UI test pass)
- applicant city snapshot and casting project-title mapping
- real opportunity compensation mapping
- project/casting detail application form
- admin verify + suspend/reactivate
- Our Work CMS kind + admin section + public page + homepage section + seed
- non-destructive Our Work seed command
- unit test for portfolio limit

Still to finish after this test pass:
- page controls on every admin/public long list (infrastructure is included)
- full project/casting media-rich CRUD UX (backend CRUD already exists)
- member skills/languages/showreel/session-device controls
- saved-list talent picker/reorder UI
- richer CMS editing, legal/public routes, footer subscription
- SMTP/Google/S3 external-service verification
- final responsive/accessibility/UAT/deployment
