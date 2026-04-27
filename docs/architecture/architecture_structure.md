# SKLAD — Canonical Architecture Structure

## Goal

This document fixes the final canonical structure, naming rules, and implementation patterns for the project.

It is the single source of truth for:

* folder layout
* naming conventions
* domain / infrastructure / feature boundaries
* Dexie usage rules
* repository / service / query responsibilities
* validation and localization flow

No alternative structure should be introduced unless an explicit architecture decision replaces this one.

---

## Chosen architecture pattern

The project uses a **backend-style layered modular architecture**.

The application is split into four layers:

* **domain** — business records, use-case inputs, validation schemas, result contracts, use-case services, query DTOs
* **infrastructure** — Dexie DB wiring, repositories, Dexie query implementations, service composition root, and reusable technical adapters like the JSON engine, browser file adapter, and restore core
* **features** — React hooks, forms, components, feature-local orchestration
* **shared** — cross-cutting helpers, i18n, generic query helpers

This is a pragmatic modular architecture.

## Folder shape rule

Keep folders flat by default while the surface is small and cohesive.

Introduce one semantic subfolder level when a folder starts holding clearly distinct subareas that evolve independently, or when a local helper starts behaving like a second slice.

Practical depth limit:

* prefer one semantic subfolder below a slice root
* fixed namespace folders like `entries`, `queries`, `i18n`, or `validation` do not justify stacking additional generic layers

Forbidden dumping-ground names:

* `utils`
* `helpers`
* `common`
* `misc`
* other catch-all names that hide responsibility instead of naming it

It intentionally follows a service/repository/query shape similar to backend applications.
It is simpler than full Clean Architecture or strict hexagonal architecture.

---

## Chosen design patterns

### Persistence pattern

* **Repository** — thin adapter over one Dexie table
* **Service / Use Case** — validation, transaction orchestration, multi-repository workflow
* **Query module** — read-side list, lookup, and projection implementation

### Validation pattern

* **Schema-first validation** with Zod v4
* **safeParse()** at the boundary
* **map Zod issues to app-level validation issues**
* **stable validation error codes**
* **localized messages outside schemas**

### React data flow

* **Read path:** component → feature hook → infrastructure query → Dexie
* **Write path:** component → feature hook/action → domain service → repositories → Dexie

---

## Fixed high-level rules

1. One use-case family gets one folder under `domain`.
2. One file contains one main contract or implementation.
3. No giant catch-all files like `types.ts`, `records.ts`, `shared.ts`, or `contracts.ts` if they become dumpsters.
4. No pseudo-type aliases like `type EntityId = string`.
5. No empty wrappers like `interface X extends Y {}` unless the subtype adds real meaning.
6. Prefer explicit, readable contracts over abstract generic wrappers.
7. React components must not access Dexie tables directly.
8. Repositories stay thin.
9. Multi-table workflows belong in services.
10. UI-facing reads belong in query modules.
11. `domain` is not “types only”; it contains pure application logic.
12. `infrastructure` contains Dexie- and storage-specific implementations.
13. Query helper functions that are generic and storage-agnostic belong in `shared`, not in `domain/queries`.
14. We do not introduce per-use-case dependency contract files like `create-arrival.dependencies.ts` unless a future
    architecture decision explicitly requires ports/adapters.

---

## Canonical folder structure

