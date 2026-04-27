# SKLAD Architecture Reorganization Plan

## 1. Problem statement

The current source tree follows the intended high-level layers, but the lower-level folder and file ownership is not yet native to read by path. `src/features` mixes reusable business workflows, read hooks, editor forms, scanner runtime, buffer state, navigation shell UI, app adapters, and shared form controls at the same top level. That makes it hard to answer "who owns this?" from a path alone.

The main structural problems are:

- multiple architecture styles are visible at once: route-local page composition, feature slices, backend-style services/repositories/queries, runtime controllers, adapters, and facade-like service composition;
- before the completed Stage 2 ownership wave, file ownership was unclear in historical feature roots such as `arrival-editor`, `arrivals-data`, `draft-publish`, `stock-adjustment`, `stock-departure-prefill`, and `scanner-runtime`;
- some roles are named by implementation accident instead of architecture role, especially facade, connector, adapter, entity, runtime, form-model, and view-model;
- form helpers are scattered across editor folders and shared form-field folders, causing repeated mapper and section composition patterns;
- feature-local shared controls risk becoming global dumping grounds unless their allowed scope is strict;
- route-local cards, sections, dialogs, and page-state helpers are now mostly under `src/pages`, but the relationship between page, feature, and shared still needs to be locked in a parent architecture plan;
- duplication exists because local composition boundaries are not always clear enough, not because the repo needs broader generic abstractions.

This document is the parent architecture-level plan. `docs/refactor/FEATURE_STRUCTURE_REFACTOR_PLAN.md` is previous narrow planning input and should be linked or deprecated only after useful findings are merged. Do not delete it unless a separate cleanup task confirms it is redundant.

## 2. Chosen architecture

SKLAD uses:

`layered modular architecture + feature/use-case co-location`

This means:

- keep the top-level layers: `app`, `router`, `pages`, `features`, `domain`, `infrastructure`, `shared`;
- keep the backend-style repository/service/query split for durable data;
- co-locate feature code by business/use-case owner instead of vague role buckets;
- keep pages thin and route-owned;
- keep scanner, buffer, and forms as explicit workflow seams;
- keep first-data domain/infrastructure boundaries leave-alone unless a concrete correctness bug is found;
- do not introduce FSD, DDD tactical nesting, Clean Architecture, Hexagonal Architecture, or port/adapter expansion as a competing model.

Layer meaning:

- `app`: bootstrap, providers, theme, root composition.
- `router`: route tree, route ids, path helpers, route metadata, navigation boundary.
- `pages`: route entry/composition, route-local sections/dialogs/lib only.
- `features`: reusable UI/workflow hooks, forms, runtime models, second-data seams, feature-local controls.
- `domain`: records, inputs, schemas, results, validators, use-case services, query DTOs.
- `infrastructure`: Dexie, repositories, query implementations, browser adapters, service composition facades/connectors.
- `shared`: generic UI primitives, i18n, routing helpers, generic utilities.

## Stage 2 ownership wave status

Status: complete as of 2026-04-27.

Completed ownership tasks:

- `AR-003` arrivals ownership move: done.
- `AR-004` departures ownership move: done.
- `AR-005` drafts ownership move: done.
- `AR-0204` buffer ownership move: done.
- `AR-0205` scanner ownership move: done.
- `AR-0206` stocks ownership move: done.
- `AR-0801` scanner/buffer runtime checkpoint: done.
- `AR-0802` mobile form runtime checkpoint: done.

Current post-move owners:

| Historical pre-move path | Current path | Status | Next action |
| --- | --- | --- | --- |
| `src/features/arrival-editor`, `src/features/arrivals-data` | `src/features/arrivals/{editor,data}` | moved; done; current owner normalized | form co-location/naming only after preflight |
| `src/features/departure-editor`, `src/features/departures-data` | `src/features/departures/{editor,data}` | moved; done; current owner normalized | form co-location/naming only after preflight |
| `src/features/draft-editor`, `src/features/drafts-data`, `src/features/draft-publish` | `src/features/drafts/{editor,data,publish}` | moved; done; current owner normalized | form co-location/naming only after preflight |
| `src/features/buffer-core`, `src/features/buffer-picker` | `src/features/buffer/{core,picker}` | moved; done; current owner normalized | no buffer behavior change; later seam cleanup only if approved |
| `src/features/scanner-runtime` | `src/features/scanner/{runtime,modal}` | moved; done; current owner normalized | no scanner behavior change; later modal/runtime simplification only if approved |
| `src/features/stocks-data`, `src/features/stock-adjustment`, `src/features/stock-departure-prefill` | `src/features/stocks/{data,adjustment,departure-prefill}` | moved; done; current owner normalized | no stock behavior change; later naming cleanup only if approved |

Verification evidence from completed checkpoints:

- Precise old moved-path import scans in `src` and `tests` are clean.
- `npm run typecheck` passed after the ownership wave and checkpoint slices.
- Runtime checkpoints passed where applicable: scanner/buffer modal and picker wiring in `AR-0801`; mobile arrival, departure, draft, and buffer route/form wiring in `AR-0802`.
- AR-0601B verified the live-camera path in a headed Chromium environment with a real `MediaStream`, active video track, tab-switch cleanup, modal-close cleanup, and reopen recovery; barcode decode success is still not claimed.
- AR-0901 synchronized active source-truth docs after the hardening wave so they no longer describe pre-move feature roots as active.

Historical inventory rows below retain pre-move paths only as planning evidence. Treat the current post-move owners in this section and the checked task statuses in the refactor queue as the source of truth.

## 3. Role vocabulary

| Role | Meaning | Allowed locations | Not allowed |
| --- | --- | --- | --- |
| record | Durable stored shape for first data. | `src/domain/<owner>` | React, Dexie implementation, feature state |
| input | Command or query input contract. | `src/domain/<owner>/<use-case>` or `src/domain/queries` | UI-only props |
| schema | Zod boundary validation for app inputs. | `src/domain/<owner>/<use-case>` | feature components, infrastructure queries |
| result | Machine-readable outcome union. | `src/domain/<owner>/<use-case>`; feature runtime result files for second data | hidden booleans for important state |
| service | Use-case validation/orchestration contract or implementation. | pure use-case service in `domain`; composition service in `infrastructure/services` | React state, components |
| repository | Thin one-table Dexie adapter. | `src/infrastructure/repositories` | query filtering, multi-table workflows |
| query | Read DTO contract. | `src/domain/queries/<owner>` | Dexie execution |
| queries | Dexie-backed read implementation. | `src/infrastructure/queries/<owner>` | command writes, UI state |
| adapter | Concrete technical boundary for browser/library/API behavior. | `src/infrastructure/browser`, `src/shared/haptics` only for truly generic browser capability | business rules, feature UI |
| connector | Real glue across a service payload and an external/runtime technical boundary. | `src/infrastructure/services/*` or browser/service integration files | proxy-only wrappers |
| facade | Stable composed public surface over concrete dependencies. | `src/infrastructure/services/*`; feature runtime facade only for UI/runtime seams | decorative re-export barrels |
| form | React form owner. | `src/features/<owner>/editor/form` | domain services, Dexie |
| form-model | Form values, local mapping, validation adapter, section state. | `src/features/<owner>/editor/form/model` | durable business validation that belongs in domain |
| view-model | UI projection local to a page or feature surface. | `src/pages/<route>/lib` or `src/features/<owner>/<surface>/model` | durable source of truth |
| hook | Thin React adapter over query, service, store, or controller. | `src/features/<owner>/**/hooks` or page-local `lib` for route state | new business rules, Dexie table access as target state |
| runtime | Imperative session/lifecycle orchestration. | `src/features/scanner/runtime`, `src/features/buffer/core` | durable entity writes |
| storage | Transient second-data store in features, durable table repository in infrastructure. | `features/*/model/*.store.ts`, `infrastructure/repositories` | mixing localStorage with durable settings |
| component | UI component. | `pages`, `features`, `shared/ui` depending on ownership | business rules |
| page | Route entry/composition. | `src/pages/<route>` | reusable workflow state |
| mapper | Explicit shape conversion. | colocated with the boundary served | catch-all shared utilities |
| validator | Boundary validation adapter. | domain schemas or form-local adapters | UI text-only checks hidden in components |
| strategy | Named variation point where variation is real. | restore mode, scanner adapter selection, other proven polymorphic seams | generic abstraction for file-count reduction |

Known vocabulary debt: `*.ports.ts` names exist in first-data domain services. Do not rename them during feature folder moves. Handle only in a later first-data naming slice after explicit approval.

## 4. Folder grammar

Default grammar:

```txt
src/<layer>/<owner>/<use-case-or-subarea>/<thing>.<role>.ts
```

Examples:

```txt
src/domain/entries/arrival/create/create-arrival.service.ts
src/infrastructure/queries/journals/arrival.queries.ts
src/features/arrivals/editor/form/model/arrival-form.mapper.ts
src/features/scanner/runtime/scanner-runtime.facade.ts
```

Exceptions:

- React components use `.tsx`.
- Existing `index.tsx` files may remain during migration.
- New component files should prefer named files such as `arrival-list.card.tsx`, `scanner-live.panel.tsx`, and `backup-history.section.tsx`.
- Use `index.ts` only for real public boundaries.
- Route files stay route-named under `src/pages/<route>/`.
- i18n catalogs keep message/catalog names.
- config files keep config-specific names.
- tests mirror the behavior/source owner and may keep test-oriented names.

Forbidden dumping-ground names:

- `helpers`
- `utils`
- `common`
- `misc`

Existing files with those names should not be expanded. Rename or split them only in a bounded cleanup slice.

## 5. Target structure

### `src/features`

```txt
src/features/
  arrivals/
    data/
      hooks/
    editor/
      arrival-editor.tsx
      arrival-editor-loading-state.tsx
      arrival-editor-not-found-state.tsx
      form/
        arrival-buffer-apply.form-adapter.ts
        arrival-editor.form.tsx
        arrival-editor.actions.tsx
        arrival-editor.sections.tsx
        model/
        sections/

  departures/
    data/
      hooks/
    editor/
      form/
        model/
        sections/

  drafts/
    data/
      hooks/
    editor/
      form/
        fields/
        model/
        sections/
    publish/
      hooks/

  scanner/
    runtime/
      model/
    modal/
      hooks/
      sections/

  buffer/
    core/
      model/
    picker/
      ui/

  stocks/
    data/
      hooks/
    adjustment/
    departure-prefill/

  settings/
    personalization/
      hooks/
    ui-settings/

  backup/
    hooks/
    workflow/

  directories/
    data/
      hooks/

  codes/
    data/
      hooks/

  form-controls/
    codes/
    directory/
    date-time/
    primitive-fields/
    preferences/

  navigation/
    overlay/
    shell/
    bottom-nav/

  dashboard/
  pwa/
```

`features/form-controls` is allowed only for reusable UI form controls used by multiple feature editors. It must not contain domain write logic, entity-specific mappers, submit orchestration, durable services, or catch-all helpers.

Expected major feature subareas:

- `arrivals`: `data`, `editor`.
- `departures`: `data`, `editor`.
- `drafts`: `data`, `editor`, `publish`.
- `scanner`: `runtime`, `modal`.
- `buffer`: `core`, `picker`.
- `stocks`: `data`, `adjustment`, `departure-prefill`.
- `settings`: `personalization`, `ui-settings`.
- `backup`: `hooks`, `workflow`.
- `directories`: `data`.
- `codes`: `data`.

### `src/pages`

```txt
src/pages/
  <route>/
    <route>-page.tsx
    components/
    sections/
    dialogs/
    lib/
```

Pages own route entry/composition, route-local cards, route-local sections, route-local dialogs/drawers, and route-local view state. Pages do not own reusable feature workflows, scanner runtime, buffer storage, or durable business rules.

### `src/domain`

Keep current high-level shape:

```txt
src/domain/
  backup/
  codes/
  common/
  directories/
  drafts/
  entries/
  queries/
  settings/
  validation/
```

Target refinements:

- records, inputs, schemas, results, validators, services stay here;
- query DTOs stay under `domain/queries`;
- generic query helper functions live under `src/shared/utils/query` and stay out of `domain/queries`;
- `*.ports.ts` stays untouched until approved.

### `src/infrastructure`

```txt
src/infrastructure/
  browser/
  db/
  queries/
  repositories/
  restore-core/
  serialization/
  services/
```

Infrastructure owns Dexie, repositories, query implementations, browser adapters, technical engines, and service composition facades/connectors.

### `src/shared`

```txt
src/shared/
  config/
  gestures/
  haptics/
  i18n/
  lib/
  routing/
  types/
  ui/
  utils/
```

Shared must remain generic. Domain-specific form controls do not move here. Generic query helpers live under `shared/utils/query`.

### `src/router`

```txt
src/router/
  components/
  hooks/
  layouts/
  lib/
  tree/
  types/
```

Router owns route tree, route ids, path generation, route metadata, navigation hooks, and route-aware link components. It must not own feature business logic.

## 6. Ownership matrix

Current likely locations that reference completed Stage 2 roots are historical pre-move evidence. Active post-move paths are listed under target owner/current owner.

| Concern | Current likely location | Target owner | Allowed dependencies | Forbidden dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| arrival form helpers | `features/arrival-editor/form/model` | `features/arrivals/editor/form/model` | domain contracts, form-controls, buffer copy result | Dexie, repositories | Move in arrivals folder slice only. |
| departure form helpers | `features/departure-editor/form/model` | `features/departures/editor/form/model` | domain contracts, form-controls, scanner facade | Dexie | Preserve linked-arrival behavior. |
| draft publish helpers | `features/draft-publish`, `domain/drafts/publish` | `domain/drafts/publish` + `features/drafts/publish` | arrival/departure service facades | page logic | Do not reopen first-data publish service without bug. |
| scanner runtime | `features/scanner-runtime/model` | `features/scanner/runtime` | buffer core, overlay arbitration, infrastructure scanner adapter | durable records | Runtime coordinates second-data seams. |
| scanner adapters | `infrastructure/browser/scanner` | same | browser APIs, ZXing | React, buffer store | Adapter owns browser capability/lifecycle/decode. |
| buffer storage | `features/buffer-core/model` | `features/buffer/core/model` | localStorage/zustand, shared id/time | IndexedDB | Second data only. |
| buffer picker | `features/buffer-picker/ui` | `features/buffer/picker/ui` | buffer core, overlay arbitration | deleting source buffer on apply | Copy-not-delete invariant. |
| record-code UI fields | `features/form-fields/field-family-codes` | `features/form-controls/codes` | record-code domain types | record-code repository | UI control only. |
| directory fields | `features/form-fields/field-family-directory` | `features/form-controls/directory` | directory read hooks | direct repository/Dexie | Keep directory write rules out. |
| backup import/export UI | `features/backup/hooks`, `features/backup/ui` | `features/backup/hooks`, `features/backup/workflow` | backup hooks, infrastructure browser-file adapter via hook seam | raw Dexie in UI | High-risk runtime flow. |
| backup restore connectors | `infrastructure/services/backup` | same | backup domain, restore-core, repositories | feature UI | Restore commit remains infrastructure transaction. |
| stock projection UI | `pages/stocks`, `features/stocks-data` | route page + `features/stocks/data` | stock query hook | durable stock table | Stocks are derived read model. |
| route navigation metadata | `router/tree` | `router` | pages, shared routing | feature business logic | Large tree can split later. |
| generic UI primitives | `shared/ui` | `shared/ui` | Mantine/theme, generic props | domain-specific records | Do not absorb product semantics. |
| query sorting/pagination helpers | `shared/utils/query` | current owner | storage/domain-agnostic values | Dexie, React, domain records | Moved in `AR-0508B`; keep domain coupling out. |

## 7. Import direction rules

Allowed direction:

- `app` may import providers, router, theme, shared setup.
- `router` may import pages and shared routing, plus feature navigation UI only through root layout where already accepted.
- `pages` may import `features`, `router`, `domain` DTO types, and `shared`.
- `features` may import feature hooks/models, shared UI, domain contracts, and service/query facades.
- `domain` may import pure domain/common/validation code and Zod.
- `infrastructure` may import domain contracts, Dexie, browser/library APIs, shared pure utilities, repositories, and services.
- `shared` may import only generic libraries and app theme where the primitive is intentionally visual.

Forbidden direction:

- `features` must not import Dexie tables directly as target state. Current direct `appDb` hook usage is accepted debt and must not expand.
- `features` must not instantiate repositories as target state. Current instances in first-data hooks are accepted debt and must not expand.
- `domain` must not import React, Mantine, Dexie, browser APIs, feature code, router code, or infrastructure implementation.
- `infrastructure` must not import React pages/components.
- `shared` must not import domain-specific modules.
- `pages` must not own durable business logic.

## 8. Current inventory and historical move evidence

Action meanings:

- keep: current owner is acceptable until touched.
- move: historical pure folder/path move, no behavior change; if the row references a completed Stage 2 owner, the move is already done.
- rename: file role name should change in a later naming slice.
- split: oversized owner should be decomposed locally.
- merge: fold into a clearer local owner.
- delete: only after reference search confirms stale/dead artifact.
- needs-decision: requires explicit approval because it could touch first-data, route policy, or UI behavior.

### `src/features`

Rows that reference old Stage 2 folders are historical pre-move paths. They are not active folders after `AR-003`, `AR-004`, `AR-005`, `AR-0204`, `AR-0205`, and `AR-0206`. For completed ownership moves, the path in the current-path column is the active owner path; remaining `move/rename` wording describes later naming cleanup, not active old-folder ownership.

