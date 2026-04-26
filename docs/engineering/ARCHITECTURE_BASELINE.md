# ARCHITECTURE_BASELINE

This document defines the reusable engineering baseline for boundaries, ownership, and module decomposition.

If a repository needs stricter or more specific rules than this baseline, those rules belong in:
- `docs/engineering/PROJECT_OVERRIDES.md`

## 1. Boundary model

- Keep module boundaries explicit.
- Keep domain rules near the owning bounded area.
- Isolate infrastructure from domain contracts.
- Do not blur domain rules inside orchestration layers.

## 2. Ownership defaults

- The owning module owns its domain helpers.
- Shared layer must stay narrow.
- Move code to shared only when it is truly agnostic, reusable, and domain-independent.

## 3. Shared vs local helpers

- Domain-specific helpers stay local by default.
- Shared code must not depend on product or domain semantics.
- Reuse alone is not enough reason to move code into shared.

## 4. Module decomposition defaults

- Separate `types`, `constants`, `config`, `schema`, `service` / `use-case`, `mapper`, `validator`, `calculator` when this reduces mixed responsibility.
- Split by responsibility and ownership, not mechanically by file count.
- If a file is already large or mixed, split it before extending it further.

## 5. Barrel policy

- Use `index.ts` only for a real public boundary.
- Do not add barrels for aesthetics or shorter import paths.
- Keep internal helpers private by default.

## 6. Extraction sequence

- Extract pure helpers first.
- Extract stable sibling responsibilities next.
- Introduce public boundaries only when external consumers actually exist.
- Keep extraction incremental and reviewable.

## 7. Architectural consistency

- Prefer disciplined multiparadigm code over ad hoc mixing.
- Declarative style is the default when it improves clarity.
- Imperative style is allowed when it makes control flow, side effects, or performance constraints clearer.
- Intentional paradigm shifts for a project or layer belong in `PROJECT_OVERRIDES.md`.

## 8. Design patterns

- Prefer recognizable design patterns when they clarify ownership, contracts, and change shape.
- Use patterns as constraints that reduce accidental complexity, not as decorative abstractions.
- Do not mix incompatible patterns inside one module without an explicit reason.
- Prefer one clear pattern per boundary over hybrid ad hoc structure.