```txt
src/
  domain/
    common/
      record-kinds.ts
      value-objects.ts

    validation/
      validation-error-code.ts
      validation-issue.ts
      map-zod-issues.ts

    directories/
      supplier.record.ts
      category.record.ts
      product.record.ts

    codes/
      record-code.record.ts

    entries/
      arrival/
        arrival.record.ts
        create-arrival.input.ts
        create-arrival.schema.ts
        create-arrival.result.ts
        create-arrival.service.ts
        update-arrival.input.ts
        update-arrival.schema.ts
        update-arrival.result.ts
        update-arrival.service.ts
        write/
          arrival-write.ts

      departure/
        departure.record.ts
        create-departure.input.ts
        create-departure.schema.ts
        create-departure.result.ts
        create-departure.service.ts

    drafts/
      draft.record.ts
      draft-code.input.ts
      arrival-draft.payload.ts
      departure-draft.payload.ts
      save-draft.input.ts
      save-draft.schema.ts
      save-draft.result.ts
      save-draft.service.ts

    settings/
      setting.record.ts
      favorite.record.ts
      profile.record.ts

    backup/
      app-backup.payload.ts
      index.ts
      export/
        backup-export.input.ts
        backup-export.report.ts
        backup-export.result.ts
        backup-export.service.ts
      import/
        backup-import.report.ts
        backup-import.result.ts
        backup-import.service.ts
      checkpoint/
        backup-checkpoint.details.ts
        backup-checkpoint.input.ts
        backup-checkpoint.record.ts
        backup-checkpoint.report.ts
        backup-checkpoint.result.ts
        backup-checkpoint.service.ts
      history/
        backup-history.details.ts
        backup-history.record.ts
      restore/
        backup-restore.conflict.ts
        backup-restore.input.ts
        backup-restore.mode.ts
        backup-restore.plan.ts
        backup-restore.planner.ts
        backup-restore.report.ts
        backup-restore.result.ts
        backup-restore.service.ts

    queries/
      arrival/
        arrival-list.query.ts
        arrival-list.item.ts
        arrival-details.query.ts
      departure/
        departure-list.query.ts
        departure-list.item.ts
        departure-details.query.ts
      draft/
        draft-list.query.ts
        draft-list.item.ts
        draft-details.query.ts
      directory/
        supplier-list.query.ts
        category-list.query.ts
        product-list.query.ts
      record-code/
        record-code-list.query.ts
      stock/
        stock-list.query.ts

  infrastructure/
    db/
      app-db.ts
      app-db.schema.ts
      app-db.migrations.ts
      app-db-tables.ts

    serialization/
      json.engine.ts

    browser/
      file/
        browser-file.adapter.ts

    restore-core/
      index.ts
      restore-core.ts

    backup/

    repositories/
      base/
        base.repository.ts
        base-named.repository.ts

      journals/
        arrival.repository.ts
        departure.repository.ts
        draft.repository.ts
      directories/
        supplier.repository.ts
        category.repository.ts
        product.repository.ts
      personalization/
        settings.repository.ts
        favorite.repository.ts
        profile.repository.ts
      codes/
        record-code.repository.ts
      backup/
        backup-checkpoint.repository.ts
        backup-history.repository.ts

    services/
      index.ts
      personalization/
        personalization.services.ts
      journals/
        arrival.services.ts
        departure.services.ts
        draft.services.ts
      backup/
        backup-export.services.ts
        backup-checkpoint.services.ts
        backup-import-validation.services.ts
        backup-restore.services.ts
        backup-restore.commit.ts
        backup-restore.state.ts

    queries/
      journals/
        arrival.queries.ts
        departure.queries.ts
        draft.queries.ts
      personalization/
        settings.queries.ts
        favorites.queries.ts
        profiles.queries.ts
      codes/
        record-code.queries.ts
      backup/
        backup-metadata.queries.ts
      stock/
        stock.queries.ts

  features/
    arrivals/
      data/
        hooks/
      editor/
        form/
        hooks/

    departures/
      data/
        hooks/
      editor/
        form/
        hooks/

    drafts/
      data/
        hooks/
      editor/
        form/
      publish/
        hooks/

    settings/
      hooks/
      components/
      forms/

    backup/
      hooks/
      ui/

    scanner/
      runtime/
      modal/

    buffer/
      core/
      picker/

    stocks/
      data/
      adjustment/
      departure-prefill/

    form-controls/
      codes/
      date-time/
      money/
      directory/
      support/
        field-info-trigger/
        field-metadata/

    form-fields/
      field-family-directory/
      form-section-accordion/

    form-preferences/

  shared/
    i18n/
      validation/
        validation-messages.ru.ts
        validation-messages.en.ts
        resolve-validation-message.ts

      arrival/
        create/
          create-arrival-operation-message-keys.ts
          create-arrival-operation-messages.en.ts
          create-arrival-operation-messages.ru.ts
          get-create-arrival-operation-message.ts
        update/
          update-arrival-operation-message-keys.ts
          update-arrival-operation-messages.en.ts
          update-arrival-operation-messages.ru.ts
          get-update-arrival-operation-message.ts

    utils/
      create-id.ts
      format.ts
      normalize-text.ts
      object-utils.ts
      time.ts
      type-guards.ts

      query/
        sort-direction.ts
        normalize-search.ts
        paginate.ts
        matches-date-range.ts
        contains-normalized-text.ts
        compare-nullable-string.ts
        compare-nullable-number.ts
        compare-iso-date.ts
```

