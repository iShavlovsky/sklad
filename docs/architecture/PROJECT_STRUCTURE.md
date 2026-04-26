# PROJECT_STRUCTURE

## 1. Repository layout

- `src/app/`
  - bootstrap, providers, theme, app-level composition only
- `src/router/`
  - typed route tree, route helpers, navigation boundary, hash-router wiring
  - explicit route-first subtree for `arrivals`, `departures`, `drafts`, `buffer`, and `settings`
  - explicit settings subtree for `/settings`, `/settings/profile`, `/settings/backup`, and `/settings/about`
- `src/pages/`
  - route-owned screen entry points and route-local composition
  - canonical touched-route pattern is `pages/<route>/` with `<route>-page.tsx`, `sections/`, `dialogs/`, and `lib/`
  - default page rhythm is mobile-first and composed through shared page primitives over the shell-owned rail
- `src/features/`
  - reusable business/workflow slices, not route-local page composition
  - current touched examples: `arrival-editor`, `arrivals-data`, `departure-editor`, `departures-data`, `drafts-data`, `draft-publish`, `stocks-data`, `stock-adjustment`, `stock-departure-prefill`, `buffer-core`, `buffer-picker`, `scanner-runtime`
  - `codes/` closes the current support-domain record-code hook surface
- `src/domain/`
  - durable product truth and use-case contracts
- `src/infrastructure/`
  - Dexie, repositories, services, queries, browser adapters, service composition root
- `src/infrastructure/serialization/`
  - reusable JSON engines and payload serializers
- `src/infrastructure/browser/file/`
  - reusable browser file selection/download adapters
- `src/infrastructure/browser/scanner/`
  - reusable browser scanner adapter contracts for live camera and photo/file decode
- `src/infrastructure/restore-core/`
  - reusable diff / merge / rebase core for restore planning
- `src/infrastructure/backup/`
  - current holding area for backup-adjacent technical code during extraction; not the target owner of reusable JSON/file/restore-core roles
- `src/shared/`
  - generic utilities, generic UI, i18n, route helpers
  - canonical home for the shared gesture hook and shared haptics adapter seams
  - `shared/ui/collection-section` is the current generic mobile list-section owner for arrivals, departures, drafts, buffer, and stocks; route-local sections keep data/query meaning outside `shared/`
- repo root reused from donor for now:
  - `package.json`, `vite.config.ts`, `tsconfig*`, public assets, Playwright config, and baseline tool wiring
- `docs/`
  - project truth, status, QA, execution contract
- `handoff/`
  - initial project package and handoff notes

## 2. Module ownership

### `domain/entries/*`

- owns arrival/departure records, schemas, inputs/results, services
- does belong:
  - commit validation
  - normalization logic
  - publish/write orchestration contracts
- does not belong:
  - Dexie table calls
  - React hooks
  - Mantine-specific UI concerns

### `domain/drafts/*`

- owns draft payload shapes and publish-related contracts
- does belong:
  - incomplete payload shapes
  - publish target semantics
  - publish orchestration contract that maps a draft into the target create input and defines draft-consumption behavior
- does not belong:
  - page routing
  - scanner runtime

### `domain/settings/*`

- owns persisted personalization records and write-side CRUD contracts
- does belong:
  - `SettingRecord`, `FavoriteRecord`, `ProfileRecord`
  - save/delete services and repository ports for these durable records
  - key-based settings persistence semantics
- does not belong:
  - browser storage adapters
  - UI state
  - backup/import/export orchestration
- controlled drift rule:
  - journal-style entity domains use explicit `create/update/delete/write` substructure
  - key-based settings/personalization may use a simpler save/delete shape when that is the honest model
  - support domains may also drift from journal structure when the product semantics are narrower than record lifecycles
- target shape:
  - keep settings as extensible key/value durable data
  - keep favorites and profiles as durable personalization tables with canonical CRUD
  - keep read-model DTOs in `domain/queries/personalization/*`, not in repositories

### `domain/codes/*`

- owns durable record code contracts, normalization, and code-record materialization helpers
- does belong:
  - `RecordCodeRecord`, `RecordCodeInput`
  - normalized-value helpers for durable code rows
  - owner-scoped record-code construction reused by arrival, departure, and draft writes
- does not belong:
  - scanner runtime
  - feature UI or buffer state
  - cross-table lookup orchestration