| Historical pre-move path | Detected role | Detected owner | Current path | Status / next action | Reason | Risk | Validation needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/arrival-editor/arrival-editor.tsx` | editor component | arrival-editor | `src/features/arrivals/editor/arrival-editor.tsx` | move | co-locate under arrivals owner | medium | typecheck; arrival route smoke |
| `src/features/arrival-editor/arrival-editor-loading-state.tsx` | editor state component | arrival-editor | `src/features/arrivals/editor/arrival-editor-loading-state.tsx` | move | same editor owner | low | typecheck |
| `src/features/arrival-editor/arrival-editor-not-found-state.tsx` | editor state component | arrival-editor | `src/features/arrivals/editor/arrival-editor-not-found-state.tsx` | move | same editor owner | low | typecheck |
| `src/features/arrival-editor/form/arrival-buffer-apply.ts` | form buffer adapter | arrival-editor | `src/features/arrivals/editor/form/arrival-buffer-apply.form-adapter.ts` | move/rename | explicit form adapter role | medium | buffer apply tests |
| `src/features/arrival-editor/form/arrival-editor-form.tsx` | form | arrival-editor | `src/features/arrivals/editor/form/arrival-editor.form.tsx` | move/rename | named form file | medium | arrival form smoke |
| `src/features/arrival-editor/form/arrival-editor-form-actions.tsx` | form actions component | arrival-editor | `src/features/arrivals/editor/form/arrival-editor.actions.tsx` | move/rename | clearer role name | low | typecheck |
| `src/features/arrival-editor/form/arrival-editor-form-sections.tsx` | form section composer | arrival-editor | `src/features/arrivals/editor/form/arrival-editor.sections.tsx` | move/rename | clearer role name | low | typecheck |
| `src/features/arrival-editor/form/model/arrival-form.constants.ts` | form-model constants | arrival-editor | `src/features/arrivals/editor/form/model/arrival-form.constants.ts` | move | form-local model | low | typecheck |
| `src/features/arrival-editor/form/model/arrival-form.mappers.ts` | form-model mapper | arrival-editor | `src/features/arrivals/editor/form/model/arrival-form.mapper.ts` | move/rename | singular role naming | medium | mapper tests |
| `src/features/arrival-editor/form/model/arrival-form.types.ts` | form-model types | arrival-editor | `src/features/arrivals/editor/form/model/arrival-form.types.ts` | move | local model contracts | low | typecheck |
| `src/features/arrival-editor/form/model/arrival-form.validation.ts` | form validator | arrival-editor | `src/features/arrivals/editor/form/model/arrival-form.validator.ts` | move/rename | explicit validator role | medium | form validation tests |
| `src/features/arrival-editor/form/model/use-arrival-form.ts` | form hook | arrival-editor | `src/features/arrivals/editor/form/model/use-arrival-form.ts` | move | form-local hook | medium | arrival form smoke |
| `src/features/arrival-editor/form/model/use-arrival-section-navigation.ts` | form section state hook | arrival-editor | `src/features/arrivals/editor/form/model/use-arrival-section-navigation.ts` | move | form-local view state | low | typecheck |
| `src/features/arrival-editor/form/sections/additional-section/index.tsx` | form section component | arrival-editor | `src/features/arrivals/editor/form/sections/arrival-additional.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/arrival-editor/form/sections/directories-section/index.tsx` | form section component | arrival-editor | `src/features/arrivals/editor/form/sections/arrival-directories.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/arrival-editor/form/sections/main-section/index.tsx` | form section component | arrival-editor | `src/features/arrivals/editor/form/sections/arrival-main.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/arrival-editor/hooks/use-create-arrival.ts` | write hook | arrival-editor | `src/features/arrivals/editor/hooks/use-create-arrival.ts` | move | editor write facade hook | low | typecheck |
| `src/features/arrival-editor/hooks/use-delete-arrival.ts` | write hook | arrival-editor | `src/features/arrivals/editor/hooks/use-delete-arrival.ts` | move | editor write facade hook | low | typecheck |
| `src/features/arrival-editor/hooks/use-update-arrival.ts` | write hook | arrival-editor | `src/features/arrivals/editor/hooks/use-update-arrival.ts` | move | editor write facade hook | low | typecheck |
| `src/features/arrivals-data/hooks/use-arrival-details.ts` | read hook | arrivals-data | `src/features/arrivals/data/hooks/use-arrival-details.ts` | move | co-locate arrival data hooks | medium | typecheck; arrival details smoke |
| `src/features/arrivals-data/hooks/use-arrival-list.ts` | read hook | arrivals-data | `src/features/arrivals/data/hooks/use-arrival-list.ts` | move | co-locate arrival data hooks | medium | typecheck; arrival list smoke |
| `src/features/backup/hooks/use-backup-checkpoint-details.ts` | read hook | backup | same | keep | first-data backup hook debt; no move needed now | low | backup regression if touched |
| `src/features/backup/hooks/use-backup-checkpoint-list.ts` | read hook | backup | same | keep | backup owner already clear | low | backup regression if touched |
| `src/features/backup/hooks/use-backup-export.ts` | export hook/browser handoff | backup | same | keep | high-risk flow; defer cleanup | medium | backup export smoke if touched |
| `src/features/backup/hooks/use-backup-history-details.ts` | read hook | backup | same | keep | backup owner already clear | low | backup regression if touched |
| `src/features/backup/hooks/use-backup-history-list.ts` | read hook | backup | same | keep | backup owner already clear | low | backup regression if touched |
| `src/features/backup/hooks/use-backup-import-validation.ts` | import validation hook | backup | same | keep | high-risk flow; defer cleanup | medium | backup import tests |
| `src/features/backup/hooks/use-backup-restore.ts` | restore hook | backup | same | keep | high-risk flow; defer cleanup | medium | restore regression |
| `src/features/backup/hooks/use-create-backup-checkpoint.ts` | checkpoint hook | backup | same | keep | backup owner already clear | low | typecheck |
| `src/features/backup/ui/backup-workflow/backup-action-status-alert.tsx` | workflow component | backup | `src/features/backup/workflow/backup-action-status.alert.tsx` | move/rename | normalize workflow owner | medium | backup smoke |
| `src/features/backup/ui/backup-workflow/backup-checkpoints-section.tsx` | workflow section | backup | `src/features/backup/workflow/backup-checkpoints.section.tsx` | move/rename | normalize section role | medium | backup smoke |
| `src/features/backup/ui/backup-workflow/backup-history-section.tsx` | workflow section | backup | `src/features/backup/workflow/backup-history.section.tsx` | move/rename | normalize section role | medium | backup smoke |
| `src/features/backup/ui/backup-workflow/backup-workflow.model.ts` | workflow view-model | backup | `src/features/backup/workflow/backup-workflow.view-model.ts` | move/rename | explicit view-model role | medium | backup smoke |
| `src/features/backup/ui/backup-workflow/index.tsx` | workflow component | backup | `src/features/backup/workflow/backup-workflow.tsx` | move/rename | avoid new index.tsx | high | backup runtime smoke |
| `src/features/buffer-core/model/buffer-apply.controller.instance.ts` | controller singleton | buffer-core | `src/features/buffer/core/model/buffer-apply.controller.instance.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-apply.controller.ts` | controller | buffer-core | `src/features/buffer/core/model/buffer-apply.controller.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-apply.result.ts` | result | buffer-core | `src/features/buffer/core/model/buffer-apply.result.ts` | move | buffer core owner | low | typecheck |
| `src/features/buffer-core/model/buffer-apply.session-store.ts` | second-data store | buffer-core | `src/features/buffer/core/model/buffer-apply.session-store.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-apply.types.ts` | model types | buffer-core | `src/features/buffer/core/model/buffer-apply.types.ts` | move | buffer core owner | low | typecheck |
| `src/features/buffer-core/model/buffer-control.controller.instance.ts` | controller singleton | buffer-core | `src/features/buffer/core/model/buffer-control.controller.instance.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-control.controller.ts` | controller | buffer-core | `src/features/buffer/core/model/buffer-control.controller.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-control.result.ts` | result | buffer-core | `src/features/buffer/core/model/buffer-control.result.ts` | move | buffer core owner | low | typecheck |
| `src/features/buffer-core/model/buffer-control.session-store.ts` | second-data store | buffer-core | `src/features/buffer/core/model/buffer-control.session-store.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-control.types.ts` | model types | buffer-core | `src/features/buffer/core/model/buffer-control.types.ts` | move | buffer core owner | low | typecheck |
| `src/features/buffer-core/model/buffer-item.ts` | model factory | buffer-core | `src/features/buffer/core/model/buffer-item.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-store.ts` | store singleton | buffer-core | `src/features/buffer/core/model/buffer-store.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-core/model/buffer-store.types.ts` | store types | buffer-core | `src/features/buffer/core/model/buffer-store.types.ts` | move | buffer core owner | low | typecheck |
| `src/features/buffer-core/model/create-buffer-store.ts` | store factory | buffer-core | `src/features/buffer/core/model/create-buffer-store.ts` | move | buffer core owner | medium | buffer tests |
| `src/features/buffer-picker/ui/buffer-picker-modal/index.tsx` | picker component | buffer-picker | `src/features/buffer/picker/buffer-picker.modal.tsx` | move/rename | buffer picker subarea | high | buffer picker e2e |
| `src/features/buffer-picker/ui/buffer-picker-modal/styles.module.css` | picker style | buffer-picker | `src/features/buffer/picker/buffer-picker.module.css` | move/rename | local component style | medium | visual smoke |
| `src/features/codes/hooks/use-record-code-details.ts` | read hook | codes | `src/features/codes/data/hooks/use-record-code-details.ts` | move | data hook subarea | low | typecheck |
| `src/features/codes/hooks/use-record-code-list.ts` | read hook | codes | `src/features/codes/data/hooks/use-record-code-list.ts` | move | data hook subarea | low | typecheck |
| `src/features/codes/hooks/use-record-code-lookup.ts` | read hook | codes | `src/features/codes/data/hooks/use-record-code-lookup.ts` | move | data hook subarea | low | typecheck |
| `src/features/dashboard/model/use-home-favorites.ts` | dashboard model hook | dashboard | same | keep/needs-decision | app/dashboard ownership acceptable but route coupling exists | medium | dashboard smoke |
| `src/features/dashboard/model/use-telemetry.ts` | dashboard model hook | dashboard | same | keep/needs-decision | app/dashboard ownership acceptable but route coupling exists | medium | dashboard smoke |
| `src/features/departure-editor/form/departure-buffer-apply.ts` | form buffer adapter | departure-editor | `src/features/departures/editor/form/departure-buffer-apply.form-adapter.ts` | move/rename | explicit form adapter role | medium | buffer apply tests |
| `src/features/departure-editor/form/departure-editor-form.tsx` | form | departure-editor | `src/features/departures/editor/form/departure-editor.form.tsx` | move/rename | named form file | medium | departure form smoke |
| `src/features/departure-editor/form/departure-editor-form-actions.tsx` | form actions component | departure-editor | `src/features/departures/editor/form/departure-editor.actions.tsx` | move/rename | clearer role name | low | typecheck |
| `src/features/departure-editor/form/departure-editor-form-sections.tsx` | form section composer | departure-editor | `src/features/departures/editor/form/departure-editor.sections.tsx` | move/rename | clearer role name | low | typecheck |
| `src/features/departure-editor/form/departure-form-modal.tsx` | modal component | departure-editor | `src/features/departures/editor/form/departure-form.modal.tsx` | move/rename | explicit modal role | medium | departure modal smoke |
| `src/features/departure-editor/form/model/departure-form.constants.ts` | form-model constants | departure-editor | `src/features/departures/editor/form/model/departure-form.constants.ts` | move | form-local model | low | typecheck |
| `src/features/departure-editor/form/model/departure-form.mappers.ts` | form-model mapper | departure-editor | `src/features/departures/editor/form/model/departure-form.mapper.ts` | move/rename | singular role naming | medium | mapper tests |
| `src/features/departure-editor/form/model/departure-form.types.ts` | form-model types | departure-editor | `src/features/departures/editor/form/model/departure-form.types.ts` | move | local model contracts | low | typecheck |
| `src/features/departure-editor/form/model/departure-form.validation.ts` | form validator | departure-editor | `src/features/departures/editor/form/model/departure-form.validator.ts` | move/rename | explicit validator role | medium | form validation tests |
| `src/features/departure-editor/form/model/use-departure-form.ts` | form hook | departure-editor | `src/features/departures/editor/form/model/use-departure-form.ts` | move | form-local hook | medium | departure form smoke |
| `src/features/departure-editor/form/model/use-departure-section-navigation.ts` | form section state hook | departure-editor | `src/features/departures/editor/form/model/use-departure-section-navigation.ts` | move | form-local view state | low | typecheck |
| `src/features/departure-editor/form/sections/additional-section/index.tsx` | form section component | departure-editor | `src/features/departures/editor/form/sections/departure-additional.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/departure-editor/form/sections/directories-section/index.tsx` | form section component | departure-editor | `src/features/departures/editor/form/sections/departure-directories.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/departure-editor/form/sections/main-section/index.tsx` | form section component | departure-editor | `src/features/departures/editor/form/sections/departure-main.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/departure-editor/form/sections/relation-section/index.tsx` | form section component | departure-editor | `src/features/departures/editor/form/sections/departure-relation.section.tsx` | move/rename | avoid new index.tsx | medium | linked-arrival smoke |
| `src/features/departure-editor/hooks/use-create-departure.ts` | write hook | departure-editor | `src/features/departures/editor/hooks/use-create-departure.ts` | move | editor write facade hook | low | typecheck |
| `src/features/departure-editor/hooks/use-delete-departure.ts` | write hook | departure-editor | `src/features/departures/editor/hooks/use-delete-departure.ts` | move | editor write facade hook | low | typecheck |
| `src/features/departure-editor/hooks/use-update-departure.ts` | write hook | departure-editor | `src/features/departures/editor/hooks/use-update-departure.ts` | move | editor write facade hook | low | typecheck |
| `src/features/departures-data/hooks/use-departure-details.ts` | read hook | departures-data | `src/features/departures/data/hooks/use-departure-details.ts` | move | co-locate departure data hooks | medium | typecheck; details smoke |
| `src/features/departures-data/hooks/use-departure-list.ts` | read hook | departures-data | `src/features/departures/data/hooks/use-departure-list.ts` | move | co-locate departure data hooks | medium | typecheck; list smoke |
| `src/features/directories/hooks/use-category-list.ts` | read hook | directories | `src/features/directories/data/hooks/use-category-list.ts` | move | data hook subarea | low | typecheck |
| `src/features/directories/hooks/use-product-list.ts` | read hook | directories | `src/features/directories/data/hooks/use-product-list.ts` | move | data hook subarea | low | typecheck |
| `src/features/directories/hooks/use-supplier-list.ts` | read hook | directories | `src/features/directories/data/hooks/use-supplier-list.ts` | move | data hook subarea | low | typecheck |
| `src/features/draft-editor/draft-editor-form-actions.tsx` | form actions component | draft-editor | `src/features/drafts/editor/form/draft-editor.actions.tsx` | move/rename | draft editor owner | low | typecheck |
| `src/features/draft-editor/draft-editor-form-sections.tsx` | form section composer | draft-editor | `src/features/drafts/editor/form/draft-editor.sections.tsx` | move/rename | draft editor owner | low | typecheck |
| `src/features/draft-editor/fields/draft-kind-field/index.tsx` | form field component | draft-editor | `src/features/drafts/editor/form/fields/draft-kind.field.tsx` | move/rename | draft-specific field | low | typecheck |
| `src/features/draft-editor/index.tsx` | form/editor component | draft-editor | `src/features/drafts/editor/draft-editor.tsx` | move/rename | avoid public index as component | medium | draft form smoke |
| `src/features/draft-editor/model/draft-form.constants.ts` | form-model constants | draft-editor | `src/features/drafts/editor/form/model/draft-form.constants.ts` | move | form-local model | low | typecheck |
| `src/features/draft-editor/model/draft-form.mappers.ts` | form-model mapper | draft-editor | `src/features/drafts/editor/form/model/draft-form.mapper.ts` | move/rename | singular role naming | medium | mapper tests |
| `src/features/draft-editor/model/draft-form.types.ts` | form-model types | draft-editor | `src/features/drafts/editor/form/model/draft-form.types.ts` | move | local model contracts | low | typecheck |
| `src/features/draft-editor/model/draft-form.validation.ts` | form validator | draft-editor | `src/features/drafts/editor/form/model/draft-form.validator.ts` | move/rename | explicit validator role | medium | validation tests |
| `src/features/draft-editor/model/use-draft-form.ts` | form hook | draft-editor | `src/features/drafts/editor/form/model/use-draft-form.ts` | move | form-local hook | medium | draft form smoke |
| `src/features/draft-editor/model/use-draft-section-navigation.ts` | form section state hook | draft-editor | `src/features/drafts/editor/form/model/use-draft-section-navigation.ts` | move | form-local view state | low | typecheck |
| `src/features/draft-editor/sections/additional-section/index.tsx` | form section component | draft-editor | `src/features/drafts/editor/form/sections/draft-additional.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/draft-editor/sections/directories-section/index.tsx` | form section component | draft-editor | `src/features/drafts/editor/form/sections/draft-directories.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/draft-editor/sections/main-section/index.tsx` | form section component | draft-editor | `src/features/drafts/editor/form/sections/draft-main.section.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/draft-editor/sections/publish-meta-section/index.tsx` | form section component | draft-editor | `src/features/drafts/editor/form/sections/draft-publish-meta.section.tsx` | move/rename | draft-specific section | low | typecheck |
| `src/features/draft-editor/sections/relation-section/index.tsx` | form section component | draft-editor | `src/features/drafts/editor/form/sections/draft-relation.section.tsx` | move/rename | draft-specific section | medium | draft/departure relation smoke |
| `src/features/draft-publish/hooks/use-publish-draft.ts` | publish hook | draft-publish | `src/features/drafts/publish/hooks/use-publish-draft.ts` | move | co-locate draft publish feature | medium | draft publish smoke |
| `src/features/drafts-data/hooks/use-create-draft.ts` | write hook | drafts-data | `src/features/drafts/data/hooks/use-create-draft.ts` | move | draft data hook | low | typecheck |
| `src/features/drafts-data/hooks/use-delete-draft.ts` | write hook | drafts-data | `src/features/drafts/data/hooks/use-delete-draft.ts` | move | draft data hook | low | typecheck |
| `src/features/drafts-data/hooks/use-draft-details.ts` | read hook | drafts-data | `src/features/drafts/data/hooks/use-draft-details.ts` | move | draft data hook | low | typecheck |
| `src/features/drafts-data/hooks/use-draft-list.ts` | read hook | drafts-data | `src/features/drafts/data/hooks/use-draft-list.ts` | move | draft data hook | low | typecheck |
| `src/features/drafts-data/hooks/use-update-draft.ts` | write hook | drafts-data | `src/features/drafts/data/hooks/use-update-draft.ts` | move | draft data hook | low | typecheck |
| `src/features/form-fields/field-family-codes/*` | reusable form control | form-fields | `src/features/form-controls/codes/*` | move | multiple editor control | medium | form field tests |
| `src/features/form-fields/field-family-departure-mode/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/departure-mode/*` | move | multiple editor control | medium | form field tests |
| `src/features/form-fields/field-family-description/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/description/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-family-direction/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/direction/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-family-directory/*` | reusable form control | form-fields | `src/features/form-controls/directory/*` | move | directory form control | medium | directory field tests |
| `src/features/form-fields/field-family-link-url/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/link-url/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-family-money/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/money/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-family-note/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/note/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-family-occurred-at/*` | reusable form control | form-fields | `src/features/form-controls/date-time/*` | move | date-time form control | medium | date field tests |
| `src/features/form-fields/field-family-subject-kind/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/subject-kind/*` | move | multiple editor control | medium | field tests |
| `src/features/form-fields/field-family-title/*` | reusable form control | form-fields | `src/features/form-controls/primitive-fields/title/*` | move | multiple editor control | low | typecheck |
| `src/features/form-fields/field-info-trigger/*` | reusable form control support | form-fields | `src/features/form-controls/primitive-fields/field-info-trigger/*` | move | form-control-only support | medium | help popover tests |
| `src/features/form-fields/field-metadata/*` | reusable form metadata | form-fields | `src/features/form-controls/primitive-fields/field-metadata/*` | move | form-control-only support | medium | field tests |
| `src/features/form-fields/form-section-accordion/*` | reusable form section UI | form-fields | `src/features/form-controls/primitive-fields/form-section-accordion/*` | move | form-control-only support | medium | form layout smoke |
| `src/features/form-preferences/model/form-preferences.keys.ts` | preference keys | form-preferences | `src/features/form-controls/preferences/model/form-preferences.keys.ts` | move | form-control preference seam | low | typecheck |
| `src/features/form-preferences/model/form-preferences.store.ts` | second-data store | form-preferences | `src/features/form-controls/preferences/model/form-preferences.store.ts` | move | transient form preferences | medium | preference tests |
| `src/features/form-preferences/model/form-preferences.types.ts` | preference types | form-preferences | `src/features/form-controls/preferences/model/form-preferences.types.ts` | move | form-control preference seam | low | typecheck |
| `src/features/navigation/model/create-overlay-arbitration-store.ts` | overlay store factory | navigation | `src/features/navigation/overlay/create-overlay-arbitration-store.ts` | move | overlay subarea | medium | scanner/buffer overlay smoke |
| `src/features/navigation/model/overlay-arbitration.store.ts` | overlay store singleton | navigation | `src/features/navigation/overlay/overlay-arbitration.store.ts` | move | overlay subarea | medium | overlay smoke |
| `src/features/navigation/model/overlay-arbitration.types.ts` | overlay types | navigation | `src/features/navigation/overlay/overlay-arbitration.types.ts` | move | overlay subarea | low | typecheck |
| `src/features/navigation/ui/app-overlay-host/index.tsx` | overlay host | navigation | `src/features/navigation/overlay/app-overlay-host.tsx` | move/rename | overlay subarea | medium | scanner/buffer smoke |
| `src/features/navigation/ui/mobile-bottom-nav/*` | bottom nav UI | navigation | `src/features/navigation/bottom-nav/*` | move | navigation subarea | medium | route nav smoke |
| `src/features/navigation/ui/mobile-shell/index.tsx` | shell component | navigation | `src/features/navigation/shell/mobile-shell.tsx` | move/rename | shell subarea | medium | mobile shell smoke |
| `src/features/navigation/ui/mobile-shell/network-status.tsx` | shell status component | navigation | `src/features/navigation/shell/network-status.tsx` | move | shell subarea | low | typecheck |
| `src/features/navigation/ui/mobile-shell/styles.module.css` | shell style | navigation | `src/features/navigation/shell/mobile-shell.module.css` | move/rename | local shell style | medium | mobile visual smoke |
| `src/features/pwa/ui/pwa-status-banner/index.tsx` | PWA UI | pwa | `src/features/pwa/pwa-status-banner.tsx` | move/rename | avoid new index.tsx | low | typecheck |
| `src/features/scanner-runtime/model/*` | scanner runtime model | scanner-runtime | `src/features/scanner/runtime/model/*` | move | scanner runtime owner | high | scanner runtime tests |
| `src/features/scanner-runtime/model/scanner-runtime.facade.ts` | runtime facade | scanner-runtime | `src/features/scanner/runtime/model/scanner-runtime.facade.ts` | move | stable feature runtime facade | high | scanner modal smoke |
| `src/features/scanner-runtime/ui/scanner-modal/*` | scanner modal UI | scanner-runtime | `src/features/scanner/modal/*` | move | separate runtime from modal UI | high | scanner modal e2e |
| `src/features/settings/hooks/*` | personalization hooks | settings | `src/features/settings/personalization/hooks/*` | move | settings subarea | medium | settings smoke |
| `src/features/settings/model/use-ui-settings.ts` | UI settings hook | settings | `src/features/settings/ui-settings/use-ui-settings.ts` | move | UI settings subarea | medium | theme smoke |
| `src/features/stock-adjustment/stock-adjustment.ts` | stock use-case helper | stock-adjustment | `src/features/stocks/adjustment/stock-adjustment.ts` | move | stocks owner | medium | stock adjustment tests |
| `src/features/stock-departure-prefill/stock-departure-prefill.ts` | prefill helper | stock-departure-prefill | `src/features/stocks/departure-prefill/stock-departure-prefill.ts` | move | stocks owner | medium | stock-to-departure smoke |
| `src/features/stocks-data/hooks/use-stock-list.ts` | read hook | stocks-data | `src/features/stocks/data/hooks/use-stock-list.ts` | move | stocks data owner | medium | stock query smoke |

Grouped rows above with `*` were grouped in the historical pre-move inventory where every file in the folder had the same detected role, owner, action, reason, risk, and validation. Completed Stage 2 grouped moves are now represented by their current owner paths.

### Suspicious files outside `src/features`

| Current path | Issue | Target owner/action | Risk | Validation |
| --- | --- | --- | --- | --- |
| `src/shared/utils/query/*` | generic query helpers are not domain DTOs | current owner; keep out of `domain/queries` | low | query unit tests; typecheck |
| `src/domain/**/**/*.ports.ts` | port vocabulary conflicts with chosen model | defer; do not rename without approval | high | first-data regression suite |
| `src/router/tree/app-route-tree.tsx` | large route tree and metadata owner | keep in router; split later by route subtree only if needed | medium | route smoke |
| `src/pages/ui-kit/index.tsx` | oversized dev-only page | keep; split in UI-kit-specific slice | low | ui-kit smoke |
| `src/pages/device-preview/index.tsx` | oversized dev-only page | keep; split in device-preview slice | low | device-preview smoke |
| `src/shared/utils/type-guards.ts` | oversized generic utility | split only when touched | low | unit tests |
| `src/shared/ui/collection-section/index.tsx` | large generic list primitive | keep shared and generic | medium | list route smoke |
| `src/shared/ui/record-card/index.tsx` | generic card/drawer primitive with product drift risk | keep shared only while generic | medium | list/card smoke |
| `src/shared/ui/field-visuals/*` | generic visual primitive currently untracked in worktree | keep shared only if domain-agnostic | low | typecheck |

## 9. Duplication and composition map

| Locations | Repeated responsibility | Target owner | Extraction type | Decision |
| --- | --- | --- | --- | --- |
| arrival/departure/draft form mappers | form values to domain inputs and details to form values | owning editor form model | co-locate with form | Do not move to shared; extract identical pure date/code pieces only after tests. |
| arrival/departure buffer apply adapters | copy buffer values into form code fields | owning editor form | feature-local model helper or no extraction | Preserve copy-not-delete invariant. |
| editor form actions/sections | sticky actions and accordion composition | owning editor form | co-locate with form | Keep editor-local unless identical and stable. |
| directory field families | option loading and select composition | `features/form-controls/directory` | feature-local shared component | UI control only, no directory write rules. |
| code fields | serial/code token entry and field metadata | `features/form-controls/codes` | feature-local shared component | Keep scanner/business lookup outside. |
| field metadata/help trigger | field labels, help trigger, popover content | `features/form-controls/primitive-fields` | feature-local shared component | Split large trigger locally; not shared UI. |
| scanner modal view/status/error helpers | scanner presentation mapping | `features/scanner/modal` | no extraction beyond modal-local helpers | Do not move into shared. |
| scanner runtime controller branches | live/photo/session/buffer orchestration | `features/scanner/runtime` | strategy/facade/adapter only where variation is real | Keep public facade stable. |
| backup workflow sections | status/history/checkpoint display | `features/backup/workflow` | co-locate with workflow | Keep backup service logic untouched. |
| backup metadata hooks | repeated repository/query construction | later backup hook cleanup | no extraction now | First-data leave-alone unless bug. |
| page list route sections | search/filter/sort/card/footer composition | `src/pages/<route>` + `CollectionSection` | no extraction | Route semantics stay page-local. |
| query helper functions | sort/pagination/date/text helpers | `shared/utils/query` | shared generic utility | Done in `AR-0508B`; keep explicit exports and no domain imports. |

## 10. Refactor queue

### Stage 0 - Safety cleanup

- [x] `AR-002` Confirm stale imports and donor artifacts.
  - Files likely touched: only confirmed stale files from static reference search.
  - Goal: remove broken imports, stale donor artifacts, dead placeholders, BOM/comment-only scaffolding.
  - Non-goals: no feature moves, no first-data naming changes, no `*.ports.ts` rename.
  - Acceptance criteria: every deleted/edited artifact has reference-search proof.
  - Validation: reference search; `npm run typecheck` if source changes.
  - Docs impact: update this plan only if cleanup changes target inventory.
  - Risk level: medium.
  - Stop conditions: live imports, behavior ambiguity, dirty-file conflict.
  - 2026-04-27 status: done as a safety inspection with no source cleanup required. `npm run typecheck` passed, a local import-resolution scan across `src/` and `tests/` found no missing local imports, and targeted searches found no live references to the known stale/deleted old editor-section, buffer-picker flat-file, `field-visuals/index`, donor `inventory-queries`, `dashboard-page`, or deleted design image paths.
  - Skipped/deferred: the pre-existing dirty source deletions and untracked replacement files were not edited; `docs/architecture/design/*.png` deletions were not touched because no markdown references were found in this slice; first-data `*.ports.ts`, direct `appDb` feature-hook debt, and future `features/form-controls` moves remain explicitly out of scope. Generic query helper placement was resolved later in `AR-0508B`.

### Stage 1 - Architecture vocabulary and docs sync

- [ ] `AR-0101` Lock role vocabulary in docs.
  - Files likely touched: `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md`, possibly architecture docs after approval.
  - Goal: clarify facade/connector/adapter/form-model/view-model/runtime terms.
  - Non-goals: no source rename.
  - Acceptance criteria: role vocabulary matches this document.
  - Validation: docs review.
  - Docs impact: docs-only.
  - Risk level: low.
  - Stop conditions: vocabulary conflicts with first-data frozen docs.

### Stage 2 - Feature ownership restructure

- [x] `AR-003` Move arrivals feature ownership.
  - Files likely touched: `src/features/arrival-editor`, `src/features/arrivals-data`, imports in pages/tests.
  - Goal: move to `src/features/arrivals/{editor,data}`.
  - Non-goals: no logic, no form mapper extraction, no first-data service changes.
  - Acceptance criteria: app compiles; arrivals routes import new paths; old folders empty/removed.
  - Validation: passed `npm run typecheck` after moving `src/features/arrival-editor` to `src/features/arrivals/editor`, moving `src/features/arrivals-data` to `src/features/arrivals/data`, and updating imports in source/tests.
  - Docs impact: plan task status updated; inventory remains historical planning input until a dedicated docs sync slice.
  - Risk level: medium.
  - Stop conditions: behavior changes, mapper edits required beyond imports.
  - Status: done on 2026-04-27 as a structural move only; pre-existing dirty edits inside the moved arrival editor were preserved.

- [x] `AR-004` Move departures feature ownership.
  - Files likely touched: `src/features/departure-editor`, `src/features/departures-data`, imports in pages/tests.
  - Goal: move to `src/features/departures/{editor,data}`.
  - Non-goals: no linked-arrival behavior changes.
  - Acceptance criteria: app compiles; departures routes import new paths.
  - Validation: passed `npm run typecheck` after moving `src/features/departure-editor` to `src/features/departures/editor`, moving `src/features/departures-data` to `src/features/departures/data`, and updating imports in source/tests.
  - Docs impact: plan task status updated; inventory remains historical planning input until a dedicated docs sync slice.
  - Risk level: medium.
  - Stop conditions: route-state/prefill behavior changes.
  - Status: done on 2026-04-27 as a structural move only; pre-existing dirty edits inside the moved departure editor were preserved.

- [x] `AR-005` Move drafts feature ownership.
  - Files likely touched: `src/features/draft-editor`, `src/features/drafts-data`, `src/features/draft-publish`, imports in pages/tests.
  - Goal: move to `src/features/drafts/{editor,data,publish}`.
  - Non-goals: no publish service changes.
  - Acceptance criteria: app compiles; drafts routes import new paths.
  - Validation: passed `npm run typecheck` after moving `src/features/draft-editor` to `src/features/drafts/editor`, moving `src/features/drafts-data` to `src/features/drafts/data`, moving `src/features/draft-publish` to `src/features/drafts/publish`, and updating imports in source/tests.
  - Docs impact: plan task status updated; inventory remains historical planning input until a dedicated docs sync slice.
  - Risk level: medium.
  - Stop conditions: first-data publish service needs edits.
  - Status: done on 2026-04-27 as a structural move only; pre-existing dirty edits inside the moved draft editor were preserved.

- [x] `AR-0204` Move buffer feature ownership.
  - Files likely touched: `src/features/buffer-core`, `src/features/buffer-picker`, pages/router/navigation imports.
  - Goal: move to `src/features/buffer/{core,picker}`.
  - Non-goals: no buffer semantics or apply/delete behavior changes.
  - Acceptance criteria: copy-not-delete invariant preserved; old folders removed.
  - Validation: typecheck; buffer picker smoke.
  - Docs impact: update second-data seam docs if paths change.
  - Risk level: high.
  - Stop conditions: overlay or copy semantics become unclear.
  - Status: done on 2026-04-27 as a structural move only. Current `buffer-picker` dirty filesystem state was preserved,
    imports now target `src/features/buffer/{core,picker}`, and validation passed with `npm run typecheck` plus focused
    buffer/scanner unit tests.

- [x] `AR-0205` Move scanner feature ownership.
  - Files likely touched: `src/features/scanner-runtime`, navigation imports.
  - Goal: move to `src/features/scanner/{runtime,modal}`.
  - Non-goals: no scanner engine/runtime behavior changes.
  - Acceptance criteria: scanner facade import remains stable through new path; modal opens.
  - Validation: typecheck; scanner modal smoke.
  - Docs impact: update second-data seam docs if paths change.
  - Risk level: high.
  - Stop conditions: camera/session lifecycle changes become necessary.
  - Status: done on 2026-04-27 as a structural move only. `model/*` moved to `src/features/scanner/runtime/model`,
    `ui/scanner-modal/*` moved to `src/features/scanner/modal`, infrastructure browser scanner adapters stayed in
    `src/infrastructure/browser/scanner`, and validation passed with `npm run typecheck` plus focused scanner unit tests.
    Browser/runtime scanner smoke was not run in this folder-only slice.

- [x] `AR-0206` Move stocks feature ownership.
  - Files likely touched: `src/features/stocks-data`, `src/features/stock-adjustment`, `src/features/stock-departure-prefill`, stock page imports, dashboard telemetry import, departure prefill imports.
  - Goal: move to `src/features/stocks/{data,adjustment,departure-prefill}`.
  - Non-goals: no stock projection, adjustment, departure prefill, arrival/departure write, or first-data behavior changes.
  - Acceptance criteria: stock data files live under `src/features/stocks/data`, stock adjustment files live under `src/features/stocks/adjustment`, stock departure-prefill files live under `src/features/stocks/departure-prefill`, and old stock feature path imports are gone.
  - Validation: passed `npm run test:unit -- tests/unit/infrastructure/queries/stock` and `npm run typecheck`; `tests/unit/features/stocks`, `tests/unit/pages/stocks`, and `tests/unit/features/stock` do not exist.
  - Docs impact: plan task status updated; existing inventory rows remain historical planning input until a dedicated docs sync slice.
  - Risk level: medium.
  - Stop conditions: stock projection behavior, stock adjustment behavior, departure prefill behavior, or first-data write semantics need changes.
  - Status: done on 2026-04-27 as a structural move only. Imports now target `src/features/stocks/{data,adjustment,departure-prefill}` and no old stock feature path imports remain.

### Stage 3 - Form co-location

- [x] `AR-0301` Form co-location preflight.
  - Files likely touched: docs/report only; source read-only.
  - Goal: classify current arrival, departure, and draft form surfaces before any form moves or naming cleanup.
  - Required classification: reusable form controls; feature-local form models; editor-local helpers; fields that must stay with arrival/departure/draft editors; field/control candidates for `features/form-controls`; code/directory field reuse; duplication clusters; stop conditions.
  - `features/form-controls` guardrail: allowed only for reusable UI form controls used by multiple feature editors. No domain write logic, no service/query/repository access, no feature-specific mapping, no submit orchestration, and no arbitrary helpers.
  - Non-goals: no source moves, no file renames, no logic extraction, no `features/form-controls` implementation, no first-data changes.
  - Acceptance criteria: a bounded inventory identifies what stays editor-local, what is reusable UI control surface, and what remains ambiguous; every candidate for `features/form-controls` is justified against the guardrail.
  - Validation: read-only file tree/import scan; no tests unless source changes unexpectedly.
  - Docs impact: update this plan with executor prompts or follow-ups only if the preflight finds factual drift.
  - Risk level: low.
  - Stop conditions: a candidate contains domain write logic, service/query/repository access, feature-specific mapping, unclear ownership, or a move would change buffer/form behavior.
  - Status: done on 2026-04-27 as a planning/inspection-only slice. No source files were moved, renamed, or edited.

#### AR-0301 preflight summary

- `src/features/forms` does not exist in the current tree. The active shared form surface is `src/features/form-fields` plus `src/features/form-preferences`.
- Arrival, departure, and draft form models already contain feature-specific mapping, defaults, validation adapters, and submit payload shaping. These stay editor-local.
- `src/features/form-fields` contains several true multi-editor UI controls, but not every file is safe to move directly into `features/form-controls`.
- `DirectoryFieldFamily` is reusable UI, but `use-directory-options.ts` imports directory read hooks. That query-backed option loading must not move into `features/form-controls` unless it is split from the UI control first.
- `form-preferences` is localStorage-backed second-data UI preference state. It is form-control-adjacent, but it is not a generic helper bucket and should move only in a dedicated preference-seam slice if approved.
- Buffer apply helpers stay with the owning editor forms because they copy buffer values into form-specific code fields and preserve the copy-not-delete invariant.

#### AR-0301 classification table

| Current path | Detected role | Current owner | Dependencies | Target owner | Proposed action | Reason | Risk | Validation needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/arrivals/editor/arrival-editor.tsx` | editor entry | arrivals editor | arrival data hook, local form | `features/arrivals/editor` | keep | Editor composition, not reusable control. | low | arrival create/edit smoke |
| `src/features/arrivals/editor/arrival-editor-loading-state.tsx` | editor state UI | arrivals editor | Mantine, form-shell, copy constants | `features/arrivals/editor` | keep | Arrival-specific loading copy/state. | low | typecheck |
| `src/features/arrivals/editor/arrival-editor-not-found-state.tsx` | editor state UI | arrivals editor | router, Mantine, form-shell | `features/arrivals/editor` | keep | Arrival-specific not-found state. | low | typecheck |
| `src/features/arrivals/editor/hooks/use-create-arrival.ts` | durable write hook | arrivals editor | infrastructure service | `features/arrivals/editor/hooks` | no-move | First-data hook; not form-control code. | medium | first-data hook tests/typecheck if touched |
| `src/features/arrivals/editor/hooks/use-update-arrival.ts` | durable write hook | arrivals editor | infrastructure service | `features/arrivals/editor/hooks` | no-move | First-data hook; not form-control code. | medium | first-data hook tests/typecheck if touched |
| `src/features/arrivals/editor/hooks/use-delete-arrival.ts` | durable write hook | arrivals editor | infrastructure service | `features/arrivals/editor/hooks` | no-move | First-data hook; not form-control code. | medium | first-data hook tests/typecheck if touched |
| `src/features/arrivals/editor/form/arrival-editor-form.tsx` | form orchestrator | arrivals editor form | buffer core, drafts hook, arrival write hooks, feedback, router | `features/arrivals/editor/form` | keep | Owns arrival form orchestration and durable write handoff. | high | arrival form smoke; buffer apply tests |
| `src/features/arrivals/editor/form/arrival-buffer-apply.ts` | buffer apply helper | arrivals editor form | buffer apply result, arrival code mapper | `features/arrivals/editor/form/model` | move-later | Keep local; optionally move under model with explicit `.form-adapter` name. | medium | `arrival-buffer-apply.test.ts` |
| `src/features/arrivals/editor/form/arrival-editor-form-actions.tsx` | form actions UI | arrivals editor form | Mantine, form-shell, arrival copy/types | `features/arrivals/editor/form` | keep | Arrival submit/save-draft actions are editor-local. | low | arrival form smoke |
| `src/features/arrivals/editor/form/arrival-editor-form-sections.tsx` | section composer | arrivals editor form | accordion, section components | `features/arrivals/editor/form` | keep | Editor-specific section ordering and active state. | medium | arrival form smoke |
| `src/features/arrivals/editor/form/model/arrival-form.constants.ts` | form model constants | arrivals editor form model | form preference keys, local types | `features/arrivals/editor/form/model` | keep | Arrival copy, preference mapping, and section ids are local. | low | typecheck |
| `src/features/arrivals/editor/form/model/arrival-form.types.ts` | form values/types | arrivals editor form model | domain/query types | `features/arrivals/editor/form/model` | keep | Arrival editor value shape. | low | typecheck |
| `src/features/arrivals/editor/form/model/arrival-form.mappers.ts` | form/domain mapper | arrivals editor form model | domain inputs, draft payload, date formatter, preferences | `features/arrivals/editor/form/model` | keep | Builds arrival create/update/draft inputs; forbidden in form-controls. | high | mapper tests; arrival create/edit smoke |
| `src/features/arrivals/editor/form/model/arrival-form.validation.ts` | validation adapter | arrivals editor form model | local copy, amount parser | `features/arrivals/editor/form/model` | keep | Arrival title/minimal commit and amount UI mapping stay local. | medium | form validation tests |
| `src/features/arrivals/editor/form/model/use-arrival-form.ts` | form hook | arrivals editor form model | Mantine form, local validation | `features/arrivals/editor/form/model` | keep | Local form initialization. | medium | arrival form smoke |
| `src/features/arrivals/editor/form/model/use-arrival-section-navigation.ts` | section state hook | arrivals editor form model | local section ids/types | `features/arrivals/editor/form/model` | keep | Local view state. | low | typecheck |
| `src/features/arrivals/editor/form/sections/main-section/index.tsx` | editor section | arrivals editor form sections | form-fields, local preferences, buffer action | `features/arrivals/editor/form/sections` | keep | Arrival-specific control composition and buffer action. | medium | arrival form smoke |
| `src/features/arrivals/editor/form/sections/additional-section/index.tsx` | editor section | arrivals editor form sections | description/link/note controls | `features/arrivals/editor/form/sections` | keep | Arrival section composition stays local. | low | arrival form smoke |
| `src/features/arrivals/editor/form/sections/directories-section/index.tsx` | editor section | arrivals editor form sections | directory control, local preference keys | `features/arrivals/editor/form/sections` | keep | Arrival directory paths/preferences are local. | medium | directory field smoke |
| `src/features/departures/editor/form/departure-editor-form.tsx` | form orchestrator | departures editor form | arrival data, buffer core, scanner facade, drafts, stocks prefill, write hooks | `features/departures/editor/form` | keep | Coordinates departure-specific prefill, scanner, buffer, and save flow. | high | departure form smoke; scanner/buffer checks |
| `src/features/departures/editor/form/departure-buffer-apply.ts` | buffer apply helper | departures editor form | buffer apply result | `features/departures/editor/form/model` | move-later | Keep local; optionally move under model with explicit `.form-adapter` name. | medium | `departure-buffer-apply.test.ts` |
| `src/features/departures/editor/form/departure-editor-form-actions.tsx` | form actions UI | departures editor form | Mantine, form-shell | `features/departures/editor/form` | keep | Departure submit/save-draft actions are editor-local. | low | departure form smoke |
| `src/features/departures/editor/form/departure-editor-form-sections.tsx` | section composer | departures editor form | accordion, arrival details, local sections | `features/departures/editor/form` | keep | Departure section ordering includes relation context. | medium | departure form smoke |
| `src/features/departures/editor/form/departure-form-modal.tsx` | contextual modal | departures editor form | Mantine modal, departure record, form | `features/departures/editor/form` | keep | Departure-specific contextual editor surface. | medium | departure modal smoke |
| `src/features/departures/editor/form/model/departure-form.constants.ts` | form model constants | departures editor form model | form preference keys | `features/departures/editor/form/model` | keep | Departure copy, preference mapping, and section ids are local. | low | typecheck |
| `src/features/departures/editor/form/model/departure-form.types.ts` | form values/types | departures editor form model | domain/query types | `features/departures/editor/form/model` | keep | Departure editor value shape. | low | typecheck |
| `src/features/departures/editor/form/model/departure-form.mappers.ts` | form/domain mapper | departures editor form model | domain inputs/results, arrival details, date formatter, preferences | `features/departures/editor/form/model` | keep | Builds departure inputs/drafts and linked-arrival mapping; forbidden in form-controls. | high | mapper tests; linked-arrival smoke |
| `src/features/departures/editor/form/model/departure-form.validation.ts` | validation adapter | departures editor form model | local copy, amount parser | `features/departures/editor/form/model` | keep | Departure title/minimal commit and amount UI mapping stay local. | medium | form validation tests |
| `src/features/departures/editor/form/model/use-departure-form.ts` | form hook | departures editor form model | Mantine form, local validation | `features/departures/editor/form/model` | keep | Local form initialization. | medium | departure form smoke |
| `src/features/departures/editor/form/model/use-departure-section-navigation.ts` | section state hook | departures editor form model | local section ids/types | `features/departures/editor/form/model` | keep | Local view state. | low | typecheck |
| `src/features/departures/editor/form/sections/main-section/index.tsx` | editor section | departures editor form sections | form-fields, local mapper, scanner/buffer actions | `features/departures/editor/form/sections` | keep | Departure-specific scanner/buffer/control composition. | medium | departure form smoke |
| `src/features/departures/editor/form/sections/additional-section/index.tsx` | editor section | departures editor form sections | description/direction/note controls | `features/departures/editor/form/sections` | keep | Departure section composition stays local. | low | departure form smoke |
| `src/features/departures/editor/form/sections/directories-section/index.tsx` | editor section | departures editor form sections | directory control, local preference keys | `features/departures/editor/form/sections` | keep | Departure directory paths/preferences are local. | medium | directory field smoke |
| `src/features/departures/editor/form/sections/relation-section/index.tsx` | relation section | departures editor form sections | arrival details, field label/metadata, form-shell | `features/departures/editor/form/sections` | no-move | Linked-arrival UI is departure-specific. | medium | linked-arrival smoke |
| `src/features/departures/editor/hooks/use-create-departure.ts` | durable write hook | departures editor | infrastructure service | `features/departures/editor/hooks` | no-move | First-data hook; not form-control code. | medium | typecheck if touched |
| `src/features/departures/editor/hooks/use-update-departure.ts` | durable write hook | departures editor | infrastructure service | `features/departures/editor/hooks` | no-move | First-data hook; not form-control code. | medium | typecheck if touched |
| `src/features/departures/editor/hooks/use-delete-departure.ts` | durable write hook | departures editor | infrastructure service | `features/departures/editor/hooks` | no-move | First-data hook; not form-control code. | medium | typecheck if touched |
| `src/features/drafts/editor/index.tsx` | editor entry/form orchestrator | drafts editor | arrival data, draft data, publish hook, feedback, router | `features/drafts/editor` | keep | Draft create/edit/publish orchestration stays local. | high | draft create/edit/publish smoke |
| `src/features/drafts/editor/draft-editor-form-actions.tsx` | form actions UI | drafts editor | Mantine, form-shell | `features/drafts/editor/form` | move-later | Later folder normalization only; remains draft-local. | low | draft form smoke |
| `src/features/drafts/editor/draft-editor-form-sections.tsx` | section composer | drafts editor | accordion, arrival details, draft sections | `features/drafts/editor/form` | move-later | Later folder normalization only; remains draft-local. | medium | draft form smoke |
| `src/features/drafts/editor/fields/draft-kind-field/index.tsx` | draft-specific field | drafts editor | record kind, field label/metadata, form preferences | `features/drafts/editor/form/fields` | move-later | Draft-kind selection is not a generic form control. | medium | draft kind smoke |
| `src/features/drafts/editor/model/draft-form.constants.ts` | form model constants | drafts editor model | form preference keys | `features/drafts/editor/form/model` | move-later | Folder normalization only; draft-local constants. | low | typecheck |
| `src/features/drafts/editor/model/draft-form.types.ts` | form values/types | drafts editor model | domain/query types | `features/drafts/editor/form/model` | move-later | Folder normalization only; draft-local value shape. | low | typecheck |
| `src/features/drafts/editor/model/draft-form.mappers.ts` | form/domain mapper | drafts editor model | draft payloads, arrival/departure mapper, date formatter, preferences | `features/drafts/editor/form/model` | move-later | Folder normalization only; publish payload mapping stays local. | high | draft mapper/publish smoke |
| `src/features/drafts/editor/model/draft-form.validation.ts` | validation adapter | drafts editor model | local types | `features/drafts/editor/form/model` | move-later | Folder normalization only; draft validation semantics stay local. | medium | draft form tests |
| `src/features/drafts/editor/model/use-draft-form.ts` | form hook | drafts editor model | Mantine form, draft details, local validation | `features/drafts/editor/form/model` | move-later | Folder normalization only; local form initialization. | medium | draft form smoke |
| `src/features/drafts/editor/model/use-draft-section-navigation.ts` | section state hook | drafts editor model | local section ids/types | `features/drafts/editor/form/model` | move-later | Folder normalization only; local view state. | low | typecheck |
| `src/features/drafts/editor/sections/main-section/index.tsx` | editor section | drafts editor sections | form-fields, draft-kind field | `features/drafts/editor/form/sections` | move-later | Folder normalization only; draft-specific section composition. | medium | draft form smoke |
| `src/features/drafts/editor/sections/additional-section/index.tsx` | editor section | drafts editor sections | description/direction/link/note controls | `features/drafts/editor/form/sections` | move-later | Folder normalization only. | low | draft form smoke |
| `src/features/drafts/editor/sections/directories-section/index.tsx` | editor section | drafts editor sections | directory control | `features/drafts/editor/form/sections` | move-later | Folder normalization only. | medium | directory field smoke |
| `src/features/drafts/editor/sections/publish-meta-section/index.tsx` | publish UI section | drafts editor sections | Mantine, form-shell | `features/drafts/editor/form/sections` | no-move | Draft publish metadata is draft-specific. | medium | draft publish smoke |
| `src/features/drafts/editor/sections/relation-section/index.tsx` | relation section reuse | drafts editor sections | departure relation section | `features/drafts/editor/form/sections` | needs-decision | Reuses departure UI; do not extract until relation ownership is explicit. | medium | linked-arrival smoke |
| `src/features/form-fields/field-family-codes/index.tsx` | reusable code UI control | form-fields | Mantine, serial-tokens-input, field label | `features/form-controls/codes` | move-later | Used by arrival, departure, draft; no service/query/repository access. | medium | form field tests; arrival/departure/draft smoke |
| `src/features/form-fields/field-family-codes/field-family-codes.constants.ts` | code field metadata/options | form-fields | record-code kind type, metadata type | `features/form-controls/codes` | move-later | UI metadata/options; domain type only, no write logic. | low | typecheck |
| `src/features/form-fields/field-family-codes/field-family-codes.types.ts` | code field props/types | form-fields | React/Mantine types | `features/form-controls/codes` | move-later | Control-local props. | low | typecheck |
| `src/features/form-fields/field-family-directory/index.tsx` | reusable directory UI control | form-fields | Mantine, preferences, directory options hook | `features/form-controls/directory` | split-later | UI is reusable, but query-backed option loading must be split first. | high | directory field tests; route smoke |
| `src/features/form-fields/field-family-directory/use-directory-options.ts` | directory option query hook | form-fields | directory data hooks | `features/directories/data` or editor adapter | needs-decision | Imports query hooks; forbidden inside form-controls. | high | directory query/form smoke |
| `src/features/form-fields/field-family-directory/field-family-directory.helpers.ts` | path helper | form-fields | none | `features/form-controls/directory` | move-later | UI-control helper only if it stays tied to directory control. | low | typecheck |
| `src/features/form-fields/field-family-directory/field-family-directory.constants.ts` | directory field metadata | form-fields | metadata type | `features/form-controls/directory` | move-later | UI metadata only. | low | typecheck |
| `src/features/form-fields/field-family-directory/field-family-directory.types.ts` | directory field props/types | form-fields | Mantine form type, preference key | `features/form-controls/directory` | move-later | Control-local props, but option provider split must be resolved. | medium | typecheck |
| `src/features/form-fields/field-family-occurred-at/index.tsx` | reusable date-time UI control | form-fields | Mantine DateTimePicker, metadata | `features/form-controls/date-time` | move-later | Used by arrival, departure, draft; UI-only. | medium | date field tests; form smoke |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.format.ts` | date-time display adapter | form-fields | none | `features/form-controls/date-time` | move-later | Pure control-adjacent formatting used by form models. | medium | `field-family-occurred-at.format.test.ts`; mapper tests |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.constants.ts` | date-time metadata | form-fields | metadata type | `features/form-controls/date-time` | move-later | UI metadata only. | low | typecheck |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.types.ts` | date-time props/types | form-fields | Mantine form type, metadata | `features/form-controls/date-time` | move-later | Control-local props. | low | typecheck |
| `src/features/form-fields/field-family-money/index.tsx` | reusable amount/currency UI control | form-fields | Mantine NumberInput/TextInput, metadata | `features/form-controls/amount` | move-later | Used by arrival, departure, draft; UI-only. | medium | amount/form smoke |
| `src/features/form-fields/field-family-money/field-family-money.constants.ts` | amount metadata | form-fields | metadata type | `features/form-controls/amount` | move-later | UI metadata only. | low | typecheck |
| `src/features/form-fields/field-family-money/field-family-money.types.ts` | amount props/types | form-fields | Mantine form type, metadata | `features/form-controls/amount` | move-later | Control-local props. | low | typecheck |
| `src/features/form-fields/field-family-title/*` | reusable title control files | form-fields | Mantine, metadata, form type | `features/form-controls/primitive-fields/title` | move-later | Used by all editors; UI-only. | medium | form smoke |
| `src/features/form-fields/field-family-description/*` | reusable description control files | form-fields | Mantine, metadata, form type | `features/form-controls/primitive-fields/description` | move-later | Used by all editors; UI-only. | low | form smoke |
| `src/features/form-fields/field-family-note/*` | reusable note control files | form-fields | Mantine, metadata, form type | `features/form-controls/primitive-fields/note` | move-later | Used by all editors; UI-only. | low | form smoke |
| `src/features/form-fields/field-family-subject-kind/*` | reusable subject-kind control files | form-fields | domain type, preferences, Mantine | `features/form-controls/primitive-fields/subject-kind` | move-later | Used by all editors; domain type only, no write logic. | medium | form smoke |
| `src/features/form-fields/field-family-departure-mode/*` | reusable departure-mode control files | form-fields | domain type, preferences, Mantine | `features/form-controls/primitive-fields/departure-mode` | move-later | Used by departure and draft; domain type only, no write logic. | medium | departure/draft smoke |
| `src/features/form-fields/field-family-direction/*` | reusable direction control files | form-fields | Mantine, metadata, form type | `features/form-controls/primitive-fields/direction` | move-later | Used by departure and draft; UI-only. | low | departure/draft smoke |
| `src/features/form-fields/field-family-link-url/*` | reusable link URL control files | form-fields | Mantine, metadata, form type | `features/form-controls/primitive-fields/link-url` | move-later | Used by arrival and draft; UI-only. | low | arrival/draft smoke |
| `src/features/form-fields/field-info-trigger/*` | reusable help trigger/label files | form-fields | Mantine Popover/Tooltip, field metadata | `features/form-controls/primitive-fields/field-info-trigger` | move-later | Multi-control UI support; no domain writes. | medium | help popover tests |
| `src/features/form-fields/field-metadata/*` | form field copy/metadata files | form-fields | none/local types | `features/form-controls/primitive-fields/field-metadata` | move-later | UI metadata only; keep out of shared. | medium | field tests; text-integrity check if touched |
| `src/features/form-fields/form-section-accordion/*` | reusable form section UI files | form-fields | Mantine Accordion, theme size helper | `features/form-controls/primitive-fields/form-section-accordion` | move-later | Used by arrival, departure, draft; UI-only section wrapper. | medium | form layout smoke |
| `src/features/form-preferences/model/form-preferences.keys.ts` | preference key catalog | form-preferences | local types | `features/form-controls/preferences/model` if approved | needs-decision | Form-control-adjacent but not a field control; keep until preference seam is approved. | medium | preference tests/typecheck |
| `src/features/form-preferences/model/form-preferences.store.ts` | transient preference store | form-preferences | zustand/localStorage | `features/form-controls/preferences/model` if approved | needs-decision | Second-data UI preference seam; not a generic helper and must not become durable. | high | preference tests; mobile form smoke |
| `src/features/form-preferences/model/form-preferences.types.ts` | preference types | form-preferences | none | `features/form-controls/preferences/model` if approved | needs-decision | Move only with the preference store as one seam. | medium | typecheck |
| `src/pages/arrivals/arrival-create-page.tsx`, `src/pages/arrivals/arrival-edit-page.tsx` | route entrypoints | arrivals pages | ArrivalEditor | `src/pages/arrivals` | no-move | Pages stay thin and import feature editor. | low | route smoke |
| `src/pages/departures/departure-create-page.tsx` | route entrypoint | departures pages | DepartureEditorForm | `src/pages/departures` | no-move | Page route owns prefill route state only. | low | route smoke |
| `src/pages/drafts/draft-create-page.tsx`, `src/pages/drafts/draft-edit-page.tsx` | route entrypoints | drafts pages | DraftEditor | `src/pages/drafts` | no-move | Pages stay thin and import feature editor. | low | route smoke |
| `src/features/buffer/**` | buffer core/picker | buffer | buffer stores/controllers/picker | `features/buffer/{core,picker}` | no-move | Buffer is second-data owner; form slice must consume it only. | high | buffer tests |
| `src/features/scanner/**` | scanner runtime/modal | scanner | scanner runtime, buffer core | `features/scanner/{runtime,modal}` | no-move | Forms must not own scanner runtime. | high | scanner tests |
| `tests/unit/features/arrivals/form/arrival-buffer-apply.test.ts` | form helper test | arrivals tests | arrival buffer helper | tests mirror source owner | keep | Tests copy-not-delete apply behavior. | low | run when helper moves |
| `tests/unit/features/departures/form/departure-buffer-apply.test.ts` | form helper test | departures tests | departure buffer helper | tests mirror source owner | keep | Tests copy-not-delete apply behavior. | low | run when helper moves |
| `tests/unit/features/departures/form/departure-editor.mappers.test.ts` | mapper test | departures tests | departure mapper | tests mirror source owner | keep | Covers local mapper semantics. | low | run when mapper changes |
| `tests/unit/features/buffer/**` | buffer tests | buffer tests | buffer core/page helpers | tests mirror source owner | no-move | Buffer tests are not form-control tests. | low | run if buffer integration changes |
| `tests/unit/features/drafts` | absent test folder | n/a | n/a | n/a | needs-decision | No focused draft form tests currently found. | medium | add only in a draft implementation slice |

#### AR-0301 approved move candidates for later implementation

Approved only as later source-move tasks, not in this preflight:

- `src/features/form-fields/field-family-codes/*` -> `src/features/form-controls/codes/*`.
- `src/features/form-fields/field-family-occurred-at/*` -> `src/features/form-controls/date-time/*`.
- `src/features/form-fields/field-family-money/*` -> `src/features/form-controls/amount/*`.
- Pure primitive field families under `field-family-title`, `field-family-description`, `field-family-note`, `field-family-direction`, `field-family-link-url`, `field-family-subject-kind`, and `field-family-departure-mode` -> `src/features/form-controls/primitive-fields/<field>/*`.
- `field-info-trigger`, `field-metadata`, and `form-section-accordion` -> `src/features/form-controls/primitive-fields/*` only as UI support for reusable controls.
- Directory UI files may move to `src/features/form-controls/directory/*` only after `use-directory-options.ts` is separated from query-backed option loading.

#### AR-0301 rejected or deferred candidates

- Arrival, departure, and draft form mappers are rejected for `features/form-controls`; they build domain inputs/draft payloads or relation/publish mappings.
- Arrival/departure buffer apply helpers are rejected for generic extraction now; they stay editor-local and preserve copy-not-delete form semantics.
- `src/features/form-fields/field-family-directory/use-directory-options.ts` is deferred because it imports directory read hooks.
- `src/features/form-preferences/model/*` is deferred because it is a transient localStorage-backed preference seam, not a field control.
- Draft relation reuse of `DepartureRelationSection` is deferred; relation ownership needs an explicit decision before extraction.
- `src/features/buffer/**` and `src/features/scanner/**` are rejected for form co-location; forms consume those seams and must not own them.

#### AR-0301 duplication clusters

| Locations | Repeated responsibility | Extraction type | Decision |
| --- | --- | --- | --- |
| arrival/departure/draft `*.mappers.ts` | default values, domain input construction, draft payload mapping, code splitting | no extraction yet | Keep local; only pure date formatting is a reusable control helper. |
| arrival/departure `*-buffer-apply.ts` | append copied buffer values to form code fields | editor-local helper | Keep per editor; do not create a generic buffer/form abstraction yet. |
| arrival/departure/draft `use-*-section-navigation.ts` | active accordion section state | no extraction yet | Duplication is small and local; extraction would create a thin generic wrapper. |
| arrival/departure/draft main/additional/directories sections | repeated field-family composition | no extraction yet | Sections encode owner-specific paths, preferences, and actions. |
| `field-family-*` wrappers | repeated Mantine controlled-field shape | reusable form control | Move later to `features/form-controls` by control family after import updates. |
| directory option loading | query-backed supplier/product/category options | needs product/architecture decision | Split option provider from UI control before any form-controls move. |
| form preference reads/writes | remembered select/checkbox defaults | needs product/architecture decision | Keep as a form-control-adjacent second-data seam; do not bury in arbitrary helpers. |
| field metadata/help trigger | label/help/popover copy and UI | reusable form control support | Move with controls, not to `shared`. |

#### AR-0301 recommended next 3 implementation tasks

1. `AR-0302A` Arrival form-local naming cleanup only.
   - Scope: `src/features/arrivals/editor/form/**`.
   - Goal: rename/move arrival form-local files into `form/model` and `form/sections` role names without behavior changes.
   - Validation: `npm run test:unit -- tests/unit/features/arrivals/form` and `npm run typecheck`.

2. `AR-0302B` Departure form-local naming cleanup only.
   - Scope: `src/features/departures/editor/form/**`.
   - Goal: rename/move departure form-local files into `form/model` and `form/sections` role names without behavior changes.
   - Validation: `npm run test:unit -- tests/unit/features/departures/form` and `npm run typecheck`.

3. `AR-0302C` Draft editor form-folder normalization only.
   - Scope: `src/features/drafts/editor/**`.
   - Goal: create `form/model`, `form/sections`, and `form/fields` ownership under drafts without publish or mapper behavior changes.
   - Validation: focused draft route smoke if no unit tests exist, plus `npm run typecheck`.

Do not start `features/form-controls` moves until these editor-local form boundaries are normalized and `DirectoryFieldFamily` option loading has a separate decision.

#### AR-0301 stop conditions for future implementation

- Target file already exists with non-identical content.
- A candidate imports services, repositories, Dexie, or direct query implementations.
- A candidate contains domain write logic, submit payload mapping, or validation result mapping.
- A move would change buffer apply copy-not-delete semantics.
- A move would require scanner/runtime ownership changes.
- A move would touch first-data domain/infrastructure services.
- A move would require broad form redesign or validation semantic changes.
- A control is used once and is not immediately needed by at least two editor owners.
- `features/form-controls` starts receiving arbitrary helpers rather than reusable UI controls.

- [x] `AR-0302A` Arrival form-local naming cleanup only.
  - Files likely touched: `src/features/arrivals/editor/form/**`, arrival imports, arrival-focused tests.
  - Goal: give arrival editor form-local files role-explicit names without changing form behavior.
  - Non-goals: no reusable form-control extraction, no first-data changes, no buffer/scanner behavior changes, no UI redesign.
  - Acceptance criteria: arrival form component, actions, sections, local model, buffer apply helper, and validation adapter use role-based file names; no old arrival form-local import paths remain.
  - Validation: search for old arrival form-local paths; `npm run test:unit -- tests/unit/features/arrivals`; `npm run test:unit -- tests/unit/features/arrivals/form/arrival-buffer-apply.test.ts`; `npm run typecheck`.
  - Docs impact: this plan status updated only.
  - Risk level: medium.
  - Stop conditions: any import update requires behavior changes or touches first-data.
  - Status: done on 2026-04-27 as a naming/role-clarity cleanup only. Renamed arrival form-local files to `arrival-editor.form.tsx`, `arrival-editor.actions.tsx`, `arrival-editor.sections.tsx`, `arrival-editor.buffer-apply.ts`, `arrival-editor.form-constants.ts`, `arrival-editor.form-mappers.ts`, `arrival-editor.form-values.ts`, `arrival-editor.validation.ts`, and named section files under `form/sections`. Behavior logic was not changed.

- [x] `AR-0302B` Departure form-local naming cleanup only.
  - Files likely touched: `src/features/departures/editor/form/**`, direct departure form imports, departure-focused tests, and direct draft mapper import of departure form mappers.
  - Goal: give departure editor form-local files role-explicit names without changing form behavior.
  - Non-goals: no reusable form-control extraction, no first-data changes, no linked-arrival/prefill behavior changes, no buffer/scanner behavior changes, no UI redesign.
  - Acceptance criteria: departure form component, actions, sections, modal, local model, buffer apply helper, and validation adapter use role-based file names; no old departure form-local import paths remain.
  - Validation: search for old departure form-local paths; `npm run test:unit -- tests/unit/features/departures`; `npm run test:unit -- tests/unit/features/departures/form/departure-buffer-apply.test.ts`; `npm run typecheck`.
  - Docs impact: update inventory.
  - Risk level: medium.
  - Stop conditions: prefill/relation behavior changes.
  - Status: done on 2026-04-27 as a naming/role-clarity cleanup only. Renamed departure form-local files to `departure-editor.form.tsx`, `departure-editor.actions.tsx`, `departure-editor.sections.tsx`, `departure-form.modal.tsx`, `departure-editor.buffer-apply.ts`, `departure-editor.form-constants.ts`, `departure-editor.form-mappers.ts`, `departure-editor.form-values.ts`, `departure-editor.validation.ts`, and named section files under `form/sections`. Behavior logic was not changed.

- [x] `AR-0302C` Draft editor form-folder normalization only.
  - Files likely touched: `src/features/drafts/editor/**`, direct draft page imports, and draft-focused tests if present.
  - Goal: create `form/model`, `form/fields`, and `form/sections` ownership under the draft editor with role-explicit file names.
  - Non-goals: no draft publish behavior changes, no draft save/update behavior changes, no payload semantic changes, no reusable form-control extraction, no first-data changes.
  - Acceptance criteria: draft editor form component, actions, sections, local model, validation adapter, and draft-specific field use role-based file names/folders; no old draft form-local import paths remain.
  - Validation: search for old draft form-local paths; report absent `tests/unit/features/drafts`; `npm run typecheck`.
  - Docs impact: update inventory.
  - Risk level: medium.
  - Stop conditions: draft publish behavior changes.
  - Status: done on 2026-04-27 as a naming/folder-clarity cleanup only. Normalized draft editor files under `src/features/drafts/editor/form/{model,fields,sections}` and renamed them to `draft-editor.form.tsx`, `draft-editor.actions.tsx`, `draft-editor.sections.tsx`, `draft-editor.form-constants.ts`, `draft-editor.form-mappers.ts`, `draft-editor.form-values.ts`, `draft-editor.validation.ts`, `draft-editor.kind-field.tsx`, and named section files under `form/sections`. Behavior logic and publish logic were not changed.

### Stage 4 - Public boundary cleanup

- [x] `AR-0401` Audit feature public boundaries.
  - Files likely touched: feature `index.ts(x)` and imports only where decorative.
  - Goal: keep `index.ts` only for real public boundaries; avoid new `index.tsx`.
  - Non-goals: no broad import style rewrite.
  - Acceptance criteria: every boundary has a consumer reason.
  - Validation: import graph search; typecheck.
  - Docs impact: update boundary rules if needed.
  - Risk level: medium.
  - Stop conditions: public import churn becomes broad.
  - Status: audit complete on 2026-04-27. This was a planning/docs-only slice; no source files, imports, barrels, or public APIs were changed.

#### AR-0401 audit summary

Current feature public-boundary shape after the Stage 2 ownership wave and `AR-0302A/B/C` form-local cleanup:

- There is no broad `src/features/index.ts` or owner-root `src/features/<owner>/index.ts` barrel.
- Pages mostly import named feature entry files directly, which is acceptable while pages stay thin route composition.
- Real public-ish boundaries exist where app/router/page or another feature has a concrete consumer: scanner runtime facade, scanner modal, buffer picker modal, navigation shell/overlay entries, PWA banner, backup workflow, and reusable form-field family entries.
- Most `index.tsx` files under `src/features` are component-folder entries, not re-export barrels. They are acceptable as existing migration artifacts, but new public APIs should prefer named files or explicit `public.ts` only when there is a real consumer.
- The highest-risk leaked internals are draft editor reuse of departure editor relation/mapping internals and direct buffer/scanner/navigation model imports. These are not behavior bugs, but they should not be widened by decorative barrels.
- `features/form-fields` remains a transitional reusable form-control area. Its field-family entries have multiple editor consumers, but directory field option loading and preference-store access prevent a blind move to `features/form-controls`.

#### AR-0401 feature owner public surface

| Feature owner | Current public exports / public-ish files | External consumers | Internal files imported directly from outside | Classification | Recommended future action |
| --- | --- | --- | --- | --- | --- |
| `arrivals` | Named route editor `editor/arrival-editor.tsx`; data/editor hooks; form model test targets. | `src/pages/arrivals`, `src/pages/stocks`, dashboard telemetry, departure/draft editors for arrival lookup. | `editor/hooks/*`, `data/hooks/*`, form buffer-apply test target. | route-facing named entrypoints; test-only internals. | Keep direct page imports. Do not add owner-root barrel. Later decide whether create/delete hooks need a narrow public hook entry. |
| `departures` | Named form entry `editor/form/departure-editor.form.tsx`; data/editor hooks; form sections/model. | `src/pages/departures`, `src/pages/stocks`, dashboard telemetry, draft editor relation/mappers. | `editor/form/model/departure-editor.form-mappers.ts`, `editor/form/sections/departure-editor.relation-section.tsx`. | partly acceptable route-facing surface; partly internal-but-leaked. | Keep page imports direct. Later isolate draft/departure relation reuse before exposing anything publicly. |
| `drafts` | Named form entry `editor/form/draft-editor.form.tsx`; data hooks; publish hook. | `src/pages/drafts`, arrivals/departures editors create drafts, dashboard telemetry. | data hooks and publish hook imported by draft form/page; no owner-root barrel. | acceptable named direct imports. | Keep. Avoid a draft root barrel; publish stays explicit under `drafts/publish`. |
| `buffer` | `picker/ui/buffer-picker-modal/index.tsx`; core model/store/controller files. | pages/buffer, scanner runtime/modal, navigation shell/overlay, arrival/departure forms, tests. | many `core/model/*` imports from scanner, navigation, pages, and forms. | real second-data seam, but public boundary is too implicit. | Later create a narrow buffer core public entry only if it reduces direct model coupling without proxy-only wrapping. |
| `scanner` | `modal/index.tsx`; `runtime/model/scanner-runtime.facade.ts`. | navigation overlay/shell, departure editor, dashboard favorite tile, scanner modal hooks/tests. | runtime session types/stores imported within scanner modal; facade imported externally. | runtime facade is real-public-boundary; modal index is overlay component entry. | Keep facade. Do not expose scanner internals; later consider moving facade to a shallower named runtime entry if import clarity warrants it. |
| `stocks` | `data/hooks/use-stock-list.ts`; `adjustment/stock-adjustment.ts`; `departure-prefill/stock-departure-prefill.ts`. | pages/stocks, dashboard telemetry, departure create/page workflow. | departure-prefill type/helper imported by departure/stocks pages; adjustment helper imported by stocks workflow. | named feature subarea entries. | Keep direct subarea imports. Do not create `stocks/index.ts`. |
| `settings` | `hooks/*`; `model/use-ui-settings.ts`. | app providers, settings pages, ui-kit, dashboard favorites. | hooks imported by `settings/model/use-ui-settings.ts` and dashboard model. | acceptable feature-hook surface. | Keep; no broad settings barrel. |
| `backup` | `ui/backup-workflow/index.tsx`; hooks under `features/backup/hooks`. | `src/pages/settings/settings-backup-page.tsx`. | workflow consumes backup hooks internally. | route-local feature workflow entry. | Keep existing component-folder entry; later rename to named file only if touched for backup UI cleanup. |
| `directories` | hooks under `features/directories/hooks`. | `features/form-fields/field-family-directory/use-directory-options.ts`. | directory hooks consumed by form-field directory option loader. | acceptable read-hook surface with form-control caveat. | Before `form-controls`, split UI control from query-backed option loading. |
| `codes` | hooks under `features/codes/hooks`. | no current direct scan hits in `src/pages` or feature imports. | none found in this audit. | keep-private/read-surface available. | No public-boundary work now. |
| `navigation` | `ui/app-overlay-host/index.tsx`, `ui/mobile-shell/index.tsx`, `ui/mobile-bottom-nav/index.tsx`; overlay arbitration model. | router root layout, ui-kit, buffer/scanner seams. | `model/overlay-arbitration.*` imported by buffer/scanner/picker. | real app-level boundary plus second-data arbitration seam. | Keep root-layout imports. Do not export overlay arbitration through navigation root barrel; later evaluate a narrow model public entry only if direct model imports spread. |
| `dashboard` | model hooks `use-telemetry.ts`, `use-home-favorites.ts`. | dashboard page, navigation network status, home favorites components. | telemetry imports multiple feature hooks/stores. | route-adjacent feature model with cross-feature aggregation. | Keep for now; later decide whether dashboard model belongs under page-local dashboard lib or remains reusable telemetry feature. |
| `pwa` | `ui/pwa-status-banner/index.tsx`. | app providers. | none. | real app-provider component boundary. | Keep existing component-folder entry. |
| `form-fields` | field-family component-folder `index.tsx` entries and support entries. | arrival/departure/draft editors and tests. | directory option loader imports directory hooks; field families import form-preferences. | real reusable form-control surface, transitional name. | Do not delete barrels. Later migrate approved UI-only families to `features/form-controls` by family. |
| `form-controls` | folder absent. | none. | none. | not started. | Create only after approved extraction; must not become a dumping ground. |
| `form-preferences` | `model/form-preferences.*` store/key/types. | editors and field families. | model files imported directly by controls and form mappers. | second-data preference seam, not a UI control. | Keep out of `form-controls`; later expose only if preference model imports spread further. |

#### AR-0401 cross-feature import findings

| Importing file | Imported file | Importing owner | Imported owner | Imported role | Classification | Reason | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/pages/arrivals/*` | `features/arrivals/{editor,data}/...` | pages | arrivals | editor/data hooks | allowed direct import | Pages are thin route composition and import named feature entries. | low |
| `src/pages/departures/*` | `features/departures/{editor,data}/...` | pages | departures | editor/data hooks | allowed direct import | Route owns page composition, feature owns workflow. | low |
| `src/pages/drafts/*` | `features/drafts/{editor,data}/...` | pages | drafts | editor/data/publish | allowed direct import | Draft pages use named route-level feature entrypoints. | low |
| `src/pages/buffer/**` | `features/buffer/core/model/*` | pages | buffer | buffer core model/store | should use public boundary later | Buffer page is a legitimate consumer, but imports deep model files. | medium |
| `src/pages/stocks/lib/use-stocks-page-workflow.ts` | `features/arrivals/editor/hooks/use-create-arrival.ts`, `features/departures/editor/hooks/use-create-departure.ts` | pages | arrivals/departures | feature write hooks | allowed direct import | Stock adjustment is route workflow over existing journal hooks; no first-data service reopening. | medium |
| `src/pages/stocks/**` | `features/stocks/{data,adjustment,departure-prefill}/...` | pages | stocks | stock data/workflow helpers | allowed direct import | Stocks page consumes its own feature subareas. | low |
| `src/pages/settings/settings-backup-page.tsx` | `features/backup/ui/backup-workflow` | pages | backup | workflow component | allowed direct import | Settings route hosts the backup workflow. | low |
| `src/app/providers/app-providers.tsx` | `features/pwa/ui/pwa-status-banner`, `features/settings/model/use-ui-settings` | app | pwa/settings | provider UI/settings hook | allowed direct import | App provider owns global PWA/status and persisted UI settings composition. | low |
| `src/router/layouts/root-layout/index.tsx` | `features/navigation/ui/{app-overlay-host,mobile-shell}` | router | navigation | shell/overlay UI | allowed direct import | Root layout is the accepted app-level shell host. | low |
| `src/features/navigation/ui/app-overlay-host/index.tsx` | `features/buffer/picker/ui/buffer-picker-modal`, `features/scanner/modal` | navigation | buffer/scanner | overlay components | allowed direct import | Overlay host composes global/contextual overlay surfaces without owning their state. | medium |
| `src/features/navigation/ui/mobile-shell/index.tsx` | `features/buffer/core/model/buffer-store.ts`, `features/scanner/runtime/model/scanner-runtime.facade.ts` | navigation | buffer/scanner | shell utility state/runtime action | should use public boundary later | Shell needs scanner/buffer reachability, but buffer store import is deep. | medium |
| `src/features/scanner/runtime/model/*` | `features/buffer/core/model/*`, `features/navigation/model/overlay-arbitration.types.ts` | scanner | buffer/navigation | second-data seam contracts | allowed direct import | Scanner writes only to buffer and coordinates overlay/control seams. | medium |
| `src/features/scanner/modal/index.tsx` | `features/buffer/core/model/buffer-store.ts`, `features/navigation/model/overlay-arbitration.store.ts`, scanner runtime model | scanner | buffer/navigation/scanner | modal runtime dependencies | should use public boundary later | Behavior is correct, but modal imports deep stores directly. | medium |
| `src/features/buffer/core/model/*` | `features/navigation/model/overlay-arbitration.*` | buffer | navigation | overlay arbitration seam | allowed direct import | Buffer apply/control must coordinate contextual overlay identity. | medium |
| `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | `features/buffer/core/model/*`, `features/navigation/model/overlay-arbitration.*` | buffer | buffer/navigation | picker controller/store dependencies | should use public boundary later | Picker is same owner for buffer core, but navigation model import is a direct seam. | medium |
| arrival/departure/draft form sections | `features/form-fields/*` | arrivals/departures/drafts | form-fields | reusable field UI | allowed direct import | These controls have 2+ editor consumers and no durable writes in the field components. | low |
| arrival/departure/draft form model | `features/form-fields/field-family-occurred-at/field-family-occurred-at.format.ts` | arrivals/departures/drafts | form-fields | date-time formatter | should use public boundary later | Formatter is reused by mappers; keep with date-time control until `form-controls` extraction. | low |
| arrival/departure/draft form model/fields | `features/form-preferences/model/*` | arrivals/departures/drafts/form-fields | form-preferences | remembered preference seam | allowed direct import | Preferences are second-data UI defaults, not durable first-data. | medium |
| `features/form-fields/field-family-directory/use-directory-options.ts` | `features/directories/hooks/*` | form-fields | directories | directory read hooks | needs-decision | UI control currently owns query-backed option loading, blocking a blind move to `form-controls`. | medium |
| `src/features/departures/editor/form/departure-editor.form.tsx` | `features/arrivals/data/hooks/*`, `features/scanner/runtime/model/scanner-runtime.facade.ts`, `features/stocks/departure-prefill/*` | departures | arrivals/scanner/stocks | lookup/runtime/prefill | allowed direct import | Departure form needs linked-arrival lookup, scanner entry, and route-state prefill. | medium |
| `src/features/drafts/editor/form/draft-editor.form.tsx` | `features/arrivals/data/hooks/*`, `features/drafts/{data,publish}/hooks/*` | drafts | arrivals/drafts | lookup/data/publish hooks | allowed direct import | Draft editor composes draft write/read/publish and optional arrival relation lookup. | medium |
| `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` | `features/departures/editor/form/model/departure-editor.form-mappers.ts` | drafts | departures | form mapper helper | internal-but-leaked | Draft relation mapping reuses departure form internals. | high |
| `src/features/drafts/editor/form/sections/draft-editor.relation-section.tsx` | `features/departures/editor/form/sections/departure-editor.relation-section.tsx` | drafts | departures | editor section component | internal-but-leaked | Cross-editor UI reuse should get a product/ownership decision before publicizing. | high |
| `src/features/dashboard/model/use-telemetry.ts` | arrivals/departures/drafts/stocks hooks and buffer store | dashboard | multiple | telemetry aggregation | needs-decision | Dashboard aggregates app telemetry; may remain feature model or move page-local later. | medium |
| `src/features/dashboard/model/use-home-favorites.ts` | `features/settings/hooks/*` | dashboard | settings | durable personalization hooks | allowed direct import | Dashboard favorites consume existing personalization hooks without reopening settings. | low |
| `tests/unit/features/**` | `src/features/**/model/*`, scanner modal presentation helpers | tests | feature internals | unit test targets | test-only-entry | Tests intentionally target pure helpers/controllers; keep direct for stability. | low |

#### AR-0401 barrel and index classification

| File | Exports / role | Current consumers | Classification | Future action |
| --- | --- | --- | --- | --- |
| `src/features/backup/ui/backup-workflow/index.tsx` | `BackupWorkflow` route workflow component. | `pages/settings/settings-backup-page.tsx`. | route-local-entry | Keep. Rename to named file only if backup workflow is touched. |
| `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | `BufferPickerModal` contextual picker component. | `navigation/ui/app-overlay-host`. | real-public-boundary | Keep. Do not export picker internals. |
| `src/features/form-fields/field-family-codes/index.tsx` | `CodesFieldFamily`. | arrival/departure/draft main sections. | real-public-boundary | Keep until `form-controls/codes` migration. |
| `src/features/form-fields/field-family-departure-mode/index.tsx` | `DepartureModeFieldFamily`. | departure/draft main sections. | real-public-boundary | Keep until `form-controls/primitive-fields` decision. |
| `src/features/form-fields/field-family-description/index.tsx` | `DescriptionFieldFamily`. | arrival/departure/draft additional sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-family-direction/index.tsx` | `DirectionFieldFamily`. | departure/draft additional sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-family-directory/index.tsx` | `DirectoryFieldFamily` plus option loading. | arrival/departure/draft directory sections. | needs-decision | Split query-backed option loading before moving. |
| `src/features/form-fields/field-family-link-url/index.tsx` | `LinkUrlFieldFamily`. | arrival/draft additional sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-family-money/index.tsx` | `MoneyFieldFamily`. | arrival/departure/draft main sections. | real-public-boundary | Keep until `form-controls/amount` migration. |
| `src/features/form-fields/field-family-note/index.tsx` | `NoteFieldFamily`. | arrival/departure/draft additional sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-family-occurred-at/index.tsx` | `OccurredAtFieldFamily`. | arrival/departure/draft main sections. | real-public-boundary | Keep until `form-controls/date-time` migration. |
| `src/features/form-fields/field-family-subject-kind/index.tsx` | `SubjectKindFieldFamily`. | arrival/departure/draft main sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-family-title/index.tsx` | `TitleFieldFamily`. | arrival/departure/draft main sections. | real-public-boundary | Keep until `form-controls/primitive-fields` migration. |
| `src/features/form-fields/field-info-trigger/index.tsx` | `FieldInfoTrigger`, `FieldLabel`. | editors and draft/departure local fields. | real-public-boundary | Keep as form-control support, not shared UI. |
| `src/features/form-fields/form-section-accordion/index.tsx` | `FormSectionAccordion`, props helper. | arrival/departure/draft section composition. | real-public-boundary | Keep as form-control support until extraction. |
| `src/features/navigation/ui/app-overlay-host/index.tsx` | `AppOverlayHost`. | router root layout. | real-public-boundary | Keep. |
| `src/features/navigation/ui/mobile-bottom-nav/index.tsx` | `MobileBottomNav`, `BottomNavigation` re-export, types. | mobile shell and ui-kit. | needs-decision | Keep; later split component entry from compatibility exports if touched. |
| `src/features/navigation/ui/mobile-shell/index.tsx` | `MobileShell`. | router root layout. | real-public-boundary | Keep. |
| `src/features/pwa/ui/pwa-status-banner/index.tsx` | `PwaStatusBanner`. | app providers. | real-public-boundary | Keep. |
| `src/features/scanner/modal/index.tsx` | `ScannerModal`. | navigation overlay host. | real-public-boundary | Keep; do not expose modal helpers. |
| `src/features/scanner/runtime/model/scanner-runtime.facade.ts` | scanner runtime controller instance, types, `openScannerSession`. | navigation shell, dashboard favorite tile, departure form, scanner modal hooks. | real-public-boundary | Keep; later consider shallower path without changing behavior. |

No decorative barrel that only re-exports a broad internal folder was found under `src/features` in this audit. The `index.tsx` files above are mostly existing component-folder entries with concrete consumers; they should not be deleted in a broad sweep.

#### AR-0401 approved future cleanup candidates

1. `AR-0402A` Buffer core public-boundary preflight and narrow entrypoint.
   - Scope: inspect only `features/buffer/core/model` consumers and design a minimal explicit public surface for store/controller/types if it reduces deep imports.
   - Do not change buffer behavior, localStorage semantics, apply/delete semantics, or scanner integration.

2. `AR-0402B` Scanner runtime public path clarification.
   - Scope: scanner runtime facade consumers only.
   - Goal: decide whether `scanner-runtime.facade.ts` should remain in place or get a shallower named public entry in a later source slice.
   - Do not move browser scanner adapters or scanner modal internals.

3. `AR-0402C` Draft/departure relation reuse decision.
   - Scope: draft imports of departure editor mapper/section only.
   - Goal: decide whether relation reuse stays direct, moves to a local draft copy, or becomes an explicit relation-control owner.
   - Do not extract to `shared` and do not change relation/publish behavior.

#### AR-0401 rejected or deferred candidates

- Deleting any current `index.tsx` file is rejected for this slice; every scanned feature `index.tsx` has a concrete consumer or component-folder role.
- Adding `src/features/<owner>/index.ts` root barrels is rejected; it would hide owner/subarea intent.
- Moving form-field entries to `features/form-controls` is deferred to Stage 5 after directory option loading and preference seam ownership are decided.
- Publicizing departure editor form mappers/sections is rejected until the draft relation reuse decision is explicit.
- Wrapping buffer/scanner/navigation stores in proxy-only public APIs is rejected; a later boundary must reduce coupling, not just rename imports.
- Rewriting test imports is deferred; pure helper/controller tests may keep direct internal imports.
- Moving dashboard telemetry to `shared` is rejected because it is product/app-specific aggregation.

#### AR-0401 stop conditions for later implementation

- Deleting a barrel would require broad import churn.
- A direct import is intentionally route-local page composition.
- A direct import is a stable test target for a pure helper/controller.
- A new public entrypoint would expose internals instead of narrowing them.
- Cleanup would change scanner, buffer, form, stock, or backup behavior.
- Cleanup would touch first-data domain/infrastructure or rename `*.ports.ts`.
- Cleanup would require form-control extraction.
- Cleanup would create new circular imports between buffer, scanner, and navigation.
- Ownership is ambiguous between page-local, feature-local, and shared.

#### AR-0402A - Buffer core public-boundary preflight and narrow entrypoint

Status: done on 2026-04-27.

Decision: create `src/features/buffer/core/buffer-core.public.ts` as a narrow, role-explicit public boundary with named exports only. The boundary is justified because production consumers repeatedly imported stable buffer core seams from deep `model/*` files: singleton buffer store, apply controller/session, control controller, and public result/type contracts. The boundary does not export buffer factory functions, session-store creators, result constructors, local implementation helpers, or every buffer core file.

Import map summary:

| Consumer role | Importing files | Previous buffer core imports | Public boundary candidate? | Decision |
| --- | --- | --- | --- | --- |
| arrival editor | `src/features/arrivals/editor/form/**` | apply controller, apply session store, buffer store, applied-result type | yes | Updated to `buffer-core.public.ts`. |
| departure editor | `src/features/departures/editor/form/**` | apply controller, apply session store, buffer store, applied-result type | yes | Updated to `buffer-core.public.ts`. |
| draft editor | none found | none | no | No change. |
| buffer picker | `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | apply controller, apply session store, buffer store, controller/store types | yes | Updated to `buffer-core.public.ts`; same feature owner, external to core. |
| scanner runtime | `src/features/scanner/runtime/model/**` | buffer store/control contracts, buffer item/result types | yes | Updated to `buffer-core.public.ts`. |
| scanner modal | `src/features/scanner/modal/index.tsx` | buffer store | yes | Updated to `buffer-core.public.ts`. |
| navigation shell | `src/features/navigation/ui/mobile-shell/index.tsx` | buffer store | yes | Updated to `buffer-core.public.ts`. |
| dashboard telemetry | `src/features/dashboard/model/use-telemetry.ts` | buffer store | yes | Updated to `buffer-core.public.ts`. |
| buffer page | `src/pages/buffer/**` | buffer item type, buffer store, buffer control controller/owner | yes | Updated to `buffer-core.public.ts`. |
| buffer/scanner tests | `tests/unit/features/buffer/**`, `tests/unit/features/scanner/**` | factory functions and pure controller/store internals | no | Kept direct test imports; these are stable unit-test targets, not production public API. |

Public exports approved in this slice:

- `bufferStore`
- `bufferApplyController`
- `bufferApplySessionStore`
- `bufferControlController`
- `BufferItem`
- `BufferStore`
- `BufferAddResult`
- `BufferApplyAppliedResult`
- `BufferApplyControllerInstance`
- `BufferApplySessionStore`
- `BufferControlController`
- `BufferControlOwner`
- `AcquireBufferControlResult`
- `ReleaseBufferControlResult`

Rejected exports:

- `createBufferStore`
- `createBufferApplyController`
- `createBufferApplySessionStore`
- `createBufferControlController`
- `createBufferControlSessionStore`
- result-constructor helpers
- persistence constants
- all `export *` patterns

Validation evidence:

- Production `src` imports no longer reference `@/features/buffer/core/model/*`.
- Tests still directly import buffer core internals where they intentionally test pure factories/controllers.
- The new public entrypoint contains no `export *`.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run test:unit -- tests/unit/features/scanner` passed because scanner imports changed.
- `npm run typecheck` passed.

Stop conditions preserved:

- No buffer behavior, localStorage/zustand behavior, duplicate handling, apply/delete semantics, scanner behavior, form behavior, overlay arbitration behavior, first-data code, dependencies, or source file moves changed.

#### AR-0402B - Scanner runtime public path clarification

Status: done on 2026-04-27.

Decision: create `src/features/scanner/runtime/scanner-runtime.public.ts` as a narrow, role-explicit public boundary over the existing scanner runtime facade. The boundary is justified because production consumers outside scanner runtime imported the stable runtime seam from the deeper `runtime/model/scanner-runtime.facade.ts` path. The new boundary exposes only consumer-facing scanner runtime pieces and does not export session stores, preferences store, scanner result helpers, controller factories, browser adapters, modal presentation helpers, or every runtime model file.

Import map summary:

| Consumer role | Importing files | Previous scanner runtime imports | Public boundary candidate? | Decision |
| --- | --- | --- | --- | --- |
| navigation shell/header scanner action | `src/features/navigation/ui/mobile-shell/index.tsx` | `openScannerSession` from `runtime/model/scanner-runtime.facade.ts` | yes | Updated to `scanner-runtime.public.ts`. |
| dashboard favorite scanner action | `src/pages/dashboard/home-favorites/index.tsx` | `openScannerSession` from `runtime/model/scanner-runtime.facade.ts` | yes | Updated to `scanner-runtime.public.ts`. |
| departure editor scanner action | `src/features/departures/editor/form/departure-editor.form.tsx` | `openScannerSession` from `runtime/model/scanner-runtime.facade.ts` | yes | Updated to `scanner-runtime.public.ts`. |
| scanner modal orchestration | `src/features/scanner/modal/index.tsx`, modal hooks, modal `types.ts` | controller instance and controller type from `runtime/model/scanner-runtime.facade.ts` | yes | Updated facade imports to `scanner-runtime.public.ts`; modal-local session store/type imports remain direct. |
| scanner modal presentation/session view helpers | scanner modal presentation, status, notification, section files | `scanner-session.types.ts`, `scanner-session.store.ts`, `scanner-preferences.store.ts` | no | Kept direct because these are same-owner scanner internals, not app-level public API. |
| infrastructure browser scanner composition | `src/infrastructure/browser/scanner/runtime/*` | scanner runtime controller factory/session store internals via relative imports | no | Kept unchanged; browser adapter composition was not part of this public-path slice. |
| scanner tests | `tests/unit/features/scanner/**` | pure runtime factories/controllers by source path | no | Kept direct because these are intentional unit-test targets. |

Public exports approved in this slice:

- `openScannerSession`
- `scannerRuntimeController`
- `ScannerOpenSessionResult`
- `ScannerRuntimeControllerInstance`

Rejected exports:

- `scannerSessionStore`
- `scannerPreferencesStore`
- `createScannerRuntimeController`
- `createScannerSessionStore`
- scanner runtime result constructors/helpers
- scanner session state/types that are modal/runtime internals
- browser scanner adapter exports
- modal presentation helpers
- all `export *` patterns

Validation evidence:

- The new public entrypoint contains no `export *`.
- Production `src` imports no longer reference `@/features/scanner/runtime/model/scanner-runtime.facade.ts`.
- Remaining production imports from `@/features/scanner/runtime/model/*` are same-owner scanner modal/session internals, not external runtime-facade consumers.
- Scanner tests still directly import scanner runtime internals where they intentionally test pure factories/controllers.
- `npm run test:unit -- tests/unit/features/scanner` passed.
- `npm run typecheck` passed.

Stop conditions preserved:

- No scanner behavior, live camera/photo decode behavior, modal open/close behavior, permission/error state behavior, buffer behavior, overlay arbitration behavior, browser scanner adapter logic, first-data code, dependencies, or source file moves changed.

#### AR-0402C - Draft/departure relation reuse decision

Status: decision/preflight complete on 2026-04-27.

Decision summary: draft currently reuses two departure editor internals: the linked-arrival form mapper and the linked-arrival relation UI section. This reuse is not a current behavior bug and does not touch services, repositories, Dexie, or draft publish execution directly. It is still an ownership leak because the draft editor depends on departure editor form value shape and departure-labeled UI internals. Do not expose departure editor internals publicly and do not extract a broad journal-entry seam yet. The selected next implementation is a narrow local duplicate inside the draft editor.

Current draft relation truth:

- Draft relation lookup itself is owned by `src/features/drafts/editor/form/draft-editor.form.tsx`, which imports arrival data hooks directly. This is acceptable because the draft editor needs optional linked-arrival lookup for departure drafts.
- Draft publish remains owned by `src/features/drafts/publish/hooks/use-publish-draft.ts` over the existing publish service. The inspected relation reuse does not call publish services and does not change target-service validation.
- Draft relation UI renders only for `kind === 'departure'`.
- `features/form-controls` does not exist yet; `features/form-fields` is still the active reusable form-field surface.
- `tests/unit/features/drafts` does not exist. Existing coverage for the reused mapper is only `tests/unit/features/departures/form/departure-editor.mappers.test.ts`.

Cross-owner import map:

| Importing file | Imported file | Imported symbol | Importing owner | Imported owner | Role of imported symbol | Classification | Risk | Candidate action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` | `src/features/departures/editor/form/model/departure-editor.form-mappers.ts` | `applyLinkedArrivalToDepartureValues` | drafts editor form model | departures editor form model | Copies selected arrival details into a departure-shaped form value while preserving local departure fields. | form-model mapper | medium-high | Duplicate the small linked-arrival-to-draft mapping locally in `draft-editor.form-mappers.ts`; do not publish departure mappers. |
| `src/features/drafts/editor/form/sections/draft-editor.relation-section.tsx` | `src/features/departures/editor/form/sections/departure-editor.relation-section.tsx` | `DepartureRelationSection` | drafts editor section | departures editor section | Linked-arrival select/preview/apply UI over caller-provided props. | UI section | medium | Duplicate the UI section locally as `DraftRelationSection` until reuse across three owners exists. |
| `src/features/drafts/editor/form/draft-editor.form.tsx` | `src/features/arrivals/data/hooks/use-arrival-list.ts`, `src/features/arrivals/data/hooks/use-arrival-details.ts` | `useArrivalList`, `useArrivalDetails` | drafts editor form | arrivals data | Query-backed arrival option/details lookup for departure draft relation. | query-backed helper via feature hook | medium | Keep direct. This is draft-owned orchestration over existing arrival read hooks, not departure-editor reuse. |

Reuse classification:

| Reused piece | UI-only? | Imports hooks? | Imports services/queries/repositories? | Departure-specific copy? | Depends on mode/profit/loss? | Affects publish payload? | Affects buffer apply? | Can move without behavior change? | Assessment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `applyLinkedArrivalToDepartureValues` | no | no | no | yes, operates on `DepartureEditorFormValues` and preserves departure-local fields | indirectly preserves `mode`, but does not choose profit/loss behavior | indirectly affects draft form state later saved into payload, but does not call publish | no | yes, by local duplication using `DraftEditorFormValues` and `ArrivalDetails` | Keep behavior, remove departure form-value coupling locally. |
| `DepartureRelationSection` | mostly yes | no | no | yes, text/test ids are departure-flavored and component name is departure-owned | no | no | no | yes, by local copy with same visible behavior | UI-only but not neutral enough for `form-controls` because it is linked-arrival relation UI, not a generic field. |
| arrival data hooks in draft editor | no | yes, they are hooks | no direct service/repository in draft file | no | no | only supplies form relation data | no | not needed | Keep direct; this is legitimate draft orchestration over arrival read hooks. |

Decision matrix:

| Option | Pros | Cons | Risk | Behavior impact | Verification needed | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| keep direct import | Smallest immediate diff; no behavior risk. | Keeps draft coupled to departure internals and encourages publicizing form internals. | medium | none | no source validation in this planning slice | Reject as long-term shape; acceptable only until the next narrow implementation. |
| duplicate locally | Makes draft path self-owned; avoids premature abstraction; keeps first-data/publish untouched. | Duplicates small relation UI/mapping logic. | low-medium | none if copied behavior stays identical | draft form smoke; departure mapper tests; new draft mapper test if added | Selected. |
| extract to `features/form-controls/relation` | Could remove duplication later. | Relation is not a generic control yet; linked-arrival semantics and arrival query orchestration are product-specific. | high | possible UI/test-id drift | broad form smoke | Reject for now. |
| extract to `features/journal-entry/relation` | Could become neutral if arrivals, departures, and drafts all need the same relation seam. | Only departure/draft need this now; high dumping-ground risk. | high | likely import churn | broad editor smoke | Defer until three-owner reuse exists and public surface can stay narrow. |
| extract to domain | Would centralize pure mapping if it were domain semantics. | Current mapping is form-value/UI copy behavior, not durable domain logic. | high | could blur form vs domain boundaries | domain and form tests | Reject. |
| defer | Avoids touching source while risk is low. | Leaves known ownership leak unresolved. | medium | none | none | Use only if source work is paused; not the preferred next implementation. |

Selected recommendation:

- Next implementation task: `AR-0403A - Draft relation local duplicate cleanup`.
- Type: narrow local duplicate.
- Scope:
  - `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts`
  - `src/features/drafts/editor/form/sections/draft-editor.relation-section.tsx`
  - draft-focused tests only if added; existing departure mapper tests only for regression.
- Goal: remove draft imports from departure editor internals by duplicating the small linked-arrival mapper and relation section locally inside the draft editor.
- Non-goals: no `features/form-controls` extraction, no `journal-entry` feature, no domain helper, no publish behavior change, no first-data changes, no UI redesign.
- Acceptance criteria:
  - `src/features/drafts/editor/**` no longer imports `src/features/departures/editor/form/model/departure-editor.form-mappers.ts`.
  - `src/features/drafts/editor/**` no longer imports `src/features/departures/editor/form/sections/departure-editor.relation-section.tsx`.
  - Draft relation visible behavior remains unchanged.
  - Departure editor files are not modified except tests if strictly needed for path-proof validation.
  - No `shared`, `form-controls`, or `journal-entry` folder is introduced.
- Validation:
  - old cross-owner import scan for the two departure paths;
  - `npm run test:unit -- tests/unit/features/departures`;
  - add/run focused draft mapper test only if the implementation slice adds one;
  - `npm run typecheck`;
  - browser/runtime verification only if UI behavior changes unexpectedly.

Rejected alternatives:

- Do not create `src/features/form-controls/relation` now. The relation section is linked-arrival workflow UI, not a generic controlled field.
- Do not create `src/features/journal-entry/relation` now. Only departure and departure-kind drafts use the seam; extracting now would create a new feature bucket before the reuse is proven across owners.
- Do not move the mapper to `domain`. It maps form values and UI copy behavior; durable publish semantics remain in domain/service contracts.
- Do not expose departure editor mappers/sections through a public boundary. That would make an internal leak official.
- Do not touch draft publish services or first-data boundaries in this cleanup.

Stop conditions for `AR-0403A`:

- The duplicate would require changing draft save/publish payload semantics.
- The duplicate would require changing departure relation/prefill behavior.
- The duplicate would require touching services, repositories, Dexie, or first-data contracts.
- The UI copy/test id changes would become a redesign instead of a local ownership cleanup.
- A target draft-local file already exists with non-identical behavior.
- The implementation starts creating a broad `journal-entry`, `shared`, or `form-controls` dumping ground.

Validation evidence for this preflight:

- `git status --short` confirmed a heavily dirty worktree with prior unstaged ownership and public-boundary changes; no source edits were made in this slice.
- `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` imports only one departure editor model symbol: `applyLinkedArrivalToDepartureValues`.
- `src/features/drafts/editor/form/sections/draft-editor.relation-section.tsx` imports only one departure editor UI symbol: `DepartureRelationSection`.
- No tests import draft relation helpers directly; `tests/unit/features/drafts` is absent.
- Existing departure mapper test covers `applyLinkedArrivalToDepartureValues` preserving local codes, mode, note, and direction.

#### AR-0403A - Draft relation local duplicate cleanup

Status: done on 2026-04-27.

Decision: remove the draft editor dependency on departure editor internals by duplicating the two small relation pieces locally inside the draft editor. This keeps draft relation ownership explicit and avoids creating `features/form-controls`, `features/journal-entry`, `shared`, or a public departure editor boundary before broader reuse is proven.

Changes completed:

- `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` now maps linked `ArrivalDetails` into `DraftEditorFormValues` locally. It preserves draft-local fields through object spread, including codes, code kind, currency, departure mode, direction, note, link URL, occurred-at value, and selected linked-arrival id.
- `src/features/drafts/editor/form/sections/draft-editor.relation-section.tsx` now owns the relation section UI directly as `DraftRelationSection`. It keeps the existing visible copy, handlers, props, and test ids behavior-equivalent while removing the `DepartureRelationSection` import.
- `tests/unit/features/drafts/form/draft-editor.mappers.test.ts` was added to prove linked-arrival application copies arrival fields without overwriting draft-local departure fields.

Removed cross-owner imports:

| Importing owner | Removed imported owner | Removed dependency | Replacement |
| --- | --- | --- | --- |
| drafts editor form model | departures editor form model | `applyLinkedArrivalToDepartureValues` | draft-local `ArrivalDetails` to `DraftEditorFormValues` mapping |
| drafts editor relation section | departures editor relation section | `DepartureRelationSection` | draft-local `DraftRelationSection` implementation |

Validation evidence:

- Draft editor old-import scan found no remaining `features/departures/editor`, `departures/editor`, or `departure-editor` references under `src/features/drafts/editor`.
- `npm run test:unit -- tests/unit/features/departures` passed: 2 files, 4 tests.
- `npm run test:unit -- tests/unit/features/drafts` passed: 1 file, 1 test.
- `npm run typecheck` passed.

Stop conditions preserved:

- No draft save/update/publish behavior, departure editor behavior, validation semantics, buffer apply behavior, scanner behavior, first-data domain/infrastructure code, services, repositories, queries, dependencies, shared abstractions, `features/form-controls`, or `features/journal-entry` folders changed.

#### AR-0403B - Infrastructure scanner runtime buffer public-boundary import cleanup

Status: done on 2026-04-27.

Decision: replace the remaining production scanner infrastructure imports from deep buffer core model files with the existing narrow buffer public boundary. No new buffer exports were needed because `buffer-core.public.ts` already explicitly exports the stable consumer-facing symbols used by the browser scanner runtime composition root.

Deep import map:

| File | Previous deep buffer import | Symbols imported | Public export available? | New import |
| --- | --- | --- | --- | --- |
| `src/infrastructure/browser/scanner/runtime/controller.instance.ts` | `../../../../features/buffer/core/model/buffer-control.controller.instance.ts`, `../../../../features/buffer/core/model/buffer-store.ts` | `bufferControlController`, `bufferStore` | yes | `@/features/buffer/core/buffer-core.public.ts` |
| `src/infrastructure/browser/scanner/runtime/controller.ts` | `../../../../features/buffer/core/model/buffer-control.types.ts`, `../../../../features/buffer/core/model/buffer-store.types.ts` | `BufferControlController`, `BufferStore` | yes | `@/features/buffer/core/buffer-core.public.ts` |

Validation evidence:

- Production `src` deep buffer import scan found no remaining `@/features/buffer/core/model/`, `../features/buffer/core/model/`, `../../features/buffer/core/model/`, `../../../features/buffer/core/model/`, `../../../../features/buffer/core/model/`, or `features/buffer/core/model/` references.
- `src/features/buffer/core/buffer-core.public.ts` still has explicit named exports only and no `export *`.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run typecheck` passed.

Stop conditions preserved:

- No scanner runtime logic, buffer core logic, localStorage/zustand semantics, duplicate handling, apply/delete semantics, browser scanner adapter behavior, first-data code, dependencies, file moves, file renames, or broad barrels changed.

### Stage 5 - Duplication reduction

- [x] `AR-0501` Extract proven form-control duplicates, preflight first.
  - Status: preflight complete on 2026-04-27.
  - Files inspected: `src/features/form-fields`, `src/features/form-preferences`, `src/features/arrivals/editor/form`, `src/features/departures/editor/form`, `src/features/drafts/editor/form`, and focused form tests.
  - Goal: choose the first safe form-control extraction family before moving any source.
  - Decision: `field-family-codes` is the first approved extraction candidate; directory fields, preferences, and broad primitive-field moves are deferred.
  - Non-goals: no source moves, no source renames, no import rewrites, no behavior changes, no first-data changes, no broad `features/form-controls` cleanup.
  - Acceptance criteria: the first implementation task is narrow, UI-only, and guarded against a dumping-ground move.
  - Validation: readback, next-task search, dirty-worktree check.
  - Docs impact: this section records the extraction decision and guardrails.
  - Risk level: medium.
  - Stop conditions: candidate imports services/repositories/Dexie, owns feature-specific mapping, owns scanner/buffer behavior, is used by only one owner, or requires behavior/first-data changes.

#### AR-0501 preflight summary

`src/features/form-controls` does not currently exist. `src/features/form-fields` remains the active reusable form-field surface. The safest first extraction is the code/token field family because it is used by arrival, departure, and draft editors and its dependency surface is UI-only plus stable type/metadata imports.

Do not perform a broad `form-fields` to `form-controls` move. Move one family at a time, and keep `features/form-controls` restricted to reusable UI form controls used by multiple feature editors.

Guardrails for `features/form-controls` remain:

- allowed: field components, field UI composition, display-only helpers tightly coupled to controls, generic controlled-field adapters, and Mantine UI wiring that is domain-write-free;
- forbidden: domain write logic, services, queries, repositories, Dexie, first-data orchestration, scanner runtime, buffer storage, submit payload mapping, feature-specific validation result mapping, arbitrary helper functions, and one-off controls used by only one owner.

Candidate family inventory:

| Candidate family | Current files | Current consumers | Dependency classification | Extraction decision | Reason |
| --- | --- | --- | --- | --- | --- |
| code/token fields | `src/features/form-fields/field-family-codes/{index.tsx,field-family-codes.constants.ts,field-family-codes.types.ts}` | arrivals main section, departures main section, drafts main section | Mantine UI, `SerialTokensInput`, `FieldLabel`, `FieldInlineIcon`, `RecordCodeKind` type, local metadata/types; no service/query/repository/Dexie/scanner/buffer imports | approved first | Proven 3-owner UI control with no write or runtime ownership. |
| directory fields | `src/features/form-fields/field-family-directory/*` | arrivals/departures/drafts directory sections | Mantine UI, form preferences, `useDirectoryOptions`; `useDirectoryOptions` imports directory read hooks | blocked for blind extraction | UI is reusable, but query-backed option loading must be split or explicitly accepted before moving to `form-controls/directory`. |
| date/time fields | `src/features/form-fields/field-family-occurred-at/*` | arrivals/departures/drafts main sections; form mappers use `field-family-occurred-at.format.ts` | Mantine DateTimePicker, field metadata, pure date formatting helper; no service/query/repository/Dexie | safe later | Good candidate, but formatter is also consumed by form models, so move after the first code-family slice proves the pattern. |
| amount/currency fields | `src/features/form-fields/field-family-money/*` | arrivals/departures/drafts main sections | Mantine NumberInput/TextInput, field metadata; no service/query/repository/Dexie | safe later | Reusable UI-only control, but not the first slice because code fields have clearer product role and action imports to validate. |
| field metadata/help UI | `field-info-trigger/*`, `field-metadata/*` | most field families plus relation/kind sections | Mantine Popover/Tooltip, local metadata copy/types; no service/query/repository/Dexie | defer | Support surface should move only with or after a selected control family; do not make it a primitive dumping ground first. |
| form section accordion | `form-section-accordion/*` | arrival/departure/draft section containers | Mantine Accordion, app theme size helper, help trigger | defer | Reusable section UI, but it is layout support rather than the safest first field-control extraction. |
| primitive text fields | title, description, note, link URL, direction | multi-editor sections | Mantine inputs/textareas, metadata; no service/query/repository/Dexie | defer | Safe candidates, but a broad primitive-fields move would be too much churn for the first extraction. |
| subject kind / departure mode | `field-family-subject-kind/*`, `field-family-departure-mode/*` | subject kind: all editors; departure mode: departure/draft | domain type imports plus `formPreferencesStore` | defer | Reusable, but preference-store coupling should be handled after the pure UI code field move. |
| form preferences | `src/features/form-preferences/model/*` | form constants, mappers, subject kind, departure mode, directory create toggle, draft kind | zustand/localStorage second-data preference seam | needs decision | Not a form control. Keep in `form-preferences` until a dedicated preference-seam task approves any move. |

Dependency classification:

| Family | UI-only? | Multi-owner? | Services/queries/repositories/Dexie? | Scanner/buffer? | Feature-specific mapping? | Safe now? |
| --- | --- | --- | --- | --- | --- | --- |
| code/token fields | yes | yes: arrivals, departures, drafts | no | no | no | yes |
| directory fields | partially | yes | yes, through directory read hooks | no | no write mapping, but query-backed option loading | no |
| date/time fields | yes | yes | no | no | formatter is form-model adjacent but pure | later |
| amount/currency fields | yes | yes | no | no | no | later |
| metadata/help UI | yes | yes | no | no | no | later as support |
| section accordion | yes | yes | no | no | no | later as support |
| subject kind / departure mode | mostly | yes | no | no | no | later after preference decision |
| form preferences | no; second-data preference seam | yes | no Dexie/service/query, but owns localStorage-backed state | no | no | needs decision |

Selected first extraction family:

- Task ID: `AR-0502A - Move code token field family to form-controls/codes`.
- Target:
  - `src/features/form-fields/field-family-codes/index.tsx` -> `src/features/form-controls/codes/index.tsx`
  - `src/features/form-fields/field-family-codes/field-family-codes.constants.ts` -> `src/features/form-controls/codes/code-field.constants.ts`
  - `src/features/form-fields/field-family-codes/field-family-codes.types.ts` -> `src/features/form-controls/codes/code-field.types.ts`
- Import updates:
  - arrival main section imports from `@/features/form-controls/codes`;
  - departure main section imports from `@/features/form-controls/codes`;
  - draft main section imports from `@/features/form-controls/codes`;
  - type imports for `CodesFieldAction` update to the new code-control types path or public code-control entrypoint, depending on the implementation preflight.
- Allowed imports for the moved code control:
  - Mantine components;
  - `@/shared/ui/serial-tokens-input`;
  - `@/shared/ui/field-visuals`;
  - `RecordCodeKind` as a type-only/domain contract import;
  - existing form-field metadata/help support only as a transitional dependency if the implementation slice does not also move support files.
- Forbidden imports for the moved code control:
  - services, queries, repositories, Dexie, `appDb`;
  - scanner runtime, buffer store/control/apply;
  - arrival/departure/draft editor mappers or hooks;
  - submit/publish/create/update orchestration.
- Validation plan for `AR-0502A`:
  - scan for old `@/features/form-fields/field-family-codes` imports in `src` and `tests`;
  - run `npm run test:unit -- tests/unit/features/arrivals`;
  - run `npm run test:unit -- tests/unit/features/departures`;
  - run `npm run test:unit -- tests/unit/features/drafts`;
  - run `npm run typecheck`;
  - do not run browser/runtime verification unless import changes reveal runtime risk.

Blocked or deferred families:

- Directory fields are blocked for extraction until the query-backed `useDirectoryOptions` seam is split or explicitly approved as a dependency outside `features/form-controls`.
- Form preferences stay in `src/features/form-preferences` until a dedicated second-data preference-seam decision. They are not generic form-control files.
- Date/time and amount/currency fields are safe later, but they should follow the code-control slice to keep the first move small and reviewable.
- Field metadata/help trigger and section accordion are support surfaces. They must not become a broad `primitive-fields` bucket before a concrete family needs the move.
- Primitive text fields are reusable but deferred because moving all primitive wrappers at once would create broad import churn.

Stop conditions for `AR-0502A`:

- The target path already exists with non-identical content.
- The code field move requires moving directory option loading, form preferences, buffer/scanner code, services, queries, repositories, Dexie, or editor form mappers.
- The move would require behavior, validation, UI, or first-data changes.
- The new `features/form-controls/codes` entrypoint would need `export *` or a broad barrel.
- The implementation starts moving unrelated field families or support files without a concrete import need.

Validation evidence for this preflight:

- `src/features/form-controls` is absent.
- Code field imports are currently limited to arrival, departure, and draft main sections.
- `field-family-codes` imports Mantine UI, `SerialTokensInput`, `FieldInlineIcon`, `FieldLabel`, local metadata/types, and `RecordCodeKind` type; it does not import services, queries, repositories, Dexie, scanner, buffer, or editor mappers.
- `DirectoryFieldFamily` imports `useDirectoryOptions`, and `useDirectoryOptions` imports `useSupplierList`, `useProductList`, and `useCategoryList`; therefore directory extraction is not approved as the first move.
- Focused form tests currently exist for arrivals, departures, drafts mapper behavior, and occurred-at formatting. No dedicated code-field test exists yet.

#### AR-0502A - Move code token field family to form-controls/codes

Status: done on 2026-04-27.

Decision: move only the reusable code/token field family from the transitional `features/form-fields` area to `features/form-controls/codes`. Filenames were preserved during the move to avoid unnecessary rename churn in this implementation slice.

Moves completed:

| Previous path | Current path | Status |
| --- | --- | --- |
| `src/features/form-fields/field-family-codes/index.tsx` | `src/features/form-controls/codes/index.tsx` | moved |
| `src/features/form-fields/field-family-codes/field-family-codes.constants.ts` | `src/features/form-controls/codes/field-family-codes.constants.ts` | moved |
| `src/features/form-fields/field-family-codes/field-family-codes.types.ts` | `src/features/form-controls/codes/field-family-codes.types.ts` | moved |

Import updates:

- `src/features/arrivals/editor/form/sections/arrival-editor.main-section.tsx` now imports `CodesFieldFamily` and `CodesFieldAction` from `features/form-controls/codes`.
- `src/features/departures/editor/form/sections/departure-editor.main-section.tsx` now imports `CodesFieldFamily` and `CodesFieldAction` from `features/form-controls/codes`.
- `src/features/drafts/editor/form/sections/draft-editor.main-section.tsx` now imports `CodesFieldFamily` from `features/form-controls/codes`.
- The moved code family keeps transitional explicit imports to `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata` until a later support-surface extraction is approved.

Guardrails preserved:

- No directory, date-time, amount/currency, primitive field, help metadata, section accordion, or form-preference family moved.
- No services, queries, repositories, Dexie, `appDb`, scanner, buffer, submit mapping, durable record-code persistence, or first-data code touched.
- No `features/form-controls/index.ts`, broad barrel, or `export *` was created.

Validation evidence:

- Old code-field import scans for `@/features/form-fields/field-family-codes` and `../form-fields/field-family-codes` were clean after the move.
- `src/features/form-controls/codes` forbidden-import scan found no repositories, services, queries, Dexie, `appDb`, scanner, or buffer imports.
- `src/features/form-controls` `export *` scan was clean.
- `npm run test:unit -- tests/unit/features/arrivals` passed.
- `npm run test:unit -- tests/unit/features/departures` passed.
- `npm run test:unit -- tests/unit/features/drafts` passed.
- `npm run typecheck` passed.

#### AR-0502B - Next form-control family preflight

Status: preflight complete on 2026-04-27.

Decision: select `field-family-occurred-at` as the next narrow extraction family. It is used by arrival, departure, and draft editors, has no service/query/repository/Dexie/scanner/buffer dependency, and already has a focused formatter test. `field-family-money` is also reusable and UI-only, but it should follow after the date-time slice because it currently has less focused test coverage.

Preflight summary:

- `src/features/form-controls/codes` exists and remains the only extracted form-control family.
- `src/features/form-fields/field-family-occurred-at` and `src/features/form-fields/field-family-money` remain transitional active form-field families.
- Directory fields remain deferred because `field-family-directory/use-directory-options.ts` imports directory read hooks, and `field-family-directory/index.tsx` imports form preference state.
- Do not create `features/form-controls/index.ts`; do not use `export *`.

Candidate inventory:

| Candidate | Current files | Owners using it | Dependencies | UI-only? | Move risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| date/time fields | `src/features/form-fields/field-family-occurred-at/{index.tsx,field-family-occurred-at.constants.ts,field-family-occurred-at.types.ts,field-family-occurred-at.format.ts}` | arrivals main section, departures main section, drafts main section; arrival/departure/draft form mappers use the formatter | Mantine `DateTimePicker`, Mantine form type, shared `FieldInlineIcon`, form metadata/help support, pure formatter | yes; formatter is pure and control-adjacent | medium because formatter imports must update in form models and tests | approved next |
| amount/currency fields | `src/features/form-fields/field-family-money/{index.tsx,field-family-money.constants.ts,field-family-money.types.ts}` | arrivals main section, departures main section, drafts main section | Mantine `Group`, `NumberInput`, `TextInput`, Mantine form type, shared `FieldInlineIcon`, form metadata/help support | yes | low/medium; no focused money-field test currently exists | defer until after date-time |

Dependency classification:

| Family | Services | Repositories | Queries | Dexie/appDb | Scanner | Buffer | Editor-specific mappers | Domain contracts | Form metadata/help support | Mantine | Shared utils |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date/time fields | no | no | no | no | no | no | formatter is consumed by editor mappers but does not import them | no | yes: `FieldLabel`, `FieldMetadata`, `getFieldPlaceholder` | yes: `@mantine/dates`, `@mantine/form` type | yes: `FieldInlineIcon` |
| amount/currency fields | no | no | no | no | no | no | no | no | yes: `FieldLabel`, `FieldMetadata`, `getFieldPlaceholder` | yes: `@mantine/core`, `@mantine/form` type | yes: `FieldInlineIcon` |
| directory fields | no direct service import | no | yes through directory read hooks | no | no | no | no | directory feature hooks | yes | yes | no |

Selected next extraction family:

- Next task ID: `AR-0502C - Move date-time field family to form-controls/date-time`.
- Target path: `src/features/form-controls/date-time/`.
- Files to move:
  - `src/features/form-fields/field-family-occurred-at/index.tsx` -> `src/features/form-controls/date-time/index.tsx`
  - `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.constants.ts` -> `src/features/form-controls/date-time/field-family-occurred-at.constants.ts`
  - `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.types.ts` -> `src/features/form-controls/date-time/field-family-occurred-at.types.ts`
  - `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.format.ts` -> `src/features/form-controls/date-time/field-family-occurred-at.format.ts`
- Imports to update:
  - `src/features/arrivals/editor/form/sections/arrival-editor.main-section.tsx` should import `OccurredAtFieldFamily` from `@/features/form-controls/date-time`.
  - `src/features/departures/editor/form/sections/departure-editor.main-section.tsx` should import `OccurredAtFieldFamily` from `@/features/form-controls/date-time`.
  - `src/features/drafts/editor/form/sections/draft-editor.main-section.tsx` should import `OccurredAtFieldFamily` from `@/features/form-controls/date-time`.
  - `src/features/arrivals/editor/form/model/arrival-editor.form-mappers.ts` should import `formatIsoForDateTimePicker` from `@/features/form-controls/date-time/field-family-occurred-at.format.ts`.
  - `src/features/departures/editor/form/model/departure-editor.form-mappers.ts` should import `formatIsoForDateTimePicker` from `@/features/form-controls/date-time/field-family-occurred-at.format.ts`.
  - `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` should import `formatIsoForDateTimePicker` from `@/features/form-controls/date-time/field-family-occurred-at.format.ts`.
  - `tests/unit/features/form-fields/field-family-occurred-at.format.test.ts` should update only the import path, or be renamed in a later test-structure slice if explicitly approved.

Allowed imports for `AR-0502C`:

- Mantine `DateTimePicker` and Mantine form types.
- `@/shared/ui/field-visuals`.
- Transitional explicit imports to `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata` until support surfaces are approved for extraction.
- Local date-time constants, types, and formatter.

Forbidden imports for `AR-0502C`:

- services, repositories, queries, Dexie, `appDb`;
- scanner runtime, buffer storage/control/apply;
- arrival/departure/draft editor hooks, submit mappers, create/update/publish orchestration;
- first-data domain/infrastructure write orchestration;
- broad `features/form-controls/index.ts` or any `export *`.

Validation plan for `AR-0502C`:

- scan for old `@/features/form-fields/field-family-occurred-at` imports in `src` and `tests`;
- scan `src/features/form-controls/date-time` for forbidden imports: services, repositories, queries, Dexie, `appDb`, scanner, buffer, editor mappers;
- scan `src/features/form-controls` for `export *`;
- run `npm run test:unit -- tests/unit/features/form-fields`;
- run `npm run test:unit -- tests/unit/features/arrivals`;
- run `npm run test:unit -- tests/unit/features/departures`;
- run `npm run test:unit -- tests/unit/features/drafts`;
- run `npm run typecheck`.

Blocked or deferred families:

- `field-family-money` is deferred, not blocked. It is a valid later candidate for `src/features/form-controls/money/`, but should follow the date-time move because it has no focused money-field test yet.
- Directory fields remain blocked for blind extraction until query-backed option loading and form-preference coupling are separated or explicitly approved outside `features/form-controls`.
- Field metadata/help support remains transitional. Move it only when a selected control-family slice proves a concrete need; do not create a broad support bucket.

Stop conditions for `AR-0502C`:

- `src/features/form-controls/date-time` already exists with non-identical content.
- Moving the formatter requires behavior or validation changes.
- The move requires moving money, directory, form-preference, metadata/help, or accordion files in the same slice.
- The candidate imports services, repositories, queries, Dexie, `appDb`, scanner, buffer, editor submit mappers, or first-data orchestration.
- The target would require `features/form-controls/index.ts`, `export *`, or a broad convenience barrel.
- The implementation would touch first-data, redesign UI, or change arrival/departure/draft form behavior.

Validation evidence for this preflight:

- `OccurredAtFieldFamily` is imported by arrival, departure, and draft main sections.
- `formatIsoForDateTimePicker` is imported by arrival, departure, and draft form mappers and by `tests/unit/features/form-fields/field-family-occurred-at.format.test.ts`.
- `MoneyFieldFamily` is imported by arrival, departure, and draft main sections.
- Candidate dependency scans found no services, repositories, queries, Dexie, `appDb`, scanner, buffer, or editor mapper imports inside `field-family-occurred-at` or `field-family-money`.
- Directory-field dependency scan confirmed query-backed directory hooks and form-preference state, so directory extraction stays deferred.

#### AR-0502C - Move date-time field family to form-controls/date-time

Status: done on 2026-04-27.

Decision: move only the reusable occurred-at/date-time field family from the transitional `features/form-fields` area to `features/form-controls/date-time`. Filenames were preserved to keep this as a folder-ownership cleanup without naming churn.

Moves completed:

| Previous path | Current path | Status |
| --- | --- | --- |
| `src/features/form-fields/field-family-occurred-at/index.tsx` | `src/features/form-controls/date-time/index.tsx` | moved |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.constants.ts` | `src/features/form-controls/date-time/field-family-occurred-at.constants.ts` | moved |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.types.ts` | `src/features/form-controls/date-time/field-family-occurred-at.types.ts` | moved |
| `src/features/form-fields/field-family-occurred-at/field-family-occurred-at.format.ts` | `src/features/form-controls/date-time/field-family-occurred-at.format.ts` | moved |

Import updates:

- `src/features/arrivals/editor/form/sections/arrival-editor.main-section.tsx` now imports `OccurredAtFieldFamily` from `features/form-controls/date-time`.
- `src/features/departures/editor/form/sections/departure-editor.main-section.tsx` now imports `OccurredAtFieldFamily` from `features/form-controls/date-time`.
- `src/features/drafts/editor/form/sections/draft-editor.main-section.tsx` now imports `OccurredAtFieldFamily` from `features/form-controls/date-time`.
- `src/features/arrivals/editor/form/model/arrival-editor.form-mappers.ts` now imports `formatIsoForDateTimePicker` from `features/form-controls/date-time/field-family-occurred-at.format.ts`.
- `src/features/departures/editor/form/model/departure-editor.form-mappers.ts` now imports `formatIsoForDateTimePicker` from `features/form-controls/date-time/field-family-occurred-at.format.ts`.
- `src/features/drafts/editor/form/model/draft-editor.form-mappers.ts` now imports `formatIsoForDateTimePicker` from `features/form-controls/date-time/field-family-occurred-at.format.ts`.
- `tests/unit/features/form-fields/field-family-occurred-at.format.test.ts` now imports the formatter from the new date-time control owner; the test file itself was not moved in this slice.

Guardrails preserved:

- No code, money, directory, metadata/help, accordion, or form-preference family moved.
- No services, queries, repositories, Dexie, `appDb`, scanner, buffer, validation semantics, submit mapping, first-data domain/infrastructure code, or runtime behavior changed.
- No `features/form-controls/index.ts`, broad barrel, or `export *` was created.
- Transitional explicit imports from the moved date-time control to `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata` remain until a later support-surface extraction is approved.

Validation evidence:

- Old import scans for `@/features/form-fields/field-family-occurred-at` and `../form-fields/field-family-occurred-at` were clean after the move.
- Raw `field-family-occurred-at` hits remain only as preserved filenames under `features/form-controls/date-time`, formatter imports, and the existing focused test name/import.
- `src/features/form-controls/date-time` forbidden-import scan found no repositories, services, queries, Dexie, `appDb`, scanner, or buffer imports.
- `src/features/form-controls` `export *` scan was clean.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run test:unit -- tests/unit/features/arrivals` passed.
- `npm run test:unit -- tests/unit/features/departures` passed.
- `npm run test:unit -- tests/unit/features/drafts` passed.
- `npm run typecheck` passed.

#### AR-0502D - Next form-control family preflight for money

Status: preflight complete on 2026-04-27.

Decision: defer moving `field-family-money` until a focused money-control test covers the control-owned value coercion. The family is multi-owner and UI-only, but `MoneyFieldFamily` owns the `NumberInput` adapter behavior that writes `''` for empty/null and `String(value)` for numeric input. That is behavior-sensitive enough to require focused coverage before the move.

Preflight summary:

- `src/features/form-controls/codes` and `src/features/form-controls/date-time` exist and must not be touched by the money preflight or test slice.
- `src/features/form-fields/field-family-money` remains the active transitional owner.
- `MoneyFieldFamily` is used by arrival, departure, and draft main sections.
- No amount/currency formatter file exists under `field-family-money`; amount parsing remains feature-local in arrival, departure, and draft form mappers/validation adapters.
- Existing focused tests cover arrival/departure/draft mapper behavior and occurred-at formatting, but there is no focused money-control test.

Candidate inventory:

| Candidate | Current files | Owners using it | Dependencies | UI-only? | Behavior-sensitive pieces | Move risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| amount/currency fields | `src/features/form-fields/field-family-money/{index.tsx,field-family-money.constants.ts,field-family-money.types.ts}` | arrivals main section, departures main section, drafts main section | Mantine `Group`, `NumberInput`, `TextInput`, Mantine form type, shared `FieldInlineIcon`, form metadata/help support | yes | `NumberInput` `onChange` coerces `''`/`null` to empty string and numbers to string form state; currency delegates to Mantine form input props | medium until focused control test exists | deferred pending test |

Dependency classification:

| Import category | Money family status |
| --- | --- |
| services | no |
| repositories | no |
| queries | no |
| Dexie/appDb | no |
| scanner | no |
| buffer | no |
| editor-specific mappers | no |
| validation adapters | no |
| domain contracts/types | no |
| form metadata/help support | yes: `FieldLabel`, `FieldMetadata`, `getFieldPlaceholder` |
| Mantine | yes: `@mantine/core`, `@mantine/form` type |
| shared utils/UI | yes: `@/shared/ui/field-visuals` |

Selected decision:

- `field-family-money` is approved architecturally as a reusable form control, but the source move is deferred pending focused behavior coverage.
- Do not move it in the same task that adds the test.
- After the test lands and passes, the move target is `src/features/form-controls/money/`.

Next implementation task:

- Task ID: `AR-0502E - Add focused money field control test`.
- Goal: add a narrow test for `MoneyFieldFamily` behavior before moving it.
- Files likely touched:
  - `tests/unit/features/form-fields/field-family-money.test.tsx` or a similarly narrow test under the existing form-field test area.
- Test behavior to cover:
  - renders amount and currency inputs with metadata labels/placeholders;
  - amount `NumberInput` change writes string form state for numeric values;
  - clearing amount writes an empty string;
  - currency input remains controlled through existing form input props.
- Non-goals:
  - no source moves;
  - no behavior changes;
  - no extraction to `features/form-controls/money`;
  - no first-data, service, query, repository, scanner, or buffer changes.

Future move task after the test:

- Task ID: `AR-0502F - Move money field family to form-controls/money`.
- Target path: `src/features/form-controls/money/`.
- Files to move:
  - `src/features/form-fields/field-family-money/index.tsx` -> `src/features/form-controls/money/index.tsx`
  - `src/features/form-fields/field-family-money/field-family-money.constants.ts` -> `src/features/form-controls/money/field-family-money.constants.ts`
  - `src/features/form-fields/field-family-money/field-family-money.types.ts` -> `src/features/form-controls/money/field-family-money.types.ts`
- Imports to update:
  - `src/features/arrivals/editor/form/sections/arrival-editor.main-section.tsx` should import `MoneyFieldFamily` from `@/features/form-controls/money`.
  - `src/features/departures/editor/form/sections/departure-editor.main-section.tsx` should import `MoneyFieldFamily` from `@/features/form-controls/money`.
  - `src/features/drafts/editor/form/sections/draft-editor.main-section.tsx` should import `MoneyFieldFamily` from `@/features/form-controls/money`.
  - The focused money-control test should update only its import path during `AR-0502F`.

Allowed imports for `AR-0502F`:

- Mantine `Group`, `NumberInput`, `TextInput`, and Mantine form types.
- `@/shared/ui/field-visuals`.
- Transitional explicit imports to `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata` until support surfaces are approved for extraction.
- Local money constants and types.

Forbidden imports for `AR-0502F`:

- services, repositories, queries, Dexie, `appDb`;
- scanner runtime, buffer storage/control/apply;
- arrival/departure/draft editor hooks, mappers, validation adapters, submit/create/update/publish orchestration;
- first-data domain/infrastructure write orchestration;
- broad `features/form-controls/index.ts` or any `export *`.

Validation plan:

- For `AR-0502E`: run the new focused money-control test, `npm run test:unit -- tests/unit/features/arrivals`, `npm run test:unit -- tests/unit/features/departures`, `npm run test:unit -- tests/unit/features/drafts`, and `npm run typecheck`.
- For `AR-0502F`: scan for old `@/features/form-fields/field-family-money` imports in `src` and `tests`; scan `src/features/form-controls/money` for forbidden imports; scan `src/features/form-controls` for `export *`; run the focused money-control test plus arrival/departure/draft focused tests and `npm run typecheck`.

Stop conditions:

- The focused test reveals current money-control behavior is ambiguous or differs across owners.
- Moving the money family would require changing the `NumberInput` value coercion, validation semantics, amount parsing, submit mapping, or UI behavior.
- The candidate imports services, repositories, queries, Dexie, `appDb`, scanner, buffer, editor mappers, validation adapters, or first-data orchestration.
- The move requires moving date-time, code, directory, form-preference, metadata/help, or accordion files in the same slice.
- The target path already exists with non-identical content.
- The target would require `features/form-controls/index.ts`, `export *`, or a broad convenience barrel.

Validation evidence for this preflight:

- Current consumers are limited to arrival, departure, and draft main sections.
- Dependency scans found no services, repositories, queries, Dexie, `appDb`, scanner, buffer, editor mapper, validation adapter, or first-data imports inside `field-family-money`.
- Amount parsing/validation remains feature-local in arrival, departure, and draft form model files; it is not owned by `MoneyFieldFamily`.
- No focused money-control test exists under `tests/unit/features/form-fields`, `tests/unit/features/arrivals`, `tests/unit/features/departures`, or `tests/unit/features/drafts`.

#### AR-0502E - Add focused money field control test

Status: done on 2026-04-27.

Decision: add a focused unit test for `MoneyFieldFamily` before moving the money control family. The test uses the existing Node-based Vitest setup and inspects the returned React element props/events directly instead of introducing a DOM/TSX test configuration change.

Files changed:

- `tests/unit/features/form-fields/field-family-money.test.ts`

Coverage added:

- verifies amount and currency controls render with the current metadata placeholders;
- verifies the amount input receives empty string form state as an empty value;
- verifies numeric amount changes call `setFieldValue('amount', String(value))`;
- verifies empty string and `null` amount changes call `setFieldValue('amount', '')`;
- verifies currency remains controlled through the existing form input props.

Implementation changes:

- none. `src/features/form-fields/field-family-money/*` was not changed.

Guardrails preserved:

- no money-control move;
- no `features/form-controls/money` folder;
- no code/date-time/directory/metadata/help/form-preference changes;
- no arrival/departure/draft form behavior, submit mapping, validation semantics, first-data domain/infrastructure, services, queries, repositories, scanner, or buffer changes.

Validation evidence:

- `npm run test:unit -- tests/unit/features/form-fields/field-family-money.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run test:unit -- tests/unit/features/arrivals` passed.
- `npm run test:unit -- tests/unit/features/departures` passed.
- `npm run test:unit -- tests/unit/features/drafts` passed.
- `npm run typecheck` passed.

Next approved implementation task:

- `AR-0502F - Move money field family to form-controls/money`.

#### AR-0502F - Move money field family to form-controls/money

Status: done on 2026-04-27.

Decision: move only the reusable money/amount-currency control family from the transitional `features/form-fields` owner into `features/form-controls/money`. The move is allowed because AR-0502D classified the family as multi-owner UI/control code and AR-0502E added focused value-coercion coverage before the source move.

Moves completed:

| Historical path | Current path | Status |
| --- | --- | --- |
| `src/features/form-fields/field-family-money/index.tsx` | `src/features/form-controls/money/index.tsx` | moved |
| `src/features/form-fields/field-family-money/field-family-money.constants.ts` | `src/features/form-controls/money/field-family-money.constants.ts` | moved |
| `src/features/form-fields/field-family-money/field-family-money.types.ts` | `src/features/form-controls/money/field-family-money.types.ts` | moved |

Import updates:

- arrival, departure, and draft editor main sections now import `MoneyFieldFamily` from `@/features/form-controls/money`;
- the focused money-control test now imports from `src/features/form-controls/money/index.tsx`;
- internal money-control imports were adjusted only for the new folder depth, keeping transitional explicit imports to `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata`.

Guardrails preserved:

- no code/date-time/directory/metadata/help/form-preference files moved;
- no behavior, validation, submit mapping, buffer, scanner, service, query, repository, Dexie, `appDb`, first-data, or domain/infrastructure changes;
- no `features/form-controls/index.ts` and no `export *` barrel was introduced.

Validation evidence:

- old money path scan found no stale `@/features/form-fields/field-family-money` or relative old-path imports; remaining `field-family-money` hits are local moved filenames inside `src/features/form-controls/money`;
- forbidden import scan under `src/features/form-controls/money` found no repositories, services, queries, Dexie, `appDb`, scanner, or buffer imports;
- `export *` scan under `src/features/form-controls` found no hits;
- `npm run test:unit -- tests/unit/features/form-fields/field-family-money.test.ts` passed;
- `npm run test:unit -- tests/unit/features/form-fields` passed;
- `npm run test:unit -- tests/unit/features/arrivals` passed;
- `npm run test:unit -- tests/unit/features/departures` passed;
- `npm run test:unit -- tests/unit/features/drafts` passed;
- `npm run typecheck` passed.

#### AR-0504 - Directory field extraction decision/preflight

Status: preflight complete on 2026-04-27.

Decision: defer directory field extraction. `DirectoryFieldFamily` is a reusable multi-editor control, but the current implementation still combines UI rendering, debounced search state, query-backed option loading, and form-preference persistence in the same component path. Moving it directly into `features/form-controls/directory` would violate the form-controls guardrail unless the query and preference responsibilities are split first. There are also no focused directory-field tests under the inspected form-field, arrival, departure, or draft unit test folders.

Preflight summary:

- Arrival, departure, and draft directory sections all consume `DirectoryFieldFamily` from `@/features/form-fields/field-family-directory`.
- `index.tsx` renders the select/text/checkbox UI, owns local `searchValue` state, debounces search, calls `useDirectoryOptions`, and writes create-if-missing preference values through `formPreferencesStore`.
- `use-directory-options.ts` performs query-backed option loading through directory feature hooks.
- `field-family-directory.types.ts` imports `FormPreferenceKey`, so the public prop type is preference-coupled.
- `field-family-directory.constants.ts` and `field-family-directory.helpers.ts` are pure enough to move with a later UI-only control, but moving them alone would not create a useful seam.
- `field-info-trigger`, `field-metadata`, `form-section-accordion`, and `form-preferences` remain deferred support surfaces and must not be pulled into `features/form-controls/directory`.

Directory file inventory:

| File | Current role | Imports | Consumers | UI-only? | Query-backed? | Preference-coupled? | Candidate target | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/form-fields/field-family-directory/index.tsx` | directory field component plus local state/orchestration | React state/effect, Mantine controls, `useDebouncedValue`, `formPreferencesStore`, `FieldInfoTrigger`, `FieldLabel`, metadata, helper, types, `useDirectoryOptions` | arrival/departure/draft directory sections | no | yes, through `useDirectoryOptions` | yes, writes `formPreferencesStore` | later split: UI-only component may target `features/form-controls/directory` | defer; split before move |
| `src/features/form-fields/field-family-directory/use-directory-options.ts` | directory option-loading hook | `useSupplierList`, `useProductList`, `useCategoryList`, query DTO literals | `DirectoryFieldFamily` | no | yes | no direct store coupling | keep outside `features/form-controls`; likely `features/form-fields` or future directory-field adapter | keep/defer |
| `src/features/form-fields/field-family-directory/field-family-directory.types.ts` | props and kind/path types | Mantine form type, `FormPreferenceKey` | `DirectoryFieldFamily`, option hook | partly | no | yes, prop type includes preference key | split later into UI props without preference key plus adapter props | defer |
| `src/features/form-fields/field-family-directory/field-family-directory.constants.ts` | field metadata | `FieldMetadata` type | `DirectoryFieldFamily` | yes | no | no | `features/form-controls/directory` only with UI component | move later |
| `src/features/form-fields/field-family-directory/field-family-directory.helpers.ts` | nested form-value reader | none | `DirectoryFieldFamily` | yes, control-adjacent | no | no | `features/form-controls/directory` only with UI component | move later |

Dependency classification:

| File | services | repositories | queries | Dexie/appDb | directory hooks | form-preferences | scanner | buffer | editor mappers | domain contracts/types | Mantine | shared utils | form metadata/help support |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `index.tsx` | no | no | indirect through `useDirectoryOptions` | no | indirect | yes: `formPreferencesStore` | no | no | no | no | yes: core + hooks | no | yes |
| `use-directory-options.ts` | no | no | yes through directory feature hooks | no | yes: supplier/product/category list hooks | no | no | no | no | no | no | no | no |
| `field-family-directory.types.ts` | no | no | no | no | no | yes: `FormPreferenceKey` type | no | no | no | no | yes: form type | no | no |
| `field-family-directory.constants.ts` | no | no | no | no | no | no | no | no | no | no | no | no | yes: `FieldMetadata` type |
| `field-family-directory.helpers.ts` | no | no | no | no | no | no | no | no | no | no | no | no | no |

Split option decision matrix:

| Option | Pros | Cons | Risk | Decision |
| --- | --- | --- | --- | --- |
| A - keep directory fields where they are | Preserves behavior and avoids putting query/preference logic into `form-controls` | Leaves one mixed field-family owner | low now, medium later | selected for now |
| B - split UI-only control, keep option loading outside | Would make `features/form-controls/directory` honest if the component receives options/search/create handlers as props | Requires component API split and import churn; current behavior needs tests first | medium | viable later, not now |
| C - create feature-local directory field seam under forms/form-fields | Avoids misleading `form-controls` ownership for query-backed behavior | Adds another seam before proving the split; could become a dumping ground | medium | rejected for now |
| D - defer | Prevents an unsafe extraction while preserving current behavior | Leaves debt documented | low | selected |

Selected decision:

- Directory extraction is deferred, not approved for a source move.
- A later extraction may move only a UI-only directory control into `src/features/form-controls/directory/`.
- Query-backed option loading must stay outside `features/form-controls`.
- Preference persistence must stay outside `features/form-controls/directory` or be injected through callbacks after a separate decision.
- No directory field files should move until characterization tests cover select mode, manual-create mode, preference write behavior, and option loading handoff.

Rejected/deferred alternatives:

- Directly moving `field-family-directory/*` to `features/form-controls/directory` is rejected because it would move query-backed hooks and preference writes into form-controls.
- Moving `use-directory-options.ts` into `features/form-controls/directory` is rejected because directory read hooks/query-backed loading are forbidden there.
- Moving `form-preferences` under form-controls is deferred; it is second-data preference state, not UI-only control code.
- Moving metadata/help/accordion support in the same slice is deferred to avoid creating a support-surface dumping ground.

Next implementation task:

- Task ID: `AR-0504A - Add focused directory field characterization tests`.
- Goal: add narrow tests around current `DirectoryFieldFamily` behavior before any UI/data split.
- Files likely touched:
  - `tests/unit/features/form-fields/field-family-directory.test.ts` or a similarly narrow path matching existing test conventions.
- Test behavior to cover:
  - select mode renders options and writes selected id/name;
  - manual create mode renders text input when `createIfMissing` is checked;
  - toggling create-if-missing clears the selected id and remembers the preference when `preferenceKey` is provided;
  - option-loading can be mocked without hitting directory repositories or Dexie.
- Non-goals:
  - no source move;
  - no UI/data split;
  - no `features/form-controls/directory`;
  - no directory hook, query, repository, service, form-preference, metadata/help, or first-data changes.

Future split candidate after tests:

- Task ID: `AR-0504B - Split directory UI control from option loading`.
- Allowed direction only after AR-0504A passes:
  - extract a UI-only component that accepts `options`, `searchValue`, `onSearchChange`, create toggle state, and callback props;
  - keep `useDirectoryOptions` and form-preference writes outside `features/form-controls/directory`;
  - do not move the public directory field adapter until the split proves behavior-equivalent.

Validation plan:

- For `AR-0504A`: run the new focused directory-field test directly, then `npm run test:unit -- tests/unit/features/form-fields`, arrival/departure/draft focused tests, and `npm run typecheck`.
- For any later split/move: scan `src/features/form-controls/directory` for services, repositories, queries, Dexie, `appDb`, directory hooks, form-preferences, scanner, buffer, submit mappers, and first-data orchestration; scan for broad `features/form-controls/index.ts` and `export *`; run focused form-field and editor tests plus typecheck.

Stop conditions:

- The current component cannot be tested without refactoring source behavior.
- The UI component cannot receive options/search/create handlers as props without behavior changes.
- Query-backed directory hooks or form-preference writes would have to move into `features/form-controls/directory`.
- Extraction would touch first-data domain/infrastructure, directory query semantics, submit mapping, validation mapping, scanner, or buffer behavior.
- The target would require a broad form-controls barrel, catch-all helper, or support-surface dumping ground.

#### AR-0504A - Add focused directory field characterization tests

Status: partial on 2026-04-27.

Decision: add helper-level characterization only. The safe current seam is `getValueAtPath` in `field-family-directory.helpers.ts`; `use-directory-options.ts` and `DirectoryFieldFamily` remain untested in this slice because they require React hook, Mantine component, directory hook, and form-preference mocking. No source behavior was changed and no directory extraction was performed.

Files changed:

- `tests/unit/features/form-fields/field-family-directory.helpers.test.ts`

Coverage added:

- top-level and nested dot-path reads for directory-backed form values;
- undefined result for missing, empty, or absent paths;
- safe traversal through `null`, `undefined`, and primitive intermediate values.

Untested behavior:

- select-mode option rendering and selected id/name writes;
- manual create text input rendering when `createIfMissing` is checked;
- create-if-missing preference writes through `formPreferencesStore`;
- query-backed option loading through `useDirectoryOptions`.

Validation evidence:

- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.helpers.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0504A-2 - Add directory field UI and preference characterization tests`.
- Goal: cover the component/hook behavior before `AR-0504B` attempts a UI/data split.
- Stop condition: if the current unit setup requires source refactors or brittle Mantine/query mocks, keep `AR-0504B` blocked and use a runtime/integration proof instead.

#### AR-0504A-2 - Add directory field UI and preference characterization tests

Status: done on 2026-04-27.

Decision: add Node-compatible React characterization tests without changing directory source. The test uses React server rendering, narrow Mantine component mocks, and directory feature hook mocks at the hook boundary. This avoids browser DOM dependence while still exercising the public props and event handlers that a future UI/data split must preserve.

Files changed:

- `tests/unit/features/form-fields/field-family-directory.ui.test.ts`

Coverage added:

- selecting a directory option writes the expected `idPath` and `namePath` values;
- manual create/free-text mode writes the expected `namePath` value;
- create-if-missing toggle writes the form boolean, clears the selected id, and persists the preference through `formPreferencesStore`;
- selected name is passed as `searchValue` and into the supplier option-loading query.

Untested behavior:

- full DOM interaction with Mantine `Select`, `TextInput`, and `Checkbox`;
- debounce timing beyond the mocked current-value seam;
- visual labels/help trigger rendering;
- live Dexie-backed directory query execution.

Validation evidence:

- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.ui.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0504B - Split directory UI control from option loading`.
- Allowed direction: split only the UI control that receives options/search/create state via props; keep directory hooks and form-preference writes outside `features/form-controls/directory`.

#### AR-0504B - Split directory UI control from option loading

Status: done on 2026-04-27.

Decision: split the directory field family in place. `index.tsx` remains the query/preference/form wrapper and still owns `useDirectoryOptions`, debounced search state, form value writes, and `formPreferencesStore` writes. `directory-field.control.tsx` is the local UI-only control and owns Mantine rendering plus UI event adaptation only. Nothing was moved into `features/form-controls/directory`.

Files changed:

- `src/features/form-fields/field-family-directory/index.tsx`
- `src/features/form-fields/field-family-directory/directory-field.control.tsx`

Split performed:

- wrapper keeps option loading through `useDirectoryOptions`;
- wrapper keeps create-if-missing preference orchestration through `formPreferencesStore`;
- wrapper keeps selected option, manual input, and create-toggle form writes;
- UI control receives options, search value, selected values, create state, and callbacks as props;
- UI control imports Mantine, field metadata/help support, and local directory types/constants only.

Forbidden import evidence:

- `Select-String` scan of `directory-field.control.tsx` for `services`, `repositories`, `queries`, `dexie`, `Dexie`, `appDb`, `useDirectoryOptions`, `formPreferencesStore`, `scanner`, and `buffer` returned no matches.

Validation evidence:

- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.helpers.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.ui.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0504C - Directory UI-only control move preflight`.
- Goal: verify whether the local UI-only control can move to `features/form-controls/directory` without dragging field metadata/help support or creating a directory-control dumping ground.

#### AR-0504C - Directory UI-only control move preflight

Status: preflight complete on 2026-04-27.

Decision: approve a narrow next move for the directory UI-only control, but only after keeping query-backed loading, form preference writes, and form-wrapper typing outside `features/form-controls/directory`. `DirectoryFieldControl` is UI-only after `AR-0504B`: it imports Mantine, field metadata/help UI support, directory display metadata, and directory UI types only. It does not import `useDirectoryOptions`, directory hooks, services, repositories, queries, Dexie/appDb, `formPreferencesStore`, scanner, buffer, submit mappers, or first-data orchestration.

Preflight summary:

- `src/features/form-fields/field-family-directory/index.tsx` remains the query/preference-aware wrapper and must not move in the next slice.
- `src/features/form-fields/field-family-directory/directory-field.control.tsx` is ready to move as the UI-only control.
- `src/features/form-fields/field-family-directory/field-family-directory.constants.ts` is UI-safe metadata and may move with the control.
- `src/features/form-fields/field-family-directory/field-family-directory.types.ts` must not move wholesale because it imports `UseFormReturnType` and `FormPreferenceKey`; only UI-safe type pieces may be introduced in the target.
- `field-info-trigger` and `field-metadata` are UI/help support surfaces and may remain in `features/form-fields` as transitional imports.
- `form-section-accordion` is unrelated to the directory control move and remains deferred.

Move candidate inventory:

| File | Current role | Imports | Consumers | UI-only? | Needs to move? | Candidate target | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/form-fields/field-family-directory/directory-field.control.tsx` | Directory select/manual input UI control | React type, Mantine controls, `FieldInfoTrigger`, `FieldLabel`, `FormInfoContentKey` type, directory metadata/constants/types | `field-family-directory/index.tsx`; directory UI tests indirectly through wrapper | yes | yes | `src/features/form-controls/directory/directory-field.control.tsx` | move next |
| `src/features/form-fields/field-family-directory/field-family-directory.constants.ts` | Directory field labels/placeholders/help metadata | `FieldMetadata` type only | `directory-field.control.tsx` | yes | yes | `src/features/form-controls/directory/field-family-directory.constants.ts` | move with control; rename only in a later naming slice if desired |
| `src/features/form-fields/field-family-directory/field-family-directory.types.ts` | Mixed directory field family props and kind type | Mantine form type, `FormPreferenceKey` type | wrapper and control | partially | no wholesale move | keep wrapper types local; introduce target-local UI type if needed | split only UI-safe `DirectoryFieldKind`/control props into target during move |
| `src/features/form-fields/field-family-directory/field-family-directory.helpers.ts` | Wrapper helper for nested form values | none | wrapper and helper test | pure, but wrapper-local | no | none | keep in form-fields wrapper family |
| `src/features/form-fields/field-info-trigger/*` | Reusable form help trigger and label UI | React, Mantine, Tabler icon, field metadata helpers/content | multiple form field families and section accordion | yes | no | stay under `features/form-fields` for now | allow transitional import from moved control; do not broaden next slice |
| `src/features/form-fields/field-metadata/*` | Form metadata/help content and helpers | local metadata files only | field help trigger, field families | yes | no | stay under `features/form-fields` for now | defer support-surface ownership decision |
| `src/features/form-fields/form-section-accordion/*` | Form section layout/help UI | React type, Mantine Accordion/Group/Text, app accordion theme, `FieldInfoTrigger` | editor sections | yes, but unrelated | no | none | keep deferred; not part of directory control move |

Metadata/help support decision:

| Option | Decision | Reason | Risk |
| --- | --- | --- | --- |
| A - keep metadata/help in `features/form-fields` | selected | Support files are UI-only and have no query/preference/domain-write imports; leaving them avoids a broad support-surface move. | creates a temporary `form-controls/directory -> form-fields` UI-support import, acceptable while support ownership is deferred |
| B - move metadata/help support with directory control | rejected for this slice | These support surfaces are shared by multiple form families and section UI, not directory-specific. | would turn a directory move into a broad form-support migration |
| C - block directory move until support surfaces are handled | not selected | Current support imports are UI-only and do not violate form-control guardrails. | lower risk than broad support migration |

Selected next implementation task:

- Task ID: `AR-0504D - Move directory UI-only control to form-controls/directory`.
- Scope:
  - create `src/features/form-controls/directory/`;
  - move `src/features/form-fields/field-family-directory/directory-field.control.tsx` to `src/features/form-controls/directory/directory-field.control.tsx`;
  - move `src/features/form-fields/field-family-directory/field-family-directory.constants.ts` to `src/features/form-controls/directory/field-family-directory.constants.ts`;
  - introduce or move only UI-safe directory control types in the target, such as `DirectoryFieldKind`, `DirectoryFieldOption`, and `DirectoryFieldControlProps`;
  - keep `DirectoryFieldFamilyProps`, `DirectoryFieldPathMap`, `getValueAtPath`, `useDirectoryOptions`, and form preference handling in `src/features/form-fields/field-family-directory/`;
  - update wrapper and tests only for import paths.
- Allowed imports in the target:
  - React types;
  - Mantine UI components;
  - local directory control types/constants;
  - `features/form-fields/field-info-trigger` and `features/form-fields/field-metadata` as transitional UI-only help support.
- Forbidden imports in the target:
  - `useDirectoryOptions`;
  - directory hooks;
  - services, repositories, queries, Dexie/appDb;
  - `formPreferencesStore` or preference writes;
  - scanner, buffer, submit mappers, validation adapters, or first-data orchestration.

Rejected/deferred alternatives:

- Moving all of `field-family-directory/*` to `features/form-controls/directory` remains rejected because the wrapper owns query loading and preference writes.
- Moving `use-directory-options.ts` remains rejected because it imports directory feature hooks and query-backed option loading.
- Moving `form-preferences` remains rejected because it is second-data preference state, not UI-only control code.
- Moving `field-info-trigger`, `field-metadata`, or `form-section-accordion` is deferred to a separate support-surface decision, if needed.
- Creating `features/form-controls/index.ts` or any `export *` barrel is rejected.

Validation plan for `AR-0504D`:

- scan `src/features/form-controls/directory` for `services`, `repositories`, `queries`, `dexie`, `Dexie`, `appDb`, `useDirectoryOptions`, `formPreferencesStore`, `scanner`, and `buffer`;
- scan `src/features/form-controls` for `export *` and a root `index.ts`;
- run `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.helpers.test.ts`;
- run `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.ui.test.ts`;
- run `npm run test:unit -- tests/unit/features/form-fields`;
- run `npm run typecheck`.

Stop conditions:

- `DirectoryFieldControl` gains query hooks, form preference writes, services/repositories/queries, Dexie/appDb, scanner, buffer, submit mapping, or first-data imports before the move.
- The move would require behavior changes in select/manual input/create-if-missing flows.
- The move would require moving directory option loading, preference storage, or form wrapper ownership into `features/form-controls`.
- The metadata/help support import becomes non-UI-only or starts pulling query/preference/domain-write logic.
- The target would require a broad root barrel, `export *`, or arbitrary support helpers.

#### AR-0504D - Move directory UI-only control to form-controls/directory

Status: done on 2026-04-27.

Decision: move only the UI-only directory control surface into `features/form-controls/directory`. The directory field wrapper remains in `features/form-fields/field-family-directory` and still owns form value writes, debounced search state, query-backed option loading through `useDirectoryOptions`, and create-if-missing preference writes through `formPreferencesStore`.

Files changed:

- `src/features/form-controls/directory/directory-field.control.tsx`
- `src/features/form-controls/directory/directory-field.types.ts`
- `src/features/form-controls/directory/field-family-directory.constants.ts`
- `src/features/form-fields/field-family-directory/index.tsx`
- `src/features/form-fields/field-family-directory/field-family-directory.types.ts`

Move/type split performed:

- moved `directory-field.control.tsx` to `src/features/form-controls/directory/directory-field.control.tsx`;
- moved UI-safe directory display metadata to `src/features/form-controls/directory/field-family-directory.constants.ts`;
- created `src/features/form-controls/directory/directory-field.types.ts` for `DirectoryFieldKind`, `DirectoryFieldOption`, and `DirectoryFieldControlProps`;
- kept `DirectoryFieldFamilyProps`, `DirectoryFieldPathMap`, `getValueAtPath`, `useDirectoryOptions`, and form preference handling under `src/features/form-fields/field-family-directory/`;
- kept field metadata/help support under `src/features/form-fields/{field-info-trigger,field-metadata}` as the transitional UI support seam;
- did not create a root `features/form-controls/index.ts` or any `export *` barrel.

Forbidden import evidence:

- `src/features/form-controls/directory` scan for `useDirectoryOptions`, `formPreferencesStore`, `FormPreferenceKey`, `services`, `repositories`, `queries`, `dexie`, `Dexie`, `appDb`, `scanner`, and `buffer` returned no matches.
- `src/features/form-controls` scan for `export *` returned no matches.

Validation evidence:

- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.helpers.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields/field-family-directory.ui.test.ts` passed.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0505 - Form-controls support-surface ownership preflight`.
- Goal: decide whether `field-info-trigger`, `field-metadata`, and `form-section-accordion` should stay under `features/form-fields` as shared form support, move under a narrower support owner, or remain deferred.
- Non-goal: no directory query/preference movement and no behavior changes.

#### AR-0505 - Form-controls support-surface ownership preflight

Status: preflight complete on 2026-04-27.

Decision: approve one narrow follow-up move for UI-only field help/metadata support into `features/form-controls/support`. Do not move `form-section-accordion` in that task. The help trigger and metadata files are reused by extracted controls under `features/form-controls/{codes,date-time,money,directory}` and remaining transitional field families, and their inspected imports are UI/local metadata only. `form-section-accordion` is also UI-only, but it is an editor section layout shell rather than field-control support, so moving it to `form-controls/support` would broaden that owner.

Preflight summary:

- `src/features/form-controls` now contains extracted reusable controls: `codes`, `date-time`, `money`, and `directory`.
- Extracted controls still import `FieldLabel`, `FieldInfoTrigger`, `FieldMetadata`, `FormInfoContentKey`, and `getFieldPlaceholder` from `src/features/form-fields/{field-info-trigger,field-metadata}`.
- `field-info-trigger` imports React, Mantine, Tabler icon, and local metadata helpers/content. It has no service/query/repository/Dexie/appDb/scanner/buffer/form-preference dependency.
- `field-metadata` owns form field/section help content, metadata types, and display helpers. It has no service/query/repository/Dexie/appDb/scanner/buffer/form-preference dependency.
- `form-section-accordion` imports Mantine Accordion/Group/Text, app accordion theme sizing, and `FieldInfoTrigger`. It is reusable editor section UI, not a reusable field-control helper.
- Remaining `features/form-fields` families include primitive fields plus preference-coupled field families. Preference-coupled families stay out of `features/form-controls` until separate decisions.

Support surface inventory:

| File/folder | Current role | Imports | Consumers | UI-only? | Form-control-specific? | Product-agnostic? | Candidate target | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/form-fields/field-info-trigger/index.tsx` | Help icon/popover/tooltip and `FieldLabel` UI | React hooks/types, Mantine, Tabler icon, local field metadata helpers/content/constants/types | `form-controls/codes`, `form-controls/date-time`, `form-controls/money`, `form-controls/directory`, remaining field families, editor relation/main/kind sections, `form-section-accordion` | yes | yes; field label/help support | no; SKLAD form/help semantics | `src/features/form-controls/support/field-info-trigger/` | move in `AR-0505A` |
| `src/features/form-fields/field-info-trigger/field-info-trigger.constants.ts` | Help trigger accessible label | none | `field-info-trigger/index.tsx` | yes | yes | no | `src/features/form-controls/support/field-info-trigger/` | move with trigger |
| `src/features/form-fields/field-info-trigger/field-info-trigger.types.ts` | Help trigger and field label props | ReactNode type, `FormInfoContentKey`, `FieldMetadata` | `field-info-trigger/index.tsx` | yes | yes | no | `src/features/form-controls/support/field-info-trigger/` | move with trigger after metadata path is moved |
| `src/features/form-fields/field-metadata/field-info-content.ts` | Field and section help copy registry | none | `FieldInfoTrigger`, field metadata helpers, accordion/types via `FormInfoContentKey`, editor sections | yes, content support | yes for forms; includes section help too | no; product form copy | `src/features/form-controls/support/field-metadata/` | move with explicit guardrail that content is form-control/help support, not generic shared copy |
| `src/features/form-fields/field-metadata/field-metadata.helpers.ts` | Display helpers for field help/placeholder | local metadata content/types | date-time, money, title, direction, link URL, field info trigger | yes | yes | no | `src/features/form-controls/support/field-metadata/` | move in `AR-0505A` |
| `src/features/form-fields/field-metadata/field-metadata.types.ts` | `FieldMetadata` type | `FormInfoContentKey` type | extracted controls, remaining field families, editor relation/kind sections | yes | yes | no | `src/features/form-controls/support/field-metadata/` | move in `AR-0505A` |
| `src/features/form-fields/form-section-accordion/index.tsx` | Editor section accordion shell with optional help trigger | React type, Mantine Accordion/Group/Text, app accordion theme helper, `FieldInfoTrigger` | arrival/departure/draft editor section containers | yes | no; section layout shell | no; form/editor-specific | stay in `features/form-fields` for now | defer; do not move to `form-controls/support` |
| `src/features/form-fields/form-section-accordion/*.ts` | Section accordion constants/types | React types, `FormInfoContentKey` type | `form-section-accordion/index.tsx` | yes | no | no | stay in `features/form-fields` for now | defer with accordion |
| Remaining `src/features/form-fields/field-family-*` primitives | Transitional field families not yet extracted | Mantine, field support; some import `formPreferencesStore` | arrival/departure/draft editors | mixed | field controls, but not support | no | later per-family task only | not part of support move |
| `src/features/form-preferences/*` | Persisted form preference state | zustand/localStorage seam | directory, subject kind, departure mode families | no | no | no | none | must not move |

Consumer map:

| Consumer | Support surface used | Consumer owner | Reason | Can remain transitional? | Candidate future import path |
| --- | --- | --- | --- | --- | --- |
| `src/features/form-controls/codes/*` | `FieldLabel`, `FieldMetadata` | extracted code controls | labels/help metadata for code token UI | yes until `AR-0505A` | `@/features/form-controls/support/field-info-trigger`; `@/features/form-controls/support/field-metadata/...` |
| `src/features/form-controls/date-time/*` | `FieldLabel`, `FieldMetadata`, `getFieldPlaceholder` | extracted date-time controls | label/help/placeholder metadata | yes until `AR-0505A` | same support paths |
| `src/features/form-controls/money/*` | `FieldLabel`, `FieldMetadata`, `getFieldPlaceholder` | extracted money controls | amount/currency labels and placeholders | yes until `AR-0505A` | same support paths |
| `src/features/form-controls/directory/*` | `FieldInfoTrigger`, `FieldLabel`, `FormInfoContentKey`, `FieldMetadata` | extracted directory UI-only control | label/help metadata and create-toggle help | yes until `AR-0505A` | same support paths |
| `src/features/form-fields/field-family-title`, `direction`, `description`, `note`, `link-url`, `subject-kind`, `departure-mode` | `FieldLabel`, `FieldMetadata`, sometimes `getFieldPlaceholder` | remaining transitional form fields | reusable field label/metadata support while families remain unmoved | yes | same support paths after support move |
| `src/features/form-fields/field-family-directory/index.tsx` | no direct support import after `AR-0504D`; wrapper consumes moved directory control | directory wrapper | query/preference-aware wrapper delegates UI | yes | none unless wrapper types need metadata |
| `src/features/form-fields/form-section-accordion/*` | `FieldInfoTrigger`, `FormInfoContentKey` | editor section layout support | optional section help trigger | yes | imports support path after `AR-0505A`, but accordion stays where it is |
| Arrival/departure/draft editor main/relation/kind sections | `FieldInfoTrigger`, `FieldLabel`, `FieldMetadata`, `FormSectionAccordion` | editor forms | section-level help and relation/kind labels | yes | help/metadata from support after `AR-0505A`; accordion remains direct |
| Tests under `tests/unit/features/form-fields` | no direct support imports found in scan | form-field tests | current tests cover field family behavior, not support internals | yes | update only if import paths appear later |

Decision matrix:

| Option | Pros | Cons | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| A - keep support surfaces in `features/form-fields` | no churn; current code works | extracted controls continue depending on transitional field bucket | medium ownership drift | reject as final state; acceptable only until next slice |
| B - move UI-only help/metadata support to `features/form-controls/support` | aligns extracted controls with their support; keeps form-specific concepts out of `shared/ui`; removes `form-controls -> form-fields` support dependency | touches imports across extracted controls, remaining field families, accordion, and editor sections | medium import churn, low behavior risk | selected for `field-info-trigger` and `field-metadata` only |
| C - move support to `shared/ui` | reusable path name | wrong layer for SKLAD form metadata/help semantics | high architecture drift | reject |
| D - split support surfaces | allows help/metadata to move while accordion stays | requires clear stop conditions so support does not absorb layout/editor shell | low/medium | selected shape |
| E - defer all support moves | avoids immediate churn | leaves support ownership ambiguous after four control moves | medium | reject unless implementation scan finds forbidden imports |

Selected next task:

- Task ID: `AR-0505A - Move UI-only form help metadata support to form-controls/support`.
- Scope:
  - create `src/features/form-controls/support/field-info-trigger/`;
  - create `src/features/form-controls/support/field-metadata/`;
  - move only `src/features/form-fields/field-info-trigger/*` and `src/features/form-fields/field-metadata/*`;
  - update imports in extracted controls, remaining form fields, editor sections, `form-section-accordion`, and tests only if needed;
  - keep `form-section-accordion` in `src/features/form-fields/form-section-accordion`;
  - keep `form-preferences`, directory wrapper, directory option loading, primitive field families, and editor-local sections out of the support move.
- Allowed imports in `features/form-controls/support`:
  - React types/hooks and Mantine UI for the help trigger;
  - Tabler icon already used by the trigger;
  - local support metadata content/types/helpers/constants.
- Forbidden imports in `features/form-controls/support`:
  - services, repositories, queries, Dexie/appDb;
  - form preferences or preference writes;
  - scanner, buffer, submit mappers, feature-specific validation adapters, first-data orchestration;
  - broad editor section layout ownership.

Rejected/deferred alternatives:

- Do not move `form-section-accordion` to `features/form-controls/support`; it is editor section layout, not field-control support.
- Do not move any `field-family-*` primitives in `AR-0505A`; each field family still needs a dedicated extraction decision.
- Do not move `form-preferences`; it is a second-data preference seam, not UI support.
- Do not move support to `shared/ui`; `FieldMetadata`, `FormInfoContentKey`, and help copy are product/form-specific.
- Do not create `features/form-controls/index.ts` or any `export *` barrel.

Validation plan for `AR-0505A`:

- scan `src/features/form-controls/support` for `services`, `repositories`, `queries`, `dexie`, `Dexie`, `appDb`, `formPreferencesStore`, `FormPreferenceKey`, `scanner`, and `buffer`;
- scan `src/features/form-controls` for `export *` and root `index.ts`;
- scan `src` and `tests` for stale `@/features/form-fields/field-info-trigger` and `@/features/form-fields/field-metadata` imports;
- run `npm run test:unit -- tests/unit/features/form-fields`;
- run focused arrival/departure/draft unit tests if any import paths change there;
- run `npm run typecheck`.

Stop conditions:

- Any support file imports preferences, query hooks, services, repositories, Dexie/appDb, scanner, buffer, submit mapping, validation adapters, or first-data orchestration before the move.
- The move would require changing help/label UI behavior or field metadata semantics.
- The target would need a root barrel, `export *`, or arbitrary helper bucket.
- `form-section-accordion` or editor-local layout would need to move to make imports work.
- A support file is used by only one control and not clearly reusable.

#### AR-0505A - Move UI-only form help metadata support to form-controls/support

Status: done on 2026-04-27.

Decision: move only the UI-only form help/metadata support surfaces from `features/form-fields` into `features/form-controls/support`. This removes the transitional `form-controls -> form-fields` support dependency while keeping section layout, form preferences, and remaining field families outside the move.

Moves completed:

| Previous path | Current path | Status |
| --- | --- | --- |
| `src/features/form-fields/field-info-trigger/field-info-trigger.constants.ts` | `src/features/form-controls/support/field-info-trigger/field-info-trigger.constants.ts` | moved |
| `src/features/form-fields/field-info-trigger/field-info-trigger.types.ts` | `src/features/form-controls/support/field-info-trigger/field-info-trigger.types.ts` | moved |
| `src/features/form-fields/field-info-trigger/index.tsx` | `src/features/form-controls/support/field-info-trigger/index.tsx` | moved |
| `src/features/form-fields/field-metadata/field-info-content.ts` | `src/features/form-controls/support/field-metadata/field-info-content.ts` | moved |
| `src/features/form-fields/field-metadata/field-metadata.helpers.ts` | `src/features/form-controls/support/field-metadata/field-metadata.helpers.ts` | moved |
| `src/features/form-fields/field-metadata/field-metadata.types.ts` | `src/features/form-controls/support/field-metadata/field-metadata.types.ts` | moved |

Import updates:

- Extracted controls under `src/features/form-controls/{codes,date-time,money,directory}` now import `FieldInfoTrigger`, `FieldLabel`, `FieldMetadata`, `FormInfoContentKey`, and metadata helpers from `features/form-controls/support`.
- Remaining transitional field families under `src/features/form-fields/field-family-*` now import form help/metadata support from `features/form-controls/support`.
- Arrival, departure, and draft editor sections that render direct help/label affordances now import support from `features/form-controls/support`.
- `form-section-accordion` remains under `src/features/form-fields/form-section-accordion` and imports only the moved help/metadata support.

Deferred surfaces preserved:

- `src/features/form-fields/form-section-accordion` was not moved.
- `src/features/form-preferences` was not moved.
- Remaining `src/features/form-fields/field-family-*` folders were not moved.
- No `src/features/form-controls/index.ts`, broad support barrel, or `export *` was created.

Validation evidence:

- Old support import scans for `@/features/form-fields/field-info-trigger`, `@/features/form-fields/field-metadata`, `../form-fields/field-info-trigger`, and `../form-fields/field-metadata` returned no matches.
- `src/features/form-fields/form-section-accordion` and `src/features/form-preferences` still exist outside `features/form-controls`.
- `src/features/form-controls/support` forbidden-import scan for `services`, `repositories`, `queries`, `dexie`, `Dexie`, `appDb`, `formPreferencesStore`, `FormPreferenceKey`, `scanner`, and `buffer` returned no matches.
- `src/features/form-controls` scan for `export *` returned no matches.
- `npm run test:unit -- tests/unit/features/form-fields` passed.
- `npm run test:unit -- tests/unit/features/arrivals` passed.
- `npm run test:unit -- tests/unit/features/departures` passed.
- `npm run test:unit -- tests/unit/features/drafts` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0506 - Form-controls extraction checkpoint after support move`.
- Goal: verify extracted control and support ownership after codes, date-time, money, directory, and support surfaces were moved.
- Non-goal: no additional field-family moves, no form-preferences move, and no form-section-accordion move.

#### AR-0507 - Next form-field family/preference ownership preflight

Status: preflight complete on 2026-04-27.

Decision: keep the remaining `src/features/form-fields` owner as an explicit transitional form seam owner and close Phase 5 for now. Do not move `form-section-accordion`, do not move or rename the directory wrapper, and do not merge `form-preferences` into durable settings or `form-controls`. The extracted `features/form-controls` owner now contains UI-only reusable controls and UI-only help/metadata support; the remaining `form-fields` files are either query/preference-aware wrappers, editor section layout, or still-unclassified field families that need separate preflights before any move.

Preflight summary:

- `src/features/form-controls` now owns UI-only reusable controls for codes, date-time, money, and directory plus `support/field-info-trigger` and `support/field-metadata`.
- `src/features/form-fields/field-family-directory/index.tsx` remains the query/preference-aware wrapper. It calls `useDirectoryOptions`, owns debounced search/form writes, and writes create-if-missing preferences through `formPreferencesStore`.
- `src/features/form-fields/field-family-directory/use-directory-options.ts` remains query-backed through directory feature hooks and must not move to `features/form-controls`.
- `src/features/form-fields/form-section-accordion` remains editor section layout. It is UI-only, but it is not a field-control support surface and should not be absorbed by `form-controls/support`.
- `src/features/form-preferences` remains a separate second-data seam over zustand/localStorage for remembered form choices. It is not durable IndexedDB settings unless a future product decision explicitly promotes it.
- Arrival, departure, and draft editors still consume `FormSectionAccordion`, `DirectoryFieldFamily`, and form preference defaults directly where those owners are behavior-relevant.
- The architecture plan did not contain a separate `AR-0506` section during this readback; current source/status scans and the completed `AR-0505A` evidence were used as the Phase 5 checkpoint basis.

Remaining form-fields inventory:

| File/folder | Current role | Imports | Consumers | UI-only? | Query-backed? | Preference-coupled? | Candidate owner | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/form-fields/form-section-accordion/*` | reusable editor form section accordion with optional help trigger | React types, Mantine Accordion/Group/Text, app accordion theme helper, `features/form-controls/support/field-info-trigger`, `FormInfoContentKey` type | arrival/departure/draft editor section containers | yes | no | no | keep in `features/form-fields` for now | keep; do not move to `form-controls/support` or `shared/ui` |
| `src/features/form-fields/field-family-directory/index.tsx` | directory wrapper over the UI-only directory control | React state/effect, Mantine `useDebouncedValue`, `DirectoryFieldControl`, `formPreferencesStore`, local helper/types, `useDirectoryOptions` | arrival/departure/draft directory sections; directory UI test | no | yes, through `useDirectoryOptions` | yes, writes preference values | keep in `features/form-fields/field-family-directory` | keep; no rename/move now |
| `src/features/form-fields/field-family-directory/use-directory-options.ts` | query-backed option-loading hook | directory feature hooks: `useSupplierList`, `useProductList`, `useCategoryList` | directory wrapper | no | yes | no | keep outside `form-controls`; likely same directory wrapper owner | keep |
| `src/features/form-fields/field-family-directory/field-family-directory.helpers.ts` | pure nested form-value reader for wrapper path access | none | directory wrapper; helper test | yes as pure helper, but wrapper-local | no | no | keep with wrapper | keep; do not move alone |
| `src/features/form-fields/field-family-directory/field-family-directory.types.ts` | directory wrapper prop/path types | Mantine form type, `DirectoryFieldKind` from form-controls, `FormPreferenceKey` type | directory wrapper | no | no | yes, prop type includes preference key | keep with wrapper | keep |
| `src/features/form-preferences/model/*` | remembered form choice store and key registry | zustand/localStorage, local preference types | form mappers; subject-kind/departure-mode/directory fields; draft kind field; directory UI test | no | no | owns preference state | keep separate feature seam | keep; second-data, not durable settings |
| `src/features/form-fields/field-family-subject-kind/*` | preference-coupled select field family | Mantine Select, `formPreferencesStore`, support label, field visuals | arrival/departure/draft editors | mostly UI but writes preferences | no | yes | later per-family preflight if extraction is useful | defer |
| `src/features/form-fields/field-family-departure-mode/*` | preference-coupled departure mode radio field | Mantine Radio/Group, `formPreferencesStore`, support label, field visuals | departure/draft editors | mostly UI but writes preferences | no | yes | later per-family preflight if extraction is useful | defer |
| Other remaining `src/features/form-fields/field-family-{title,description,direction,link-url,note}/*` | simple reusable field families still under transitional owner | Mantine inputs/selects/textarea, support label/metadata, shared field visuals | arrival/departure/draft editors where applicable | likely UI-only | no | no | later per-family preflight only | defer; do not batch-move |
| Empty `src/features/form-fields/field-family-occurred-at/` | empty leftover folder after date-time move | none | none | n/a | no | no | none | safe cleanup candidate only in a later housekeeping slice |

Ownership decision matrix:

| Option | Pros | Cons | Risk | Behavior impact | Verification needed | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Keep remaining `form-fields` as-is | Honest transitional owner for wrappers, layout, and not-yet-classified field families; no import churn | Folder name is now less precise because UI-only controls moved out | low | none | readback/status only for this preflight | selected |
| Move `form-section-accordion` | Could reduce remaining `form-fields` surface | It is editor section layout, not field-control support; `shared/ui` would be product-specific; editor-local copies would add churn | medium | none only if pure import move, but ownership risk is high | form-field/editor tests plus typecheck if later attempted | rejected now |
| Rename/move `form-fields` owner | Could make the transitional role clearer | Names like `form-runtime`, `form-orchestration`, or `form-seams` are broader than the current need and risk a new dumping ground | medium/high | likely import churn only, but broad | full import scans and typecheck | rejected now |
| Keep `form-preferences` separate | Preserves second-data semantics and avoids mixing localStorage preferences with durable settings | Leaves direct feature seam imports from form mappers/fields | low | none | existing focused form tests if touched later | selected |
| Split directory wrapper further | Could narrow wrapper internals later | No current behavior need; existing split already isolates UI-only control | medium | potential behavior risk in search/preference handling | directory helper/UI tests plus typecheck | defer |
| Proceed to query-helper placement preflight | Moves the architecture work to the next unresolved structural concern after Phase 5 | Requires a new preflight before any helper move | low | none in preflight | readback/status for planning; query tests/typecheck in later implementation | selected next |

Selected decision:

- Phase 5 form-control extraction is complete enough to stop form-control moves.
- `src/features/form-fields` remains valid as a transitional owner for non-extracted form seams: query/preference-aware wrappers, editor section layout, and individually deferred field families.
- `form-section-accordion` stays under `features/form-fields/form-section-accordion`.
- `field-family-directory` stays under `features/form-fields/field-family-directory` as the query/preference-aware wrapper around `features/form-controls/directory`.
- `form-preferences` stays a separate second-data feature seam and must not be promoted to durable settings by refactor alone.
- Do not execute the older generic query-helper move directly; run a dedicated placement preflight first.

Rejected/deferred alternatives:

- Moving `form-section-accordion` to `features/form-controls/support` is rejected because it is section layout, not field-control support.
- Moving `form-section-accordion` to `shared/ui` is rejected because it carries SKLAD form section/help semantics.
- Duplicating `form-section-accordion` into each editor is rejected because current reuse is clear and behavior-equivalent duplication would add churn without clarifying ownership.
- Moving `field-family-directory/index.tsx` or `use-directory-options.ts` into `features/form-controls/directory` is rejected because query-backed loading and preference writes are forbidden in form-controls.
- Renaming `features/form-fields` to `form-runtime`, `form-orchestration`, or `form-seams` is deferred because the current owner is acceptable transitional state and a rename would be broad import churn.
- Moving `form-preferences` into durable settings is rejected without a product decision; it remains second-data preference state excluded from first-data backup semantics.
- Batch-moving remaining simple field families is deferred; each family needs a narrow preflight and must not turn `form-controls` into a dumping ground.

Next task:

- Task ID: `AR-0508 - Generic query-helper placement preflight`.
- Goal: inspect `src/domain/common/query-helpers`, query consumers, and current architecture docs before any helper move.
- Scope:
  - decide whether the existing `domain/common/query-helpers` placement remains valid or should move;
  - classify helpers as storage-agnostic, query-contract, infrastructure-query, or shared utility;
  - update the architecture plan with an implementation-ready decision.
- Non-goals:
  - no query helper move;
  - no query behavior changes;
  - no first-data service/repository/query changes;
  - no form-control or form-field changes.
- Note: `AR-0701` is already used later in this plan for scanner modal simplification, so this preflight uses `AR-0508` to avoid an ID collision.

Validation plan:

- Readback check for the `AR-0507` section.
- Search the plan for `AR-0508 - Generic query-helper placement preflight`.
- Run `git status --short` and confirm this slice changed only `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md`.
- Do not run tests/typecheck for this docs-only preflight unless source files change unexpectedly.

Stop conditions for future implementation:

- Stop before moving/renaming if the current owner is acceptable transitional state.
- Stop if a move would require behavior changes, broad editor rewrites, or test rewrites beyond import updates.
- Stop if a move would put query-backed loading, preference writes, submit mapping, scanner/buffer state, or first-data orchestration into `features/form-controls`.
- Stop if a move would mix `form-preferences` second-data semantics with durable IndexedDB settings.
- Stop if a proposed `shared/ui` target would contain product/form-specific concepts.
- Stop if the next target would become a broad dumping ground or require a root barrel.

#### AR-0508 - Generic query-helper placement preflight

Status: preflight complete on 2026-04-27.

Decision: approve `src/shared/utils/query/` as the final target for the current generic query-helper family, but do not move helpers yet. Add focused characterization tests first. The inspected helpers are storage-agnostic and mostly domain-agnostic; they are used by domain query DTOs only for the generic `SortDirection` type and by infrastructure query implementations for in-memory sorting, filtering, pagination, and search matching. The only domain coupling is `matches-date-range.ts` importing the `DateRange` type from `domain/common/value-objects.ts`; the helper behavior is generic, but a future move must remove that domain import by using a target-local structural range type or inline structural parameter shape.

Preflight summary:

- `src/domain/common/query-helpers` exists and contains one cohesive generic helper family: sort direction, pagination, normalized search, text matching, nullable comparators, ISO date comparison, and date-range matching.
- `src/shared/utils/query` does not currently exist.
- `src/domain/queries/*` imports only `SortDirection` from `domain/common/query-helpers`; no domain query DTO imports helper implementations.
- `src/infrastructure/queries/*` imports helper implementations from `domain/common/query-helpers` for query execution.
- No helper imports Dexie, repositories, services, features, UI, scanner, buffer, or SKLAD entity contracts.
- No direct unit test currently targets the helper family. `tests/unit/infrastructure/queries/stock/stock.queries.test.ts` indirectly exercises stock query behavior only.
- `PROJECT_STRUCTURE.md` currently accepts `domain/common/query-helpers` as a temporary shared utility layer, while `architecture_structure.md` describes `shared/utils/query` as the canonical generic helper home. The implementation should reconcile this by moving the generic family after tests are added.

Query helper inventory:

| File | Current role | Exports | Imports | Consumers | Storage-agnostic? | Domain-agnostic? | Candidate target | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/domain/common/query-helpers/sort-direction.ts` | generic sort direction primitive and direction applicator | `SortDirection`, `applySortDirection` | none | domain query DTOs; helper comparators | yes | yes | `src/shared/utils/query/sort-direction.ts` | move after tests |
| `src/domain/common/query-helpers/compare-iso-date.ts` | generic string ISO date comparator | `compareIsoDate` | local `sort-direction` | infrastructure journal, directory, code, stock queries | yes | yes | `src/shared/utils/query/compare-iso-date.ts` | move after tests |
| `src/domain/common/query-helpers/compare-nullable-number.ts` | generic nullable number comparator | `compareNullableNumber` | local `sort-direction` | arrival/departure/stock infrastructure queries | yes | yes | `src/shared/utils/query/compare-nullable-number.ts` | move after tests |
| `src/domain/common/query-helpers/compare-nullable-string.ts` | generic nullable string comparator | `compareNullableString` | local `sort-direction` | journal, directory, code, stock infrastructure queries | yes | yes | `src/shared/utils/query/compare-nullable-string.ts` | move after tests |
| `src/domain/common/query-helpers/contains-normalized-text.ts` | generic normalized text inclusion helper over nullable strings | `containsNormalizedText` | `isDefined` from `shared/utils/type-guards.ts` | journal, directory, code, stock infrastructure queries | yes | yes | `src/shared/utils/query/contains-normalized-text.ts` | move after tests |
| `src/domain/common/query-helpers/matches-date-range.ts` | generic inclusive date-range matcher | `matchesDateRange` | `DateRange` type from `domain/common/value-objects.ts` | arrival/departure/draft infrastructure queries | yes | mostly; type import is domain-coupled | `src/shared/utils/query/matches-date-range.ts` after type decoupling | move only with structural type decoupling |
| `src/domain/common/query-helpers/normalize-search.ts` | generic search string trim/lowercase helper | `normalizeSearch` | none | journal, directory, code, stock infrastructure queries | yes | yes | `src/shared/utils/query/normalize-search.ts` | move after tests |
| `src/domain/common/query-helpers/paginate.ts` | generic array pagination helper | `paginate` | none | journal, directory, code, stock infrastructure queries | yes | yes | `src/shared/utils/query/paginate.ts` | move after tests |
| `src/domain/common/query-helpers/index.ts` | explicit helper family public file | explicit named exports | local helper files | domain query DTOs; infrastructure query implementations | yes | follows exported files | `src/shared/utils/query/index.ts` | recreate with explicit named exports only; no `export *` |
| `src/shared/utils/query` | target folder | n/a | n/a | none; folder missing | n/a | n/a | create later | create only during move slice |

Consumer map:

| Consuming file | Consumed helper | Consumer layer | Consumer owner | Import direction status | Reason |
| --- | --- | --- | --- | --- | --- |
| `src/domain/queries/arrival/arrival-list.query.ts` | `SortDirection` type | domain | arrival query DTO | should move helper to shared | DTO needs a generic sort direction contract, not domain-specific helper implementation |
| `src/domain/queries/departure/departure-list.query.ts` | `SortDirection` type | domain | departure query DTO | should move helper to shared | same generic query DTO type need |
| `src/domain/queries/draft/draft-list.query.ts` | `SortDirection` type | domain | draft query DTO | should move helper to shared | same generic query DTO type need |
| `src/domain/queries/directory/{supplier,product,category}-list.query.ts` | `SortDirection` type | domain | directory query DTOs | should move helper to shared | same generic query DTO type need |
| `src/domain/queries/record-code/record-code-list.query.ts` | `SortDirection` type | domain | record-code query DTO | should move helper to shared | same generic query DTO type need |
| `src/domain/queries/stock/stock-list.query.ts` | `SortDirection` type | domain | stock query DTO | should move helper to shared | same generic query DTO type need |
| `src/infrastructure/queries/journals/arrival.queries.ts` | `compareIsoDate`, `compareNullableNumber`, `compareNullableString`, `containsNormalizedText`, `matchesDateRange`, `normalizeSearch`, `paginate` | infrastructure | arrival read implementation | should move helper to shared | infrastructure reads should consume generic helpers from shared, not domain/common |
| `src/infrastructure/queries/journals/departure.queries.ts` | same as arrival | infrastructure | departure read implementation | should move helper to shared | same generic sort/filter/pagination use |
| `src/infrastructure/queries/journals/draft.queries.ts` | `compareIsoDate`, `compareNullableString`, `containsNormalizedText`, `matchesDateRange`, `normalizeSearch`, `paginate` | infrastructure | draft read implementation | should move helper to shared | same generic sort/filter/pagination use |
| `src/infrastructure/queries/directories/{supplier,product,category}.queries.ts` | `compareIsoDate`, `compareNullableString`, `containsNormalizedText`, `normalizeSearch`, `paginate` | infrastructure | directory read implementations | should move helper to shared | helpers are not directory semantics |
| `src/infrastructure/queries/codes/record-code.queries.ts` | `compareIsoDate`, `compareNullableString`, `containsNormalizedText`, `normalizeSearch`, `paginate` | infrastructure | record-code read implementation | should move helper to shared | helpers are not record-code semantics |
| `src/infrastructure/queries/stock/stock.queries.ts` | `compareIsoDate`, `compareNullableNumber`, `compareNullableString`, `containsNormalizedText`, `normalizeSearch`, `paginate` | infrastructure | stock read implementation | should move helper to shared | generic helpers support the stock projection but do not encode stock semantics |
| `tests/unit/infrastructure/queries/stock/stock.queries.test.ts` | indirect helper behavior through `StockQueries` | tests | stock query behavior | acceptable | indirect coverage only; does not replace focused helper tests |

Decision matrix:

| Option | Pros | Cons | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| A - keep all helpers in `domain/common` | no import churn; accepted by one current doc as temporary | keeps generic implementation under domain and leaves docs split | low short-term, medium architecture drift | reject as final state; acceptable only until test-first move |
| B - move all helpers to `shared/utils/query` | aligns with canonical shared utility target; removes infrastructure imports from `domain/common` | requires import updates across domain DTOs and infrastructure query implementations; `matchesDateRange` needs type decoupling | medium | approve after focused tests |
| C - partial move | avoids touching `matchesDateRange` type coupling immediately | splits a cohesive helper family and leaves two query-helper owners | medium | reject unless type decoupling proves unsafe |
| D - split and rename helper families | could create granular files under shared | current family is already small and explicit; extra folders would be over-architecture | low/medium churn | reject |
| E - defer | avoids moving without tests | leaves known architecture mismatch unresolved | low | selected immediate action: defer move until tests exist |

Selected decision:

- The helper family should move to `src/shared/utils/query` eventually because the helpers are generic, storage-agnostic, and not SKLAD entity semantics.
- Do not move in `AR-0508`; add direct helper characterization tests first.
- Move the whole helper family together after tests pass; do not partially move unless `matchesDateRange` type decoupling reveals a real blocker.
- The future move must keep explicit named exports only and must not use `export *`.
- The future move must remove the domain import from `matches-date-range.ts` by using a structural range type local to the shared helper layer.

Rejected/deferred alternatives:

- Keeping helpers permanently in `domain/common` is rejected because the canonical target for generic query helpers is `shared/utils/query`, and infrastructure query implementations should not depend on domain for generic sorting/search/pagination functions.
- Moving only the comparators/pagination/search helpers while leaving `matchesDateRange` behind is deferred; it would create two helper owners for one cohesive family.
- Moving `DateRange` itself to `shared` is rejected in this slice because it is currently a domain common value object used by query DTOs.
- Creating a broad shared query barrel with `export *` is rejected; keep explicit named exports if an index file is created.
- Moving any query implementation logic, Dexie behavior, repositories, services, or query DTOs is out of scope.

Next task:

- Task ID: `AR-0508A - Add focused generic query-helper characterization tests`.
- Goal: add direct tests for the current helper behavior before moving the helper family.
- Likely test path:
  - `tests/unit/domain/common/query-helpers.test.ts` or another narrow path matching current test conventions.
- Behaviors to cover:
  - `applySortDirection` for ascending/descending;
  - nullable string/number comparison, including null ordering;
  - ISO date comparison;
  - `normalizeSearch` trim/lowercase behavior;
  - `containsNormalizedText` empty-search and null/undefined handling;
  - `matchesDateRange` inclusive from/to behavior;
  - `paginate` negative offset, null limit, zero/negative limit, and normal page windows.
- Non-goals:
  - no helper move;
  - no import rewrites;
  - no query behavior changes;
  - no domain/infrastructure placement changes.

#### AR-0508A - Add focused generic query-helper characterization tests

Status: done on 2026-04-27.

Summary:

- Added direct characterization coverage for the current generic query-helper family while it still lives under `src/domain/common/query-helpers`.
- No helper files were moved or renamed.
- No production imports were rewritten.
- No helper behavior was intentionally changed.

Coverage added:

- `applySortDirection` ascending/descending semantics.
- Nullable string comparison, including `null` as empty string.
- Nullable number comparison, including `null` as negative infinity.
- ISO date lexical comparison with sort direction.
- `normalizeSearch` trim/lowercase behavior while preserving inner spacing.
- `containsNormalizedText` empty-search matching and null/undefined value filtering.
- `paginate` normal windowing, negative offset clamping, `null` limit, and non-positive limit behavior.
- `matchesDateRange` inclusive closed ranges and open-ended `from`/`to` boundaries.

DateRange coupling note:

- The test uses the current public `DateRange` type only to characterize current `matchesDateRange` behavior.
- Future `AR-0508B` must still decouple `matchesDateRange` from the domain `DateRange` import before moving the helper to `src/shared/utils/query`.
- Do not move `DateRange` to `shared` as part of the helper move.

Validation evidence:

- `npm run test:unit -- tests/unit/domain/common/query-helpers.test.ts` passed.
- `npm run test:unit -- tests/unit/infrastructure/queries` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0508B - Move generic query helper family to shared/utils/query`.

Future implementation task after tests:

- Task ID: `AR-0508B - Move generic query helper family to shared/utils/query`.
- Allowed only after `AR-0508A` passes.
- Scope:
  - create `src/shared/utils/query/`;
  - move the current helper family as one cohesive unit;
  - update imports in domain query DTOs and infrastructure query implementations;
  - decouple `matches-date-range.ts` from `DateRange` domain import with a structural type;
  - update docs that currently describe the temporary `domain/common/query-helpers` placement.

#### AR-0508B - Move generic query helper family to shared/utils/query

Status: done on 2026-04-27.

Summary:

- Moved the full generic query-helper family from `src/domain/common/query-helpers/` to `src/shared/utils/query/`.
- Updated domain query DTOs and infrastructure query implementations to import helpers from `@/shared/utils/query`.
- Updated the focused characterization test to import the moved helper family from `src/shared/utils/query/index.ts`.
- Removed the old `src/domain/common/query-helpers/` folder after the move.
- Kept the helper index explicit; no `export *` barrel was introduced.

DateRange decoupling:

- `matches-date-range.ts` no longer imports `DateRange` from `domain/common/value-objects.ts`.
- It now uses a local structural `DateRangeLike` shape with the same `{ from: string | null; to: string | null }` fields.
- `DateRange` remains in `domain/common/value-objects.ts`.

Validation evidence:

- Old import/path scan for `domain/common/query-helpers`, `@/domain/common/query-helpers`, and `../domain/common/query-helpers` in `src` and `tests` was clean.
- `src/shared/utils/query/matches-date-range.ts` has no domain import; `DateRangeLike` local type naming is intentional.
- `src/shared/utils/query/index.ts` uses explicit named exports and no `export *`.
- `npm run test:unit -- tests/unit/domain/common/query-helpers.test.ts` passed.
- `npm run test:unit -- tests/unit/infrastructure/queries` passed.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0509 - Query-helper placement checkpoint`.

#### AR-0510 - Query-helper docs truth sync

Status: done on 2026-04-27.

Summary:

- Synced active status and architecture docs to the confirmed query-helper placement truth after `AR-0508B` and the `AR-0509` checkpoint.
- Current generic storage/domain-agnostic query helpers live in `src/shared/utils/query/`.
- `src/domain/common/query-helpers/` is absent and no longer an active helper owner.
- `domain/queries/*` remains the DTO contract owner only.
- `infrastructure/queries/*` consumes helper code from `@/shared/utils/query`.
- `matchesDateRange` uses a local structural range shape and does not import domain `DateRange`; `DateRange` remains in `domain/common` for product/domain contracts.
- No source files, test files, imports, helper behavior, or query behavior were changed in this docs-only slice.

Docs updated:

- `docs/status/CURRENT_STATE_AND_GAPS.md`
- `docs/architecture/PROJECT_STRUCTURE.md`
- `docs/architecture/architecture_structure.md`
- `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md`

Validation evidence:

- Source inspection confirmed `src/shared/utils/query/` exists and `src/domain/common/query-helpers/` is absent.
- Source inspection confirmed domain query DTOs and infrastructure query implementations import from `@/shared/utils/query`.
- Source inspection confirmed `src/shared/utils/query/matches-date-range.ts` has no domain import and uses local `DateRangeLike`.
- Docs search for `domain/common/query-helpers` and `src/domain/common/query-helpers` now leaves only historical refactor-plan references in `AR-0508*` and completed task evidence.
- Docs search for `shared/utils/query` and `src/shared/utils/query` confirms the current placement appears in active architecture/status docs.

Next task:

- Task ID: `AR-0601 - Review scanner runtime variation points`.

Validation plan:

- For `AR-0508A`: run the new focused helper test directly, then any existing query tests that are touched by import/test setup, and `npm run typecheck`.
- For `AR-0508B`: scan for old `@/domain/common/query-helpers` imports; scan `src/shared/utils/query` for domain, infrastructure, Dexie, repository, service, feature, UI, scanner, and buffer imports; scan for `export *`; run helper tests, infrastructure query tests, and `npm run typecheck`.
- For this preflight: readback check for `AR-0508`, search for `AR-0508A`, and run `git status --short`.

Stop conditions:

- A helper is found to import domain entity contracts or encode arrival/departure/draft/record-code/directory semantics.
- A helper imports Dexie, repositories, services, features, UI, scanner, or buffer code.
- Direct helper tests cannot be added without changing helper behavior.
- Moving helpers would require broad unrelated query rewrites beyond import path updates and the `matchesDateRange` type decoupling.
- `shared/utils/query` would need a broad dumping-ground API or `export *` barrel.

- [x] `AR-0502` Move generic query helpers.
  - Status: completed through `AR-0508A`, `AR-0508B`, `AR-0509`, and `AR-0510`.
  - Files touched in the implementation slice: old `domain/common/query-helpers`, new `shared/utils/query`, query imports, and focused tests.
  - Goal: move storage/domain-agnostic helpers out of domain.
  - Non-goals: no query behavior changes.
  - Acceptance criteria: helper tests pass; domain/queries remains DTO-only.
  - Validation: query unit tests; typecheck.
  - Docs impact: architecture/status docs updated in `AR-0510`.
  - Risk level: medium.
  - Stop conditions: helper depends on domain records.

### Stage 6 - Polymorphic seams

- [x] `AR-0601` Review scanner runtime variation points.
  - Files likely touched: scanner runtime only if split is justified.
  - Goal: introduce strategy/facade/adapter only where variation is real.
  - Non-goals: no ZXing adapter changes.
  - Acceptance criteria: public facade stable; no proxy-only wrappers.
  - Validation: scanner runtime tests; scanner modal smoke.
  - Docs impact: second-data seam docs if new seam added.
  - Risk level: high.
  - Stop conditions: no clear variation point.
  - Status: review complete on 2026-04-27. No source edits in this slice. Do not add a new scanner strategy/facade layer now; the current live/photo variation is already represented by browser adapter contracts plus the scanner runtime controller dependency bundle. Next safe task is verification/test hardening before any local simplification.

#### AR-0601 - Review scanner runtime variation points

Status: done on 2026-04-27.

Review summary:

- Scanner remains shared capture tooling and writes only to the transient buffer through `bufferStore.addItem`.
- Browser/media/ZXing details stay in `src/infrastructure/browser/scanner/{adapters,contracts,zxing}`.
- Feature-owned runtime orchestration stays in `src/features/scanner/runtime`.
- Modal/UI orchestration stays in `src/features/scanner/modal`.
- `src/features/scanner/runtime/scanner-runtime.public.ts` is sufficient for external production consumers; it exposes only `openScannerSession`, `scannerRuntimeController`, and public controller result/instance types.
- Do not add a live/photo strategy seam now. Live and photo already have separate adapter contracts with different lifecycle, capability, and failure shapes.
- The safest next work is a verification/test slice before changing behavior-sensitive scanner orchestration.

Runtime ownership map:

| File / area | Current role | Imports | Exports | Consumers | Ownership status | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `features/scanner/runtime/scanner-runtime.public.ts` | narrow public runtime seam | runtime facade only | `openScannerSession`, `scannerRuntimeController`, public types | navigation shell, dashboard favorites, departure editor, scanner modal hooks | acceptable real public boundary | low; keep explicit exports only |
| `features/scanner/runtime/model/scanner-runtime.facade.ts` | feature facade binding preferred tab and browser controller instance | browser runtime instance, scanner preferences | controller instance and open helper | public seam | acceptable internal facade; not a broad barrel | medium; feature imports infrastructure composition instance by design |
| `features/scanner/runtime/model/scanner-runtime-controller.ts` | scanner orchestration over session, overlay, buffer, live/photo adapters | buffer public seam, infrastructure adapter contracts, session helpers | `createScannerRuntimeController` | browser runtime composition, controller tests | correct feature runtime owner | high; live start/stop and buffer submit state are behavior-sensitive |
| `features/scanner/runtime/model/scanner-runtime.types.ts` | runtime result/controller contracts | buffer public types, infrastructure adapter result types, session types | result unions and controller contract | controller, modal hooks, tests | acceptable contract owner | medium; imports adapter types directly |
| `features/scanner/runtime/model/scanner-session.store.ts` and `create-scanner-session-store.ts` | session lifecycle state store | Zustand only | singleton store and factory | modal, browser runtime composition, tests | correct second-data store owner | medium; modal depends on same-owner internals |
| `features/scanner/runtime/model/scanner-preferences.store.ts` | localStorage-backed scanner preference state | Zustand persist | preferred tab/camera store | modal and facade | correct second-data preference owner | low; remains transient second data |
| `features/scanner/runtime/model/scanner-runtime.error-mapping.ts` | adapter-result to session-status mapping | runtime/session contracts | mapping helpers | controller | correct local helper | medium; mapping changes affect visible errors |
| `features/scanner/runtime/model/scanner-runtime-session-state.ts` | local control-owner/source/error helpers | buffer public types, runtime dependencies | local helpers | controller | correct local helper | medium; buffer-control ownership sensitive |
| `features/scanner/modal/index.tsx` | fullscreen scanner modal composition | scanner stores/preferences, public controller, buffer store, overlay store, modal hooks/sections | `ScannerModal` | app overlay host | acceptable same-feature orchestration owner | high; large component and UI lifecycle coordination |
| `features/scanner/modal/hooks/use-scanner-live-orchestration.ts` | live auto-start, refresh, pause/resume, tab/close stop handling | public controller | hook return callbacks | scanner modal | correct modal-local orchestration | high; needs runtime proof before refactor |
| `features/scanner/modal/hooks/use-scanner-photo-decode.ts` | crop/abort/photo decode trigger | public controller, media transform helper | photo decode callback | scanner modal | correct modal-local orchestration | high; fixture-backed photo decode coverage exists, but hook split remains behavior-sensitive |
| `infrastructure/browser/scanner/adapters/live.ts` | browser live camera adapter | ZXing/browser APIs, media APIs, scanner contracts | live adapter factory/types | browser runtime composition, tests via types | correct infrastructure adapter | high; real camera path remains runtime-sensitive |
| `infrastructure/browser/scanner/adapters/photo.ts` | browser photo/file decode adapter | ZXing/browser APIs, object URL/image APIs, scanner contracts | photo adapter factory/types | browser runtime composition, e2e photo path | correct infrastructure adapter | medium/high; fixture-backed photo decode is covered |
| `infrastructure/browser/scanner/runtime/controller.ts` | browser composition root binding feature controller to adapters | feature runtime factory, buffer public seam, scanner session store, overlay store | browser runtime factory | runtime instance | acceptable composition bridge, but direction is mixed | medium; do not move browser adapter code into features |
| `infrastructure/browser/scanner/runtime/controller.instance.ts` | singleton browser scanner runtime controller | buffer public seam, scanner session store, overlay store | singleton instance | scanner runtime facade | acceptable app/browser composition instance | medium; keep imports narrow |
| `tests/unit/features/scanner/**` | scanner session/runtime/presentation characterization | feature internals, buffer internals, adapter types | tests only | validation | acceptable direct internal imports | low; tests intentionally target internals |
| `tests/unit/infrastructure/browser/scanner/**` | adapter contract/ZXing helper characterization | infrastructure scanner contracts/helpers | tests only | validation | acceptable direct internal imports | low |

Variation point map:

| Variation point | Current implementation | Real variants | Current complexity | Candidate pattern | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Live camera scan | `LiveScannerAdapter.startSession()` plus controller `startLiveScan()` | device id, constraints, permission/capability states, ZXing results | high but inherent browser lifecycle | adapter already present | keep; no extra strategy |
| Photo/file decode | `PhotoScannerAdapter.decodeFile()` plus modal crop/abort hook | file type, size, crop transform, abort, decode result | medium/high | adapter already present | keep; no extra strategy |
| Live vs photo mode | session `activeTab`, modal tabs, separate adapters | two real modes | split across controller and modal hooks | no abstraction | keep explicit branches; add tests before local simplification |
| Scanner session open/close | controller opens overlay, acquires buffer control for form entrypoints, closes session | global vs form entrypoint | medium | controller | keep; existing controller is correct seam |
| Permission/error state mapping | `scanner-runtime.error-mapping.ts`, modal presentation helpers | permission denied/unavailable, decode failed, file too large, session error | medium | local mapping helper | keep local; no public facade |
| Duplicate buffer capture | buffer add result mapped to warning and status message | added, eviction, duplicate, empty | medium | no abstraction | keep controller branch; tests already cover duplicate |
| Overlay/modal lifecycle | overlay arbitration + modal close/tab effects | scanner modal vs other overlays | high | controller plus modal-local hooks | keep; local simplification only after runtime proof |
| Preferences/session state | scanner session store + preferences store | preferred tab, selected camera, active session | low/medium | stores already present | keep; no new store |
| Browser scanner adapter composition | infrastructure browser runtime controller creates live/photo adapters and binds feature runtime | browser composition only | medium due feature/infrastructure cross import | composition root | keep as accepted bridge; avoid adding proxy layer |
| Buffer write seam | controller calls `bufferStore.addItem()` through buffer public seam | added, eviction, duplicate, empty | medium | existing buffer public seam | keep; no durable write |

Public boundary review:

- Scanner public boundary is narrow enough for production consumers. External production consumers use `scanner-runtime.public.ts` for `openScannerSession` or controller type/instance.
- Scanner modal still imports same-owner internals (`scannerSessionStore`, `scannerPreferencesStore`, session types) directly. This is acceptable because modal and runtime share the scanner feature owner and the modal needs reactive state.
- Infrastructure browser scanner runtime imports feature runtime internals for browser composition. This is a deliberate composition bridge, not a public API pattern to expand. Do not move adapters into features or runtime controller into infrastructure.
- `buffer-core.public.ts` is sufficient for scanner runtime and browser composition. No deep production buffer-core model imports were found in the inspected scanner/browser path.
- Tests may keep direct internal imports for factories/controllers/adapters because they intentionally characterize internals.

Complexity hotspots:

| Hotspot | Why complex | Inherent? | Reduction option | Verification needed |
| --- | --- | --- | --- | --- |
| `scanner-runtime-controller.ts::startLiveScan` | permission capability, live start, async decode callback, immediate stop after decode, status mutation | mostly inherent | local helper extraction only, no new strategy | unit tests plus live-camera runtime check before behavior refactor |
| `scanner-runtime-controller.ts::decodePhotoFile` | file selection status, decode state, adapter result mapping, buffer submission | partly inherent | small local mapping helper if tests cover branches | unit tests plus fixture-backed photo decode smoke |
| `scanner-runtime-controller.ts::submitDecodedValue` | maps buffer result union into scanner state | inherent boundary mapping | keep as one explicit branch | unit tests only |
| `scanner-runtime.error-mapping.ts::applyScannerFailureResult` | maps infrastructure codes into UI/session states | local mapping complexity | keep local; extract tests before edits if changed | unit tests only |
| `scanner/modal/index.tsx` | many state subscriptions, tab debouncing, overlay visibility, inline status, panel composition | accidental file size plus inherent modal orchestration | local decomposition only; do not change runtime contracts | Playwright modal smoke and scanner unit tests |
| `use-scanner-live-orchestration.ts` | auto-start, tab switch stop, close stop, throttled toggle, refresh | behavior-sensitive UI/runtime lifecycle | add characterization/Playwright proof before extraction | Playwright modal smoke; real camera for live confidence |
| `use-scanner-photo-decode.ts` | crop transform, abort, size check, tab sync, decode call | behavior-sensitive but local | keep; possible local test seam later | fixture-backed photo decode and typecheck |
| `infrastructure/browser/scanner/adapters/live.ts` | browser capability, media APIs, ZXing session control | inherent browser adapter complexity | leave as adapter; no feature extraction | real camera verification if touched |
| `infrastructure/browser/scanner/adapters/photo.ts` | image loading/object URL/abort/ZXing decode | inherent browser adapter complexity | leave as adapter | fixture-backed photo decode if touched |

Decision matrix:

| Option | Pros | Cons | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| A - leave scanner runtime as-is | preserves tested seams; no behavior risk | leaves large controller/modal surfaces | low short-term | selected for public/runtime structure |
| B - local simplification only | can reduce file cognitive load without new API | still behavior-sensitive; needs tests first | medium | approve only after test/runtime proof |
| C - live/photo strategy seam | sounds tidy but duplicates existing adapter split | adds wrapper/proxy risk | high abstraction drift | reject for now |
| D - scanner error mapping extraction | mapping already local; could add tests if changed | not a major complexity source | low | defer until error behavior changes |
| E - browser adapter boundary cleanup | could reduce mixed feature/infrastructure imports | may create composition-root churn without behavior gain | medium/high | defer; current bridge acceptable |
| F - runtime verification before refactor | improves safety before touching browser lifecycle | requires browser/device availability | low | selected before live-path changes |

Selected recommendation:

- Keep the current scanner runtime public boundary and browser adapter boundaries.
- Do not introduce a new strategy, adapter, or facade in `AR-0601`.
- Treat live/photo as real variation already owned by `LiveScannerAdapter` and `PhotoScannerAdapter`.
- Permit only future local simplification inside controller/modal/hook files, and only after focused characterization or runtime proof for the affected path.

Rejected/deferred alternatives:

- Reject a new `scanner runtime strategy` layer now because it would proxy the existing live/photo adapter split.
- Reject moving browser scanner adapters into `features/scanner`; browser/media/ZXing concerns belong in infrastructure.
- Reject moving feature scanner runtime into infrastructure; session, overlay, buffer submission, and modal orchestration are feature second-data concerns.
- Defer publicizing scanner session stores/preferences; they are same-owner modal/runtime internals, not app-level public API.
- Defer browser composition cleanup unless import direction becomes a concrete blocker.

Next task:

- Task ID: `AR-0601A - Scanner live-camera runtime verification checkpoint`.
- Goal: verify current live camera open/start/stop/tab-switch/close behavior before changing live orchestration code.
- Scope: verification/report-only; no source edits.
- Minimum evidence if a camera is available: open scanner from shell, observe live capability, auto-start or permission prompt path, pause/resume via preview, switch to photo and verify live stop, close modal and verify session/overlay cleanup.
- Fallback if real camera is unavailable: document unavailable device constraints and run Playwright modal smoke plus existing scanner unit tests before any source refactor.

Validation plan for future implementation:

- Controller-only changes: `npm run test:unit -- tests/unit/features/scanner`, `npm run test:unit -- tests/unit/features/buffer`, `npm run typecheck`.
- Modal-local UI/hook changes: scanner unit tests, `tests/e2e/smoke/scanner-modal.spec.ts`, and focused mobile-shaped Playwright smoke.
- Photo decode changes: fixture-backed photo decode e2e plus infrastructure scanner unit tests.
- Live camera changes: real camera verification or explicit blocker report; do not claim robustness from unit tests only.
- Import-boundary-only changes: static import scans plus typecheck.

Stop conditions:

- Any change would affect live camera start/stop, photo/file decode, buffer duplicate behavior, modal open/close, or overlay arbitration without focused tests.
- A refactor would move browser adapter code into features or feature runtime into infrastructure.
- A new public boundary would expose session stores/preferences broadly.
- Runtime behavior cannot be verified and the affected path is browser-sensitive.

#### AR-0601A - Scanner live-camera runtime verification checkpoint

Status: partial on 2026-04-27.

Verification summary:

- No source files were refactored in this slice.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run typecheck` passed.
- Static old-path scan for `features/scanner-runtime`, `features/buffer-core`, and `features/buffer-picker` returned no stale import-path hits.
- Vite dev server started with `npm run dev -- --port 5173 --strictPort` and served the app at `http://127.0.0.1:5173/`.
- Playwright mobile viewport `390x844` verified app load, shell utilities, scanner modal open, live tab render, photo tab render, live-to-photo switch, photo-to-live switch, modal close, and scanner modal reopen.
- Browser runtime smoke observed no page errors and no unresolved import/module/overlay arbitration errors.
- Buffer count stayed `0 -> 0` during the fallback smoke, so no accidental buffer write was observed.

Environment/camera evidence:

- Chromium reported `navigator.mediaDevices` and `getUserMedia` as present.
- `enumerateDevices()` returned audio/video device kinds with empty device ids/labels in this environment.
- The scanner live panel reached status labels `Запрос доступа` / `Ошибка`.
- The live preview video had no `srcObject`, no tracks, `readyState: 0`, and remained paused before and after tab switching.
- Therefore the live camera path was not verified as a real started camera session in this environment.

Browser runtime observations:

| Check | Result | Evidence |
| --- | --- | --- |
| App starts | pass | mobile shell header rendered |
| Scanner action reachable | pass | shell scanner action opened the modal |
| Scanner modal opens | pass | `role=dialog` scanner modal visible |
| Live tab/panel renders | pass | live panel visible and selected initially |
| Live camera start path attempted | partial | auto-start path reached error state, but no real stream attached |
| Permission/unavailable/error visible | partial | status pills showed request/error state; no inline error text was rendered in this run |
| Photo tab reachable | pass | photo panel and file input rendered |
| Live -> photo tab switch | pass | modal remained usable; no active stream was left attached |
| Photo -> live tab switch | pass | live panel rendered again |
| Close releases modal | pass | dialog closed without page errors |
| Reopen after close | pass | scanner modal reopened and rendered live panel |
| Buffer write regression | pass for fallback | buffer localStorage count stayed unchanged |

Console/runtime notes:

- Page errors: none.
- Console warnings: ZXing emitted `RSS Expanded reader IS NOT ready for production yet! use at your own risk.` three times during adapter initialization. This was not an app import/module error.

Selected decision:

- Treat AR-0601A as fallback runtime proof complete but live-camera proof incomplete.
- Do not simplify live scanner lifecycle code yet on the basis of this environment alone.
- A future scanner runtime refactor that touches live start/stop, tab switching, or close cleanup must first get real-device/camera evidence or remain blocked to non-live local simplification.

Next task:

- Task ID: `AR-0601B - Real-device scanner live-camera verification`.
- Goal: run the same scanner modal lifecycle on an environment with actual camera access and record whether a real `MediaStream` starts, stops on photo-tab switch, stops on modal close, and recovers after reopen.
- Scope: verification/report-only unless a blocking runtime import/path bug prevents app load.

Stop conditions:

- Do not claim live-camera readiness from headless Chromium or unavailable-camera fallback evidence.
- Stop before refactoring if the environment cannot produce a real live stream and the proposed change affects live start/stop.
- Stop if tab switching or close/reopen creates page errors, overlay conflicts, or persistent active media tracks.

#### AR-0601B - Real-device scanner live-camera verification

Status: done on 2026-04-27.

Verification summary:

- No scanner, modal, buffer, browser adapter, or other source behavior files were changed in this slice.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run typecheck` passed.
- Vite dev server started with `npm run dev -- --port 5173 --strictPort` and served the app at `http://127.0.0.1:5173/`.
- Playwright mobile viewport `390x844` launched headed Chromium with camera permission granted for `http://127.0.0.1:5173`.
- The scanner modal opened from the shell scanner action, rendered the live panel, switched live -> photo, switched photo -> live, closed, and reopened without page errors.

Real MediaStream evidence:

| Check | Evidence |
| --- | --- |
| Camera APIs | `navigator.mediaDevices`, `getUserMedia`, and `enumerateDevices` were present; camera permission state was `granted`. |
| Devices | `enumerateDevices()` returned video inputs including `KOTOFON (Виртуальная камера Windows)` and `Integrated Camera (04f2:b71c)`. |
| Initial live stream | `video.srcObject` was a `MediaStream`; `stream.getVideoTracks().length` was `1`; track `readyState` was `live`; video readyState was `4`; preview size was `1280x720`. |
| Device switch/restart | The camera select accepted `Integrated Camera (04f2:b71c)`. After live -> photo -> live, `video.srcObject` was a `MediaStream` backed by `Integrated Camera (04f2:b71c)` with one live video track, video readyState `4`, and preview size `640x480`. |
| Live -> photo cleanup | The remembered live video track changed from `live` to `ended`, current video `srcObject` became absent, and current video track count became `0`; modal status labels moved to `Доступ разрешён` / `Ожидание`. |
| Close cleanup | After modal close, the remembered live video track changed to `ended`, the video element was absent, current `srcObject` was absent, and current video track count was `0`. |
| Reopen | Reopening the scanner modal produced a new `MediaStream` with one live video track, backed by `Integrated Camera (04f2:b71c)`, video readyState `4`, and status labels `Доступ разрешён` / `Сканирование`. |

Console/runtime notes:

- Page errors: none.
- Console warnings: ZXing emitted `RSS Expanded reader IS NOT ready for production yet! use at your own risk.` three times during scanner adapter initialization. This is an upstream ZXing warning, not an unresolved app import/module/overlay runtime error.
- No scanner/buffer/overlay runtime errors were observed during open, live start, tab switch, close, or reopen.

Selected decision:

- Real camera-backed live scanner lifecycle evidence is now available for the current implementation.
- Live scanner start, live -> photo cleanup, photo -> live restart, close cleanup, and reopen are verified at runtime for the observed headed Chromium environment.
- Future scanner runtime simplification may proceed only as a narrow, behavior-preserving slice with the same live-camera cleanup expectations and focused scanner/buffer/typecheck validation.

Next task:

- Task ID: `AR-0701 - Split oversized scanner modal locally`.
- Goal: reduce scanner modal component/hook size with modal-local named files while preserving the verified live-camera lifecycle.
- Scope: local modal decomposition only; no scanner runtime logic, browser adapter logic, buffer behavior, or UI redesign.

### Stage 7 - Hook/component simplification

- [x] `AR-0701` Split oversized scanner modal locally.
  - Files likely touched: scanner modal components/hooks.
  - Goal: reduce oversized component/hook files with modal-local named files.
  - Non-goals: no UI redesign, no scanner behavior changes.
  - Acceptance criteria: modal behavior unchanged.
  - Validation: scanner modal tests/e2e.
  - Docs impact: update inventory.
  - Risk level: high.
  - Stop conditions: runtime behavior changes required.
  - Status: done on 2026-04-27. Local modal readability split extracted `sections/body.tsx`, `sections/inline-state.tsx`, and `sections/tabs.tsx` from `src/features/scanner/modal/index.tsx`; existing modal header/footer/live/photo sections remain local. No scanner runtime, browser adapter, buffer, overlay, photo decode, or live orchestration logic changed.
  - Evidence: `npm run test:unit -- tests/unit/features/scanner` passed, 3 files and 23 tests. `npm run typecheck` passed. Focused headed Playwright mobile viewport `390x844` real-camera regression passed: scanner modal opened, `video.srcObject` was a `MediaStream` with one live video track, live -> photo changed the remembered track to `ended` and cleared the current stream, photo -> live restarted a live `Integrated Camera (04f2:b71c)` stream, modal close ended the live track and removed the current stream, and reopening produced a functional live stream again. No page errors or scanner/buffer/overlay runtime errors were observed; ZXing emitted the known `RSS Expanded reader IS NOT ready for production yet! use at your own risk.` warning during adapter initialization.

- [x] `AR-0702` Split oversized backup workflow locally.
  - Files likely touched: backup workflow component.
  - Goal: keep workflow sections local and named.
  - Non-goals: no backup service/restore changes.
  - Acceptance criteria: export/import/restore UI unchanged.
  - Validation: backup smoke.
  - Docs impact: update inventory.
  - Risk level: high.
  - Stop conditions: durable restore behavior changes.
  - Status: done on 2026-04-27. Local backup workflow readability split extracted `backup-workflow.export-restore-section.tsx` and `backup-workflow.checkpoint-section.tsx` under `src/features/backup/ui/backup-workflow/`. `BackupWorkflow` still owns hooks, async export/import validation/restore/checkpoint handlers, state, and latest history/checkpoint projections. No backup domain, infrastructure service, browser file, JSON serialization, restore-core, durable transaction, or hook behavior changed.
  - Evidence: `npm run test:unit -- tests/unit/domain/backup` passed, 1 file and 7 tests. Suggested focused paths `tests/unit/features/backup`, `tests/unit/infrastructure/services/backup`, and `tests/unit/infrastructure/backup` are absent and reported no test files. `npm run typecheck` passed. Static scan of touched backup workflow UI files found no infrastructure, restore-core, appDb/Dexie, repository, or backup service imports.

### Stage 8 - Runtime verification

- [x] `AR-0801` Verify scanner and buffer after moves.
  - Files likely touched: none unless docs update.
  - Goal: runtime proof for scanner modal, buffer picker, overlay handoff.
  - Non-goals: no broad release certification.
  - Acceptance criteria: mobile-shaped smoke passes or blockers logged.
  - Validation: targeted Playwright scanner/buffer specs.
  - Docs impact: QA docs only if truth changes.
  - Risk level: medium.
  - Stop conditions: dev server/browser unavailable; report blocker.
  - Status: done on 2026-04-27. Static old-path import scan found no moved-path import references. `npm run test:unit -- tests/unit/features/scanner`, `npm run test:unit -- tests/unit/features/buffer`, and `npm run typecheck` passed. Playwright mobile viewport 390x844 verified app load, shell header/navigation utilities, scanner modal open/close, buffer route load, and departure buffer picker open. No relevant import/module/overlay runtime errors were observed. Live camera and photo/file decode paths were not verified in this environment.

- [x] `AR-0802` Verify mobile form flows after moves.
  - Files likely touched: none unless docs update.
  - Goal: arrivals, departures, drafts route-current smoke.
  - Non-goals: no UI redesign.
  - Acceptance criteria: create/edit basics still render and submit path is intact.
  - Validation: targeted Playwright or focused route smoke.
  - Docs impact: QA docs only if truth changes.
  - Risk level: medium.
  - Stop conditions: source behavior regression found.
  - Status: done on 2026-04-27. Static old-path import scan found no moved-path import references. `npm run test:unit -- tests/unit/features/arrivals`, `npm run test:unit -- tests/unit/features/departures`, `npm run test:unit -- tests/unit/features/buffer`, and `npm run typecheck` passed; `tests/unit/features/drafts` does not exist. Playwright mobile viewport 390x844 with a fresh browser context verified `/arrivals`, `/arrivals/create`, `/departures`, `/departures/create`, `/drafts`, `/drafts/create`, and `/buffer` route loads. Arrival, departure, and draft create forms rendered and accepted a sample title without save. Arrival and departure buffer picker entrypoints opened and closed. No relevant import/module/runtime errors were observed.

- [x] `AR-0803` Verify import/export if backup workflow is touched.
  - Files likely touched: none unless docs update.
  - Goal: backup export/import/restore smoke.
  - Non-goals: no data model changes.
  - Acceptance criteria: backup workflow still works at touched boundary.
  - Validation: targeted backup spec.
  - Docs impact: QA docs only if truth changes.
  - Risk level: high.
  - Stop conditions: restore/data-loss risk appears.
  - Status: done on 2026-04-27. Verification-only after `AR-0702`; no source refactor or backup behavior change.
  - Evidence: `npm run test:unit -- tests/unit/domain/backup` passed, 1 file and 7 tests. Suggested focused paths `tests/unit/features/backup`, `tests/unit/infrastructure/services/backup`, and `tests/unit/infrastructure/backup` are absent and reported no test files. `npm run typecheck` passed. Vite dev server started with `npm run dev -- --port 5173 --strictPort`. Custom Playwright mobile viewport `390x844` smoke reached `/#/settings/backup`, confirmed backup/export/restore/checkpoint/history/checkpoint-list surfaces rendered, confirmed restore was initially disabled, triggered safe export download with filename `sklad-backup-v1-...json`, parsed backup payload version `1`, confirmed exported JSON excluded a seeded `sklad-buffer` transient value, selected an invalid backup JSON file for validation, and confirmed restore stayed disabled. No backup-related console or page errors were observed. Destructive restore commit was not performed.

- [x] `AR-0804` Component `index.tsx` audit.
  - Files touched: `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md` only.
  - Goal: classify all `index.ts`, `index.tsx`, and `*.public.ts` entrypoints and select a narrow first rename slice.
  - Non-goals: no source edits, no moves, no renames, no import rewrites.
  - Acceptance criteria: real public boundaries are separated from decorative/component-folder entries; next task is one narrow rename slice.
  - Status: preflight complete on 2026-04-27.

#### AR-0804 - Component index.tsx audit

Status: preflight complete on 2026-04-27.

Audit summary:

- 74 current entrypoint files were found under `src`: 46 `index.tsx`, 26 `index.ts`, and 2 `*.public.ts`.
- Real public boundaries are stable enough to leave alone: router, scanner runtime public seam, buffer core public seam, infrastructure service/DB/query helper boundaries, shared gesture/haptics/query utilities, and domain contract/service boundaries.
- Most `index.tsx` files are component-folder entrypoints rather than harmful barrels. They should not be batch-renamed because many are imported as intentional folder APIs.
- The highest-value first rename is a single-consumer feature workflow component: `src/features/backup/ui/backup-workflow/index.tsx`. It is not a route convention or stable public boundary, and a named file would improve navigation without touching backup domain/infrastructure behavior.
- Keep route entries and broad shared UI entrypoints unchanged unless a later route/UI slice has a concrete reason to touch them.

Index inventory:

| File | Layer | Owner | Current role / exports | Consumers | Boundary / route / component entry | Problem | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/theme/components/index.ts` | app | theme components | Mantine `themeComponents` composition | 1 | component/theme entry | none | keep |
| `src/app/theme/index.ts` | app | theme | app theme public surface | 3 | real public boundary | none | real-public-boundary |
| `src/app/theme/tokens/index.ts` | app | theme tokens | mode config exports | 3 | real public boundary | none | real-public-boundary |
| `src/domain/backup/export/index.ts` | domain | backup export | export service contracts | 1 internal domain aggregator | domain sub-boundary | minor `export *` parent exposure risk only | keep; review `export *` separately |
| `src/domain/backup/import/index.ts` | domain | backup import | import validation service contracts | 1 internal domain aggregator | domain sub-boundary | none | keep |
| `src/domain/backup/index.ts` | domain | backup | backup contract/service surface | 19 | real public boundary | moderate because it still uses `export *` for subfamilies | keep; later explicit-export cleanup only if scoped |
| `src/domain/codes/index.ts` | domain | codes | record-code contracts/write helpers | 3 | real public boundary | none | keep |
| `src/domain/directories/index.ts` | domain | directories | directory records/normalizer | 2 | real public boundary | none | keep |
| `src/domain/queries/arrival/index.ts` | domain | query DTOs | arrival query DTO types | 1 parent aggregator | DTO boundary | none | keep |
| `src/domain/queries/departure/index.ts` | domain | query DTOs | departure query DTO types | 1 parent aggregator | DTO boundary | none | keep |
| `src/domain/queries/directory/index.ts` | domain | query DTOs | directory query DTO types | 1 parent aggregator | DTO boundary | none | keep |
| `src/domain/queries/draft/index.ts` | domain | query DTOs | draft query DTO types | 1 parent aggregator | DTO boundary | none | keep |
| `src/domain/queries/index.ts` | domain | query DTOs | type-only query DTO aggregator | 0 direct | real public boundary but currently unused | minor; `export type *` is intentional DTO aggregation | keep |
| `src/domain/queries/personalization/index.ts` | domain | query DTOs | settings/favorites/profile DTOs | 13 | real public boundary | none | keep |
| `src/domain/queries/record-code/index.ts` | domain | query DTOs | record-code query DTOs | 2 | real public boundary | none | keep |
| `src/domain/queries/stock/index.ts` | domain | query DTOs | stock query DTOs | 1 | DTO boundary | none | keep |
| `src/domain/settings/index.ts` | domain | settings | settings records/write surface | 2 | real public boundary | minor `export *` from write | keep; explicit-export cleanup only if scoped |
| `src/domain/settings/write/index.ts` | domain | settings write | write service contracts | 1 parent aggregator | domain sub-boundary | none | keep |
| `src/domain/validation/index.ts` | domain | validation | validation issue mapper/types | 0 direct | real boundary candidate, currently unused | minor | keep |
| `src/features/backup/ui/backup-workflow/index.tsx` | features | backup workflow | `BackupWorkflow` component | 1 | component-folder entry | moderate navigation cost after local split | rename-later; selected first |
| `src/features/buffer/core/buffer-core.public.ts` | features | buffer core | explicit public buffer seam | 20 | real public boundary | none | real-public-boundary |
| `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | features | buffer picker | `BufferPickerModal` component | 1 | component-folder entry | minor | rename-later, lower priority |
| `src/features/form-controls/codes/index.tsx` | features | form controls | `CodesFieldFamily` reusable control | 3 | component-folder public entry | none after extraction | keep for now |
| `src/features/form-controls/date-time/index.tsx` | features | form controls | `OccurredAtFieldFamily` reusable control | 3 | component-folder public entry | none after extraction | keep for now |
| `src/features/form-controls/money/index.tsx` | features | form controls | `MoneyFieldFamily` reusable control | 4 including test | component-folder public entry | none after extraction | keep for now |
| `src/features/form-controls/support/field-info-trigger/index.tsx` | features | form-controls support | `FieldInfoTrigger`, `FieldLabel` | 18 | support public entry | none after support move | keep |
| `src/features/form-fields/field-family-departure-mode/index.tsx` | features | form fields | departure-mode field family | 2 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-description/index.tsx` | features | form fields | description field family | 3 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-direction/index.tsx` | features | form fields | direction field family | 2 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-directory/index.tsx` | features | directory field wrapper | query/preference-aware directory wrapper | 4 including test | wrapper entry, not UI-only control | none; index hides wrapper role but ownership is intentional | keep until separate directory-wrapper naming task |
| `src/features/form-fields/field-family-link-url/index.tsx` | features | form fields | link URL field family | 2 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-note/index.tsx` | features | form fields | note field family | 3 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-subject-kind/index.tsx` | features | form fields | subject-kind field family | 3 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/field-family-title/index.tsx` | features | form fields | title field family | 3 | component-folder entry | moderate; remaining form-field family not preflighted | defer |
| `src/features/form-fields/form-section-accordion/index.tsx` | features | form fields | form section accordion and props | 3 | component-folder entry | minor; AR-0507 accepted transitional owner | keep |
| `src/features/navigation/ui/app-overlay-host/index.tsx` | features | navigation overlay | overlay host component | 1 | component-folder entry | minor | keep; behavior-sensitive overlay surface |
| `src/features/navigation/ui/mobile-bottom-nav/index.tsx` | features | navigation | bottom navigation entry and types | 2 | component-folder public entry | none | keep |
| `src/features/navigation/ui/mobile-shell/index.tsx` | features | navigation shell | mobile shell component | 1 | component-folder entry | minor | keep; shell-sensitive |
| `src/features/pwa/ui/pwa-status-banner/index.tsx` | features | PWA status | PWA status banner | 1 | component-folder entry | minor | rename-later only if touched |
| `src/features/scanner/modal/index.tsx` | features | scanner modal | scanner modal orchestration component | 1 | component-folder entry | high behavior sensitivity despite navigation benefit | defer |
| `src/features/scanner/runtime/scanner-runtime.public.ts` | features | scanner runtime | explicit scanner runtime public seam | 9 | real public boundary | none | real-public-boundary |
| `src/infrastructure/db/index.ts` | infrastructure | DB | app DB/schema/table public surface | 30 | real public boundary | none | real-public-boundary |
| `src/infrastructure/restore-core/index.ts` | infrastructure | restore core | restore planning primitives | 3 | real public boundary | none | real-public-boundary |
| `src/infrastructure/services/index.ts` | infrastructure | services | write/service composition surface | 20 | real public boundary | none | real-public-boundary |
| `src/pages/arrivals/components/arrival-card/index.tsx` | pages | arrivals card | arrival card plus preview helpers | 1 | component-folder entry | moderate; exports helpers and component from `index` | rename-later |
| `src/pages/buffer/components/buffer-card/index.tsx` | pages | buffer card | buffer card | 1 | component-folder entry | minor | rename-later |
| `src/pages/dashboard/home-favorites/index.tsx` | pages | dashboard home favorites | dashboard favorites component | 1 | component-folder entry | minor | rename-later |
| `src/pages/dashboard/index.tsx` | pages | dashboard route | `DashboardPage` | router lazy/static import not captured by regex | route entry | none | route-entry-ok |
| `src/pages/departures/components/departure-card/index.tsx` | pages | departures card | departure card plus preview helpers | 1 | component-folder entry | moderate; exports helpers and component from `index` | rename-later |
| `src/pages/device-preview/index.tsx` | pages | device preview route | `DevicePreviewPage` | router lazy/static import not captured by regex | route entry | none | route-entry-ok |
| `src/pages/drafts/components/draft-card/index.tsx` | pages | drafts card | draft card plus preview helpers | 1 | component-folder entry | moderate; exports helpers and component from `index` | rename-later |
| `src/pages/stocks/components/stock-card/index.tsx` | pages | stocks card | stock card plus preview helpers | 2 | component-folder entry | moderate; exports helpers and component from `index` | rename-later |
| `src/pages/stocks/index.tsx` | pages | stocks route aggregate | `StocksPage`, `StockDetailsPage` route aggregate | 1 | route/page public boundary | none | route-entry-ok |
| `src/pages/ui-kit/index.tsx` | pages | UI kit route | `UiKitPage` | router lazy/static import not captured by regex | route entry | none | route-entry-ok |
| `src/router/components/app-link/index.tsx` | router | router components | typed `AppLink` | 1 parent router boundary | internal component entry | none | keep |
| `src/router/components/app-nav-link/index.tsx` | router | router components | typed `AppNavLink` | 1 parent router boundary | internal component entry | none | keep |
| `src/router/components/route-head/index.tsx` | router | router components | `RouteHead` | 1 parent router boundary | internal component entry | none | keep |
| `src/router/index.ts` | router | router public API | typed router public surface | 19 | real public boundary | none | real-public-boundary |
| `src/router/layouts/root-layout/index.tsx` | router | root layout | `RootLayout`, fallback export | 1 | route layout entry | none | route-entry-ok |
| `src/shared/gestures/index.ts` | shared | gestures | reusable gesture hooks/types | 2 | real public boundary | none | real-public-boundary |
| `src/shared/haptics/index.ts` | shared | haptics | haptics provider/adapters/hooks | 6 | real public boundary | none | real-public-boundary |
| `src/shared/ui/action-feedback/index.tsx` | shared | action feedback | feedback API hook/types | 10 | shared UI public entry | none | keep |
| `src/shared/ui/collection-section/index.tsx` | shared | collection section | reusable collection surface | 5 | shared UI public entry | none | keep |
| `src/shared/ui/confirm-action-modal/index.tsx` | shared | confirm modal | reusable confirm modal | 5 | shared UI public entry | none | keep |
| `src/shared/ui/field-visuals/index.tsx` | shared | field visuals | generic field icon visuals | 15 | shared UI public entry | none | keep |
| `src/shared/ui/file-dropzone/index.tsx` | shared | file dropzone | reusable file dropzone | 1 | shared UI public entry | minor, but scanner-only today | keep until reuse decision |
| `src/shared/ui/form-shell/index.tsx` | shared | form shell | form section card/sticky actions | 18 | shared UI public entry | none | keep |
| `src/shared/ui/horizontal-slider/index.tsx` | shared | slider | reusable slider | 1 internal shared UI consumer | component entry | minor | keep |
| `src/shared/ui/image-crop-editor/index.tsx` | shared | image crop editor | reusable crop editor | 1 scanner consumer | shared UI public entry | minor | keep until scanner/photo UI task |
| `src/shared/ui/page-primitives/index.tsx` | shared | page primitives | page containers/action rows/spacers | 23 | shared UI public entry | none | keep |
| `src/shared/ui/page-section/index.tsx` | shared | page section | reusable page section | 22 | shared UI public entry | none | keep |
| `src/shared/ui/record-card/index.tsx` | shared | record card | generic record cards/preview helpers | 14 | shared UI public entry | none | keep |
| `src/shared/ui/serial-tokens-input/index.tsx` | shared | token input | reusable token input | 1 codes control consumer | shared UI public entry | none | keep |
| `src/shared/utils/query/index.ts` | shared | query helpers | explicit generic query helper exports | 17 | real public boundary | none | real-public-boundary |

Rename candidate and import impact:

| Priority | Current file | Proposed file | Import consumers | Test consumers | Risk | Validation needed |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | none | none | none | none | none | no current index file is actively misleading enough to require immediate blocking cleanup |
| P1 | `src/features/backup/ui/backup-workflow/index.tsx` | `src/features/backup/ui/backup-workflow/backup-workflow.tsx` | `src/pages/settings/settings-backup-page.tsx` | none found | low; route import only, no backup domain/infrastructure behavior | `npm run test:unit -- tests/unit/domain/backup`, `npm run typecheck`, optional backup route smoke if route import changes |
| P1 | `src/pages/{arrivals,departures,drafts,stocks}/components/*-card/index.tsx` | `arrival-card.tsx`, `departure-card.tsx`, `draft-card.tsx`, `stock-card.tsx` | list/detail sections | none found | medium; helper exports and preview components share one file | page list/detail smoke plus typecheck |
| P1 | `src/features/scanner/modal/index.tsx` | `scanner-modal.tsx` | `src/features/navigation/ui/app-overlay-host/index.tsx` | scanner modal tests may reference modal internals indirectly | high; scanner lifecycle was recently verified and is camera-sensitive | scanner unit tests, typecheck, real-camera regression if touched |
| P2 | `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | `buffer-picker-modal.tsx` | `src/features/navigation/ui/app-overlay-host/index.tsx` | none found | medium; overlay/buffer picker path | buffer tests, typecheck, overlay smoke |
| P2 | `src/features/navigation/ui/{app-overlay-host,mobile-shell}/index.tsx` | named local files | root layout | none found | medium; route shell/overlay behavior | navigation smoke plus typecheck |
| P2 | `src/features/pwa/ui/pwa-status-banner/index.tsx` | `pwa-status-banner.tsx` | app providers | none found | low | typecheck |
| P2 | remaining `src/features/form-fields/field-family-*/index.tsx` | named field-family files | arrival/departure/draft editor sections | directory and money tests for specific families | medium; field-family ownership still transitional | focused form-field tests plus typecheck, only after family preflight |
| P3 | route/page entries under `src/pages/*/index.tsx` and `src/router/layouts/root-layout/index.tsx` | none now | route tree | route smoke | low value | leave as route-entry-ok |
| P3 | shared UI component folders under `src/shared/ui/*/index.tsx` | none now | multiple features/pages | varied | low value to high churn | leave as shared public component entries |
| P3 | domain/infrastructure/shared utility `index.ts` boundaries | none now | multiple layers | query/domain tests | public API risk | leave as real public boundaries |

Decision matrix:

| Option | Pros | Cons | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| Keep all indexes as-is | zero churn | misses one clear navigation cleanup after backup split | low | reject as final audit outcome |
| Batch-rename all component-folder `index.tsx` files | maximizes naming consistency | high import churn; touches scanner, forms, pages, shared UI, route shell at once | high | reject |
| Rename only `BackupWorkflow` entrypoint first | narrow, single consumer, improves a recently split workflow owner | requires one route import update and focused backup validation | low | selected |
| Rename scanner modal first | would align with `scanner-modal.*` local files | live-camera lifecycle is behavior-sensitive and not worth touching only for naming | high | defer |
| Rename route/page entries | route names become explicit | existing route entry convention is acceptable and low pain | low/medium | defer |
| Cleanup `export *` in domain boundaries | improves explicit public boundaries | not a component index rename task | medium | defer to a separate public-boundary audit |

Selected first implementation task:

- Task ID: `AR-0804A - Rename backup workflow component entrypoint`.
- Scope:
  - rename `src/features/backup/ui/backup-workflow/index.tsx` to `src/features/backup/ui/backup-workflow/backup-workflow.tsx`;
  - update the single import in `src/pages/settings/settings-backup-page.tsx`;
  - do not touch backup hooks, domain backup contracts, infrastructure services, browser file adapters, restore core, or serialization;
  - do not rename any other index file.
- Validation:
  - `npm run test:unit -- tests/unit/domain/backup`;
  - `npm run typecheck`;
  - backup route smoke only if the route import change needs runtime evidence.

Rejected / deferred candidates:

- Defer `src/features/scanner/modal/index.tsx`; name clarity is useful, but scanner modal lifecycle remains camera-sensitive and should not be touched for cosmetic naming.
- Defer remaining form-field family `index.tsx` files until each family has a placement/naming preflight; some are still transitional form seams.
- Defer page record-card `index.tsx` files as a later page-local card cleanup because they export metrics, cards, and preview content together.
- Keep route entries (`src/pages/dashboard/index.tsx`, `src/pages/device-preview/index.tsx`, `src/pages/ui-kit/index.tsx`, `src/pages/stocks/index.tsx`, `src/router/layouts/root-layout/index.tsx`) as route-entry-ok.
- Keep `*.public.ts` files and real `index.ts` public boundaries unchanged.

Stop conditions for later rename implementation:

- Stop if the target file is a real public boundary or route convention.
- Stop if rename requires broad unrelated import churn.
- Stop if a default export/name mismatch would require behavior changes.
- Stop if tests or consumers treat the folder path as a stable public API.
- Stop if the candidate is cosmetic and not tied to a touched owner.
- Stop if validation would require real-device/runtime proof that is unavailable for a naming-only change.

Validation plan for this audit:

- Readback check for this `AR-0804` section.
- Search the plan for `AR-0804A`.
- `git status --short` to confirm no source files were changed by this planning slice.

#### AR-0804A - Rename backup workflow component entrypoint

Status: done on 2026-04-27.

Summary:

- Renamed `src/features/backup/ui/backup-workflow/index.tsx` to `src/features/backup/ui/backup-workflow/backup-workflow.tsx`.
- Updated the only direct source consumer, `src/pages/settings/settings-backup-page.tsx`, to import the named file path.
- No backup workflow logic, hooks, domain contracts, infrastructure services, browser file adapter, JSON serialization, restore-core code, checkpoint/history behavior, or restore behavior was changed.
- No other `index.tsx` component entrypoint was renamed, and no backup barrel or `export *` entrypoint was created.

Validation evidence:

- Search for `backup-workflow/index` and `backup-workflow/index.tsx` found no stale source/test references.
- `npm run test:unit -- tests/unit/domain/backup` passed.
- `tests/unit/features/backup`, `tests/unit/infrastructure/services/backup`, and `tests/unit/infrastructure/backup` are absent; no focused tests exist at those paths.
- `npm run typecheck` passed.

Next task:

- Task ID: `AR-0805 - Review remaining component-folder index rename candidates`.
- Goal: decide whether the next rename should target page-local record-card entries, scanner modal entry naming, or stop the naming wave to avoid cosmetic churn.
- Scope: planning/inspection only unless a later prompt selects one narrow rename.

#### AR-0805 - Review remaining component-folder index rename candidates

Status: preflight complete on 2026-04-27.

Remaining index summary:

- Current post-`AR-0804A` entrypoint count is 73 under `src`: 45 `index.tsx`, 26 `index.ts`, and 2 `*.public.ts`.
- The only delta from `AR-0804` is that `src/features/backup/ui/backup-workflow/index.tsx` is gone and `src/features/backup/ui/backup-workflow/backup-workflow.tsx` now owns the backup workflow component.
- No remaining `index.tsx` is a P0 blocker. The next useful cleanup is page-local and route-owned, not a public-boundary change.
- Do not select route entries, shared UI public entries, scanner modal, form-control public entries, or real public boundaries in the next implementation slice.

Remaining index inventory delta:

| File | Owner | Role | Consumer count | AR-0804 recommendation | Current recommendation | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `src/features/backup/ui/backup-workflow/index.tsx` | backup workflow | removed by AR-0804A | 0 | selected first | complete | no longer exists |
| `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | buffer picker | contextual picker modal | 1 | P2 rename-later | defer | overlay/buffer picker behavior is more sensitive than page-card naming |
| `src/features/form-controls/codes/index.tsx` | form controls | reusable codes control | 3 | keep | keep | intentional multi-owner control entry |
| `src/features/form-controls/date-time/index.tsx` | form controls | reusable date-time control | 3 | keep | keep | intentional multi-owner control entry |
| `src/features/form-controls/money/index.tsx` | form controls | reusable money control | 4 | keep | keep | intentional multi-owner control entry with test import |
| `src/features/form-controls/support/field-info-trigger/index.tsx` | form-control support | field info/label support | 18 | keep | keep | intentional support entry used widely |
| `src/features/form-fields/field-family-departure-mode/index.tsx` | form fields | remaining field family | 2 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-description/index.tsx` | form fields | remaining field family | 3 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-direction/index.tsx` | form fields | remaining field family | 2 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-directory/index.tsx` | form fields | query/preference directory wrapper | 4 | keep | keep | wrapper role is intentional after directory UI split |
| `src/features/form-fields/field-family-link-url/index.tsx` | form fields | remaining field family | 2 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-note/index.tsx` | form fields | remaining field family | 3 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-subject-kind/index.tsx` | form fields | remaining field family | 3 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/field-family-title/index.tsx` | form fields | remaining field family | 3 | defer | defer | field-family ownership still needs separate preflight before naming churn |
| `src/features/form-fields/form-section-accordion/index.tsx` | form fields | form section layout support | 3 | keep | keep | accepted transitional form layout owner in AR-0507 |
| `src/features/navigation/ui/app-overlay-host/index.tsx` | navigation | root overlay host | 1 | keep | keep | behavior-sensitive overlay surface |
| `src/features/navigation/ui/mobile-bottom-nav/index.tsx` | navigation | bottom nav entry | 2 | keep | keep | intentional navigation component-folder API |
| `src/features/navigation/ui/mobile-shell/index.tsx` | navigation | shell entry | 1 | keep | keep | shell-sensitive route layout surface |
| `src/features/pwa/ui/pwa-status-banner/index.tsx` | PWA | app status banner | 1 | P2 rename-later | defer | low value; rename only when touched |
| `src/features/scanner/modal/index.tsx` | scanner | scanner modal orchestration | 1 | defer | defer | camera lifecycle remains too sensitive for cosmetic naming |
| `src/pages/arrivals/components/arrival-card/index.tsx` | arrivals page | card, metrics, preview content | 1 | P1 rename-later | selected next | high navigation value, route-local, single consumer |
| `src/pages/buffer/components/buffer-card/index.tsx` | buffer page | buffer card | 1 | P2 rename-later | defer | simpler than arrival card, but lower value; can follow after one card pattern lands |
| `src/pages/dashboard/home-favorites/index.tsx` | dashboard page | favorites section component | 1 | P2 rename-later | defer | dashboard ownership should be handled in a route-local dashboard slice |
| `src/pages/dashboard/index.tsx` | dashboard page | route entry | 0 import regex hits | route-entry-ok | keep | route entry convention |
| `src/pages/departures/components/departure-card/index.tsx` | departures page | card, metrics, preview content | 1 | P1 rename-later | defer | same card cluster; do not batch |
| `src/pages/device-preview/index.tsx` | device preview page | dev verification route | 0 import regex hits | route-entry-ok | keep | route entry convention |
| `src/pages/drafts/components/draft-card/index.tsx` | drafts page | card, metrics, preview content | 1 | P1 rename-later | defer | same card cluster; do not batch |
| `src/pages/stocks/components/stock-card/index.tsx` | stocks page | card, metrics, preview content | 2 | P1 rename-later | defer | more consumers than arrival; leave until after simpler card rename |
| `src/pages/stocks/index.tsx` | stocks page | route aggregate | 1 | route-entry-ok | keep | route/page public boundary |
| `src/pages/ui-kit/index.tsx` | UI kit page | dev route entry | 0 import regex hits | route-entry-ok | keep | route entry convention |
| `src/router/components/app-link/index.tsx` | router | typed app link | 1 | keep | keep | internal router component consumed by public router boundary |
| `src/router/components/app-nav-link/index.tsx` | router | typed nav link | 1 | keep | keep | internal router component consumed by public router boundary |
| `src/router/components/route-head/index.tsx` | router | route head | 1 | keep | keep | internal router component consumed by public router boundary |
| `src/router/layouts/root-layout/index.tsx` | router | root layout route entry | 1 | route-entry-ok | keep | route layout entry |
| `src/shared/ui/action-feedback/index.tsx` | shared UI | action feedback API | 10 | keep | keep | shared UI public entry |
| `src/shared/ui/collection-section/index.tsx` | shared UI | collection/list shell | 5 | keep | keep | shared UI public entry |
| `src/shared/ui/confirm-action-modal/index.tsx` | shared UI | confirm modal | 5 | keep | keep | shared UI public entry |
| `src/shared/ui/field-visuals/index.tsx` | shared UI | field visuals | 15 | keep | keep | shared UI public entry |
| `src/shared/ui/file-dropzone/index.tsx` | shared UI | file dropzone | 1 | keep | keep | shared UI public entry; scanner-owned usage today is not enough to rename |
| `src/shared/ui/form-shell/index.tsx` | shared UI | form shell primitives | 18 | keep | keep | shared UI public entry |
| `src/shared/ui/horizontal-slider/index.tsx` | shared UI | slider primitive | 1 | keep | keep | shared UI component entry |
| `src/shared/ui/image-crop-editor/index.tsx` | shared UI | crop editor | 1 | keep | keep | shared UI public entry |
| `src/shared/ui/page-primitives/index.tsx` | shared UI | page layout primitives | 23 | keep | keep | shared UI public entry |
| `src/shared/ui/page-section/index.tsx` | shared UI | page section | 22 | keep | keep | shared UI public entry |
| `src/shared/ui/record-card/index.tsx` | shared UI | generic record card primitives | 14 | keep | keep | shared UI public entry |
| `src/shared/ui/serial-tokens-input/index.tsx` | shared UI | token input | 1 | keep | keep | shared UI public entry |