---

## Naming convention

Every file must follow this pattern:

```txt
<entity-or-usecase>.<role>.ts
```

### Allowed role suffixes

* `record`
* `input`
* `payload`
* `schema`
* `result`
* `service`
* `query`
* `queries`
* `repository`

### Examples

* `arrival.record.ts`
* `create-arrival.input.ts`
* `create-arrival.schema.ts`
* `create-arrival.result.ts`
* `create-arrival.service.ts`
* `arrival-list.query.ts`
* `journals/arrival.repository.ts`
* `journals/arrival.queries.ts`

### Fixed naming decisions

* secondary codes table: `recordCodes`
* secondary code record: `RecordCodeRecord`
* arrival/departure family folders remain separate

---

## `domain`

`domain` is not “types only”.

It contains:

* records
* use-case inputs
* validation schemas
* result contracts
* use-case services
* query DTOs
* pure application logic that does not depend on React and does not implement Dexie-specific storage behavior

### Fixed rule

`domain` may contain executable code when that code is:

* pure
* application-level
* use-case-oriented
* independent from UI
* independent from storage implementation details

Examples that belong in `domain`:

* `create-arrival.service.ts`
* `create-arrival.schema.ts`
* `map-zod-issues.ts`
* `save-draft.service.ts`

Examples that do not belong in `domain`:

* Dexie table access
* repository implementations
* `useLiveQuery()` usage
* DB schema declarations

---

## `domain/common`

Contains only truly shared business primitives.

### Allowed contents

* short discriminated unions
* reusable value objects

### Examples

* `RecordKind`
* `SubjectKind`
* `DepartureMode`
* `RecordOriginKind`
* `RecordCodeKind`
* `RecordCodeOwnerKind`
* `MoneyValue`
* `DirectoryRefSnapshot`
* `DateRange`

### Not allowed here

* UI-specific state
* repository types
* DB implementation details
* giant generic utility types

---

## `domain/validation`

Contains app-level validation contracts.

### Fixed validation model

Use one canonical error code type:

* `ValidationErrorCode`

Use one canonical issue shape:

* `ValidationIssue`

Use one mapper from Zod v4 issues to app issues:

* `map-zod-issues.ts`

### Important rule

Do **not** create both `ValidationErrorCode` and `ValidationMessageKey` as separate parallel concepts.

The canonical flow is:

```txt
safeParse()
→ zod issues
→ ValidationIssue[]
→ resolve localized message from ValidationErrorCode
```

`ValidationErrorCode` is the stable contract.
Localized messages are derived from it.

### Zod rule

Zod schemas that validate use-case input belong in `domain`, because they validate application boundaries, not
infrastructure.

---

## `domain/directories`

Contains persisted directory records only.

### Canonical records

* `SupplierRecord`
* `CategoryRecord`
* `ProductRecord`

### Rules

* records stay explicit
* no empty `extends`
* no artificial shared base records just to remove 3–5 duplicated lines
* support-domain status: boundary-complete for the current product truth
* the domain surface stays limited to durable record contracts; repository/query support lives elsewhere
* no standalone directory command boundary is required until product scope adds direct directory management

