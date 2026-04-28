# PRODUCT_SPEC

## 1. Product purpose
- What the product exists to do:
  - Let one user quickly capture, stage, edit, and persist incoming and outgoing entities in an offline-first browser app.
  - Keep capture mechanics, durable business records, and derived views clearly separated.
- What it explicitly does not try to be:
  - a backend-driven ERP;
  - a collaborative system;
  - a generic cloud-sync platform;
  - a donor-compatible inventory clone with identical assumptions.

## 2. Actors
- Primary user:
  - single operator maintaining personal or small-scale accounting flows.
- Secondary user:
  - future same-device user profile is possible, but not a V1 product assumption.
- System/internal actor:
  - scanner runtime, browser storage, import/export services, and query projections.

## 3. Core entities

### BufferItem
- purpose: transient staging record for decoded machine-readable values
- stable identity: local buffer item id
- important fields: `id`, `value`, `capturedAt`, optional `kind`, optional `source`
- lifecycle notes: lives in localStorage-backed buffer; copied into forms; not authoritative durable business data; excluded from backup/import source of truth

### Arrival
- purpose: durable record that an entity appeared and must be accounted for
- stable identity: `arrival.id`
- important fields:
  - `id`
  - `subjectKind`
  - `title`
  - `description`
  - `occurredAt`
  - `quantity`, `totalCost`, `unitCost`
  - legacy `amount`, `currency` for backward compatibility
  - `linkUrl`
  - `note`
  - `supplierId` / snapshot name
  - `productId` / snapshot name
  - `categoryId` / snapshot name
  - `originDraftId`
  - origin metadata
- lifecycle notes:
  - can be created manually or from draft;
  - may have zero or more related `RecordCode` rows;
  - only `title` is required at commit time.

### Departure
- purpose: durable record that an entity left accounting scope
- stable identity: `departure.id`
- important fields:
  - `id`
  - `subjectKind`
  - `title`
  - `description`
  - `occurredAt`
  - `quantity`, `totalCost`, `unitCost`
  - legacy `amount`, `currency` for backward compatibility
  - `note`
  - `direction`
  - `supplierId` / snapshot name
  - `productId` / snapshot name
  - `categoryId` / snapshot name
  - `mode` (`profit` | `loss`)
  - `basedOnArrivalId`
  - `originDraftId`
  - origin metadata
- lifecycle notes:
  - can be standalone, draft-based, or arrival-linked;
  - scanner-assisted lookup may prefill it;
  - prefill never makes the record immutable.

### Draft
- purpose: durable incomplete work item for a future arrival or departure
- stable identity: `draft.id`
- important fields: `id`, `kind`, `title`, `payload`, `createdAt`, `updatedAt`
- lifecycle notes:
  - payload may be incomplete;
  - publish creates a new arrival/departure record and consumes the source draft in the same transaction;
  - draft is not just a status on another table.

#### Publish contract
- publish target must be explicit and match the draft kind:
  - arrival draft -> arrival target
  - departure draft -> departure target
- publish reuses the existing target create boundary for validation, directory resolution, linked-arrival checks, persistence, and related code writes.
- draft-owned record codes are mapped into the target create input as the target's code list; target code rows are rematerialized with the target owner and new ids.
- publish result should be a machine-readable union scoped to:
  - `VALIDATION_ERROR`;
  - `DRAFT_NOT_FOUND`;
  - `PUBLISH_TARGET_INVALID`;
  - `TARGET_RESOLUTION_FAILED`;
  - `DB_WRITE_FAILED`.
- target-service validation or resolution failures should be surfaced without localized UI strings.

### RecordCode
- purpose: durable list of QR/barcode/vendor/custom codes attached to arrival, departure, or draft payload
- stable identity: `recordCode.id`
- important fields: `id`, `ownerKind`, `ownerId`, `value`, `normalizedValue`, `kind`, `createdAt`
- lifecycle notes:
  - multiple codes per owner are allowed;
  - code search/prefill depends on this table;
  - buffer values are not durable codes until attached to a record or draft.

### Directory entities
- name: `Supplier`, `Product`, `Category`
- purpose: optional acceleration and normalization of recurring fields
- stable identity: entity id
- important fields:
  - `id`
  - `name`
  - `normalizedName`
  - `note`
  - `isArchived`
  - timestamps
- lifecycle notes:
  - optional to use;
  - forms must still work with free text when the directory is empty or incomplete.
  - products now have a route-owned `/products` list/edit surface for search, archive filtering, supplier/category labels, and minimal card editing.

### Settings and personalization
- name: `SettingRecord`, `FavoriteRecord`, `ProfileRecord`
- purpose: durable user-specific app behavior and navigation preferences
- stable identity:
  - settings by `key`
  - favorite by `id`
  - profile by `id`
