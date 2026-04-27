# Architecture Hardening Final Report

## 1. Executive summary

The architecture hardening wave is complete with documented residual risks. The wave normalized feature ownership paths, clarified public second-data seams, extracted reusable form controls safely, moved generic query helpers to `src/shared/utils/query`, split scanner and backup UI locally for readability, renamed selected component-folder entrypoints, and closed with a passing final mobile smoke in `AR-0902D`.

The work preserved the existing product boundaries: scanner remains a shared capture tool that writes to buffer, buffer remains transient second data, forms continue to consume existing service/query/hook seams, stocks remain a derived read model, and backup/import/export remains first-data focused.

## 2. Completed structural changes

### Feature ownership

Feature owners were normalized under explicit folders:

- `src/features/arrivals/{editor,data}`
- `src/features/departures/{editor,data}`
- `src/features/drafts/{editor,data,publish}`
- `src/features/buffer/{core,picker}`
- `src/features/scanner/{runtime,modal}`
- `src/features/stocks/{data,adjustment,departure-prefill}`

These moves made route/page ownership and reusable feature ownership easier to distinguish. Page-local cards, sections, dialogs, and page-state helpers remain under `src/pages/<route>/`.

### Public seams

The wave introduced or reinforced narrow public seams for shared second-data consumers:

- `src/features/buffer/core/buffer-core.public.ts`
- `src/features/scanner/runtime/scanner-runtime.public.ts`

These seams are explicit public boundaries, not root barrels. They should stay narrow and should not export every runtime/internal helper.

### Form controls

Reusable UI-only form controls now live under:

- `src/features/form-controls/codes`
- `src/features/form-controls/date-time`
- `src/features/form-controls/money`
- `src/features/form-controls/directory`
- `src/features/form-controls/support/field-info-trigger`
- `src/features/form-controls/support/field-metadata`

The deferred non-UI-only form surfaces intentionally remain outside `form-controls`:

- `src/features/form-fields/form-section-accordion`
- `src/features/form-fields/field-family-directory/index.tsx`
- `src/features/form-fields/field-family-directory/use-directory-options.ts`
- `src/features/form-fields/field-family-directory/field-family-directory.helpers.ts`
- `src/features/form-preferences`

`form-controls` must remain UI-only and must not absorb query loading, form preference writes, submit mapping, scanner/buffer behavior, services, repositories, or Dexie access.

### Shared query helpers

Generic storage/domain-agnostic query helpers now live under:

- `src/shared/utils/query`

Current ownership is:

- `src/domain/queries` owns read-model DTO contracts only.
- `src/infrastructure/queries` owns Dexie-backed read implementations.
- `src/infrastructure/queries` consumes helpers from `src/shared/utils/query`.
- `matchesDateRange` is decoupled from domain `DateRange` through a structural generic range shape.
- `DateRange` remains a domain/common value object for product/domain contracts that need it.

No generic query helper implementation should be reintroduced under `src/domain/common/query-helpers`.

### Local UI splits

The scanner modal was split locally under `src/features/scanner/modal` into role-specific section/helper files. This was a readability split only; scanner runtime, browser adapters, buffer writes, live lifecycle, and photo/file decode behavior were not intentionally changed.

The backup workflow was split locally under `src/features/backup/ui/backup-workflow`. `BackupWorkflow` still owns the hooks and workflow state; backup domain contracts, infrastructure services, browser file adapter, JSON serialization, restore-core, durable transaction semantics, and restore behavior were not intentionally changed.

### Named component entrypoints

Selected component-folder `index.tsx` entrypoints were renamed to role-explicit files:

- `src/features/backup/ui/backup-workflow/backup-workflow.tsx`
- `src/pages/arrivals/components/arrival-card/arrival-card.tsx`
- `src/pages/departures/components/departure-card/departure-card.tsx`
- `src/pages/drafts/components/draft-card/draft-card.tsx`
- `src/pages/stocks/components/stock-card/stock-card.tsx`
- `src/pages/buffer/components/buffer-card/buffer-card.tsx`

