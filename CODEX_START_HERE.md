# Start Codex Here — M. Dadu Films V1.0.0

Work on the current M. Dadu Films repository without skipping the active checkpoint.

Read in this order:

1. `AGENTS.md`
2. `docs/progress.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/ARCHITECTURE.md`
5. `docs/CODEX_WORKFLOW.md`
6. the nearest nested `AGENTS.md`
7. relevant screenshots under `docs/references/ui/`

## Current priority

The repository has already been cleaned and flattened. The next work is **UI alignment + responsive
QA**, not deployment and not a blind continuation into later feature stages.

Preserve working authentication, API, profile, media and feedback behavior while improving the
presentation.

For UI work:
- use the screenshots as visual references, not as production page images,
- homepage may be cinematic/dark where appropriate,
- public inner pages should stay light/editorial/spacious,
- member/admin workspaces should remain clean and light,
- do not reuse the exact same card/grid treatment for every section,
- use centralized tokens rather than arbitrary colors,
- test roughly 360 / 768 / 1024 / 1440 widths.

Treat `docs/progress.md` as canonical. Do not mark human visual approval complete without explicit
user confirmation.

Do not deploy before Stage 18. Do not add GraphQL, Redis, extra roles, mobile OTP, microservices,
Kubernetes or SES.

Frontend: `3333`
Backend: `8888`

After each coherent slice run the relevant checks. Prefer `npm run check` for the full repository
quality gate.
