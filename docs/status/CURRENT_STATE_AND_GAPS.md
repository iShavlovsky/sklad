# CURRENT_STATE_AND_GAPS

## 1. Progress snapshot

- Estimated readiness: **~20–25% of the first usable milestone**
- What already works:
  - app bootstrap, theme provider, notifications, and AppShell-based mobile-first shell foundation;
  - optional Google account connection provider that degrades to configured-missing UI when `VITE_GOOGLE_CLIENT_ID` is absent;
  - typed route system with route metadata and hash-router wiring;
  - explicit route-first subtree for arrivals, departures, products, drafts, buffer, and settings;
  - explicit settings subtree for `/settings`, `/settings/profile`, `/settings/backup`, and `/settings/about`;
  - theme settings now expose one fixed light/dark mode selector, with initial fallback from the current OS light/dark preference when no persisted choice exists;
  - the shared Mantine design-system layer now exposes the current blue/slate-first visual baseline through one canonical Mantine theme factory in `src/app/theme/*`, including canonical `brandBlue` / `neutralSlate` / semantic intent palettes, typed semantic `theme.other` tokens, `primaryShade` 500/400 defaults, canonical typography families/scales/weights/line-heights, compact layout tokens, 48px touch targets, semantic status tokens, and runtime-verified light/dark switching;
  - `/ui-kit` now exists as the canonical dev-only implementation-proof route for theme/UI-kit slices; it uses a dedicated full-width shell layout instead of the default mobile page rail, while the current surface covers section A (color system), section B (typography system), section C (layout tokens), core-component slices D1/D2, D3 feedback/container primitives, and D4 navigation/progress/display primitives, including success/warning input tones, tonal alert/notification states, compact badge/pill sizing, inline accordion examples, multi-size overlay previews, a floating light/dark theme toggle, and runtime-checked overlay/loading/data-display previews;
  - app-level overlay host with the current scanner modal and contextual buffer picker bottom drawer;
  - important action outcomes now use one shared action-feedback hook over Mantine notifications plus the shared haptics adapter for create/save/update/delete/publish/apply/clear, stock adjustment, and scanner-buffer failure surfaces, while navigation, sorting, filters, and preview-drawer opens stay silent;
  - compact mobile-first route pages through shared page primitives and a shell-owned rail layout;
  - route-local semantic sections, dialogs, and page-state helpers for arrivals, departures, products, drafts, buffer, and stocks now live under `src/pages/<route>/`, while `shared/ui/collection-section` stays the one generic list-shell primitive;
  - the architecture hardening wave is complete through `AR-0806`: feature owners are normalized under `src/features/arrivals/{editor,data}`, `src/features/departures/{editor,data}`, `src/features/drafts/{editor,data,publish}`, `src/features/buffer/{core,picker}`, `src/features/scanner/{runtime,modal}`, and `src/features/stocks/{data,adjustment,departure-prefill}`;
  - arrival, departure, and draft editors now share a feature-local form system: UI-only reusable controls live under `src/features/form-controls/*`, query/preference-aware or layout form seams remain under `src/features/form-fields/*`, and second-data remembered defaults stay under `src/features/form-preferences/model`;
  - IndexedDB schema for the intended durable tables;
  - base repositories and two real durable write slices (`create-arrival`, `update-arrival`);
  - two real read slices (`arrival list`, `arrival details`);
  - reusable utilities and tokenized code input component.
- Main remaining risk:
  - product direction could drift if implementation starts copying donor inventory-only behavior instead of following the new universal arrival/departure/draft truth.
  - implementation could drift if UI/scanner/buffer slices move ahead of the durable `src/domain` + `src/infrastructure` entity-management boundaries.

## 2. Confirmed current state

- `sklad-next.zip` is a full donor repository snapshot with:
  - repo root configs and scripts;
  - public assets;
  - product/process docs;
  - Playwright smoke tests;
  - mature scanner, buffer, stocks, settings, backup, arrivals, departures, and navigation slices.
- `src.zip` is an intentionally partial new codebase snapshot containing only `src/`.
- Per user clarification, the intended working repo state is:
  - new `src/` from `src.zip`;
  - repo root and non-`src` assets/config reused from donor unless intentionally changed later.
- The new app uses React + TypeScript + Mantine and currently wires notifications at the provider layer.
- The router is tree-based, typed, and currently uses `createHashRouter`.
- `MobileShell` already reserves header utility slots for scanner, buffer, and settings.
- Current route IA is explicit in code:
  - `arrivals` subtree with list/create/details/edit routes
  - `departures` subtree with list/create/details/edit routes
  - `drafts` subtree with list/create/details/edit routes
  - `buffer` route as the singleton manage surface
  - `settings` subtree with hub/profile/backup/about routes
- The root shell now implements the current Step 1 contract for the touched app-level navigation surface:
  - current route title
  - scanner utility
  - buffer utility with count indicator
  - menu utility that opens a right-side navigation drawer with settings, products, buffer, and route links
  - compact shell network-status control with icon-only trigger and popover details
- The home route now uses route-owned shell/home composition instead of the old missing donor-era dashboard query reference:
  - telemetry section
- durable favorites section with a seeded starter set, now rendered through a dedicated dashboard owner with persisted drag-and-drop ordering across a two-column tile grid
- Current surface ownership is explicit in code:
  - route-owned surfaces: arrivals, departures, drafts, buffer page, settings pages
  - global overlay surface: scanner modal rendered from the root overlay host
  - contextual overlay surface: buffer picker bottom drawer rendered from the root overlay host for an active requester