---

## `domain/codes`

Contains the secondary indexed code model.

### Canonical record

* `RecordCodeRecord`

### Why it is separate

* one arrival/departure/draft may have multiple codes
* scanner lookup needs indexed search
* codes must not live only inside arrays on the parent record
* code lookup is a real query surface
* support-domain status: boundary-complete for the current product truth
* the domain surface stays limited to code contracts and helper inputs; repository/query support lives elsewhere
* no standalone code command boundary is required because codes are owned by arrival/departure/draft write flows

---

## `domain/entries`

Contains final operational records and use-cases.

### `arrival/`

Contains:

* `arrival.record.ts`
* `create-arrival.input.ts`
* `create-arrival.schema.ts`
* `create-arrival.result.ts`
* `create-arrival.service.ts`
* `update-arrival.input.ts`
* `update-arrival.schema.ts`
* `update-arrival.result.ts`
* `update-arrival.service.ts`
* `write/arrival-write.ts`
* `create/*` arrival operation message bundles
* `update/*` arrival operation message bundles

### `departure/`

Contains the mirrored set for departure.

### Rules

* each family gets its own folder
* records are explicit
* schemas are local to the use-case boundary
* services orchestrate repositories and transactions

---

## `domain/drafts`

Contains persisted workflow state and draft-specific contracts.

### Allowed contents

* `DraftRecord`
* `DraftCodeInput`
* arrival/departure draft payloads
* save draft input/schema/result/service

### Not allowed here

* final arrival/departure records
* Dexie table access

---

## `domain/settings`

Contains persisted user records outside arrival/departure journals.

### Canonical records

* `SettingRecord`
* `FavoriteRecord`
* `ProfileRecord`

### Rules

* `domain/settings` owns the write-side contracts and services for durable personalization records
* settings stay extensible key/value durable data and are not collapsed into a monolithic final app-settings object
* favorites and profiles keep canonical CRUD semantics while staying table-specific and durable
* read-model DTOs for settings/favorites/profiles live under `domain/queries/personalization`, not in repository classes

---

## `domain/backup`

Contains backup/import/restore contracts.

The domain backup boundary owns the canonical payload envelope at the root, validation/report contracts, backup checkpoint/history records, and backup-specific restore contracts. The folder is structured into one semantic level:

* `export/`
* `import/`
* `checkpoint/`
* `history/`
* `restore/`

`app-backup.payload.ts` stays at the root as the canonical payload envelope and `index.ts` stays thin. JSON parsing/stringifying remains a reusable serialization concern that must not reach browser file I/O, and reusable diff / merge / rebase logic must stay out of the backup-specific contracts.

### Canonical contents

* `AppBackupPayload`
* `BackupCheckpointRecord`
* `BackupHistoryRecord`
* checkpoint details/input/report/result/service
* history details
* backup import validation report/result/service
* backup restore input/plan/conflict/report/result/service
* backup-specific planner/connector surfaces that adapt the payload to reusable technical cores
* restore strategy contracts for `overwrite`, `merge`, and `rebase`

---

## `domain/queries`

Contains query DTOs only.

### Allowed contents

* filter DTOs
* sort DTOs
* pagination DTOs

### Examples

* `arrival-list.query.ts`
* `departure-list.query.ts`
* `stock-list.query.ts`
* `record-code-list.query.ts`

### Fixed rule

No generic wrappers like:

* `DirectoryListQuery<F extends ...>`
* `EntryListQuery<T extends ...>`

Use direct, explicit DTOs.

### Important rule

`domain/queries` contains only contracts.
It must not contain generic query helper functions.
Generic storage/domain-agnostic query helpers live in `src/shared/utils/query/`.
Dexie-backed query implementations live in `infrastructure/queries/` and consume those shared helpers.
No generic query helper implementation remains under `src/domain/common/query-helpers/`.

### Target shape

