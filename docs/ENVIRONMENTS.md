# Environment Convention

The project keeps exactly **three environment files per application**:

```text
apps/api/.env.dev
apps/api/.env.prod
apps/api/.env.example

apps/web/.env.dev
apps/web/.env.prod
apps/web/.env.example
```

## Rules

- `.env.dev` = real local-development values.
- `.env.prod` = real production values.
- `.env.example` = safe documentation/template only.
- `.env.dev` and `.env.prod` are ignored by Git.
- `.env.example` is safe to commit.
- Do not use `.env`, `.env.local`, `.env.development`, or `.env.production`.

## Development

```bash
npm run env:check:dev
npm run dev
```

Development starts:

```text
API -> apps/api/.env.dev
WEB -> apps/web/.env.dev
```

## Production-mode local verification

Deployment is currently frozen, but the production build path is:

```bash
npm run env:check:prod
npm run build
npm run start:prod
```

Production starts:

```text
API -> apps/api/.env.prod
WEB -> apps/web/.env.prod
```

## Development database utilities

```bash
npm run db:reset:dev
npm run db:seed:dev
npm run db:indexes:dev
```

## Production utilities

Production commands exist for later deployment work only. Do not run them during the current product-fix phase.

## Legacy files

If any of these exist, remove them after confirming their values were already copied:

```text
apps/api/.env
apps/api/.env.local
apps/api/.env.backup
apps/api/.env.local.backup

apps/web/.env
apps/web/.env.local
apps/web/.env.backup
apps/web/.env.local.backup
```
