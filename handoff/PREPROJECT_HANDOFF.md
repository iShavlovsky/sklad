# PREPROJECT_HANDOFF

## 1. Project idea
- Project name: **SKLAD** (working name only)
- One-sentence summary: Offline-first app for fast accounting of incoming and outgoing entities with scanner-first capture through a reusable buffer.
- Primary audience: single user / small operator who needs local-first workflows without backend setup.

## 2. Normalized scope
- Core problem:
  - make scanner-assisted input, staging, and durable accounting fast and predictable;
  - keep forms independent from scanner runtime;
  - support unfinished work through drafts;
  - keep user data durable locally.
- V1 goals:
  - scanner modal with live/photo capture;
  - one shared reusable buffer;
  - arrivals;
  - departures;
  - drafts;
  - stocks as derived read model in the first usable milestone;
  - optional directories;
  - durable settings;
  - JSON import/export;
  - mobile-first app shell.
- Non-goals:
  - cloud sync;
  - multi-user support;
  - Google integration;
  - advanced conflict UX;
  - broad analytics;
  - donor-compatible inventory-only scope.

## 3. Key flows
- Flow 1: scanner capture → buffer
- Flow 2: buffer → arrival form
- Flow 3: code lookup / buffer → departure form
- Flow 4: save draft → publish draft
- Flow 5: journals → stocks projection
- Flow 6: export/import durable data

## 4. Technical assumptions
- Platform: React + TypeScript browser app
- Runtime: browser-only, mobile-first shell
- Storage:
  - Dexie + IndexedDB for durable records/settings
  - localStorage for transient scanner buffer
- External integrations:
  - camera/media APIs
  - browser file APIs
  - ZXing scanner adapter as intended scanner direction
- Delivery constraints:
  - static-friendly routing/deploy remains the current default
  - no backend
  - offline-first core behavior
  - actual working repo should combine new `src/` with donor repo-root files unless intentionally changed

## 5. Initial architecture direction
- Main layers:
  - app
  - router
  - pages
  - features
  - domain
  - infrastructure
  - shared
- Key boundaries:
  - scanner is capture tooling, not a business entity;
  - forms consume buffer values and lookup results;
  - buffer remains one shared list in V1;
  - writes go through domain services and repositories;
  - reads go through query modules;
  - stocks remain derived read models.
- Important risks:
  - donor behavior leaking into new truth;
  - shell-first development without finished vertical slices;
  - blurred storage semantics across buffer/settings/durable records;
  - unresolved placeholder imports in the current `src/` snapshot.

## 6. Initial doc set produced
- `AGENTS.md`
- `docs/engineering/PROJECT_OVERRIDES.md`
- `docs/product/PRODUCT_BRIEF.md`
- `docs/product/USER_FLOWS.md`
- `docs/product/PRODUCT_SPEC.md`
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/architecture/PROJECT_STRUCTURE.md`
- `docs/qa/PROJECT_QA.md`
- `docs/status/CURRENT_STATE_AND_GAPS.md`
- `docs/workflows/CODEX_EXECUTION_CONTRACT.md`
- `handoff/PREPROJECT_HANDOFF.md`

## 7. Open questions
- Keep working name `SKLAD` for now, but decide final repo/product naming before public-facing polish.
- Reconfirm static/hash-router deployment only if deployment target changes later.
- Decide when to replace donor scanner dependency/config from `html5-qrcode` to the intended ZXing path during implementation, not in theory.

## 8. First implementation queue
1. remove blocking unresolved imports / stale placeholder references in the new `src/`
2. implement scanner + one shared buffer foundation
3. finish full arrival slice
4. finish full departure slice
5. implement stocks projection/page for first usable milestone
6. implement drafts slice
7. implement settings + favorites + backup baseline

## 9. Notes for working ChatGPT Project
- Keep prompts narrow and slice-based.
- Treat donor code as implementation reference, not truth source.
- Use donor repo root as the current default shell around the new `src/`, unless a slice intentionally changes config/scripts/assets.
- Do not reintroduce inventory-only constraints unless product docs are intentionally changed.
- Do not treat commented routes or reserved shell actions as completed features.