When the query family grows beyond a small flat set, group contracts by entity/area first and keep only a thin root barrel.
Prefer semantic subfolders such as `arrival/`, `departure/`, `draft/`, `directory/`, `record-code/`, and `stock/` instead of a larger flat root.

---

## `infrastructure/db`

Contains Dexie wiring only.

### `app-db.ts`

Contains:

* `AppDb extends Dexie`
* typed `Table<T, string>` fields
* constructor
* schema registration
* migrations registration
* exported singleton `appDb`

### `app-db.schema.ts`

Contains schema declarations through Dexie:

* `db.version(n).stores({...})`

### `app-db.migrations.ts`

Contains migration code:

* `db.version(n).upgrade(...)`

### `app-db-tables.ts`

Contains canonical table names.
Use only for:

* programmatic table lists
* migration helpers
* backup/import loops
* transaction table groups

Do not force table-name constants into every feature or repository when direct typed access such as `db.arrivals` is
clearer.

---

## `infrastructure/repositories`

Contains thin table adapters.

### Structure

Common reusable repository primitives live in:

* `infrastructure/repositories/base/base.repository.ts`
* `infrastructure/repositories/base/base-named.repository.ts`

Concrete repositories are grouped by bounded area inside `infrastructure/repositories/`.

### Base repository responsibilities

`base.repository.ts` may contain only the most common table-scoped primitives that are shared by several repositories,
for example:

* `getById`
* `put`
* `delete`
* `listByIds`

`base-named.repository.ts` may extend that base with a single additional concern for entities that expose
`normalizedName`, for example:

* `findByNormalizedName`

### Base repository rules

Base repository classes must stay:

* very small
* generic only over record shape
* limited to table-local operations

They must not include:

* transactions
* multi-table workflows
* business decisions
* validation
* React logic
* generalized query DSLs

### Concrete repository responsibilities

Concrete repositories may:

* inherit common CRUD helpers from base classes
* add table-specific indexed lookups
* add tightly scoped helper methods for that table only

### Examples

* `journals/arrival.repository.ts`
* `codes/record-code.repository.ts`
* `directories/supplier.repository.ts`
* `directories/category.repository.ts`
* `directories/product.repository.ts`

### Fixed rule

If methods are identical across 3 or more repositories and are table-scoped, they may be moved into a small base
repository class.
If a method depends on a specific index or table-specific behavior, it stays in the concrete repository.

Repositories are concrete infrastructure classes.
Services may depend on these concrete repositories directly in the current architecture.
We do not introduce per-use-case dependency port files unless a later architecture decision explicitly changes the
pattern.

### Canonical coverage rule

Every durable IndexedDB table must have one thin repository that covers the basic CRUD contour plus only the
table-specific helpers that belong to that table.

Allowed repository helpers are limited to direct table-local operations such as:

* name-based lookup on named tables
* count/list helpers backed by a concrete index
* owner-scoped code replacement/removal helpers
* simple list projections that still stay table-local

Repositories must not become a second query layer or absorb multi-table business logic.

### Target shape

Group concrete repositories into one semantic level by bounded area.
Keep `base/` as the only shared subfolder.
Repository methods must stay table-local and must not turn into a second query layer.

## `infrastructure/services`

Contains the public service composition root and bounded-area orchestration modules.

### Service module responsibilities

* repository instantiation
* transaction wrappers
* dependency bundle assembly
* service facade exports

### Backup role split

Backup orchestration must stay explicit and split by responsibility:

* export service boundary
* import validation/report boundary
* snapshot/checkpoint service
* restore orchestrator/manager implementation
* backup-specific connectors and planners over reusable technical cores
* backup-restore service-adjacent helpers for current-state capture and commit/history shaping
* reusable JSON engine in `src/infrastructure/serialization/`
* reusable browser file adapter in `src/infrastructure/browser/file/`
* reusable diff / merge / rebase core in `src/infrastructure/restore-core/`

Import/restore commit behavior must support the explicit strategies `overwrite`, `merge`, and `rebase`.

