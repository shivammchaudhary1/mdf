# Codex Execution Workflow

This is the operating procedure for working through the M. Dadu Films project.

## Canonical checklist

`docs/progress.md` is the canonical project checklist.

Do not maintain a competing hidden checklist.

## At the start of every work session

1. Read root `AGENTS.md`.
2. Read `docs/progress.md`.
3. Identify the active stage.
4. Read the relevant code and nearest nested `AGENTS.md`.
5. Check whether required user content exists.
6. If content is missing but not technically blocking, use the shared placeholder system.

## Task loop

Repeat:

1. Select the next unchecked item in the active stage.
2. Inspect dependencies and existing implementation.
3. Make a small plan.
4. Implement.
5. Run the narrowest relevant checks first.
6. Run broader checks before declaring completion.
7. Fix failures introduced by the change.
8. Mark the exact checklist item `[x]` only after verification passes.
9. Add a short note if the implementation has a non-obvious decision.
10. Move to the next independent unchecked item.

## Blocked items

When required information is genuinely unavailable:

```md
- [!] GST number — blocked: real GST number not supplied yet.
```

Do not invent the missing data.

Continue another independent item in the same stage.

## Verification commands

From repository root:

```bash
npm run typecheck
npm run build
npm run test
```

During development:

```bash
npm run dev
```

Expected local URLs:

```text
Frontend: http://localhost:3333
Backend:  http://localhost:8888/api/v1
Swagger:  http://localhost:8888/docs
Health:   http://localhost:8888/api/v1/health
```

Run module-specific tests where available.

## Checklist integrity

Never:
- mark all items complete in bulk,
- mark an item complete based only on visual inspection,
- mark tests complete if they were not run,
- mark integration complete when only mocks exist.

## UI feedback requirement

For every mutation, account action, upload or destructive action, explicitly handle:

- loading,
- success,
- error,
- validation failure,
- empty/no-data state where relevant.

Use the shared toast and dialog components.

## Deployment rule

Deployment work stays unchecked until Stage 18.

Do not configure production AWS resources during earlier stages unless the user explicitly changes the plan.