### `domain/backup/*`

- owns the canonical backup payload at root plus one semantic family level for backup-specific workflows
- backup families:
  - `export/`
  - `import/`
  - `checkpoint/`
  - `history/`
  - `restore/`
- root boundary:
  - `app-backup.payload.ts` stays canonical
  - `index.ts` stays thin and public
- does belong:
  - `AppBackupPayload`
  - `BackupCheckpointRecord`
  - `BackupHistoryRecord`
  - checkpoint details/input/report/result/service contracts
  - history details contract
  - restore mode/conflict/plan/report/result/service contracts
  - backup export/import validation/result contracts
  - backup-specific planner/connector contracts that translate payloads to reusable technical cores
- does not belong:
  - JSON parsing/stringifying
  - browser file I/O
  - reusable diff / merge / rebase core
  - restore commit policy implementation

### `domain/queries/*`

- owns read-model DTO contracts
- does belong:
  - list filter/sort/pagination contracts
- does not belong:
  - Dexie implementation details
  - generic storage-agnostic query helpers; current helper code lives in `src/domain/common/query-helpers/` and is accepted there as shared utility layer
- target shape once the query family keeps growing:
  - group contracts by entity/area first, then keep a thin root barrel
  - prefer `arrival/`, `departure/`, `draft/`, `directory/`, `record-code/`, and `stock/` subfolders over an ever-growing flat root
  - keep query helpers out of this folder unless they are part of the contract surface itself

### `domain/validation/*`

- owns machine-readable validation contracts
- does belong:
  - `ValidationErrorCode`
  - `ValidationIssue`
  - `mapZodIssues`
- does not belong:
  - localized message catalogs
  - UI text
  - schema-specific business rules beyond issue mapping
- target shape:
  - keep the root barrel thin and explicit
  - keep validation codes stable because other layers and i18n derive from them

### `infrastructure/db/*`

- owns database name, schema, migrations, tables, appDb wiring
- does not belong:
  - feature hooks
  - business validation

### `infrastructure/backup/*`

- current holding area for backup-adjacent technical roles while the reusable split is being extracted
- does belong:
  - temporary bridge code that still wires backup services to reusable serialization, file, and restore-core layers
- does not belong:
  - domain backup contracts
  - restore commit policy
  - checkpoint/history workflow decisions

### `infrastructure/browser/scanner/*`

- owns the browser scanner adapter boundary for second-data scanner work
- does belong:
  - live camera capability reporting contracts
  - photo/file capability reporting contracts
  - live-session start/stop contract and handle shape
  - photo decode contract shape
  - machine-readable decode/no-result/recoverable/fatal result codes
  - browser/media error mapping helpers that stay outside feature state
- does not belong:
  - scanner modal UI
  - buffer mutations or buffer persistence policy
  - arrival/departure/draft business rules
  - feature-level orchestration or duplicate session stores
- ownership split:
  - `adapters/live.ts` is the live camera session boundary
  - `adapters/photo.ts` is the photo/file decode boundary
  - `contracts/capability-report.ts` separates live vs photo capability contracts
  - `contracts/decode-result.ts` owns machine-readable adapter result and error-code contracts
  - `runtime/controller.ts` owns browser-facing scanner runtime composition
  - `zxing/*` owns ZXing-specific decode hints and error mapping

### `infrastructure/repositories/*`

- owns thin table adapters
- does belong:
  - basic CRUD / lookup helpers
- does not belong:
  - multi-table business rules
  - UI-specific assumptions
- target shape:
  - group concrete repositories into one semantic level by bounded area
  - keep `base/` as the only shared subfolder
  - repository methods stay table-local and do not become a second query layer
  - every durable table gets one canonical repository surface with base CRUD plus only table-specific indexed lookups
  - allowed table-specific helpers are narrow and direct, for example `findByNormalizedName`, `countByBasedOnArrivalId`, `listByOwner`, `findByNormalizedValue`, `replaceOwnerCodes`, and `deleteOwnerCodes`
  - repositories do not own cross-table workflows, UI assumptions, or query-style filtering/sorting/pagination
  - when a durable table exists in IndexedDB, the repository layer should be audited against this template before feature work expands
  - current repository coverage is closure-grade for the current durable table set

### `infrastructure/services/*`