Candidate ranking:

| Priority | Candidate | Proposed target | Consumer(s) | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| P0 | none | none | none | none | no remaining index entry is urgent enough to block work |
| P1 | `src/pages/arrivals/components/arrival-card/index.tsx` | `src/pages/arrivals/components/arrival-card/arrival-card.tsx` | `src/pages/arrivals/sections/arrivals-list-section.tsx` | low/medium; route-local card and preview exports only | selected |
| P1 | `src/pages/departures/components/departure-card/index.tsx` | `departure-card.tsx` | departures list section | low/medium | defer; same card cluster, do not batch |
| P1 | `src/pages/drafts/components/draft-card/index.tsx` | `draft-card.tsx` | drafts list section | low/medium | defer; same card cluster, do not batch |
| P1 | `src/pages/stocks/components/stock-card/index.tsx` | `stock-card.tsx` | stocks list section and stock details page | medium; two consumers and stocks workflow is more active | defer until after simpler card entry |
| P2 | `src/pages/buffer/components/buffer-card/index.tsx` | `buffer-card.tsx` | buffer list section | low | useful but less navigation value than metrics/preview cards |
| P2 | `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` | `buffer-picker-modal.tsx` | overlay host | medium | defer; contextual overlay behavior |
| P2 | `src/features/pwa/ui/pwa-status-banner/index.tsx` | `pwa-status-banner.tsx` | app providers | low | defer until touched |
| P2 | navigation shell/overlay `index.tsx` files | named shell/overlay files | root layout | medium | defer; route shell/overlay behavior |
| P2 | remaining form-field family `index.tsx` files | named field-family files | editor sections/tests | medium | defer until each family has a placement/naming preflight |
| P3 | route entries, router layout entries, shared UI public entries, form-control public entries | none | multiple | public/route API risk | keep |

