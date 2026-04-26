# SYSTEM_OVERVIEW

## 1. High-level shape

- Main app/runtime:
  - browser-only React + TypeScript app with Mantine UI, mobile-first shell, static-friendly router, and PWA-capable setup.
- Main storage:
  - Dexie + IndexedDB for first data: durable records, durable settings, favorites, profiles, backup metadata, and other source-of-truth state;
  - localStorage-backed scanner buffer and other second data for transient workflow state only.
- Important external integrations:
  - camera/media APIs;
  - file upload APIs;
  - ZXing-based scanner adapter for live and photo decode as the intended direction;
  - browser/device haptics APIs through one shared capability-aware adapter as the intended direction for tactile feedback;
  - JSON import/export through browser file APIs.
- Main user-visible surfaces:
  - home/favorites page;
  - route-owned arrivals subtree;
  - route-owned departures subtree;
  - route-owned drafts subtree;
  - global scanner modal;
  - route-owned buffer page and contextual buffer picker;
  - stocks page as derived read model;
  - route-owned settings subtree;
  - backup/history.

## 1.1 Current implementation truth vs approved-next UI policy

- Current implemented truth:
  - the route tree explicitly owns `arrivals`, `departures`, `drafts`, `buffer`, and `settings`;
  - `settings` already has route-owned children for `/settings`, `/settings/profile`, `/settings/backup`, and `/settings/about`;
  - the root layout renders one Mantine `AppShell`-based shell around route content and one app-level overlay host outside the route outlet;
  - the overlay host currently renders the fullscreen scanner modal and the contextual buffer picker bottom drawer;
  - touched route pages now keep their route-local composition under `src/pages/<route>/`, with `sections/`, `dialogs/`, and `lib/` folders as the owning seams for semantic blocks, page-local overlays, and page-local state/helpers;
  - touched list routes for arrivals, departures, drafts, buffer, and stocks now share one generic `CollectionSection` list-shell owner, while each route keeps its own query/filter/sort semantics, card markup, route-local dialogs, and footer/action behavior in `pages/*` owners instead of `features/*`;
  - settings include one fixed theme-mode selector with exactly two supported values: `light` and `dark`;
  - if no persisted theme choice exists yet, the app starts from the current OS light/dark preference through Mantine `useColorScheme()`;
  - the runtime theme layer does not include legacy preset compatibility.
- Current implemented truth, not broad implementation proof yet:
  - reusable gesture handling now has one shared hook seam under `src/shared/gestures/*` instead of per-page touch forks on touched surfaces;
  - reusable haptic signaling now has one shared browser/device adapter seam under `src/shared/haptics/*` instead of raw component-local vibration calls on touched surfaces;
  - both are progressive enhancement only and must never be the only success, warning, error, or alert signal.
- Approved-next policy, not fully rolled out truth:
  - loading/help component policy is fixed for future/touched surfaces even where current placeholder UI still uses temporary patterns.

## 2. Main layers

### app

Bootstrap, providers, theme, root composition.

### router

Typed route tree, route metadata, path helpers, navigation contracts, router wiring.

### pages

Route-owned composition only:

- route entry files
- route-local semantic sections
- route-local dialogs/drawers/modals
- page-local state hooks and pure helpers

Pages do not own durable business logic.

### features

Reusable business/workflow slices:

- `arrival-editor`
- `arrivals-data`
- `departure-editor`
- `departures-data`
- `drafts-data`
- `draft-publish`
- `stocks-data`
- `stock-adjustment`
- `stock-departure-prefill`
- `buffer-core`
- `buffer-picker`
- `scanner-runtime`
- plus existing settings, backup, codes, directories, dashboard, navigation, and PWA slices

### domain

Owning area for:

- records
- input/result contracts
- schemas
- validation issue mapping
- use-case services
- domain lookup and publish logic
- query DTOs

### infrastructure

Owning area for:

- Dexie database wiring
- schema/migrations
- repositories
- query implementations
- browser adapters for scanner/media/import/export
- service composition

### shared

A narrow layer for:

- generic UI primitives
- i18n
- routing helpers
- date/time and text normalization
- id generation
- object/type utilities

## 3. Data flow

### Scanner capture

`scanner modal → scanner runtime/controller → browser scanner adapter seam (live camera | photo file) → one shared buffer store (localStorage) → notifications/status`

- the feature runtime/controller owns session state, overlay coordination, tab switching, and submission into buffer;
- the infrastructure browser scanner adapter owns browser capability reporting, live-session lifecycle, photo/file decode, and machine-readable browser/decode result mapping;
- the shared buffer remains second data in localStorage and is still the only scanner write target at this stage.
- scanner tactile policy:
  - successful decode should be eligible for a short success haptic;
  - recoverable decode failure, duplicate capture, and fatal scanner failure may trigger distinct warning/error haptic patterns only through the shared haptics adapter;
  - tactile feedback is additive to visible status/alert feedback and must degrade cleanly when unsupported or suppressed.

### Form write flow

`component → feature hook/model → domain service → repositories → Dexie transaction`

### Form read flow