Current audit status:

* backup restore wiring is closure-grade
* backup restore wiring no longer blocks the first-data closure audit
* first data is closure-grade
* first data is leave-alone
* public first-data service/query/hook seams are documentation-frozen for the current architecture
* UI work should build on the existing first-data hooks/handles instead of reopening first-data boundaries

### Service module non-responsibilities

* domain rules
* read-model shaping
* UI state

### Important rule

`index.ts` is the only public composition root.
Bounded-area modules live underneath it, with direct wiring only.
Do not add an extra generic service layer or decorative barrels.
`personalization/`, `journals/arrival`, `journals/departure`, and `journals/draft` are already extracted.

## `infrastructure/queries`

Contains Dexie-backed read-side implementations.

### Query module responsibilities

* list reads
* filters
* sort/pagination
* projections for UI

### Query module non-responsibilities

* writes
* transactions
* validation of commands
* React state management

### Important rule

`ArrivalQueries`, `DepartureQueries`, and `DraftQueries` live in `infrastructure/queries/journals/`.
`SettingsQueries`, `FavoritesQueries`, and `ProfilesQueries` live in `infrastructure/queries/personalization/`.
`RecordCodeQueries` lives in `infrastructure/queries/codes/`.
`BackupMetadataQueries` lives in `infrastructure/queries/backup/`.
`StockQueries` lives in `infrastructure/queries/stock/`.

`domain/queries/*.query.ts` describe what to query.
`infrastructure/queries/<area>/*.queries.ts` implement how that query is executed.

## `features`

Contains React-facing feature slices.

Each feature may contain:

* `hooks/`
* `components/`
* `forms/`

### Fixed rule

React components and hooks must not call Dexie tables directly.
They must use:

* query modules for reading
* services for writing

### Current hook coverage

* `src/features/arrivals/{data,editor}` is closure-grade for the current first-data arrival flow and stays thin over the domain/infrastructure boundary.
* `src/features/departures/{data,editor}` is closure-grade for the current first-data departure flow and stays thin over the domain/infrastructure boundary.
* `src/features/drafts/{data,editor,publish}` is closure-grade for the current first-data draft flow and stays thin over the domain/infrastructure boundary.
* `src/features/settings/hooks` is closure-grade for the current first-data personalization flow and stays thin over the domain/infrastructure boundary.
* `src/features/codes/hooks` is closure-grade for the current record-code read surface and stays thin over the existing query boundary.
* `src/features/directories/hooks` is closure-grade for the current directory read surface and stays thin over the existing query boundary.
* `src/features/backup/hooks` is closure-grade for the current backup surface and stays thin over the existing service/query/browser-adapter boundary.
* `src/features/stocks/data` owns the derived stock read hook; `src/features/stocks/adjustment` and `src/features/stocks/departure-prefill` own the current stock workflow adapters.
* `src/features/buffer/core/buffer-core.public.ts` and `src/features/scanner/runtime/scanner-runtime.public.ts` are the current explicit second-data public seams.

### Current form-control ownership

* `src/features/form-controls` contains UI-only reusable form controls and narrow UI help/metadata support:
  * `codes/`
  * `date-time/`
  * `money/`
  * `directory/`
  * `support/field-info-trigger`
  * `support/field-metadata`
* `src/features/form-controls` must not absorb query loading, form preference writes, submit mapping, scanner/buffer behavior, or durable services/repositories.
* `src/features/form-fields` remains the owner for deferred non-UI-only form seams such as `form-section-accordion` and the query/preference-aware directory wrapper.
* `src/features/form-preferences` remains separate second-data preference state.

---

## `shared`

Contains cross-cutting helpers.

### Allowed contents

* i18n catalogs and resolvers
* text normalization
* id generation
* date helpers
* type guards
* object utilities
* generic query helpers that do not know about Dexie or domain records

### Fixed rule

Do not place domain rules in `shared`.

### `shared/utils/query/`