Selected next rename task:

- Task ID: `AR-0805A - Rename arrival page card component entrypoint`.
- File to rename:
  - `src/pages/arrivals/components/arrival-card/index.tsx`
  - to `src/pages/arrivals/components/arrival-card/arrival-card.tsx`
- Direct consumers:
  - `src/pages/arrivals/sections/arrivals-list-section.tsx`
- Scope:
  - update only the import path caused by the rename;
  - do not split metrics, preview content, or card logic;
  - do not rename departure/draft/stock/buffer cards in the same slice;
  - do not touch arrival feature hooks, domain queries, infrastructure queries, or form/editor logic.
- Validation:
  - stale-path search for `arrival-card/index` and `arrival-card/index.tsx`;
  - `npm run test:unit -- tests/unit/features/arrivals`;
  - `npm run typecheck`;
  - route smoke only if import/runtime wiring behaves unexpectedly.

Rejected / deferred candidates:

- Scanner modal entry naming remains deferred because live-camera lifecycle and modal close/reopen behavior are not worth touching for naming alone.
- Shared UI `index.tsx` entries remain accepted public component-folder APIs.
- Route entries remain accepted route conventions.
- Remaining form-field family entries remain deferred until a separate form-field ownership/naming preflight.
- Page card cluster is not batch-renamed; each route card gets its own narrow rename if the first one lands cleanly.