`component → feature hook → infrastructure query → Dexie`

### Draft publish flow

`draft page/model → draft publish service → create-arrival/create-departure service + draft repository + record code repository + optional directory repositories → single Dexie transaction`

- publish selects the target explicitly (`arrival` or `departure`) and reuses the corresponding create service for validation, persistence, and related code writes;
- draft deletion/consumption happens in the same transaction as target creation in the intended V1 policy.

### Stock projection

`stock page/feature → infrastructure stock queries / read-model builder → Dexie journals → derived balances`

### Backup/import/export

`settings/backup feature → backup service → JSON engine → browser file adapter → Dexie tables`

- backup/import/export reads and writes first data only unless a future spec explicitly promotes a transient surface to durable user data;
- the backup service produces/consumes validated payloads and machine-readable reports; browser file APIs only serialize, pick, or download bytes after that boundary;
- the restore orchestrator first derives a machine-readable commit plan and conflict report, then executes the selected restore mode;
- the JSON engine is a pure canonical payload serializer/deserializer and does not perform browser I/O;
- restore/commit is an IndexedDB transaction boundary and uses explicit `overwrite`, `merge`, or `rebase` strategy selection;
- localStorage/zustand state is a hydration/cache layer only and must never override IDB truth for durable entities;
- backup metadata updates are part of the same commit transaction when the workflow is persisted.

### Derived projections

`query modules → filtered/sorted/projected read models from Dexie`

## 3.1 Surface ownership policy

- Route-owned surfaces:
  - primary list/detail/create/edit/hub screens for arrivals, departures, drafts, buffer, and settings subtree pages
  - touched list routes now compose directly from route-local semantic sections in `src/pages/<route>/sections/*`; `PageView` is removed from the route vocabulary, and `SectionStack` / `PageSection` are no longer the canonical list-route composition contract
- Global overlay surfaces:
  - app-level singleton overlays opened from multiple entrypoints and rendered from the root overlay host
  - current implemented example: fullscreen scanner modal
- Contextual modal/picker surfaces:
  - requester-scoped overlays that return values or context back to the active route surface without becoming route roots
  - current implemented example: buffer picker bottom drawer

## 3.2 Loading and help policy

- Current implemented truth:
  - root route suspense fallback uses Mantine `Loader`
  - page sections already support `ActionIcon` + `Popover` for medium contextual help
- Approved policy for touched/future surfaces:
  - root/global loading -> `Loader`
  - section/form blocking pending -> `LoadingOverlay`
  - content placeholder loading -> `Skeleton`
  - help trigger -> `ActionIcon`
  - short help -> `Tooltip`
  - medium contextual help -> `Popover`
  - long explanatory or multi-step help -> `Modal`
- Current gap:
  - settings placeholder note/detail/build toggles have been removed; remaining settings subpages are compact route surfaces, while deeper working controls belong to real feature UI.

## 4. Runtime boundaries

- browser/client only:
  - all current runtime logic;
  - scanner/camera/file APIs;
  - scanner browser-adapter capability/lifecycle/decode contracts;
  - browser/device haptics capability and fire/suppress behavior;
  - IndexedDB and localStorage;
  - import/export.
- server only:
  - none in V1.
- shared runtime:
  - not required in the current product direction.
- worker/runtime-specific boundaries:
  - optional future extraction for heavy decode/import work, but not part of current truth.

## 4.1 Gesture and haptic ownership policy

- Shared gesture hook:
  - owns reusable touch/pointer interaction policy such as press/hold/swipe coordination when the same behavior appears across multiple surfaces;
  - does not own business actions, navigation decisions, or feature-specific persistence logic.
- Shared haptics adapter:
  - owns browser/device capability detection, pattern mapping, suppression/no-support handling, and machine-readable fire results;
  - does not own alert copy, scanner business logic, or page-specific orchestration.
- Usage law:
  - route pages and feature components may consume these seams, but should not call raw browser haptics APIs or invent parallel gesture systems inline;
  - haptics and gestures must remain optional enhancement over visible UI, labels, status text, alerts, and notifications.

## 5. Risky or sensitive areas

- scanner device integration:
  - permission states, camera lifecycle, adapter-to-runtime wiring, tab switching, modal mount/unmount timing, photo decode edge cases
- storage migrations:
  - current schema already declares more tables than currently implemented in UI; future migrations must preserve draft/settings/backup compatibility
- data tiering:
  - IDB is the source of truth for durable first data;
  - zustand/localStorage are secondary and may only hold transient or cache-like second data.
- state synchronization:
  - buffer vs form state; form state vs durable write result; settings cache vs IndexedDB truth
- stock consistency:
  - stocks are in the first usable milestone, so arrival/departure semantics and code/link handling must already produce coherent derived balances
- backup/import:
  - validation vs conflict reporting, restore safety, version compatibility, and all-or-nothing commit semantics
- route and IA drift:
  - current source already references future routes in shell/navigation before all screens exist
- donor inheritance risk:
  - scanner/buffer and backup patterns are reusable, but donor inventory-only assumptions must not leak into the new product truth
