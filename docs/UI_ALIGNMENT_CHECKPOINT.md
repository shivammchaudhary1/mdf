# UI Alignment Checkpoint — 2026-09-17

This checkpoint records what the UI-foundation patch intentionally changes and what remains later.

## Changed in this pass

- GitHub Actions now targets the real `master` branch.
- Codex rules explicitly point to `docs/DESIGN_SYSTEM.md` and UI reference images.
- Human visual approval is now treated as a manual gate.
- The global CSS token system is consolidated.
- Public header/footer/page shell receive a cleaner editorial treatment.
- Homepage receives stronger cinematic/editorial rhythm.
- Content cards vary by content type instead of looking identical.
- Member/admin workspace shell receives a cleaner light-dashboard treatment.
- Backend instructions stop the transitional `platform` module from becoming a permanent catch-all.
- Stale `.gitkeep` files are removed only when their directories already contain real files.

## Intentionally not completed here

- Final reference-by-reference approval of every public page.
- Final mobile/tablet/laptop/desktop visual QA.
- Super Admin feature UI (Stage 10).
- Stage 7+ business-feature implementation.
- Big-bang backend module migration.
- Production deployment.

Those stay controlled by `docs/progress.md`.