- Current architecture hardening truth is explicit in code:
  - scanner and buffer expose public runtime seams at `src/features/scanner/runtime/scanner-runtime.public.ts` and `src/features/buffer/core/buffer-core.public.ts`;
  - reusable form controls are extracted into `src/features/form-controls/{codes,date-time,money,directory}` with UI-only help/metadata support under `src/features/form-controls/support`;
  - deferred form surfaces remain separate by design: `src/features/form-fields/form-section-accordion`, the query/preference-aware directory wrapper under `src/features/form-fields/field-family-directory`, and `src/features/form-preferences`;
  - generic storage/domain-agnostic query helpers live in `src/shared/utils/query`, while `src/domain/queries` owns read-model DTO contracts and `src/infrastructure/queries` owns Dexie-backed implementations;
  - scanner modal and backup workflow were split locally for readability without changing scanner, buffer, backup, export, import, or restore semantics;
  - selected workflow/card entrypoints are named files instead of component-folder `index.tsx`: backup workflow plus arrivals, departures, drafts, stocks, and buffer page cards.
- Current list-surface truth on touched routes is now explicit:
  - `arrivals`, `departures`, `products`, `drafts`, `buffer`, and `stocks` each render route-local semantic sections from `src/pages/<route>/sections/*` over the shared `CollectionSection` owner;
  - `shared/ui/collection-section` stays UI-only and generic over item type;
  - query/filter/sort semantics, card markup, empty copy, page-local dialogs, and route actions stay outside `shared/`.
- Current loading/help implementation truth is narrower than the approved policy:
  - root layout suspense fallback uses Mantine `Loader`
  - route page layout currently uses shared page primitives with a shell-owned rail instead of Mantine `Container`
  - `PageSection` already uses `ActionIcon` + `Popover` for medium contextual help
  - settings placeholder notes/details/build toggles have been removed; remaining settings subpages are compact route surfaces, while deeper working controls belong to real feature UI
- The root shell now uses Mantine `AppShell` while preserving the existing scanner and buffer-picker root overlay host.
- The root styling contract is now staged instead of monolithic:
  - `src/main.tsx` imports a thin `src/app/styles/base.css` for root/base invariants only;
  - Mantine package styles remain imported at the provider root;
  - root PostCSS config now includes `postcss-preset-mantine` and `postcss-simple-vars`;
  - shared visual defaults now increasingly live in `src/app/theme/*` via Mantine theme/component ownership;
  - touched shell/page/dashboard/buffer/scanner/PWA/stocks surfaces use colocated CSS modules only where layout/geometry still needs local ownership.
- Transitional `src/shared/ui/global.css` has now been removed:
  - the root app imports only `src/app/styles/base.css` for global/base invariants;
  - touched shell/page/dashboard/scanner/PWA surfaces now own their layout through colocated CSS modules;
  - the final leftover selectors in `global.css` had no live `src` consumers and were legacy dead/test-only residue rather than active UI ownership.
- The UI foundation contract is now stricter:
  - Mantine composition plus theme-level defaults are the primary styling path for touched UI;
  - `*.module.css` is exception-only for local geometry or advanced selectors Mantine does not own cleanly;
  - non-trivial shared shell/page owners are moving to component-folder structure instead of flat sibling files;
  - repo-local AI guidance now includes a dedicated Mantine composition skill, a dedicated modern-module-css skill, and explicit AGENTS rules for UI work.
- The foundation styling split is now tighter:
  - Mantine package styles remain the required global baseline;
  - `src/app/styles/base.css` now stays limited to root invariants and browser-level safety rules;
  - shared visual defaults must live in `src/app/theme/*` or owner-local CSS modules justified by geometry/selector ownership.
  - the current app canvas now uses a restrained cold ambient background with tokenized frosted layers and subtle motion; shared `Paper`/`Card` surfaces use one editable glass-surface contract, the shell header is glass, the footer stays visually transparent, and the main rail itself no longer adds an extra glass panel layer;
  - the mobile viewport foundation is now explicit in theme/layout tokens rather than implicit in page CSS:
    - base mobile contract: `360px` CSS width;
    - dense-content guardrail: `352px`;
    - first large-phone enhancement tier: `428px`;
    - structural breakpoints are tokenized in `em`, while layout sizing/rhythm uses `rem` and `clamp(...)`.
  - the current theme baseline is now explicit instead of implied: the product supports exactly two theme modes, `light` and `dark`, and the theme layer itself does not carry legacy preset compatibility.
  - `theme.components.AppShell` now owns shell header/footer surface visuals, while `mobile-shell` local CSS is reduced toward geometry, spacing, and exceptional selector ownership.
  - production build chunking is now explicitly configured in `vite.config.ts` through `build.rollupOptions.output.manualChunks`, with vendor families split into React/router, Mantine, forms, data, scanner/media, and icons instead of one oversized app chunk.
- The touched owner-folder migration is now broader than the initial foundation pass:
  - `src/shared/ui` shared controls like confirm-action modal, file dropzone, horizontal slider, image crop editor, and serial tokens input now live in local owner folders;
  - `src/router/layouts/root-layout` now uses folder ownership;
  - `src/pages/dashboard` and `src/pages/stocks` now use folder ownership instead of flat page/style pairs.
  - `src/router/components`, `src/features/navigation/ui/app-overlay-host`, and `src/features/pwa/ui/pwa-status-banner` now also use owner-folder ownership instead of flat single-file owners.
  - `src/shared/ui/page-primitives` now keeps local CSS only for page rail/container/spacer geometry, while header/action/stack rhythm is owned by Mantine composition props;
  - `src/router/layouts/root-layout` suspense fallback no longer needs local CSS ownership and now uses Mantine layout props directly.
  - `src/features/navigation/ui/mobile-shell` now pushes shell utility action skin into Mantine props/theme ownership instead of keeping border/background/shadow/color defaults in local CSS.
  - `src/features/navigation/ui/mobile-bottom-nav` now exposes one shared bottom-navigation primitive skinned on top of Mantine `SegmentedControl` plus the route-aware shell wrapper; the current shell surface is a smaller floating glass dock with a migrating active pill/indicator, while local CSS stays focused on nav geometry and state selectors.
  - `src/features/navigation/ui/mobile-shell` now also expresses title-row and utility-group composition through Mantine owner props instead of local helper classes.
  - `src/features/navigation/ui/mobile-shell/network-status` now uses Mantine composition props for popover/telemetry layout, leaving `mobile-shell/styles.module.css` focused on shell header/main/footer geometry.
  - `src/pages/dashboard` and `src/pages/stocks` now also keep their touched local CSS mostly for layout rhythm, metric typography, and route-owned hover selectors; repeated surface fill/border/radius/padding rules have been pushed into Mantine `Paper` composition and shared theme defaults.
