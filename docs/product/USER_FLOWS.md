# USER_FLOWS

## IA and surface ownership rules

### Current implemented route-first subtree
- `/arrivals`
- `/departures`
- `/drafts`
- `/buffer`
- `/settings`
- `/settings/profile`
- `/settings/backup`
- `/settings/about`

### Surface ownership rule
- Route:
  - primary list/detail/create/edit/hub pages live in the route tree
- Global overlay:
  - singleton app-level overlays opened from multiple entrypoints live outside route pages in the root overlay host
  - current implemented example: scanner modal
- Contextual modal/picker:
  - requester-scoped overlays stay contextual and return data/help back to the active route surface
  - current implemented example: buffer picker

### Loading and help policy
- Current implemented truth:
  - root route loading uses Mantine `Loader`
  - some page sections already use `ActionIcon` + `Popover` for contextual help
- Approved policy for touched/future surfaces:
  - root/global loading -> `Loader`
  - section/form blocking pending -> `LoadingOverlay`
  - content placeholder loading -> `Skeleton`
  - help trigger -> `ActionIcon`
  - short help -> `Tooltip`
  - medium contextual help -> `Popover`
  - long help or flow help -> `Modal`
- Current settings placeholder truth:
  - local settings placeholder notes/details/build toggles have been removed; remaining settings subpages are compact route surfaces, while deeper working controls belong to real feature UI.

## Flow: Global scanner capture > buffer

### Goal
Capture a QR code or image result and keep it as a shared staging value before it is applied to a business form.

### Entry points
- header scanner action;
- arrival form;
- departure form;
- future screens that need fast code capture.

### Happy path
1. User opens the global scanner modal.
2. The modal opens on the live tab; if camera access is available, scanning starts automatically.
3. The live preview area itself acts as the pause/resume control; the user can tap the scanning area to stop or restart live scanning without using a separate play/pause button.
4. The user can switch to the photo tab, select an image, and decode a code from file input.
5. The decoded result is appended to the shared buffer.
6. The user sees the captured value and can continue working from the current route after closing the modal.

### Important validations
- scanner does not write directly into arrival/departure/draft tables;
- the live tab should degrade cleanly when camera support is missing and the photo tab remains available;
- oversized image files reject cleanly;
- duplicate capture does not stay silent.
- haptic feedback, when supported, is progressive enhancement only:
  - success decode may emit a short success haptic;
  - duplicate / recoverable decode failure may emit a warning haptic;
  - fatal scanner failure may emit an error haptic;
  - visible status text, alerts, and notifications remain required even when haptics fire.

### Error / edge cases
- no camera permission;
- unsupported device;
- decode failed;
- duplicate in buffer;
- image file too large;
- modal closed mid-session.

### Success state
The buffer receives a new item with captured value and timestamp; modal state resets only on modal close.

### Notes
V1 buffer remains one shared list. Business forms consume copied values from the buffer rather than owning buffer state.

---

## Flow: Buffer > arrival form

### Goal
Apply one or more scanned values into an arrival form without removing them from the shared buffer.

### Entry points
- arrival create modal/page;
- arrival edit flow;
- future draft-to-arrival flow.

### Happy path
1. User opens the arrival form.
2. User opens the buffer action.
3. A contextual buffer picker lists current buffer items.
4. User selects one or more items to apply.
5. Selected values are copied into the arrival form codes field.
6. User finishes the rest of the form and saves the arrival.

### Important validations
- the user still must provide a valid arrival title;
- applying a code must not delete the original buffer item;
- the form owns the copied value, but not the original buffer item.

### Error / edge cases
- buffer empty;
- buffer item edited before apply;
- duplicate codes already present in form.

### Success state
Arrival is saved as a durable record, and related codes are written to durable code storage.

### Notes
Directories are optional. User can type supplier/product/category manually.

---

## Flow: Code lookup / buffer > departure form

### Goal
Create a departure faster when the user already has a code or can link the departure to an existing arrival.

### Entry points
- departure create flow;
- departure draft publish;
- scanner action inside departure context.

### Happy path
1. User opens the departure form.
2. User selects an existing arrival, scans a code, or applies a value from buffer.
3. The system performs lookup against durable arrivals / record codes.
4. If there is a match, the departure form is prefilled, but the user can still edit values before save.
5. User selects mode (`profit` / `loss`), updates fields if needed, and saves the departure.

### Important validations
- scanner still writes to buffer first;
- departure prefill remains user-editable;
- missing match should not become a hard failure.

### Error / edge cases
- lookup returns no match;
- match is ambiguous;
- nothing usable exists in buffer;
- the selected departure mode changes how prefill is interpreted.

### Success state
Departure is saved as a separate durable record, optionally linked to a source arrival.

### Notes
Lookup is driven by code and durable journal data, not by hidden page-local assumptions.

---

## Flow: Draft save > draft open > publish

### Goal
Let the user save incomplete work and later publish it into either an arrival or a departure.

### Entry points
- arrival form;
- departure form;
- drafts list.

