# PROJECT_OVERRIDES

This file records project-specific deviations from the reusable baseline.

## Paradigm overrides

- Baseline default: declarative style where it keeps modules simple.
- Project-specific rule: scanner runtime, camera lifecycle, file decode, backup import, and draft publish flows may use **explicit imperative orchestration**.
- Why: these flows coordinate browser APIs, side effects, transactional writes, and user-visible state transitions. Hiding them behind over-declarative abstractions would make failures harder to reason about.

## Architecture overrides

- Baseline: shared layer must stay narrow.
- Project-specific rule: typed routing is treated as a first-class boundary with its own `router/` and `shared/routing/` areas.
- Scope: route tree, route ids, path generation, nav metadata, and route-level page/head contracts.
- Why: navigation is a durable app-level contract and should not be scattered across feature folders.

- Baseline: project truth should not duplicate baseline.
- Project-specific rule: architecture docs may explicitly call out the scanner → buffer → form pipeline repeatedly when needed.
- Scope: product and system docs only.
- Why: this boundary is the single most important anti-coupling rule in the project.

## Additional UI / IA overrides

- Baseline: page ownership may stay implicit until screens mature.
- Project-specific rule: touched UI surfaces must use explicit ownership across route, global overlay, and contextual modal/picker surfaces.
- Scope:
  - route-first subtree: `arrivals`, `departures`, `drafts`, `buffer`, `settings`
  - settings subtree: `/settings`, `/settings/profile`, `/settings/backup`, `/settings/about`
  - global overlay surfaces rendered from the root overlay host
  - contextual modal/picker surfaces that serve one active requester without becoming route roots
- Why: the project needs one stable answer to "is this route-owned, global, or contextual?" before UI work scales.

- Baseline: shell/layout direction can stay implementation-defined.
- Project-specific rule: Mantine `AppShell` is the canonical and now implemented app-level shell direction for touched shell work.
- Scope: root layout, app shell docs, shell refactors.
- Why: the root layout now renders one `AppShell`-based `MobileShell`, so docs should treat the shell direction as current truth instead of approved-next only.

- Baseline: loading/help affordances may be documented ad hoc.
- Project-specific rule: touched and future UI surfaces should use a fixed Mantine vocabulary:
  - root/global loading -> `Loader`
  - section/form blocking pending -> `LoadingOverlay`
  - content placeholder loading -> `Skeleton`
  - help trigger -> `ActionIcon`
  - short help -> `Tooltip`
  - medium contextual help -> `Popover`
  - long help or flow help -> `Modal`
- Why: loading and help behavior should stay predictable across features instead of drifting per page.

- Baseline: page-width rhythm can vary per screen.
- Project-specific rule: route-owned pages should stay mobile-first and use shared page primitives plus the shell-owned rail as the default page-width rhythm.
- Scope: page layouts and page-level shared wrappers.
- Why: current touched route pages still use the shared shell rail and page primitives, but the canonical route contract is now direct semantic composition from `src/pages/<route>/sections/*`; `SectionStack` and `PageSection` remain optional primitives, not the required route hierarchy.

- Baseline: app styling may stay in a broad global stylesheet until later cleanup.
- Project-specific rule: Mantine-first styling is mandatory for touched UI.
- Scope:
  - shared theme tokens and `theme.components`
  - Mantine `defaultProps`, `styles`, `classNames`, and `vars`
  - Mantine composition components and Styles API
  - Mantine CSS variables as the bridge into local CSS modules
  - colocated `*.module.css` only for local geometry/advanced selectors
  - invariant-only root base CSS
- Why: shared visual defaults should live in Mantine theme ownership, while shell geometry and exceptional layout styling stay local instead of drifting back into a monolithic stylesheet.
- Current applied truth:
  - `src/shared/ui/global.css` is removed and forbidden;
  - Mantine package styles remain the required global baseline;
  - `src/app/styles/base.css` should not own body/link/component visuals;
  - touched control/surface defaults should be pushed into `src/app/theme/components.ts` before adding owner-local CSS;
  - touched route pages and router layouts follow the same owner-folder law as `shared/ui`.
  - do not add styling-only pass-through props that just tunnel local classes through intermediate components; if only one owner needs the styling, keep that ownership local.
  - avoid `clsx` for simple one-owner Mantine surfaces when the same result can be expressed with Mantine props, static class ownership, or theme/component defaults.
  - when a colocated `*.module.css` is still the honest owner, write it with owner-scoped custom properties and modern selectors/features that reduce duplication instead of repeating the same surface recipe per element;
  - keep advanced CSS feature use pragmatic: prefer features that are already supported by the current toolchain/browser target or that have a clear `@supports`/fallback path;
  - remove decorative or inert properties that do not change rendered behavior, layout, interaction, or accessibility.