- scanner visual ownership is now partially localized:
  - `src/features/scanner/modal/styles.module.css` owns scanner modal geometry and tab/footer states;
  - `src/shared/ui/file-dropzone.module.css`, `image-crop-editor.module.css`, and `horizontal-slider.module.css` own their visual layout locally;
  - legacy class names are still preserved in DOM output for existing selectors/tests while the CSS source moves local.
  - `src/features/scanner/modal` now also uses Mantine `Paper` for reader/status/placeholder surfaces and relies on shared `Button`/`Tabs`/`Badge` defaults for more of its chrome; remaining local CSS is primarily fullscreen geometry, media positioning, and exceptional selectors.
  - `src/shared/ui/image-crop-editor` now uses Mantine `Paper` for cropper/controls surfaces and shared `ActionIcon` defaults for its control row; remaining local CSS is primarily cropper geometry.
  - `src/shared/ui/file-dropzone` now keeps local CSS mainly for dropzone layout/transition, while active/inactive chrome is pushed into owner props; `src/shared/ui/horizontal-slider` remains the current intentional custom-geometry exception in the scanner photo path.
- The current durable schema already defines:
  - suppliers
  - categories
  - products
  - arrivals
  - departures
  - drafts
  - recordCodes
  - settings
  - favorites
  - profiles
  - backupCheckpoints
  - backupHistory
- `CreateArrivalService` already follows the intended write pattern:
  - validates input via Zod
  - resolves related directory records
  - writes arrival and related codes transactionally
- Arrival create contract now distinguishes stale directory ids from confirmed inline creation and no longer silently auto-creates directories from name-only input.
- `UpdateArrivalService` now exists with the same strict directory resolution and deterministic code replacement policy.
- `DeleteArrivalService` now exists as the durable arrival delete boundary, with transactional owner-code cleanup and explicit blocking when linked departures exist.
- `ArrivalQueries.list()` and `ArrivalQueries.details()` now exist; list honors filter/sort/pagination/hasCodes and details returns arrival plus related codes.
- Arrival create/edit feature entry points are now wired through thin hooks, page modules, and the typed router surface.
- `CreateDepartureService` now exists as the first durable departure write boundary, with transactional linked-arrival validation and durable code replacement.
- `UpdateDepartureService` now exists as the durable departure update boundary, with explicit target lookup, linked-arrival validation, and deterministic code replacement.
- `DeleteDepartureService` now exists as the durable departure delete boundary, with transactional owner-code cleanup and explicit missing-target handling.
- Draft create/update entity-boundary services now exist with durable draft persistence and draft-owned record-code cleanup.
- `DraftQueries.list()` and `DraftQueries.details()` now exist; list honors filter/sort/pagination/hasCodes and details returns draft plus related codes.
- `DepartureQueries.list()` and `DepartureQueries.details()` now exist; list honors filter/sort/pagination/hasCodes and details returns departure plus related codes.
- `src/domain/queries` is now grouped by entity/area with a thin root barrel; the remaining structural work there is about future growth, not the current layout.
- `src/infrastructure/repositories` is now grouped by bounded area and closure-grade for the current durable table set.
- `src/infrastructure/services/journals/arrival.services.ts` now owns the arrival-specific service composition.
- `src/infrastructure/services/journals/departure.services.ts` now owns the departure-specific service composition.
- `src/infrastructure/services/index.ts` is now the public service composition root with only public re-exports and composed facades.
- canonical repository coverage is now governed as a table-level expectation:
  - every durable IndexedDB table should have one thin repository with base CRUD plus only table-specific helpers;
  - repository APIs stay table-local and must not turn into a second query layer;
  - support-domain tables may remain helper-light when their product role is lookup/normalization rather than standalone user workflow.
- `SettingRecord`, `FavoriteRecord`, and `ProfileRecord` now have thin repository foundations in `src/infrastructure/repositories`.
- settings/personalization now have canonical save/delete contour and thin repository normalization; durable data remains extensible and is not collapsed into a monolithic app-settings shape.
- `RecordCodeRecord` now has an explicit support-domain barrel plus shared normalized code-materialization helper in `src/domain/codes`.
- `recordCodes` now has canonical CRUD coverage plus normalized-value lookup/read query surface in the domain/infrastructure layer.
- `BackupCheckpointRecord` and `BackupHistoryRecord` now have thin repository foundations plus a minimal read surface in `src/infrastructure/queries`.
- `src/domain/backup` is now structurally normalized into `checkpoint/`, `history/`, and `restore/` families while keeping `app-backup.payload.ts` as the canonical root envelope and `index.ts` as a thin public boundary.
- `src/infrastructure/services/personalization/` now owns the personalization-specific service composition for settings, favorites, and profiles.
- `src/infrastructure/services/journals/arrival.services.ts` now owns the arrival-specific service composition.
- `src/infrastructure/services/journals/departure.services.ts` now owns the departure-specific service composition.
- `src/infrastructure/services/journals/draft.services.ts` now owns the draft-specific service composition.
- `src/infrastructure/services/backup/backup-export.services.ts` now owns the backup export service boundary.
- `src/infrastructure/services/backup/backup-import-validation.services.ts` now owns the backup import validation/report boundary.
- `src/infrastructure/serialization/json.engine.ts` now owns the reusable JSON serialization role; it no longer lives under backup ownership.
- `src/infrastructure/services/backup/backup-checkpoint.services.ts` now owns the backup snapshot/checkpoint service boundary. This slice is complete.
- `src/domain/backup` now also owns the restore orchestration contracts: restore modes, conflict/report model, commit plan shape, and restore service contract.
- `src/infrastructure/services/backup/backup-restore.services.ts` now owns the restore orchestrator/manager implementation and commits restore writes in IndexedDB, while current-state capture and restore-history shaping are pushed into service-adjacent helpers.
- The reusable technical roles around backup are now explicitly recognized as separate from backup semantics:
  - the JSON engine is a reusable serialization role, not backup domain truth, and it has been extracted to `src/infrastructure/serialization/json.engine.ts`;
  - the browser file adapter is a reusable browser adapter role, not backup domain truth;
  - merge/rebase/diff behavior lives in a reusable restore core rather than inside backup-specific orchestration.