### Happy path
1. User opens a create or edit form.
2. User saves it as a draft.
3. User opens the draft from the drafts list.
4. The stored payload is restored.
5. User chooses a target: arrival or departure, and publishes the draft.
6. The system creates the target durable record, writes related codes, and consumes the draft in the same transaction.

### Important validations
- draft lives in its own durable table;
- publish does not bypass target validation;
- publish target must match draft kind;
- publish flow owns target mapping explicitly, but reuses the target create service for actual validation and persistence;
- draft consumption happens transactionally with target creation.

### Error / edge cases
- stale draft payload after schema evolution;
- validation error on publish;
- missing draft;
- target mismatch;
- target resolution failure;
- infrastructure write failure;
- partial related-directory resolution failure.

### Success state
Draft is consumed by publish in the same transaction, and target record exists durably.

### Notes
Draft editing should happen on dedicated pages/routes, not through tiny modal-only editing.

---

## Flow: Journals > stocks read model

### Goal
Produce one usable stock view derived from journals, without turning stock into a manually authored source of truth.

### Entry points
- stocks page;
- dashboard/favorites widgets;
- future search/filter flows.

### Happy path
1. User opens the stocks page.
2. The app reads a projection from arrivals and departures.
3. The UI displays current balances / availability grouped by relevant dimensions.
4. User can inspect rows, quantities, and supporting state derived from journal history.

### Important validations
- stocks are derived, not hand-authored primary records;
- stock projection must tolerate optional directories and manual free-text input;
- stock calculations must stay consistent with journal history.

### Error / edge cases
- inconsistent legacy journal data;
- missing directory links;
- multiple codes per record.

### Success state
User sees coherent current stock state derived from the saved journals.

### Notes
Stocks are meant to reach one usable milestone, not replace the journal model as the core business truth.

---

## Flow: Export / import durable data

### Goal
Give the user explicit data export and restore workflows without requiring any backend.

### Entry points
- settings/backup screens;
- manual maintenance workflow.

### Happy path
1. User opens the backup/import area.
2. Backup workflow records snapshot/checkpoint metadata in IndexedDB as part of the durable first-data path.
3. Backup service reads the current first-data payload from IndexedDB and builds a user-visible report.
4. Reusable JSON engine serializes payload to JSON.
5. Reusable browser file adapter starts download.
6. Later the user selects a JSON file for import.
7. The system performs shape/version validation and gets a machine-readable status/report and commit plan before commit; reusable diff / merge / rebase core may contribute to the restore plan, but backup-specific connectors own the user-facing semantics.
8. User selects a commit strategy: `overwrite`, `merge`, or `rebase`.
9. Restore orchestrator performs all-or-nothing restore in IndexedDB according to the supported V1 mode and checkpoint/history policy.

### Important validations
- buffer is not the main durable backup payload;
- settings, favorites, profiles, journals, directories, drafts, backup checkpoints, and backup history remain explicit first-data groups;
- import must validate shape and version before commit;
- browser file APIs are only adapters around the validated payload;
- restore/commit writes happen in a single IndexedDB transaction for V1;
- snapshot/checkpoint metadata is committed with the workflow transaction when a backup checkpoint is requested.

### Error / edge cases
- malformed JSON;
- unsupported version;
- version mismatch;
- reportable conflict;
- write failure;
- partial restore is not a supported V1 mode.

### Success state
Durable data is exported/imported with explicit user-visible result reporting, and the chosen restore strategy is reflected in the machine-readable report.

---

## Flow: Settings subtree navigation

### Goal
Keep settings route-first, understandable from IA alone, and separate hub navigation from deeper route-owned content.

### Current implemented truth
1. User opens `/settings` as the hub route.
2. The hub links into `/settings/profile`, `/settings/backup`, and `/settings/about`.
3. Each child page is route-owned, not a nested modal.

### Notes
- `/settings` is the hub, not a dumping-ground page for every future settings panel.
- Help and loading on touched/future settings surfaces should follow the shared Mantine policy documented above.

---

## Cross-flow policy: gestures and haptics

### Shared usage law
- gesture handling that appears on multiple surfaces should go through one shared gesture hook, not page-local touch forks;
- haptic signaling should go through one shared browser/device adapter, not raw `navigator.vibrate(...)` calls from route pages or ad hoc components;
- both are progressive enhancement only and must degrade to visible UI feedback with no behavior loss.

### Scanner expectations
- scanner success may use a short success haptic;
- duplicate / recoverable scanner issues may use a warning haptic;
- fatal scanner failure may use an error haptic;
- scanner haptics must never bypass visible status, alert, or retry affordances.

### Alert and confirmation expectations
- high-importance destructive confirmations, hard validation blocks, and important alert/notification surfaces may use shared confirm/warning/error haptics where device support exists;
- low-importance informational toasts should stay visually lightweight and should not default to haptic noise.

### Broad rollout status
- this policy is now canonical repo truth;
- broad implementation rollout and real-device verification are still pending.
