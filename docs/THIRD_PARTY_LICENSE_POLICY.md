# Third-Party Dependency License Policy

This file governs **new third-party dependencies** added during V1 completion.

## Preferred licenses

Prefer dependencies under permissive licenses such as:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause

Avoid adding a new dependency if existing project code or the Node.js/platform standard library already solves the problem cleanly.

## Requires explicit approval

Do not add packages under these license families without explicit user approval:

- GPL
- AGPL
- SSPL
- source-available/proprietary/non-commercial licenses
- licenses with unclear or missing terms

## Required check for every new dependency

Record:

| Package | Version | Purpose | License | Why existing code was insufficient |
|---|---:|---|---|---|
| _Add rows only when a new dependency is introduced_ | | | | |

Do not add a package simply for convenience.

This policy does not change the license of the M. Dadu Films application source itself. The root package remains `UNLICENSED` unless the repository owner explicitly chooses to relicense the project.