- `src/infrastructure/services` is now closed at the bounded-area level; only the public root remains.
- `src/infrastructure/restore-core/restore-core.ts` now owns the reusable restore-core helpers for merge/rebase/diff planning.
- The full backup subsystem is functionally closed for V1, and backup-specific restore wiring has now passed the final stabilization audit.
- `src/features/departures/{data,editor}` is now closure-grade for the current first-data departure workflow: list, details, create, update, and delete are all routed through thin feature hooks.
- `src/features/drafts/{data,editor,publish}` is now closure-grade for the current first-data draft workflow: list, details, create, update, delete, and publish are all routed through thin feature hooks.
- `src/features/settings/hooks` is now closure-grade for the current first-data personalization workflow: settings, favorites, and profiles are all routed through thin feature hooks with honest save/delete semantics for settings and thin list/detail/save/delete adapters for favorites and profiles.
- `src/features/codes/hooks` is now closure-grade for the current record-code read surface: list, details, and lookup are all routed through thin feature hooks over the existing query boundary.
- `src/features/directories/hooks` is now closure-grade for the current directory read surface: supplier, product, and category list reads are all routed through thin feature hooks over the existing query boundary.
- `src/features/backup/hooks` is now closure-grade for the current backup surface: export, import validation, restore, checkpoint, checkpoint history, and history reads are all routed through thin feature hooks over the existing service/query/browser-adapter boundary.
- The first-data feature-hooks phase is now complete.
- `first-data closure-grade: yes`
- `leave-alone: yes`
- backup no longer blocks the first-data closure audit.
- Public first-data service/query/hook surfaces are now documentation-frozen enough to leave alone with the current architecture.
- UI should consume the existing first-data hooks/handles; reopening first data is no longer an active workstream and should happen only for new product scope or bugfix scope.
- The second-data scanner/buffer foundation now exists as explicit non-UI seams:
  - `src/features/buffer/core/model` owns the shared localStorage-backed buffer store with normalization, duplicate detection, FIFO overflow eviction, and machine-readable add/update/delete results;
  - `src/features/buffer/core/model` now also owns the non-UI buffer-apply session/controller seam for contextual picker request/result coordination with explicit copy-not-delete semantics;
  - `src/features/buffer/core/model` now also owns the non-UI buffer-control lease seam that distinguishes singleton buffer data ownership from exclusive interaction-control ownership;
  - `src/features/scanner/runtime/model` owns the scanner session store and controller seam for open/close, tab switching, permission/file/decode status reporting, and decoded-value submission into the shared buffer;
  - `src/features/navigation/model` owns single-overlay arbitration for scanner session, buffer picker, and settings overlays;
  - `src/infrastructure/browser/scanner` now owns the browser scanner adapter seam for live-camera and photo-file capabilities, lifecycle, machine-readable decode/failure results, and concrete ZXing-backed adapter implementations.
- These second-data seams now have both unit coverage at the pure/store/controller-contract level and targeted mobile-shaped Playwright coverage for the current non-camera flows.
- Second-data singleton truth is now fixed:
  - scanner is one global fullscreen modal surface rendered at app root and opened from multiple entrypoints;
  - buffer is one shared application-level second-data owner;
  - buffer page and buffer picker are separate surfaces over that same singleton buffer;
  - buffer control ownership is distinct from buffer data ownership and only one control lease may exist at a time;
  - buffer apply into forms must stay copy-based and must not delete source buffer items.
- `second-data closure-grade: yes`
- Further second-data work should now default to consumer expansion or runtime hardening only:
  - do not add new scanner/buffer orchestration seams unless a real new ownership problem appears;
  - stocks work should continue through `src/features/stocks/{data,adjustment,departure-prefill}` rather than a new durable stock owner.
- Storage-tier policy is now explicitly fixed in docs:
  - IndexedDB is first data and the source of truth for durable entities and durable metadata;
  - zustand/localStorage are second data only and may hold transient, runtime, session, or view state;
  - backup/import/export source-of-truth scope is first data only unless a future spec explicitly promotes a transient surface.
- `SerialTokensInput` from the new codebase is already a good reusable primitive for multiple code values.
- Product clarifications now fixed:
  - stocks are part of the first usable milestone;
  - V1 buffer remains one shared list;
  - `SKLAD` is still only a working name.

## 3. Confirmed misalignments / gaps

- The scanner/buffer second-data boundary layer now includes concrete ZXing wiring behind the browser-adapter contracts:
  - live camera scanning is implemented behind the live adapter contract;
  - photo/file decode is implemented behind the photo adapter contract;
  - broad multi-format ZXing coverage is configured through the browser/library path.
- The scanner runtime/controller seam can now consume the concrete live/photo ZXing browser adapters through explicit injected dependencies and controller-level integration methods.
- A minimal scanner modal UI now exists under the global app overlay host in the root layout:
  - it opens from the header scanner action;
  - it uses the existing runtime/controller, session store, overlay arbitration, and buffer store;
  - it exposes live and photo tabs plus visible status/error state;
  - successful photo/live decode still lands in the shared buffer.