- Baseline: flat UI file layout may be acceptable while the codebase is still small.
- Project-specific rule: non-trivial UI owners should move toward component-as-folder structure.
- Scope: shared page primitives, shell/navigation UI, and future touched feature UI owners.
- Why: unrelated flat sibling UI files become a dumping ground; local owner folders keep behavior, styles, and helper files aligned.
- Enforcement rule:
  - a touched non-trivial owner should not leave the slice in flat `*.tsx` / `*.module.css` form unless there is a concrete migration blocker.
  - router helper components and app-level overlay/status owners follow the same rule.
  - when a touched `*.tsx` file contains multiple React function components, split them into owner-local neighbor files if the extraction is safe and does not create duplication-only seams.

## Tooling / storage overrides

- Baseline: durable user settings may follow the default project storage pattern.
- Project-specific rule: this project intentionally splits storage:
  - IndexedDB for durable data and durable settings
  - localStorage for scanner buffer and other transient workflow state only
- Why: buffer is fast, disposable staging state; settings, favorites, profile, and backups are part of user data and must participate in export/import.

- Storage-tier policy:
  - first data: IndexedDB-backed durable source of truth, including journals, drafts, directories, settings, favorites, profiles, and backup metadata
  - second data: transient buffer/runtime/session/view state, plus cache-like UI state that is not explicitly promoted to durable user data
  - hydration rule: load from IDB first; use zustand/localStorage only as a secondary cache or ephemeral state layer, never as the source of truth for durable entities
  - backup/import policy: include first data only; exclude second data unless a future doc explicitly promotes a transient surface to durable user data
  - browser file selection, serialization, and download are adapter concerns that begin after the backup service emits a validated payload
  - restore/commit semantics must be transactionally anchored in IndexedDB, never in zustand/localStorage

- Baseline: dependencies may be added whenever they look convenient.
- Project-specific rule: dependency discipline is explicit and global.
  - Before any non-trivial technical slice, inspect `package.json` first.
  - Prefer already-installed libraries when they honestly cover the needed role.
  - If the task is typical and expensive to implement safely by hand, evaluate mature external libraries before writing custom code.
  - Do not add a new dependency by default.
  - A new dependency is allowed only when it:
    - closes a real role end-to-end, not a tiny convenience gap;
    - respects layer boundaries;
    - materially reduces risk and the amount of custom technical code;
    - does not conflict with first data, backup, router, or feature-hook architecture;
    - does not duplicate an already-installed library or create an overlapping npm zoo.
  - Library-specific technical concerns do not belong in `domain`.
  - Browser/file/serialization/adapter concerns stay in `infrastructure`.
  - `shared` must not absorb backup/domain-specific wrappers.
  - If no dependency is adopted, the implementation report must state why custom implementation is still justified.

- Baseline from donor: current legacy scanner engine is `html5-qrcode`.
- Project-specific rule: the new project standardizes on **ZXing** for scanner capture.
- Scope: live camera scanning and file/photo decoding in the new codebase.
- Why: product truth already fixes ZXing as the preferred V1 engine; donor engine choice is not carried over as canonical truth.

## Accepted debt

- Current `src.zip` contains only the `src/` tree; repository root files (package config, tsconfig, vite config, test config, CI wiring) were not part of the supplied snapshot.
- Why accepted now: product and architecture truth can still be normalized before implementation continues.
- Removal trigger: once the real repo root is restored or reconstructed, QA commands and runtime assumptions must be verified against actual scripts.

- The current source tree already contains route placeholders and shell affordances for screens that do not yet exist.
- Why accepted now: the information architecture direction is useful, but the missing screens must not be treated as implemented behavior.
- Removal trigger: once scanner, buffer, arrivals, departures, settings, and drafts slices land, placeholder/commented routes should be replaced with real pages.

- Some current files contain BOM markers and commented scaffolding.
- Why accepted now: not a blocker for architecture normalization.
- Removal trigger: clean up during the first implementation-quality pass touching those files.
