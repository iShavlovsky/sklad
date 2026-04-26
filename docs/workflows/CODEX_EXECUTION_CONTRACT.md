# CODEX_EXECUTION_CONTRACT

## 1. Goal

Keep implementation prompts narrow, reviewable, and aligned with the new project truth instead of drifting toward donor
behavior.

## 2. Default operating model

- Use Serena for symbol-aware exploration if helpful.
- One prompt = one narrow slice.
- Do not ask Codex to “finish the app”.
- Start from the smallest required read set.
- Prefer one vertical slice over broad parallel scaffolding.
- If the task changes product truth, schema, or boundaries, update docs in the same slice or add a planning artifact
  first.
- Before any non-trivial technical slice, inspect `package.json` and run a dependency audit before writing custom
  technical machinery.
- For libraries, frameworks, SDKs, browser APIs, and dependency decisions:
    - use Context7 first;
    - if Context7 is insufficient or ambiguous, verify against official primary docs;
    - do not rely on memory for package APIs, options, or compatibility claims.
- For second-data architecture work:
    - consume the existing seams before inventing new ones;
    - treat new stores, controllers, and connectors as exception-only;
    - reject wrappers that only proxy, rename, or lightly reshape existing APIs;
    - require strong justification before adding any new second-data abstraction layer.
- For UI foundation work:
    - inspect `src/app/theme/*` and `docs/architecture/MANTINE_COMPOSITION_FOUNDATION.md` before adding CSS;
    - keep `src/app/styles/base.css` invariant-only;
    - move repeated visual rules into theme/component ownership before accepting new local CSS;
    - normalize touched non-trivial UI owners to folder form unless blocked.
- For local repository code-quality verification:
    - use `npm run verify:all` instead of ad hoc separate lint/format/typecheck calls when you want one honest repo-wide pass;
    - keep the command green before calling the repo-wide surface closed.

## 3. Prompt order

1. Role
2. Read first
3. Dependency audit
4. Goal
5. Constraints / non-goals
6. Acceptance criteria
7. Validation
8. Report format

## 4. Read-first guidance

Default minimal read set:

- `docs/status/CURRENT_STATE_AND_GAPS.md`
- `docs/engineering/PROJECT_OVERRIDES.md`
- `docs/workflows/CODEX_EXECUTION_CONTRACT.md`

Add only what the slice needs:

- scanner or buffer slice:
    - `docs/product/USER_FLOWS.md`
    - `docs/product/PRODUCT_SPEC.md`
    - `docs/architecture/SYSTEM_OVERVIEW.md`
- architecture / ownership slice:
    - `docs/architecture/SYSTEM_OVERVIEW.md`
    - `docs/architecture/PROJECT_STRUCTURE.md`
    - `docs/engineering/TESTING_AND_VERIFICATION_BASELINE.md` when the slice also changes repo verification rules or scripts
- form / domain slice:
    - `docs/product/PRODUCT_SPEC.md`
    - touched `domain/*`, `features/*`, `infrastructure/*` files
- QA-sensitive slice:
    - `docs/qa/PROJECT_QA.md`

## 5. Preferred slice size

A single prompt should usually cover exactly one of:

- scanner modal lifecycle
- buffer page / picker
- one form create/edit flow
- one stock projection / stock page slice
- one draft publish path
- one storage/schema slice
- one focused refactor
- one targeted verification pass

## 6. Runtime verification rule

For release-facing UI or browser-sensitive slices:

- verify the touched flow, not the entire app;
- verify in mobile-shaped layout by default;
- call out when real-device verification was not performed;
- separate observed issues from assumptions.

## 7. Reporting contract

Expected sections:

1. Summary
2. Files Read
3. Files Modified
4. Observed Runtime Issues
5. Decisions
6. Dependency audit
    - relevant existing dependencies
    - external libraries evaluated
    - decision: reuse / add / custom
    - justification
7. Validation
8. Remaining Risks / Follow-ups

## 8. Docs update rule

Update docs when the slice changes:

- scanner/buffer behavior
- durable schema or storage semantics
- route / IA boundaries
- stock derivation semantics
- draft publish semantics
- backup/import expectations
- current operational truth

For second-data slices, keep the seam inventory and anti-abstraction guardrails current when the set of seams or their ownership changes.

## 9. Planning layer rule

Use a planning/change artifact before implementation when the task:

- is cross-cutting
- touches multiple feature boundaries
- changes schema/storage
- changes scanner engine behavior
- changes donor-to-new-project migration strategy
- changes universal arrival/departure truth

## 10. First recommended Codex queue

1. clean unresolved imports / placeholder references that block honest runtime verification
2. finish durable `src/domain` + `src/infrastructure` entity-management surfaces first
3. move to scanner/buffer/UI cleanup; `src/features/stocks/hooks` remains optional only if that derived read layer is
   still intended later
4. keep any optional stocks work separate from the scanner/buffer/UI cleanup track
5. only then resume the deferred feature/page composition slices