- ZXing is now the implemented primary scanner-engine path in the new codebase.
- `html5-qrcode` has now been removed from `package.json`; the maintained scanner path in this repo is ZXing-only.
- Browser/runtime verification for scanner-sensitive behavior is still missing:
  - live camera permission flow and real camera capture are still not verified end-to-end in this environment;
  - no real-device scanner smoke yet.
- Browser/runtime verification for gesture and haptic behavior is also still missing:
  - one shared haptics adapter seam and one shared gesture hook seam now exist in code, but their browser/runtime behavior is not yet observed end-to-end in this environment;
  - no real-device confirmation exists yet for vibration availability, suppression, or fallback behavior across supported mobile browsers.
- The current non-camera second-data paths are now observed in mobile-shaped Playwright runs:
  - scanner modal open/close works from the global shell action;
  - photo decode adds a scanned code into the shared buffer;
  - oversized photo rejection is user-visible;
  - arrival picker/apply remains copy-not-delete;
  - departure picker/apply now preserves manually entered form codes during multi-apply;
  - buffer page edit/delete/bulk-clear actions mutate the singleton buffer correctly;
  - scanner and picker overlay handoff is observed in the current singleton flow.
  - the focused theme smoke now covers light/dark switching and the updated shell/theme surface contract in the mobile viewport.
- Current release-gate truth after the route-form smoke reset:
  - `check:text-integrity`, `typecheck`, `build`, `lint`, `stylelint`, `format:check`, and unit tests are locally green;
  - targeted mobile Playwright smoke is green for scanner modal, arrivals route create/duplicate/buffer apply, departures route create/link/buffer apply, buffer page/picker, backup, stocks coherence, route availability, and selected dashboard/settings/drafts layout slices;
  - full `npm run test:e2e` is not green yet: the latest local run passed 57 tests and failed 23 tests because older smoke specs still assert donor-era dialog, page-header, semantic-heading, device-preview, UI-kit, and shell-geometry contracts;
  - `first-release-ready: no` until the remaining e2e contract drift is reconciled or the release smoke set is explicitly narrowed and documented.
- Arrival create now rejects duplicate record-code values before writing the arrival record and surfaces the existing validation-error path to the route form; this is a bugfix on the first-data write boundary, not a first-data reopening.
- `/departures/create` now uses Mantine `DateTimePicker` from `@mantine/dates` for `occurredAt` while preserving the existing string-to-service boundary on submit.
- Scanner and buffer UI composition is still intentionally partial:
  - buffer page now exists as the singleton manage surface over the shared buffer store, with page-local sort/filter state plus edit/delete/bulk-clear actions;
  - minimal buffer picker/apply UI now exists as a glass bottom drawer over the existing non-UI apply seam;
  - arrival form now consumes that picker seam for code copy-only apply;
  - departure create is now a real route-owned workflow with manual linked-arrival selection, manual codes, global scanner entry, and copy-only buffer apply;
  - drafts, settings, and the missing arrival/departure detail/edit surfaces still include placeholder-only route pages in this IA slice;
  - no draft picker consumer yet.
- The second-data architecture is now closure-grade at the current seam layer:
  - scanner singleton semantics are fixed;
  - buffer singleton semantics are fixed;
  - buffer page vs picker ownership split is fixed and exercised by a real manage page over the singleton buffer;
  - the non-UI apply seam is consumed by the arrival form and the minimal departure form modal without breaking copy-not-delete semantics;
  - the non-UI buffer control lease seam is consumed by the buffer page manage surface plus the current picker lifetime and contextual scanner runtime entrypoints;
  - the remaining work is consumer breadth and runtime depth, not unresolved second-data ownership.
- Gesture and haptic repo truth now has an initial implemented slice, even though broad runtime rollout is still pending:
  - `src/shared/haptics/*` now owns the shared browser/device haptics seam with explicit unsupported / suppressed / triggered results;
  - `src/shared/gestures/*` now owns the shared swipe-gesture seam used for reusable touch interaction policy;
  - current first consumers are scanner modal notifications, buffer manage mutations, mobile-shell scanner entry tap, mobile bottom-nav route changes, and arrival/departure high-importance form alerts;
  - both seams remain progressive enhancement only and do not replace visible success/error/alert feedback.
- Concise next-step plan for the remaining broad rollout:
  1. Extend the shared haptics seam beyond the first scanner/form/mobile-shell consumers to the remaining high-importance alert and confirmation surfaces.
  2. Add broader gesture consumers only where touch handling is truly cross-surface and does not fight existing Mantine/native interactions.
  3. Add targeted tests around the shared gesture/haptics seams and the touched first consumers.
  4. Add real-device runtime verification for supported mobile browsers before calling gesture/haptic behavior release-grade.
- Departure update/delete flows exist at the domain/infrastructure boundary, and departure create now has a real route-owned page consumer; broader departure list/edit composition is still not implemented yet.
- Departure feature hooks are now implemented; departure pages/components should consume the flow through feature hooks rather than direct infrastructure access.
- Arrival delete flow now exists at the domain/infrastructure boundary, but the feature/UI composition slice is not implemented yet.
- Draft create/update/read/delete/publish flows now exist at the domain/infrastructure boundary.
  - publish consumes the source draft in the same transaction as target creation.