- owns the public service composition root and bounded-area orchestration modules
- does belong:
  - repository instantiation
  - transaction wrappers
  - dependency bundle assembly
  - service facade exports
- does not belong:
  - business rules
  - read-model shaping
  - UI state
- target shape:
  - keep `index.ts` as the only public composition root
  - place area-specific wiring under `journals/`, `personalization/`, and `backup/` only when the split stays bounded and direct
  - avoid decorative barrels or an extra generic service layer
  - `personalization/`, `journals/arrival`, `journals/departure`, `journals/draft`, `backup/backup-export.services.ts`, `backup/backup-import-validation.services.ts`, and `backup/backup-checkpoint.services.ts` are already extracted
  - `backup/backup-restore.services.ts` remains the backup-specific restore orchestrator/manager implementation
  - `backup/backup-restore.state.ts` and `backup/backup-restore.commit.ts` are internal service-adjacent helpers for current-state capture and restore-history/payload commit shaping
  - reusable JSON serialization lives under `src/infrastructure/serialization/`
  - reusable browser file adapter code lives under `src/infrastructure/browser/file/`
  - reusable restore core lives under `src/infrastructure/restore-core/`
  - backup-specific services consume those reusable areas through explicit connectors and keep backup payload/report/result semantics in `src/domain/backup`

#### Canonical repository coverage matrix

| Durable table       | Required base CRUD coverage                | Current repository coverage                      | Missing CRUD ops | Allowed table-specific ops                                                      | Query/service boundary status                                      |
| ------------------- | ------------------------------------------ | ------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `arrivals`          | `getById` / `put` / `delete` / `listByIds` | `ArrivalRepository` on `BaseRepository`          | none             | none currently; table-specific behavior lives in services/queries               | query surface present; write boundary present                      |
| `departures`        | `getById` / `put` / `delete` / `listByIds` | `DepartureRepository` on `BaseRepository`        | none             | `countByBasedOnArrivalId`                                                       | query surface present; write boundary present                      |
| `drafts`            | `getById` / `put` / `delete` / `listByIds` | `DraftRepository` on `BaseRepository`            | none             | none currently; table-specific behavior lives in services/queries               | query surface present; write boundary present                      |
| `recordCodes`       | `getById` / `put` / `delete` / `listByIds` | `RecordCodeRepository` on `BaseRepository`       | none             | `listByOwner`, `findByNormalizedValue`, `replaceOwnerCodes`, `deleteOwnerCodes` | query/read surface present; write boundary present                 |
| `suppliers`         | `getById` / `put` / `delete` / `listByIds` | `SupplierRepository` on `BaseNamedRepository`    | none             | `findByNormalizedName` inherited from named base                                | query surface present; support-domain only                         |
| `products`          | `getById` / `put` / `delete` / `listByIds` | `ProductRepository` on `BaseNamedRepository`     | none             | `findByNormalizedName` inherited from named base                                | query surface present; support-domain only                         |
| `categories`        | `getById` / `put` / `delete` / `listByIds` | `CategoryRepository` on `BaseNamedRepository`    | none             | `findByNormalizedName` inherited from named base                                | query surface present; support-domain only                         |
| `settings`          | `getByKey` / `put` / `delete` / `list`     | `SettingsRepository`                             | none             | `getByKey` and `list` are table-specific key/value helpers                      | query surface present; write surface present                       |
| `favorites`         | `getById` / `put` / `delete` / `listByIds` | `FavoriteRepository` on `BaseRepository`         | none             | `list`                                                                          | query surface present; write surface present                       |
| `profiles`          | `getById` / `put` / `delete` / `listByIds` | `ProfileRepository` on `BaseRepository`          | none             | `list`                                                                          | query surface present; write surface present                       |
| `backupCheckpoints` | `getById` / `put` / `delete` / `listByIds` | `BackupCheckpointRepository` on `BaseRepository` | none             | `list`                                                                          | query surface present; write/service boundary still workflow-bound |
| `backupHistory`     | `getById` / `put` / `delete` / `listByIds` | `BackupHistoryRepository` on `BaseRepository`    | none             | `list`                                                                          | query surface present; write/service boundary still workflow-bound |

### `infrastructure/queries/*`