Stop conditions:

- Stop if `ArrivalCard`, `ArrivalPreviewContent`, or `buildArrivalMetrics` has more consumers than the current scan found.
- Stop if the import path is treated as a public API by tests or route-level tooling.
- Stop if the rename would require splitting card logic, changing list behavior, changing preview drawer behavior, or touching arrival query/domain/feature hooks.
- Stop if source state changes outside the arrival-card rename/import update.

Validation plan for this preflight:

- Readback check for this `AR-0805` section.
- Search the plan for `AR-0805A`.
- `git status --short` to confirm no source files were changed by this planning slice.

#### AR-0805A - Rename arrival page card component entrypoint

Status: done on 2026-04-27.

Summary:

- Renamed `src/pages/arrivals/components/arrival-card/index.tsx` to `src/pages/arrivals/components/arrival-card/arrival-card.tsx`.
- Updated the direct source consumer, `src/pages/arrivals/sections/arrivals-list-section.tsx`, to import the named file path.
- No arrival card behavior, metrics, preview content, list behavior, feature hooks, domain/query/infrastructure code, or sibling card entrypoints were changed.
- No barrel or `export *` entrypoint was introduced.

Validation:

- Stale source path scan for `arrival-card/index`, `arrival-card/index.tsx`, and `@/pages/arrivals/components/arrival-card` was clean in `src` and `tests`.
- `tests/unit/pages/arrivals` is absent in the current tree.
- `npm run test:unit -- tests/unit/features/arrivals` passed: 1 file, 2 tests.
- `npm run typecheck` passed.

