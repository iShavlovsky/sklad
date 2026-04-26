# ENGINEERING_BASELINE

This document defines the reusable engineering baseline for coding doctrine and API discipline.

If a repository needs stricter or more specific rules than this baseline, those rules belong in:
- `docs/engineering/PROJECT_OVERRIDES.md`

## 1. Priorities

1. correctness
2. architecture
3. maintainability
4. performance
5. convenience

## 2. Coding doctrine

- Prefer explicit contracts over implicit behavior.
- Prefer composition over inheritance.
- Prefer minimal diffs over broad rewrites.
- Refactor before adding new responsibility into overloaded code.
- Keep side effects isolated and obvious.
- Prefer self-documenting code over comments.
- Keep changes reviewable and small.

## 3. TypeScript defaults

- Use TypeScript `strict` by default.
- Do not use `any`.
- Use `unknown` only with proper narrowing.
- Add explicit return types for public and exported APIs.
- Avoid unsafe assertions, broad casts, and non-null assertions.

## 4. Imports and type imports

- Separate runtime imports from type imports.
- Use `import type` for type-only imports.
- Keep import structure readable and ownership-obvious.

## 5. Guard clauses

- Use one-line guard clauses when condition and return are trivial.
- Expand to block form when condition, branching, or side effect is non-trivial.

## 6. Function and API style

- Prefer small composable functions.
- Use `function` declarations for exported or public logic by default.
- Use arrow functions for local callbacks, adapters, and short local helpers.
- Keep public APIs narrow and explicit.
- Export only what external consumers actually need.

## 6.1 JSX conditional rendering

- For conditional JSX with no meaningful fallback, prefer `condition && <Node />` over `condition ? <Node /> : null`.
- Use ternary form only when both branches carry real meaning in the rendered output.
- Keep empty render branches out of JSX when they do not add clarity.

## 6.2 React component file shape

- Prefer one React function component per file.
- Split secondary local components into neighbor files when the extraction is safe, keeps ownership clear, and does not introduce duplication or fake abstraction.
- Do not force this rule when keeping tightly coupled UI primitives together is genuinely clearer or when the split would create churn without maintainability gain.

## 7. Error handling defaults

- Use stable typed error codes on public contracts.
- Keep internal error handling explicit; do not hide failure modes behind broad fallback behavior.
- Preserve error context when rethrowing or mapping errors.

## 8. Complexity and extraction discipline

- Prefer low nesting and low incidental complexity.
- Use soft complexity signals, not hard style-law limits.
- Default signals:
  - nesting target: <= 3
  - cyclomatic complexity target: <= 8
  - cyclomatic complexity ceiling: 12
- Extract before extending already-large files or functions.
- Do not add new responsibilities to already-mixed code.