- owns Dexie-backed read implementations, grouped by bounded area:
  - `journals/` for arrivals, departures, and drafts
  - `directories/` for suppliers, products, and categories
  - `personalization/` for settings, favorites, and profiles
  - `codes/` for record-code lookup/listing
  - `backup/` for backup metadata reads
  - `stock/` for the derived stock read model
- does belong:
  - filtering
  - sorting
  - projections
  - query execution strategy
- does not belong:
  - form state
  - component rendering

### `features/scanner/*`

- owns the one global scanner modal surface, camera/file session control, scanner-related status UI, and contextual scanner entry handling
- the scanner host is rendered through the root-layout overlay host rather than buried inside a route page
- scanner is opened from multiple entrypoints, but those entrypoints do not own separate scanner instances
- scanner tactile policy should be consumed here through the shared haptics adapter, not reimplemented with raw browser calls inside modal sections
- does not belong:
  - durable arrival/departure writes
  - directory persistence rules
  - buffer picker ownership

### shared gesture and haptic seams

- intended shared seams:
  - one reusable gesture hook for cross-surface touch/pointer interaction policy;
  - one reusable haptics adapter for browser/device vibration capability and pattern dispatch.
- does belong:
  - capability detection;
  - progressive-enhancement fallback handling;
  - normalized success / warning / error / confirm haptic pattern mapping;
  - reusable gesture semantics that are truly cross-surface.
- does not belong:
  - page-specific business actions;
  - scanner domain decisions;
  - alert copy or route-local orchestration.
- adoption rule:
  - feature surfaces should consume these shared seams instead of creating local `navigator.vibrate(...)` helpers or bespoke swipe/press stacks.

### `features/buffer/*`

- owns the one shared buffer data owner plus its two UI surfaces:
  - the full buffer-management page
  - the contextual quick-access picker/apply surface
- owns the non-UI apply session/controller seam that coordinates picker request/result payloads separately from overlay identity
- owns the non-UI buffer control lease seam that coordinates exclusive interaction control separately from buffer data ownership
- the buffer manage page now consumes the shared `CollectionSection` owner through the local page adapter while keeping selection/delete/clear/edit semantics feature-local
- buffer page and picker are separate surfaces over the same singleton buffer store
- applying buffer values into forms is copy-based and must not delete the source buffer item
- does not belong:
  - arrival/departure commit logic

### App-level surface ownership rule

- Route:
  - use for primary screens and route-first subtree leaves
  - current implemented examples: arrivals/departures/drafts pages, buffer page, settings hub/profile/backup/about
- Global overlay:
  - use for app-level singleton surfaces opened from many entrypoints
  - current implemented example: scanner modal through `AppOverlayHost`
- Contextual modal/picker:
  - use for requester-scoped selection/help flows that should return to the active route surface
  - current implemented example: buffer picker bottom drawer

### Current second-data seam inventory

- `features/buffer/model/buffer-store*`
  - unique role: singleton buffer data owner, persistence policy, duplicate handling, overflow policy, and canonical item CRUD
- `features/buffer/model/buffer-apply*`
  - unique role: non-UI request/result seam for contextual apply by copy; owns picker payload state, not overlay identity
- `features/buffer/model/buffer-control*`
  - unique role: exclusive interaction-control lease over the singleton buffer without changing buffer data ownership
  - current status: consumed by the buffer-page manage surface, by the current picker/controller flow, and by contextual scanner runtime entrypoints
- `features/scanner/model/scanner-session*`
  - unique role: scanner session state for entrypoint, tab, permission, decode/file status, and session lifecycle
- `features/scanner/model/scanner-runtime-controller*`
  - unique role: scanner orchestration over scanner session, overlay arbitration, buffer submission, and browser scanner adapters
- `features/navigation/model/overlay-arbitration*`
  - unique role: narrow global overlay identity arbitration only; no payload ownership
- `infrastructure/browser/scanner/*`
  - unique role: browser scanner boundary for live/photo capability, lifecycle, decode result mapping, and ZXing-backed browser implementation

### Second-data guardrails

- The current second-data seam count is near the acceptable ceiling.
- Future slices should consume these seams rather than add parallel siblings.
- No new store unless it owns genuinely new state or lifecycle that does not already fit one of the seams above.
- No new controller unless it coordinates 2+ seams with real orchestration logic that cannot live honestly in an existing controller.
- No new connector unless it isolates a real external boundary or composition-root concern.
- Do not add wrappers that only proxy, rename, or lightly reshape an existing seam API.
- Prefer extending the seam that already owns the concern instead of introducing a wrapper-around-a-wrapper.
- New second-data abstractions are now exception-only and must be justified in the slice report and reflected in docs when adopted.

