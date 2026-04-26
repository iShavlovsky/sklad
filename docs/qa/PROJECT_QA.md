# PROJECT_QA

## 1. QA strategy
- unit / module tests:
  - pure helpers in `shared/` and `domain/validation/`
  - service-level validation and normalization helpers
  - route-helper and query-helper utilities where logic is non-trivial
- integration checks:
  - Dexie-backed repository/query behavior
  - arrival create/update flows with related directory/code persistence
  - draft publish flows
  - buffer persistence semantics
  - backup import/export behavior and backup restore wiring regression checks
- browser/runtime verification:
  - scanner modal lifecycle
  - camera permission states
  - file/photo decode
  - buffer page and buffer picker
  - arrival/departure core happy paths on mobile-shaped layout
- acceptance criteria for release-facing changes:
  - changed flow must be verified where it actually runs;
  - user-visible errors must be observed, not assumed;
  - docs must match the behavior after the slice.

## 2. Verification order
1. focused local checks on touched modules
2. focused service/query/feature verification
3. broader build verification only when the touched slice justifies it
4. targeted runtime verification for user-visible and browser-sensitive flows

## 3. Runtime verification policy
For user-visible and browser-sensitive changes:
- prefer mobile-shaped verification first;
- verify only the touched flow;
- explicitly record what was observed on desktop/emulation/real device;
- do not claim scanner or import robustness without actual runtime evidence.

## 4. Done criteria
A change is done only when:
- the intended slice works end-to-end at its own boundary;
- stated constraints are preserved;
- validation claims match actual evidence;
- truth docs are updated if behavior/schema/boundaries changed;
- the report clearly distinguishes verified behavior from assumptions.

## 5. Commands (target project standard)
These commands are the **expected repo standard** once the root config is restored:

- install: `npm ci`
- lint: `npm run lint`
- typecheck: `npm run typecheck`
- build: `npm run build`
- focused test: `npm run test -- <pattern>`
- e2e: `npm run test:e2e`
- local dev: `npm run dev`

Note:
- the supplied `src.zip` did not include the actual repo root or package scripts;
- these commands must be confirmed against the real repository before being treated as verified.

## 6. Notes
Project-specific QA caveats:
- scanner flows require targeted browser/runtime checks and later real-device smoke;
- current release gate status:
  - static gates and unit tests are green in the latest local verification;
  - targeted release smoke for scanner modal, route-form arrivals/departures, buffer, backup, stocks, route availability, and selected mobile layout surfaces is green on the mobile 360x800 Playwright project;
  - full `npm run test:e2e` is not green yet because stale specs still target removed dialog/page-header/semantic-heading contracts and dev-only surfaces;
  - do not claim `first-release-ready: yes` until the full e2e release set is reconciled and green, or until the release smoke set is explicitly narrowed and documented.
- backup/import is high-risk because it mutates durable data;
- backup restore wiring is closure-grade after reusable-role extraction; remaining QA there should be regression-only unless a future slice changes restore semantics;
- first data is now a leave-alone surface; QA should treat new first-data changes as regression or bugfix scope, not as an active completion workstream;
- first-data documentation is frozen around the current service/query/hook seams; QA should not interpret missing new comments elsewhere as an active implementation gap;
- route placeholders should not be treated as implemented screens during QA;
- stock/statistics verification should wait until their read models exist;
- once the repo root is restored, add a small but real test harness instead of relying only on manual smoke.