#### AR-0805B - Rename departure page card component entrypoint

Status: done on 2026-04-27.

Summary:

- Renamed `src/pages/departures/components/departure-card/index.tsx` to `src/pages/departures/components/departure-card/departure-card.tsx`.
- Updated the direct source consumer, `src/pages/departures/sections/departures-list-section.tsx`, to import the named file path.
- No departure card behavior, metrics, preview content, list behavior, feature hooks, domain/query/infrastructure code, or sibling card entrypoints were changed.
- No barrel or `export *` entrypoint was introduced.

Validation:

- Stale source path scan for `departure-card/index`, `departure-card/index.tsx`, and `@/pages/departures/components/departure-card` was clean in `src` and `tests`.
- `tests/unit/pages/departures` is absent in the current tree.
- `npm run test:unit -- tests/unit/features/departures` passed: 2 files, 4 tests.
- `npm run typecheck` passed.

#### AR-0805C - Rename draft page card component entrypoint

Status: done on 2026-04-27.

Summary:

- Renamed `src/pages/drafts/components/draft-card/index.tsx` to `src/pages/drafts/components/draft-card/draft-card.tsx`.
- Updated the direct source consumer, `src/pages/drafts/sections/drafts-list-section.tsx`, to import the named file path.
- No draft card behavior, metrics, preview content, list behavior, feature hooks, draft publish behavior, domain/query/infrastructure code, or sibling card entrypoints were changed.
- No barrel or `export *` entrypoint was introduced.