### `features/arrivals/*`, `features/departures/*`, `features/drafts/*`, `features/directories/*`, `features/stocks/*`

- own form composition, page-level orchestration, and feature-local hooks
- arrivals, departures, drafts, and stocks now also own route-local list adapters on top of the shared `CollectionSection` shell; search/filter/sort state and card/footer behavior stay here instead of moving into `shared/`
- arrivals hooks explicitly cover list/details/create/update/delete and stay thin over the domain/infrastructure boundary
- departures hooks explicitly cover list/details/create/update/delete and stay thin over the domain/infrastructure boundary
- drafts hooks explicitly cover list/details/create/update/delete/publish and stay thin over the domain/infrastructure boundary
- directories hooks explicitly cover supplier/product/category list reads and stay thin over the domain/infrastructure boundary
- do not belong:
  - raw camera lifecycle
  - direct Dexie access

### `features/settings/*`

- owns personalization feature hooks and thin feature-local orchestration
- settings hooks explicitly cover list/details/save/delete with honest save/delete semantics for key-based durable data
- favorites hooks explicitly cover list/details/save/delete
- profiles hooks explicitly cover list/details/save/delete
- does not belong:
  - direct Dexie access
  - business rules
  - fake CRUD symmetry for settings

### `features/codes/*`

- owns record-code feature hooks for the current read surface
- `useRecordCodeList`, `useRecordCodeDetails`, and `useRecordCodeLookup` are the only current hook entry points
- does not belong:
  - direct Dexie access
  - business rules
  - fake write CRUD symmetry for a support domain without an independent write workflow

### `features/backup/*`

- owns backup feature hooks for export, import validation, restore, checkpoint creation, checkpoint history, and history reads
- export and import validation hooks may compose the browser file adapter, but they do not reimplement backup business logic in React
- does not belong:
  - direct Dexie access
  - backup business logic
  - manual browser file adapter wiring in pages/components

### First-data freeze

- the first-data stack is closure-grade and leave-alone
- the public first-data surface is documentation-frozen at the current service/query/hook boundary
- UI work should consume the existing first-data hooks/handles rather than reopen first-data boundaries
- future first-data changes should be treated as new product scope or bugfix scope

### Folder shape rule

- keep a folder flat while it owns one cohesive slice and the file list is still small
- introduce one semantic subfolder level when a folder starts holding clearly distinct subareas that evolve independently, or when a local helper starts acting like a second slice
- when filenames start repeating the same namespace word, move that namespace into a folder instead of lengthening basenames
  - prefer `scanner/runtime/controller.ts` over `browser-scanner-runtime-controller.ts`
  - prefer `scanner/adapters/live.ts` over `live-scanner-adapter.ts`
  - prefer `file/adapter.ts` over `browser-file-adapter.ts`
- for non-trivial UI owners, prefer a component folder over flat sibling `tsx`/`module.css` files:
  - default shape is `index.tsx` plus optional `styles.module.css`, `types.ts`, or explicitly named local helpers
  - if two closely related UI parts share one stylesheet, keep both under the same local owner folder
  - do not keep unrelated UI entities as long-term flat siblings in one folder
- practical depth limit:
  - prefer at most one semantic subfolder below the slice root
  - fixed namespace folders like `entries`, `queries`, `i18n`, or `validation` do not justify stacking additional generic layers
- forbidden dumping grounds:
  - `utils.ts`
  - `helpers.ts`
  - `common.ts`
  - `misc.ts`
  - other catch-all names that hide responsibility instead of naming it
- Arrival examples:
  - `src/domain/entries/arrival/` stays the contract root for arrival records, create/update services, and query-facing DTOs
  - `src/domain/entries/arrival/write/arrival-write.ts` is the shared pure write helper boundary reused by create and update
  - `src/shared/i18n/arrival/create/` and `src/shared/i18n/arrival/update/` hold operation-specific message bundles
  - do not add generic `helpers.ts` or `common.ts` files when a more specific semantic name is available

### `shared/*`