This folder contains generic read-side helper functions such as:

* `paginate`
* `normalizeSearch`
* `matchesDateRange`
* `containsNormalizedText`
* compare helpers

These helpers are storage-agnostic and do not belong in `domain/queries`.
`matchesDateRange` uses a local structural range shape, not the domain `DateRange` type. `DateRange` remains a
`domain/common` value object for product/domain contracts that need it.

---

## Canonical persistence rules

### Repository pattern

Repository code must:

* operate on one table
* stay small and explicit
* expose predictable CRUD and lookup methods

Repository code must not:

* open multi-table workflows
* validate user input
* know about UI

### Base repository pattern

A small shared base repository layer is allowed and fixed as part of the architecture.

Allowed base classes:

* `BaseRepository<TRecord extends { id: string }>`
* `BaseNamedRepository<TRecord extends { id: string; normalizedName: string }>`

Allowed shared operations:

* `getById`
* `put`
* `delete`
* `listByIds`
* `findByNormalizedName` for named records

Not allowed in base repositories:

* transaction orchestration
* query builders for arbitrary filters/sorts
* multi-table coordination
* service logic
* cross-cutting business rules

### Service / Use Case pattern

Service code must:

* validate input at the boundary
* normalize input if needed
* open Dexie transactions for multi-table writes
* orchestrate repositories
* return a stable result contract

Service code must not:

* render UI
* hold feature-local React state
* implement generic list querying

### Important rule

Services live in `domain` and may depend directly on concrete repositories from `infrastructure/repositories` in the
current architecture.
This is an intentional pragmatic trade-off.
We do not currently add dedicated `*.dependencies.ts` files or port interfaces for each use case.

### Query module pattern

Query modules must:

* implement read-side logic
* be safe to call from `useLiveQuery()`
* stay read-only

---

## Canonical validation rules

1. Use **Zod v4**.
2. Import from `zod/v4`.
3. Use `safeParse()` at boundaries.
4. Do not use deprecated `finite()`.
5. Do not expose raw Zod types as app-level contracts.
6. Map Zod issues into `ValidationIssue[]`.
7. Localized strings live outside schemas.

### Message flow

```txt
ValidationErrorCode
→ resolve-validation-message(locale, code)
→ localized string
```

---

## Canonical `null` vs `?` rule

### Persisted records

Use `| null` when the field is part of the canonical stored shape but may be empty.

Examples:

* `supplierId: string | null`
* `categoryName: string | null`
* `linkUrl: string | null`

### Input patch / partial update DTOs

Use `?` only when the property may be absent entirely.

### Query/filter DTOs

Prefer explicit fields with `null` reset state instead of optional keys.

Reason:

* stable object shape
* simpler mapping/import/export
* clearer UI semantics

---

## Canonical Dexie rules

1. Use `AppDb extends Dexie`.
2. Use `Table<T, string>` for plain record tables.
3. Use `db.version(...).stores(...)` for schema declaration.
4. Register schema before calling `this.table(...)` in `AppDb`.
5. Keep schema in `app-db.schema.ts`.
6. Keep migrations in `app-db.migrations.ts`.
7. Use transactions for multi-table writes.
8. Pass a table array to `db.transaction(...)` when convenient.
9. Do not perform unrelated external async work inside transaction scope.
10. Use `useLiveQuery()` only inside `features` hooks.
11. Keep Dexie-specific query implementations in `infrastructure/queries`.

## Canonical table set

The canonical table names are:

* `suppliers`
* `categories`
* `products`
* `arrivals`
* `departures`
* `drafts`
* `recordCodes`
* `settings`
* `favorites`
* `profiles`
* `backupCheckpoints`
* `backupHistory`

---

## Canonical file design rules

1. One file = one main contract or implementation.
2. Avoid giant dump files.
3. Avoid empty wrappers.
4. Avoid pseudo aliases over primitives.
5. Avoid generic wrappers unless they solve a real repeated problem.
6. Prefer explicit readability over abstraction noise.