Validation:

- Stale source path scan for `draft-card/index`, `draft-card/index.tsx`, and `@/pages/drafts/components/draft-card` was clean in `src` and `tests`.
- `tests/unit/pages/drafts` is absent in the current tree.
- `npm run test:unit -- tests/unit/features/drafts` passed: 1 file, 1 test.
- `npm run typecheck` passed.

#### AR-0805D - Rename stock page card component entrypoint

Status: done on 2026-04-27.

Summary:

- Renamed `src/pages/stocks/components/stock-card/index.tsx` to `src/pages/stocks/components/stock-card/stock-card.tsx`.
- Updated the two direct source consumers, `src/pages/stocks/sections/stocks-list-section.tsx` and `src/pages/stocks/stock-details-page.tsx`, to import the named file path.
- No stock card behavior, metrics, preview content, stocks list behavior, stock projection logic, adjustment behavior, departure prefill behavior, domain/query/infrastructure code, or sibling card entrypoints were changed.
- No barrel or `export *` entrypoint was introduced.

Validation:

- Stale source path scan for `stock-card/index`, `stock-card/index.tsx`, and `@/pages/stocks/components/stock-card` was clean in `src` and `tests`; remaining `components/stock-card` hits are the expected explicit `components/stock-card/stock-card` imports.
- `tests/unit/pages/stocks` is absent in the current tree.
- `tests/unit/features/stocks` is absent in the current tree.
- `npm run test:unit -- tests/unit/infrastructure/queries/stock` passed: 1 file, 3 tests.
- `npm run typecheck` passed.

