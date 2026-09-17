# Prompt to Start Codex

You can give Codex this prompt after opening the repository:

---

Work on the M. Dadu Films V1.0.0 repository.

First read `AGENTS.md`, `docs/progress.md`, `docs/ARCHITECTURE.md`,
`docs/CODEX_WORKFLOW.md`, and the nearest nested `AGENTS.md`.

Treat `docs/progress.md` as the canonical checklist. Work through the current
stage in order. For each unchecked item, inspect the existing code, implement
it, run the relevant tests/typechecks/build checks, and only then mark that
specific item complete. If an item is blocked by missing real content, mark it
blocked with the reason and continue with another independent item.

Do not deploy anything until the deployment stage. Do not add GraphQL, Redis,
extra roles, mobile OTP, microservices, Kubernetes, or SES.

Frontend must run on port 3333 and backend on 8888.

Keep administrator-editable content dynamic. Do not hardcode production
projects, people, posts, company legal details or gallery data in components.
If a required image has not been provided, use the repository's shared
placeholder system and continue.

All async actions must have intentional loading/success/error feedback using
the shared toast system. Destructive actions must use the shared confirmation
dialog, not browser alert/confirm.

Start with the first incomplete item in the current development stage and
continue through independent remaining items until blocked or the requested
scope is complete.