---

## Canonical next implementation order

The implementation order should be:

1. Finish durable `src/domain` + `src/infrastructure` entity-management surfaces first.
2. `src/infrastructure/services` is now bounded-area complete; keep the public root thin and re-export only composed facades, including the backup export, import validation, checkpoint, and restore services.
3. Move on to scanner/buffer/UI cleanup on top of `src/features/scanner/{runtime,modal}`, `src/features/buffer/{core,picker}`, and `src/features/stocks/{data,adjustment,departure-prefill}`.
4. Keep any optional stocks work separate from the scanner/buffer/UI cleanup track.
5. Then restore the deferred feature/page slices against the finished contracts.

## Completion levels

The project uses three completion levels to avoid mixing boundary work with presentation or workflow claims:

1. `Entity boundary complete`
   - `domain/`: records, inputs, schemas, result contracts, services, query DTOs
   - `infrastructure/`: repositories, query implementations, DB wiring, service composition
   - Completion means the entity has durable contracts and write/read boundaries, but no promise of feature pages or full user workflows.
2. `Feature/presentation complete`
   - `features/`
   - `pages/`
   - `router/` integration for the relevant surface
   - Completion means the entity boundary is usable from the UI, with presentation and feature orchestration wired up.
3. `Workflow complete`
   - `app/`, `router/`, `features/`, `domain/`, `infrastructure/`, `shared/`
   - Completion means the end-to-end user flow is wired, verified, and coherent across capture, form, write, read, and navigation surfaces.

Current project priority is to reach `Entity boundary complete` for all core durable entities before marking any feature/presentation or workflow slice complete.

## Entity implementation template

Use the same structural template for Arrival, Departure, and Draft slices:

```txt
domain/
  entries/<entity>/
    <entity>.record.ts
    create/
      create-<entity>.input.ts
      create-<entity>.schema.ts
      create-<entity>.result.ts
      create-<entity>.service.ts
    update/
      update-<entity>.input.ts
      update-<entity>.schema.ts
      update-<entity>.result.ts
      update-<entity>.service.ts
    delete/
      delete-<entity>.input.ts
      delete-<entity>.schema.ts
      delete-<entity>.result.ts
      delete-<entity>.service.ts
    write/
      <entity>-write.ts

  queries/
    <entity>-list.query.ts
    <entity>-list.item.ts
    <entity>-details.query.ts

infrastructure/
  repositories/
    <entity>.repository.ts
  queries/
    <entity>.queries.ts
  services/
    index.ts

features/
  <entity>/
    hooks/
    components/
    forms/
    pages/
```

The template is structural, not a claim that every file exists for every entity yet. Use it to judge missing boundary pieces and to keep arrival/departure/draft implementations comparable.

### Arrival slice must include

* `arrival.record.ts`
* `create-arrival.input.ts`
* `create-arrival.schema.ts`
* `create-arrival.result.ts`
* `create-arrival.service.ts`
* `update-arrival.input.ts`
* `update-arrival.schema.ts`
* `update-arrival.result.ts`
* `update-arrival.service.ts`
* `write/arrival-write.ts`
* `journals/arrival.repository.ts`
* `codes/record-code.repository.ts`
* `journals/arrival.queries.ts`
* `arrival-details.query.ts`
* `shared/i18n/arrival/create/*`
* `shared/i18n/arrival/update/*`
* `use-arrival-list.ts`
* `use-create-arrival.ts`
* `use-update-arrival.ts`

---

## Final fixed decisions

### Architecture

* **Layered modular architecture**

### Persistence design

* **Repository + Service + Query Module**

### Validation design

* **Zod v4 + issue mapping + stable validation codes + externalized localized messages**

### Naming

* **`<entity-or-usecase>.<role>.ts`**

### Structure

* **use-case family folders under `domain`**

### React integration

* **read through query modules + `useLiveQuery()`**
* **write through services**

This document is the canonical reference for project structure and naming until an explicit architecture decision
changes it.