- Draft feature hooks are now implemented; draft pages/components should consume the flow through feature hooks rather than direct infrastructure access.
- Settings/personalization feature hooks are now implemented; settings, favorites, and profiles should consume the flow through feature hooks rather than direct infrastructure access.
- Backup export service boundary is now implemented; import validation/report is now implemented; restore/commit is now implemented; browser file adapter is now implemented and extracted into reusable infrastructure.
- Backup metadata boundary now exists, and export plus import validation/report plus JSON engine plus snapshot/checkpoint service plus restore orchestrator/manager implementation plus browser file adapter are now implemented; the JSON engine, browser file adapter, reusable restore-core helpers, and restore service-adjacent helpers have been extracted into reusable infrastructure areas.
- Backup/import/export semantics are now clarified: first data belongs in backup/export/import/restore; second data does not.
- Remaining stabilization gap before backup can be treated as leave-alone architecture: none identified.
- Backup/export/import/restore V1 design is now fixed in docs as an implementation-ready boundary:
  - `AppBackupPayload` is the canonical payload envelope;
  - export is first-data collection plus export service boundary plus reusable JSON engine plus browser-file adapter handoff;
  - import is shape/version validation plus pre-commit report plus explicit commit strategy selection;
  - restore/commit is a single IndexedDB transaction in V1 with overwrite, merge, or rebase strategy;
  - backup history is written on successful workflow commits, and checkpoints may be written when explicitly requested.
- The target reusable split for the backup-adjacent technical roles is now part of the architectural truth:
  - reusable JSON serialization should live outside backup semantics;
  - reusable browser file selection/download should live outside backup semantics;
  - reusable merge/rebase/diff core should be shared across backup restore planning rather than implemented inside backup-specific orchestration;
  - backup-specific contracts keep payload/report/result semantics and call into those reusable roles through connectors.
  - Products now have a route-owned `/products` surface reachable from settings and stocks; it consumes the existing product directory query/repository boundaries and edits product name/supplier/category/note/archive state through a narrow directory service rather than direct page-level Dexie access.
  - Stocks are part of the intended milestone and now have a dedicated `src/infrastructure/queries/stock/stock.queries.ts` read implementation plus a live route-owned stocks page consumer over `useStockList()`.
  - the current stock projection now derives unit balance from explicit journal `quantity` values first, then `recordCodes` as the serial-aware fallback, then legacy `amount` values when older records have no quantity;
  - the current stocks page now exposes stock-card actions without inventing a separate stock store: serial/code-backed rows can open a local details drawer, positive-balance rows can jump into departure create with route-state prefill, and quantity-only rows can apply a local adjustment modal that writes through the existing arrival/departure services;
  - the current stocks list chrome now also uses the shared `CollectionSection` owner, while the drawer and adjustment modal remain route-local to the stocks feature adapter;
  - serial/code-backed rows still treat adjustment as disabled rather than pretending there is quantity-style serial correction support;
  - this is still a derived read model, not a separate durable inventory entity or a finished stock-actions workflow.
- `src/infrastructure/services` is now closed at the bounded-area level; only the public root remains.
- Remaining project-level gaps now include the broader deferred scanner/buffer/UI work; first data no longer blocks that track.
- The current scanner/browser adapter seam is contract-first in shape and concrete in implementation:
  - capability reports are explicit and separate for live camera and photo/file modes;
  - decode outcomes now distinguish success, no-result, recoverable failure, and fatal failure through machine-readable codes;
  - lifecycle contracts now distinguish live session start/stop from photo decode;
  - concrete ZXing-backed live and photo adapters now sit behind those contracts.
- The browser adapter folder shape is now explicit current truth rather than an implementation accident:
  - repeated namespace words have been pushed into folders instead of long basenames;
  - `src/infrastructure/browser/scanner/` is now split into `adapters/`, `contracts/`, `runtime/`, and `zxing/`;
  - `src/infrastructure/browser/file/adapter.ts` is the canonical browser-file adapter owner.
- The current scanner/browser implementation is ZXing-backed, and its modal/runtime lifecycle has targeted runtime evidence:
  - browser adapter behavior is covered at the pure-helper level in unit tests;
  - scanner modal open/close, photo decode into buffer, oversized-file handling, arrival/departure picker apply, buffer-page manage actions, and scanner-to-picker overlay handoff are now observed in mobile-shaped Playwright runs;
  - the current scanner modal live surface now auto-starts live scanning on the live tab and uses the preview area itself as the manual pause/resume tap target instead of a separate play/pause icon button;
  - AR-0601B verified a real headed Chromium `MediaStream` on an integrated camera: preview `srcObject` was a `MediaStream`, a live video track was present, live-to-photo and modal close released the stream, and reopen restored a functional live stream;
  - barcode decode success is still not verified as a product/runtime claim.
- The outdated donor-era scanner photo/decode smoke specs are no longer part of the active verification surface; the maintained browser evidence now follows the current ZXing-backed scanner modal flow.
- Local code-quality verification now has one canonical repo-wide command:
  - `npm run verify:all`
  - it runs autofix first, then reruns lint, typecheck, prettier check, and stylelint
  - it is expected to continue through all stages and fail only at the end so the full error surface is visible in one run
- The current scanner modal UI should now be treated as a probe surface over the existing second-data seams:
  - it is sufficient for exercising the scanner runtime and buffer destination path;
  - it should not grow into broader scanner/buffer/form orchestration before the remaining non-UI closure work is judged complete.
- The current route-first IA is ahead of full workflow rollout:
  - arrivals/departures/drafts/settings route subtrees are explicit in the route tree;
  - settings hub/profile/about pages are compact route-owned surfaces, while `/settings/profile` now owns Google account connection state and `/settings/backup` exposes local export/import validation/restore/checkpoint/history plus optional Google Drive backup controls over the existing backup payload boundary;
  - route ownership is current truth, but full business content is not.
- A verification-only fullscreen `/device-preview` route now exists as current truth for desktop inspection of mobile positioning:
  - it lives outside `RootLayout` and outside the main app shell, so the iframe preview does not duplicate the product shell around itself;
  - it renders the real hash-route app surface inside a framed iframe rather than pretending desktop resize equals device geometry;
  - it exposes phone presets plus an adjustable DPR field for QA alignment, while remaining a desktop proof surface rather than a second product route;
  - `/device-preview` and `/ui-kit` are dev-only verification routes and are intentionally excluded from the production route tree and production bundle.