- important fields:
  - theme preference
  - buffer limit
  - favorites entries
  - profile display name
  - optional Google account metadata for Drive backup, without persisted access tokens
  - optional Google Drive backup storage preference and recent file metadata
- lifecycle notes:
  - stored in IndexedDB;
  - included in backup/import;
  - distinct from transient buffer state.

### Backup metadata
- name: `BackupCheckpointRecord`, `BackupHistoryRecord`
- purpose: support restore/report/history flows
- stable identity: record id
- important fields: action, status, timestamps, snapshot payload or reference metadata
- lifecycle notes:
  - supports export/import/restore semantics;
  - durable first-data metadata and included in backup/import;
  - not part of primary business journals.

### Backup/export/import/restore boundary
- V1 payload envelope:
  - `AppBackupPayload` is the canonical backup envelope;
  - it carries `version` and `exportedAt` plus first-data entity groups.
- Included first-data groups:
  - suppliers, categories, products;
  - arrivals, departures, drafts, record codes;
  - settings, favorites, profiles;
  - backup checkpoints and backup history.
- Excluded second-data groups:
  - scanner buffer;
  - zustand/localStorage cache;
  - session/runtime/view-model state;
  - any other transient state that is not explicitly promoted to durable user data.
- Export boundary:
  - domain/infrastructure backup export service prepares the validated payload and metadata/report;
  - the JSON engine is a reusable serialization role that serializes the canonical payload after the export service boundary;
  - browser file serialization/download is handled by a reusable infrastructure-local browser adapter after the JSON engine boundary;
  - optional Google Drive upload uses the same exported JSON text after the backup export service boundary;
  - file naming, blob creation, and save-dialog behavior stay out of the payload contract.
- Import boundary:
  - import first validates envelope shape and version;
  - Google Drive downloads are treated as downloaded JSON text and must pass the same import validation before restore can be enabled;
  - import normalizes legacy arrival/departure/draft payloads that still carry only `amount` into the newer quantity/cost fields without dropping the legacy value;
  - if validation passes, restore orchestration produces a machine-readable report and commit plan before commit;
  - no write happens until the caller explicitly chooses the supported commit mode.
  - supported commit strategies are `overwrite`, `merge`, and `rebase`.
- Restore/commit boundary:
  - V1 restore is all-or-nothing and writes the validated first-data set into IndexedDB in a single transaction;
  - second data is not restored from backup;
  - partial restore modes are out of scope for V1;
  - backup-specific restore orchestration owns strategy selection, conflict resolution/reporting, and checkpoint/history write policy;
  - reusable diff / merge / rebase behavior lives outside backup semantics and is called through connectors.
- Backup metadata updates:
  - successful export/import/restore writes should update `BackupHistoryRecord`;
  - restore/commit may also write a `BackupCheckpointRecord` snapshot when a durable checkpoint is explicitly requested;
  - history/checkpoint updates happen in the same IndexedDB transaction as the corresponding write when the workflow commits.
- Snapshot/checkpoint service:
  - owns durable backup metadata assembly for checkpoint/history records;
  - stays separate from browser file I/O and from the JSON engine.
- Backup-specific contracts:
  - keep `AppBackupPayload`, export/import/restore inputs, reports, results, and checkpoint/history contracts in `domain/backup`;
  - keep planner/connector semantics there as well, but treat JSON/file/diff/merge/rebase mechanics as reusable infrastructure roles.
- Google Drive backup contract:
  - Google account connection is a feature owner, not shared infrastructure;
  - Drive REST calls are isolated behind a typed browser adapter;
  - access tokens are runtime-only and must not be stored in IndexedDB or backup payloads;
  - Drive backup is user-triggered only and must not become background cloud sync.
- Typed report model:
  - invalid payload
  - unsupported version
  - version mismatch
  - reportable conflict
  - write failure
  - success
- restore plan model:
  - selected mode
  - checkpoint participation
  - history participation
  - machine-readable conflict list

