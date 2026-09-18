# Group 2 — Critical Functional Bugs / Data Integrity

v5 repair patch.

Fixes:
- broken CMS edit update URL,
- server-side filtering before pagination for critical admin screens,
- true `Closing Soon` casting filtering,
- CMS `Published` / `Draft` / `Scheduled` filtering,
- loading / error / retry / empty states on the major admin collections,
- integration coverage for the new backend filter behavior.

The installer is designed for Windows/Git Bash too:
- it restores only Group 2 target files from the current branch HEAD,
- normalizes CRLF to LF before applying the deterministic transformations,
- it does not touch `.env.dev` or `.env.prod`,
- deployment remains frozen.

- v4 also fixes the installer-level template-literal interpolation bug from v3.

- v5 fixes the false-positive CMS sanity check from v4.