- The current help/loading/shell policy must be read carefully:
  - canonical policy for touched/future surfaces is `Loader` for root/global loading, `LoadingOverlay` for blocking form/section pending state, and `Skeleton` for placeholder loading;
  - canonical help policy for touched/future surfaces is `ActionIcon` trigger with `Tooltip`, `Popover`, or `Modal` depending on content length/context;
  - `Accordion` and `Collapse` remain valid only for inline expandable content, not as the cross-app help default; settings placeholder note/detail/build toggles have been removed rather than treated as a help pattern;
  - Mantine `AppShell` is now the implemented app-level shell direction; keep overlay ownership separate at the root overlay host instead of pushing scanner ownership into route pages or provider wiring.
- Styling migration is now in an active staged state:
  - Mantine theme tokens plus root PostCSS tooling are the canonical base for new visual work;
  - Mantine composition/theme ownership is now the default for touched visual React surfaces;
  - colocated CSS modules remain allowed only for owner-local geometry, media surfaces, and advanced selectors;
  - when CSS modules remain the honest owner, they should be written with owner-scoped variables and modern selectors/features that actually reduce duplication rather than with repeated per-element surface recipes;
  - legacy global stylesheet ownership has been eliminated;
  - theme-level token emission now uses the canonical `--sl-*` vocabulary for live shell/page ownership instead of keeping parallel legacy alias namespaces;
  - shared page primitives and shell/navigation foundation owners are now being normalized into component folders;
  - shared theme component defaults now also cover elevated surfaces, filled inputs, pills, file input, checkbox defaults, and related control rhythm so touched pages rely less on page-local visual CSS.
- `src/infrastructure/services/index.ts` no longer contains personalization-specific, arrival-specific, departure-specific, or draft-specific composition logic.
- `src/features/arrivals/{data,editor}` now owns the arrival feature-hook surface for list, details, create, update, and delete.
- `src/features/departures/{data,editor}` now owns the departure feature-hook surface for list, details, create, update, and delete.
- `src/features/drafts/{data,editor,publish}` now owns the draft feature-hook surface for list, details, create, update, delete, and publish.
- `src/features/stocks/data` owns the current derived stock read hook; `src/features/stocks/adjustment` and `src/features/stocks/departure-prefill` own the route-consumed stock workflows.
- `home` is not tracked as a first-data hook target.
- Current post-hardening structural truth:
  - generic storage/domain-agnostic query helpers now live in `src/shared/utils/query/`; `domain/queries/*` owns DTO contracts only, `infrastructure/queries/*` consumes the shared helpers, and no generic helper implementation remains under `src/domain/common/query-helpers/`;
  - `matchesDateRange` uses a structural generic range shape instead of importing domain `DateRange`, while `DateRange` remains a domain/common value object for product/domain contracts that need it;
- validation message keys now derive from `src/domain/validation/validation-error-codes.ts`, and localized catalogs stay outside the domain validation boundary;
  - `src/features/arrivals/data/hooks/use-arrival-list.ts` now points to the concrete `infrastructure/queries/journals/arrival.queries.ts` implementation and remains a thin read adapter;
  - `pages/dashboard/dashboard-page.tsx` still references an `inventory-queries` path that does not exist in the new snapshot;
  - route scaffolding is now restored to the canonical arrival/departure/draft/settings subtree shape, but several route families beyond the touched list surfaces still remain partial; arrivals/departures list routes plus buffer/stocks list shells are now real working surfaces instead of placeholder-only route probes.
- Arrival read contracts are now explicit; the remaining read-side gap is feature UI composition, not the infrastructure contract itself.
- There are no tests in `src.zip`; QA confidence still depends on donor repo tooling until the new code is merged and verified in the actual repo.
- Some files contain BOM markers and commented scaffolding.
- UI refactors and scanner/buffer feature work are intentionally deferred until the durable entity-management boundaries are complete.
- `src/domain/codes` and `src/domain/directories` are support domains and are now treated as boundary-complete for the current product truth: records stay explicit, repositories stay thin, and query support remains separate from feature UI.

## 4. High-priority implementation risks

1. **Donor inheritance risk**
   Reusing mature scanner/buffer/stocks/backup code from the donor is good, but reintroducing donor-only inventory assumptions would distort the new product truth.

2. **UI-before-boundary risk**
   The new `src/` already has navigation and route scaffolding ahead of completed feature slices. If coding shifts to UI/scanner/buffer work before the durable entity-management boundaries are complete, debt will accumulate faster than usable behavior.

3. **Derived-stock consistency risk**
   Because stocks are in the first usable milestone, arrival/departure journals and code linkage must be implemented coherently before stock projection is declared done.

4. **Post-hardening verification risk**
   The current worktree remains dirty and unstaged from the hardening wave. Barcode decode success and valid import restore commit against an isolated fixture are still not verified; destructive restore must not be claimed from the AR-0803 smoke. `form-preferences`, the directory wrapper, and first-data `*.ports.ts` naming debt remain intentionally deferred.

## 5. Confirmed completed work

### 2026-04-20 — architecture foundation snapshot normalized

- New source tree already expresses the target layered direction: `app`, `router`, `pages`, `features`, `domain`, `infrastructure`, `shared`.
- Durable schema for the intended canonical tables is already in place.
- Arrival create service and arrival query establish the initial write/read contract shape for future slices.

### 2026-04-20 — donor analysis completed

- Legacy donor project was reviewed as a reference implementation.
- Donor strengths identified for reuse:
  - fullscreen scanner modal lifecycle
  - buffer management UX
  - tokenized code input
  - backup/import discipline
  - mobile shell patterns
  - stock/read-model presentation patterns
  - real-device-aware scanner handling