## 4. Business invariants
- Scanner does not write directly into arrival/departure tables.
- Forms do not own camera or file-decode lifecycle.
- Arrivals, departures, and drafts are separate durable tables.
- Buffer is transient and excluded from durable backup semantics.
- First data lives in IndexedDB and is the source of truth for journals, drafts, directories, settings, favorites, profiles, and backup metadata.
- Second data is transient buffer/runtime/session/view state and may live in zustand/localStorage, but it is never the backup source of truth.
- Buffer size is bounded; overflow is resolved by FIFO eviction.
- Buffer duplicates must be user-visible; they must not be silently accepted as normal success.
- Applying a buffer item to a form copies data; it does not delete the source buffer entry.
- Title is required to commit arrival or departure.
- Draft payload may be incomplete; publish payload may not.
- Directory fields support both existing selection and manual input.
- Durable settings live in IndexedDB and are treated as user data.
- Google Drive backup metadata may live in durable settings, but Google access tokens are runtime-only.
- Derived states such as stock/balance/statistics are projections, not durable source of truth.
- Gesture and haptic behavior is shared UI infrastructure, not page-local business logic.
- Haptics are progressive enhancement only; they must never be the only success, warning, error, or confirmation signal.
- Scanner and alert-related haptic behavior must flow through one shared browser/device adapter when implemented.
- Reusable touch/pointer gesture behavior must flow through one shared gesture hook when implemented.

## 5. Behavior rules

### creation rules
- Creating an arrival validates the arrival payload, resolves optional directory references, persists the arrival, then persists related record codes.
- Creating a departure validates the departure payload, optionally resolves a linked arrival, persists the departure, then persists related record codes.
- Creating a draft persists the chosen payload shape without requiring the stricter final-commit validation used by arrivals/departures.
- New supplier/product/category values may be created from forms only when the arrival contract explicitly confirms inline creation for that field.

### update rules
- Updating an arrival/departure may replace its related record codes.
- Updating a draft keeps the same draft identity.
- Updating buffer items affects only the buffer.
- Editing codes in a form affects only the form until save.

### deletion / reversal rules
- Deleting buffer items never deletes durable records.
- Deleting a draft never deletes published arrivals/departures.
- Deleting an arrival that is referenced by a departure is allowed only if the chosen data policy explicitly defines the resulting state; otherwise it must be blocked or require unlink/repoint first.
- Destructive UI actions require confirmation.
- Draft publish consumes the source draft in the same transaction as target creation; preserve/update mode is not part of the initial publish contract.

### uniqueness / identity rules
- Durable record identity is always id-based.
- Directory duplicate detection is normalized-name based.
- Record code lookup is normalized-value based, but code values are not globally unique by default unless a later rule strengthens this.
- Buffer item identity is not durable business identity.

### validation rules
- `title` is the minimal required field for arrival/departure commit.
- `mode` is required for departure.
- `occurredAt` should be present at commit time unless the flow explicitly allows fallback behavior.
- File scanning rejects files above the product size limit.
- Camera and decode failures must map to user-visible recoverable errors where possible.
- Unsupported or suppressed haptics must not change functional outcomes; visible feedback remains mandatory.

### gesture / haptic rules
- A shared haptics adapter owns:
  - capability detection;
  - pattern mapping for success / warning / error / confirm signals;
  - no-support / suppressed / fired result reporting.
- A shared gesture hook owns reusable touch/pointer coordination for cross-surface interaction patterns.
- Scanner expectations:
  - successful decode may emit a short success haptic;
  - duplicate capture and recoverable decode failure may emit a warning haptic;
  - fatal scanner failure may emit an error haptic.
- Alert expectations:
  - destructive confirmation and high-importance blocking alerts may emit confirm/warning/error haptics;
  - informational feedback should not default to haptics.

## 6. Derived states / projections
- arrival list
- departure list
- draft list
- directory lists
- record code lookup results
- favorites/home shortcuts
- backup history
- optional stock/balance view after the core journals stabilize
- basic operational statistics from existing durable data

## 7. Acceptance logic
- Correct result for core scenarios:
  - a decoded value reaches buffer quickly and predictably;
  - buffer values can be applied into forms without hidden deletion;
  - arrival/departure persistence survives reload and offline use;
  - drafts preserve unfinished work and can publish into the correct target table;
- import/export handles durable data without pulling transient buffer state into business truth.
- import/export includes first data only unless a future spec explicitly promotes a transient surface to durable user data.
- backup/import/export never treats zustand/localStorage as source of truth for durable entities.
- browser file API boundaries remain external to the domain payload contract.
- Google Drive backup uses the existing backup payload and validation boundary; downloading from Drive never restores directly.
- User-visible error:
  - camera permission denied;
  - image file too large;
  - decode failed;
  - duplicate buffer capture;
  - validation failure on commit/publish;
  - import payload invalid or conflicting.
- Recoverable error:
  - scanner runtime failure with retry path;
  - decode failure with manual edit fallback;
  - directory mismatch where user can still type manually;
  - unresolved lookup where the form remains editable.

## 8. Out of scope
- backend sync
- multi-user collaboration
- background Google Drive sync or broad Google Drive file access
- smart external product lookup by code or URL
- advanced merge conflict UX
- heavy analytics
- broad abstraction over every list/page before the first working vertical slices exist