#### AR-0805E - Rename buffer page card component entrypoint

Status: done on 2026-04-27.

Preflight result:

- Selected `src/pages/buffer/components/buffer-card/index.tsx` because it is a route-owned buffer page card, not a route convention, not a public boundary, not `buffer-core.public.ts`, and not the buffer picker/modal public entrypoint.
- The candidate had one direct source consumer, `src/pages/buffer/sections/buffer-list-section.tsx`.
- `src/features/buffer/picker/ui/buffer-picker-modal/index.tsx` remained out of scope because it is a contextual picker/modal entrypoint.

Summary:

- Renamed `src/pages/buffer/components/buffer-card/index.tsx` to `src/pages/buffer/components/buffer-card/buffer-card.tsx`.
- Updated the direct source consumer, `src/pages/buffer/sections/buffer-list-section.tsx`, to import the named file path.
- No buffer behavior, buffer apply/delete semantics, duplicate handling, storage behavior, scanner behavior, picker behavior, form behavior, or public buffer seam was changed.
- No barrel or `export *` entrypoint was introduced.

Validation:

- Stale source path scan for `buffer-card/index`, `buffer-card/index.tsx`, `buffer-item-card/index`, `buffer-item-card/index.tsx`, and `@/pages/buffer/components/buffer-card` was clean in `src` and `tests`; remaining `components/buffer-card` hits are the expected explicit `components/buffer-card/buffer-card` import.
- `tests/unit/pages/buffer` is absent in the current tree.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run typecheck` passed.

#### AR-0901 - Current state docs sync after hardening wave

Status: done on 2026-04-27.

Summary:

- Updated active project truth docs after the architecture hardening/refactor wave.
- Synced normalized feature ownership for arrivals, departures, drafts, buffer, scanner, and stocks.
- Recorded current form-control extraction truth, deferred form-field/form-preference seams, shared query helper placement, scanner/backup local splits, and named component entrypoints.
- Preserved explicit remaining risks: dirty/unstaged worktree, barcode decode success not verified, valid import restore commit not verified with an isolated fixture, form preferences and the directory wrapper intentionally deferred, and first-data `*.ports.ts` naming debt still deferred.

Files updated:

- `docs/status/CURRENT_STATE_AND_GAPS.md`
- `docs/architecture/PROJECT_STRUCTURE.md`
- `docs/architecture/architecture_structure.md`
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md`

Validation:

- Active docs were searched for stale old-path references and current-path references.
- `git status --short` was used to confirm this slice changed docs only and no source files were edited.

#### AR-0902B - Final mobile smoke before hardening wave report

Status: partial on 2026-04-27.

Summary:

- Final mobile runtime smoke ran at 390x844 against the Vite dev server on `http://localhost:5173/` using hash routes.
- Core routes loaded and rendered primary UI:
  - `/`
  - `/arrivals`
  - `/arrivals/create`
  - `/departures`
  - `/departures/create`
  - `/drafts`
  - `/drafts/create`
  - `/buffer`
  - `/stocks`
  - `/settings`
  - `/settings/backup`
- Arrival, departure, and draft create forms rendered; the title field accepted sample input without saving durable records.
- Arrival and departure buffer picker drawers opened and closed from create forms; buffer remained empty and no apply/save action was performed.
- Scanner modal opened, rendered a live video element and photo/file panel, switched to the file tab, and closed.
- Backup route rendered export/restore, checkpoint, history, and checkpoint sections; restore remained disabled without a selected valid import file.

Partial reason:

- Scanner modal tab labels rendered with mojibake text (`РЎРєР°РЅРµСЂ`, `Р¤Р°Р№Р»`) during the mobile smoke. The modal lifecycle still worked, but this is a visible encoding/text defect and blocks calling the final smoke fully clean.
- Real live-camera `MediaStream` was not reverified in AR-0902B; prior AR-0601B remains the real-camera evidence for live stream start/stop/reopen behavior.
- Backup export was not triggered and restore commit was not performed in this smoke.

Validation:

- `npm run typecheck` passed.
- `npm run test:unit -- tests/unit/features/arrivals` passed: 1 file, 2 tests.
- `npm run test:unit -- tests/unit/features/departures` passed: 2 files, 4 tests.
- `npm run test:unit -- tests/unit/features/drafts` passed: 1 file, 1 test.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run test:unit -- tests/unit/features/form-fields` passed: 4 files, 13 tests.
- `npm run test:unit -- tests/unit/domain/common/query-helpers.test.ts` passed: 1 file, 11 tests.
- `npm run test:unit -- tests/unit/infrastructure/queries` passed: 1 file, 3 tests.
- `npm run test:unit -- tests/unit/domain/backup` passed: 1 file, 7 tests.
- Browser console showed Vite debug messages, the React DevTools development info message, and one non-fatal scanner-related warning: `RSS Expanded reader IS NOT ready for production yet! use at your own risk.`

#### AR-0902C - Fix scanner modal tab label encoding

Status: done on 2026-04-27.

Summary:

- Fixed only the scanner modal tab label literals in `src/features/scanner/modal/sections/tabs.tsx`.
- Replaced the mojibake visible and `aria-label` strings for the live and photo tabs with `Сканер` and `Файл`.
- No scanner runtime logic, live camera lifecycle, photo/file decode behavior, overlay arbitration, buffer behavior, form behavior, file moves, or broad encoding cleanup was performed.

Validation:

- Node readback verified the tab labels are stored as UTF-8 Cyrillic code points.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run typecheck` passed.
- Focused Playwright mobile scanner modal smoke at 390x844 confirmed tab labels render as `Сканер` and `Файл`, and the modal closes.
- Browser console showed only Vite debug messages, the React DevTools development info message, and the existing non-fatal scanner warning: `RSS Expanded reader IS NOT ready for production yet! use at your own risk.`

#### AR-0902D - Rerun final mobile smoke after scanner tab label fix

Status: done on 2026-04-27.

Summary:

- Reran the final mobile runtime smoke at 390x844 after AR-0902C.
- Verified the prior AR-0902B scanner tab label blocker is resolved: the scanner modal tabs render as `Сканер` and `Файл`.
- Core routes loaded with primary UI: `/`, `/arrivals`, `/arrivals/create`, `/departures`, `/departures/create`, `/drafts`, `/drafts/create`, `/buffer`, `/stocks`, `/settings`, and `/settings/backup`.
- Arrival, departure, and draft create forms rendered and accepted sample title input without saving durable records.
- Arrival and departure buffer picker drawers opened and closed; draft create has no buffer picker entrypoint in the current UI.
- Buffer and stocks routes rendered their empty/list surfaces.
- Backup route rendered export/restore, checkpoint, history, and checkpoint-list surfaces; restore stayed disabled without a selected valid import file.

Validation:

- `npm run typecheck` passed.
- `npm run test:unit -- tests/unit/features/arrivals` passed: 1 file, 2 tests.
- `npm run test:unit -- tests/unit/features/departures` passed: 2 files, 4 tests.
- `npm run test:unit -- tests/unit/features/drafts` passed: 1 file, 1 test.
- `npm run test:unit -- tests/unit/features/buffer` passed: 6 files, 30 tests.
- `npm run test:unit -- tests/unit/features/scanner` passed: 3 files, 23 tests.
- `npm run test:unit -- tests/unit/features/form-fields` passed: 4 files, 13 tests.
- `npm run test:unit -- tests/unit/domain/common/query-helpers.test.ts` passed: 1 file, 11 tests.
- `npm run test:unit -- tests/unit/infrastructure/queries` passed: 1 file, 3 tests.
- `npm run test:unit -- tests/unit/domain/backup` passed: 1 file, 7 tests.
- Playwright mobile smoke used a fresh Chromium context against the Vite dev server on `http://localhost:5173/`.
- Browser console had no page errors and no console errors; it showed only Vite debug messages, the React DevTools development info message, and the existing non-fatal scanner warning: `RSS Expanded reader IS NOT ready for production yet! use at your own risk.`

Skipped:

- Real live-camera `MediaStream` was not reverified in AR-0902D; AR-0601B remains the real-camera evidence for live stream start/stop/reopen behavior.
- Backup export was skipped because AR-0803 already covered the safe export path; destructive restore commit was not performed.
- No durable save/write action was performed from create forms.

#### AR-0903 - Hardening wave final report

Status: done on 2026-04-27.

Final report:

- `docs/refactor/ARCHITECTURE_HARDENING_FINAL_REPORT.md`

Summary:

- Created the final closure artifact for the architecture hardening wave.
- Captured completed structural changes, verification evidence, preserved behavior, deferred debt, locked do-not-touch surfaces, recommended narrow follow-ups, and final wave status.
- Final status recorded as: architecture hardening wave complete with documented residual risks.
- No source files, test files, moves, renames, staging, or commits were performed in this slice.

## 11. First 5 executor prompts

These prompts are historical executor prompts from the original ownership-wave plan. `AR-003`, `AR-004`, and `AR-005` are complete; old paths in this section are retained only as completed pre-move task evidence.

### Prompt 1 - AR-001 parent plan artifact

Role: architecture refactor planner for SKLAD.

Read first: this file, `AGENTS.md`, and `docs/workflows/CODEX_EXECUTION_CONTRACT.md`.

Goal: create or update only `docs/refactor/ARCHITECTURE_REORGANIZATION_PLAN.md` as the parent architecture-level plan.

Constraints: no source moves, no source edits, no deletion of `FEATURE_STRUCTURE_REFACTOR_PLAN.md`.

Acceptance criteria: plan exists, links the narrow feature plan as prior input, and explicitly forbids first-data `*.ports.ts` renames in folder-move waves.

Validation: `git status --short docs/refactor`; markdown readback.

### Prompt 2 - AR-002 safety cleanup

Role: narrow cleanup executor for SKLAD.

Read first: this file, `AGENTS.md`, current `git status --short`.

Goal: remove only confirmed stale imports/artifacts/BOM/comment-only scaffolding.

Constraints: no feature moves, no `*.ports.ts` rename, no first-data service/query/repository changes.

Acceptance criteria: every edit has reference-search proof; no behavior changes.

Validation: reference searches; `npm run typecheck` if source changes.

### Prompt 3 - AR-003 arrivals move

Role: folder-ownership executor for SKLAD.

Read first: this file and current arrivals feature/page imports.

Goal: move `src/features/arrival-editor` and `src/features/arrivals-data` into `src/features/arrivals/{editor,data}`.

Constraints: no logic changes, no mapper extraction, no first-data changes.

Acceptance criteria: old folders gone or empty; imports updated; app typechecks.

Validation: `npm run typecheck`; focused arrival route smoke if feasible.

### Prompt 4 - AR-004 departures move

Role: folder-ownership executor for SKLAD.

Read first: this file and current departures feature/page imports.

Goal: move `src/features/departure-editor` and `src/features/departures-data` into `src/features/departures/{editor,data}`.

Constraints: no behavior changes, no linked-arrival/prefill logic changes.

Acceptance criteria: old folders gone or empty; imports updated; app typechecks.

Validation: `npm run typecheck`; focused departure route smoke if feasible.

### Prompt 5 - AR-005 drafts move

Role: folder-ownership executor for SKLAD.

Read first: this file and current drafts feature/page imports.

Goal: move `src/features/draft-editor`, `src/features/drafts-data`, and `src/features/draft-publish` into `src/features/drafts/{editor,data,publish}`.

Constraints: no publish service changes, no form behavior changes.

Acceptance criteria: old folders gone or empty; imports updated; app typechecks.

Validation: `npm run typecheck`; focused draft route smoke if feasible.

## Validation notes for this artifact

Planning inspection used before creating this artifact:

- `Get-Content -Raw` for required docs, `AGENTS.md`, `package.json`, repo-local skills, and prior refactor doc.
- `git status --short` confirmed a dirty worktree with pre-existing source changes and untracked `docs/refactor`.
- `Get-ChildItem -Recurse -File` inventories for `src/features`, `src/pages`, `src/domain`, `src/infrastructure`, `src/shared`, and `src/router`.
- `Select-String` import and role scans after `rg.exe` failed with `Access is denied` in broad scans.
- Serena project activation/onboarding and symbol overview for the historical pre-move scanner runtime path `src/features/scanner-runtime/model/scanner-runtime-controller.ts`.

No build, typecheck, formatter, linter, source refactor, file move, source deletion, or Playwright command is part of this planning artifact creation.

## Remaining risks and follow-ups

- The worktree was already dirty before this artifact was created; future executor slices must preserve unrelated edits.
- `features/form-controls` needs strict policing to avoid becoming a dumping ground.
- `*.ports.ts` remains intentionally deferred first-data vocabulary debt.
- Feature hooks currently import `appDb` and repositories directly in several places; this is later architecture cleanup, not part of folder-only moves.
- Runtime-sensitive scanner, buffer, mobile form, and backup flows need targeted verification only after their files are touched.