- Donor assumptions explicitly rejected as canonical truth for the new project:
  - inventory-only product scope
  - scanner engine lock-in to `html5-qrcode`
  - localStorage as durable settings store

### 2026-04-20 — archive audit clarified

- Confirmed that `src.zip` intentionally omits repo-root files and should be combined with donor root.
- Confirmed that some missing pieces are intentional scope gaps, while others are concrete unresolved imports/placeholders that need cleanup before claiming runtime readiness.

## 6. Immediate order of work

1. Treat first data as leave-alone unless a new product task or bugfix explicitly reopens it.
2. Close the remaining second-data inter-surface contract work before more UI:
   - keep the new non-UI buffer apply request/result seam stable and consume it from future UI;
   - keep scanner as one global modal and buffer as one global second-data owner;
   - do not let buffer page or picker invent separate buffer ownership.
3. Keep optional stocks follow-up separate unless that derived read layer is explicitly resumed.
4. Only reopen first-data boundaries for:
   - a new product scope decision;
   - a correctness bug;
   - a regression found by later verification.
5. After the boundary layer is complete, do the structural cleanup slices:
   - keep `domain/queries` grouped by entity/area as the standard layout
   - keep `infrastructure/repositories` grouped by bounded area, table-local, and thin
   - split `src/infrastructure/services` behind a thin public root, starting with `personalization/`, then `journals/arrival`, `journals/departure`, and `journals/draft`
   - move any generic query helpers out of domain-local buckets and into the shared query helper layer if they still remain there
6. For service extraction follow-up work, use this order:
   - extract `journals/arrival` next;
   - keep transaction policy local to the bounded area being extracted;
   - preserve the existing public root export surface while the split continues;
   - stop after one bounded area per slice.
7. For repository coverage follow-up work, use this order:
   - keep canonical CRUD coverage locked to the existing durable tables before adding new durable tables;
   - add only table-specific helpers that are justified by a real index or owner-scoped operation;
   - treat support domains (`codes`, `directories`) as boundary-complete unless product scope adds direct management flows;
   - extend backup metadata or settings only when the product adds a new durable table or a new table-local lookup requirement.
8. For backup/export/import/restore follow-up work, use this order:

- keep browser file I/O as an adapter layer only;
- add narrower merge or partial-restore modes only after V1 all-or-nothing restore is complete and documented;
- do not move feature hooks ahead of first-data plus backup closure.

10. Feature hooks have completed the first-data phase; arrivals, departures, drafts, settings, codes, directories, and backup hooks are closed surfaces in that phase.

## Rules

- Keep this file as operational truth, not as a full work log.
- Update it when a slice changes what is actually true about behavior, schema, or current risks.

## 2026-04-23 touched UI foundation truth

- `/ui-kit` remains the canonical dev-only implementation-proof surface for theme slices.
- `/ui-kit` is also the canonical dev-only source of example usage for shared theme-driven components, component states, and proof-surface composition patterns.
- The current proof surface now covers:
  - section A: color system
  - section B: typography system
  - section C: spacing, radius, shadows, surfaces, and focus ring
  - section D1: action primitives and text-entry primitives
  - section D2: selection and picker primitives
  - section D3: feedback and container primitives with overlay size ladders plus live alert/notification/loading/overlay state toggles
  - section D4: navigation, progress, and display primitives with live burger, pagination, stepper, progress, ring-progress, and mark demos
  - section F: state matrix and status language for button/input/list-row/tab/segment states plus semantic status badges and light/dark parity previews
  - section G: iconography contract for canonical pack choice, size guidance, action-icon usage, navigation usage, and categorized icon examples
- `/ui-kit` is now intentionally interactive, not static-only:
  - D3 and D4 demos expose state changes and lightweight motion so the proof surface shows both appearance and behavior;
  - this includes a ui-kit-only live-demo motion exception so proof-surface feedback/loading samples still animate even when system reduced-motion settings would otherwise suppress them.
  - section F now reuses the same proof-surface approach for state language: selected, hover, focus, disabled, validation, pending, empty, and dark-mode examples are rendered as system states rather than business flows.
- `/ui-kit` now also demonstrates Mantine hooks paired directly with Mantine primitives:
  - `useDisclosure` controls local overlay/live-demo state;
  - `useHover` and `useFocusWithin` drive component-state feedback on interactive proof cards;
  - `useInterval` and `useReducedMotion` drive the live motion/progress preview block.
- Iconography truth is now explicit:
  - the canonical pack is `@tabler/icons-react`;
  - the current contract uses one outline style with inherited color and a fixed stroke width;
  - recommended sizes are role-based and documented in `src/app/theme/iconography/*` plus `/ui-kit` section G.
- Layout-token ownership stays under `src/app/theme/layout/*` and semantic surface/focus roles stay under `theme.other`.
- Layout-token truth is now explicit:
  - touched layout composition must work at the canonical `360px` base viewport before any enhancement tier is considered;
  - `428px` is the first large-phone enhancement tier, not the default mobile baseline;
  - compact route/layout owners should reason against the `352px` dense-content guardrail for safe composition inside the shell.
- Action and text-entry primitive defaults are now normalized through `src/app/theme/components/*`, with shared input styling owned at the `Input` layer; search remains a Mantine composition pattern, not a shared wrapper.
- The D1 component size ladder now extends below Mantine `xs`: `Button`, `ActionIcon`, and `Input` support `xxs` and `xxxs` through theme-owned vars for dense utility controls.
- Selection and picker defaults are now normalized through `Select`/`NativeSelect`/`Checkbox`/`Radio`/`Switch`/`SegmentedControl`/`Tabs`/`Badge` plus `Pill`/`PillsInput`/`TagsInput`; `/ui-kit` now also demonstrates supported date/time pickers from `@mantine/dates`.