- owns only product-agnostic helpers and primitives
- `shared/ui/collection-section` is intentionally UI-only: generic search/filter/sort/selection/list/footer composition with render-prop cards
- does not belong:
  - arrival/departure/draft-specific normalization
  - scanner/business semantics
  - backup conflict rules

### UI policy notes

- Current implemented truth:
  - root shell now uses Mantine `AppShell`
  - route pages use shared page primitives plus the shell-owned rail layout rhythm
  - `PageSection` already exposes `ActionIcon` + `Popover` help
  - shared page primitives, shell, and bottom-nav owners now follow component-folder structure instead of flat sibling files
- Approved-next policy:
  - loading vocabulary is fixed as `Loader` / `LoadingOverlay` / `Skeleton`
  - help vocabulary is fixed as `ActionIcon` / `Tooltip` / `Popover` / `Modal`
  - `Accordion` and `Collapse` remain valid for inline expandable content, not as the default cross-app help pattern
  - Mantine composition and theme ownership are the default styling path; colocated `*.module.css` is exception-only for local geometry and advanced selectors

## 3. Public boundaries

- Allowed stable public boundaries:
  - `router/index.ts`
  - feature entry hooks/components when multiple consumers exist
  - domain service entry points
  - infrastructure service composition entry points
- Boundaries that should stay small:
  - repository APIs
  - route helper surfaces
  - shared utility exports
- Avoid:
  - barrels that expose every internal helper
  - feature-local helpers imported across the whole app by default

## 4. Shared vs local

- shared:
  - generic formatting, dates, normalization primitives, route/path helpers, generic UI, i18n
- module-local:
  - arrival/departure/draft-specific validation, mappers, publish helpers, code application logic
- feature-local:
  - modal state, apply status, local form orchestration, view-specific actions
- infrastructure-local:
  - Dexie query shaping, migrations, backup/import/export payload adapters, scanner browser-adapter quirks, and import/export I/O after the service boundary

## 5. Known structural debt

- The current supplied `src.zip` contains only `src/`; repo root structure is expected to come from the donor.
- Current source already contains a strong router/foundation layer before the core feature slices are implemented.
- Route tree and shell reserve scanner/buffer/settings/arrivals/departures/stocks surfaces, but several screens are still only minimal probe surfaces in the current implementation snapshot.
- `CreateArrivalService` and `UpdateArrivalService` are the meaningful durable write slices implemented; departure, draft, scanner, buffer, and stock features are still mostly structural intent, while backup export, import validation/report, JSON engine, snapshot/checkpoint service, restore orchestrator/manager, browser file adapter, restore-core helpers, and restore service-adjacent helpers are implemented and extracted; the backup restore wiring is closure-grade and no longer blocks the first-data closure audit.
- The second-data scanner/buffer layer is now closure-grade at the seam level: buffer store, buffer apply session/controller seam, buffer control lease seam, scanner session store, overlay arbitration store, scanner runtime/controller seam, browser scanner adapter contracts, a real buffer manage page, the current picker consumers, and the minimal scanner modal UI are all present and aligned around one singleton model.
- Further second-data work should consume the existing seams above rather than create generic orchestration layers, parallel stores, or extra connector wrappers.
- first data is now closure-grade, stable, and safe to leave alone while scanner/buffer/UI work proceeds on top of the existing hook surface.
- `src/infrastructure/services/personalization/` now holds the extracted personalization composition slice.
- `src/infrastructure/services/journals/arrival.services.ts` now holds the extracted arrival composition slice.
- `src/infrastructure/services/journals/departure.services.ts` now holds the extracted departure composition slice.
- `src/infrastructure/services/journals/draft.services.ts` now holds the extracted draft composition slice.
- `src/infrastructure/services/index.ts` is now only the public composition root and composed re-export surface.
- `settings/personalization` now has closure-grade feature hooks layered over the existing save/delete and list/detail boundaries; the remaining work there is beyond the first-data hooks slice, not repository shape.
- There are real placeholder/migration artifacts in the current `src/` snapshot:
  - `pages/dashboard/dashboard-page.tsx` still references an `inventory-queries` path that does not exist in the new snapshot
  - route-first arrival/departure/draft/settings pages now exist, but many of the newly restored routes are still placeholder surfaces rather than full business workflows
- Treat commented scaffolding, leftover donor references, and BOM markers as cleanup debt, not as precedent for new code.
