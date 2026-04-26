# TESTING_AND_VERIFICATION_BASELINE

This document defines the reusable engineering baseline for testing and verification discipline.

If a repository needs stricter or more specific rules than this baseline, those rules belong in:
- `docs/engineering/PROJECT_OVERRIDES.md`

## 1. Verification order

1. nearest changed surface
2. focused module / unit / integration checks
3. broader build or suite only if justified
4. runtime verification for user-visible or environment-sensitive changes when practical

Canonical repo-wide code-quality pass:

- use `npm run verify:all` when you want one local repository verification command
- expected order:
  1. `fix:all`
  2. `lint`
  3. `typecheck`
  4. `format:check`
  5. `stylelint`
- the runner must continue through all stages and fail only at the end so the full error surface is visible

## 2. Scope selection

- Narrow checks first.
- Check the touched flow first.
- Expand verification only when risk crosses module or flow boundaries.

## 3. Runtime verification

- Prefer targeted runtime verification for release-facing UI when practically possible.
- Validate external inputs at system boundaries.
- Add explicit invariant checks at critical domain transitions when failure cost is meaningful.
- Verify only affected platforms or form factors unless wider impact is likely.

## 4. Evidence standard

- Do not claim something is verified without command output, test output, or runtime evidence.
- Separate verified behavior from assumptions.
- State explicitly when runtime verification was not performed.

## 5. Regression discipline

- For bug fixes, capture expected behavior.
- Add a focused test when it materially protects the changed behavior.
- Do not mix unrelated refactor into bugfix verification.

## 6. Reporting

- State what was verified.
- State how it was verified.
- State what was not verified.
- State remaining risks or assumptions.

## 6.1 Verification artifacts

- Automated Playwright outputs belong under `.artifacts/playwright/`.
- Manual runtime screenshots and one-off verification captures belong under `.artifacts/manual/<surface>/`.
- Do not save verification screenshots, debug captures, or transient browser logs in the repository root.
- MCP browser runtime noise such as `.playwright-mcp/` is local-only and must stay git-ignored.

## 7. Done baseline

- A change is not done until verification claims match actual evidence.
- if a slice claims repo-wide code-quality closure, that claim should be backed by a passing `npm run verify:all`.
