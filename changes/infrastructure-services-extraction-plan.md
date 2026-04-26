# infrastructure-services-extraction-plan

## 1. Proposal

### Change name
`infrastructure-services-extraction-plan`

### Problem
`src/infrastructure/services/index.ts` currently mixes service composition, repository instantiation, dependency bundles, transaction wrappers, and public facade exports in one file. That is not closure-grade because the layer is hard to read, hard to extend, and too easy to grow into a second monolith.

### Goal
Preserve a narrow public composition root while moving bounded-area service orchestration into internal modules.

### Non-goals
- Do not change domain behavior.
- Do not add public decorative barrels.
- Do not move orchestration into repositories or queries.
- Do not introduce a backup service surface that does not exist yet.
- Do not implement the split in this slice.

### Why now
The service layer has reached the point where the architecture truth needs to name the monolith explicitly and define the extraction path before any code refactor starts.

---

## 2. Audit

### Current responsibility clusters in `src/infrastructure/services/index.ts`
- composition root wiring for `appDb`
- repository instantiation for journals, directories, personalization, and `recordCodes`
- service instance instantiation for arrival, departure, draft, and personalization writes
- dependency bundle assembly for:
  - arrival create/update/delete
  - departure create/update/delete
  - draft create/update/delete/publish
- transaction wrappers for:
  - arrival writes
  - arrival deletes
  - departure writes
  - departure deletes
  - draft writes
  - draft deletes
  - draft publish
- public facade exports for settings/favorites/profiles and journal write services

### Natural bounded areas already present
- `personalization`
  - settings, favorites, profiles
  - simple one-repository facades
- `journals`
  - arrivals
  - departures
  - drafts
  - cross-entity write transactions and dependency reuse

### What must stay out of the service layer
- business rules that belong in `domain`
- table-local persistence that belongs in repositories
- read-model shaping that belongs in `infrastructure/queries`
- UI-specific orchestration

---

## 3. Design

### Canonical target shape
```txt
src/infrastructure/services/
  index.ts                  # public composition root only
  personalization/
    personalization.services.ts
  journals/
    arrival.services.ts
    departure.services.ts
    draft.services.ts
```

### Design decisions
- `index.ts` stays the only public entrypoint for the service layer.
- Internal modules own bounded-area wiring, transaction policy, and facade creation.
- One semantic grouping level below the root is justified because the layer already splits cleanly by bounded area.
- Avoid a second generic abstraction layer just to move code around.
- Keep repeated orchestration logic local to the area module unless a later slice proves a shared helper is worth the coupling.

### Minimal extraction order
1. Extract `personalization` first.
2. Extract `journals/arrival` and `journals/departure` next.
3. Extract `journals/draft` last because publish orchestration is the most composed path.
4. Only after the split exists, decide whether any transaction helper deserves a shared service-local utility.

### Risks
- premature helper sharing could recreate the same monolith in a different folder
- cross-area dependency reuse can tempt a generic service utility layer
- keeping `index.ts` too fat would preserve the original problem under a new file name

### Rollout / migration notes
- keep the current public exports stable during the split
- migrate one bounded area at a time
- do not change call sites until the new internal modules are in place

---

## 4. Tasks

1. Extract `personalization` service wiring.
   - expected output: thin module for settings/favorites/profiles facade creation
   - verification: imports still resolve through the public root
   - docs impact: `CURRENT_STATE_AND_GAPS.md`, `PROJECT_STRUCTURE.md`, `architecture_structure.md`
2. Extract journal service wiring.
   - expected output: bounded-area modules for arrivals and departures
   - verification: transaction boundaries preserved
   - docs impact: same three truth docs
3. Extract draft service wiring.
   - expected output: bounded-area module for draft create/update/delete/publish
   - verification: publish path still composes the same domain services and repositories
   - docs impact: same three truth docs

---

## 5. Spec delta

### New truth
- `src/infrastructure/services/index.ts` is a public composition root, not the place where all service orchestration lives.
- bounded-area service modules are the canonical place for transaction wrappers and facade assembly.

### Updated truth
- `src/infrastructure/services` is no longer treated as an acceptable monolith shape.
- service-layer orchestration belongs in internal bounded modules, not inline in the root file.

### Removed truth
- the architecture does not endorse a single large `index.ts` as the long-term service layer shape.