No broad component index cleanup should continue without a new narrow task.

## 3. Verification evidence

The final verification evidence is captured in the refactor plan checkpoints.

Static and unit checks passed in `AR-0902D`:

- `npm run typecheck`
- `npm run test:unit -- tests/unit/features/arrivals`
- `npm run test:unit -- tests/unit/features/departures`
- `npm run test:unit -- tests/unit/features/drafts`
- `npm run test:unit -- tests/unit/features/buffer`
- `npm run test:unit -- tests/unit/features/scanner`
- `npm run test:unit -- tests/unit/features/form-fields`
- `npm run test:unit -- tests/unit/domain/common/query-helpers.test.ts`
- `npm run test:unit -- tests/unit/infrastructure/queries`
- `npm run test:unit -- tests/unit/domain/backup`

Runtime evidence:

- `AR-0601B` verified a real headed Chromium `MediaStream`: preview `srcObject` was a `MediaStream`, a live video track existed, live-to-photo and modal close released the stream, and reopening restored a functional live stream.
- `AR-0803` verified the backup route/workflow non-destructively, including route load, backup sections, restore disabled without a valid import, safe export path, invalid import validation, and second-data buffer exclusion from the exported payload.
- `AR-0902D` reran the final mobile smoke at 390x844 after the scanner tab label fix. Core routes loaded, create forms rendered and accepted sample title input without saving, arrival/departure buffer pickers opened and closed, scanner tabs rendered correct Cyrillic labels, buffer/stocks routes rendered, and backup route rendered with restore disabled without an import file.

Not verified and not claimed:

- Barcode decode success was not verified.
- A valid import/restore commit was not verified with an isolated fixture.
- `AR-0902D` did not reverify real camera behavior; `AR-0601B` remains the real-camera evidence.
- Full broad e2e release readiness was not claimed.

## 4. Behavior explicitly preserved

- Scanner writes only to buffer.
- Buffer remains transient second data.
- Buffer apply copies values into forms and does not delete the source buffer item.
- Forms still use existing service/query/hook boundaries.
- Directory query-backed option loading remains outside UI-only form controls.
- Form preference persistence semantics remain in `src/features/form-preferences`.
- Stocks remain a derived read model, not a durable source-of-truth table.
- Backup excludes second-data buffer from backup payloads.
- Backup restore commit was not run during the final mobile smoke.
- First-data semantics were not intentionally changed by the hardening wave.

## 5. Deferred / remaining debt

- The worktree remains heavily dirty and unstaged; it needs careful staging review before commit.
- Barcode decode fixture/runtime verification remains open.
- Valid import/restore commit verification with an isolated fixture remains open.
- First-data `*.ports.ts` naming debt remains deferred.
- `form-preferences` remains a separate second-data seam by design.
- The directory wrapper/query/preference owner remains outside `form-controls` by design.
- `src/features/form-fields/field-family-occurred-at` still exists as an empty folder and should be reviewed in a housekeeping-only slice.
- AR-0902A identified suspicious or review-worthy worktree items that should be considered during staging:
  - deleted `docs/architecture/design/*.png`;
  - modified `scripts/check-text-integrity.mjs`;
  - `field-visuals` ownership change under `src/shared/ui/field-visuals`.

## 6. Do-not-touch without separate scope

Do not reopen or change these surfaces without a separate explicit task:

- first-data domain/infrastructure service, repository, and query semantics;
- backup restore commit behavior;
- scanner live-camera lifecycle;
- browser scanner adapters;
- form-preferences persistence semantics;
- directory query-backed option loading;
- valid restore commit behavior;
- barcode decode behavior.

## 7. Recommended next tasks

Recommended future tasks should stay narrow:

- worktree staging/review plan for the hardening wave;
- barcode decode fixture verification;
- isolated backup restore commit verification;
- optional first-data `*.ports.ts` naming decision;
- optional `field-visuals` ownership decision;
- optional design PNG deletion review.

Do not start a broad refactor cleanup from this report.

## 8. Final status

Architecture hardening wave: complete with documented residual risks.
