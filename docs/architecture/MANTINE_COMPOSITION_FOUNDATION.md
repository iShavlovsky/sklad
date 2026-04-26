# Mantine Composition Foundation

## Purpose

This document is the canonical styling law for SKLAD UI slices.

The default answer to "how should this be styled?" is:

1. Mantine theme tokens
2. Mantine component defaults / Styles API / `classNames` / `vars`
3. Mantine composition components
4. colocated `*.module.css` only when Mantine cannot own the result honestly

## Core law

- Prefer Mantine composition over freeform wrapper markup.
- Prefer `AppShell`, `Stack`, `Group`, `Flex`, `Box`, `Paper`, `Card`, `Fieldset`, `InputWrapper`, `Badge`, `ActionIcon`, `Tooltip`, `Popover`, `Modal`, `Typography`, and style props before custom CSS.
- Prefer `theme.components`, `defaultProps`, component `styles`, and CSS variables before repeating the same visual rules across feature files.
- Prefer Mantine `vars` and component extension points when repeated size/state styling can live on the component contract instead of in owner CSS.
- Prefer theme or component-level defaults for typography, spacing, radii, borders, control sizing, and common surface styling.
- Mantine CSS variables are the default bridge between theme ownership and local CSS modules.
- Do not introduce styling-only pass-through props such as `labelClassName`, `innerClassName`, `pillClassName`, or similar escape hatches when the owner can be expressed directly with Mantine composition, theme defaults, `classNames`, or local owner CSS.
- Use `clsx` only when there is a real need to merge optional external classes or conditional state classes; do not keep `clsx` around when a single owner class or Mantine prop already solves the surface.
- Responsive law:
  - the canonical mobile base is `360px` CSS width / `22.5rem`
  - `352px` / `22rem` is the dense-content guardrail for compact composition inside that shell
  - the first large-phone enhancement tier is `428px` / `26.75em`
  - structural breakpoints belong in theme tokens and should use `em`
  - owner sizing/spacing tokens should use `rem` and `clamp()` before inventing extra breakpoint forks

## CSS modules law

`*.module.css` is allowed only when one of these is true:

- shell or page geometry must be enforced outside a single Mantine component;
- viewport/media/cropper/dropzone/slider behavior needs raw CSS;
- advanced selectors, data-attribute states, or nested interaction styling are clearer in CSS;
- Mantine composition would become artificial or harder to maintain than a small local stylesheet.

`*.module.css` is not the default place for:

- repeated card styling;
- repeated control styling;
- repeated text styling;
- project-wide tokens;
- global component ownership.

## Modern CSS modules law

When local `*.module.css` is justified, write it as modern owner-local CSS instead of a pile of repeated declarations.

- Put repeated local values on the owner root as custom properties before styling descendants.
- Prefer modern selectors and composition tools that reduce duplication:
  - nesting
  - `:is()` / `:where()` / `:has()`
  - logical properties
  - `color-mix()` / `light-dark()`
  - container queries
  - `@supports`
- Use advanced features such as `@property`, style queries, `@starting-style`, or scroll-driven animation only when:
  - they materially improve the owner;
  - the current support/tooling story is acceptable for this repo;
  - and a fallback exists when needed.
- Keep state selectors that need nesting or data-attribute targeting in CSS modules plus Mantine `classNames`, not in Mantine theme `styles` objects.
- Remove inert or decorative properties that do not change rendered output, interaction, or accessibility.
- If multiple descendants need the same local surface/border/radius/shadow recipe, collapse it into owner-scoped variables or move the repeated visual rule to theme ownership.

## Global CSS law

- `@mantine/core/styles.css` is the required global baseline.
- Mantine baseline already owns `body` font, line-height, color-scheme, and base text/background tokens; project CSS should not duplicate those rules without a concrete browser-level need.
- `src/app/styles/base.css` is allowed only for base invariants:
  - root sizing
  - app/root overflow rules
  - app-wide focus/root browser fixes
  - reduced-motion safety that is intentionally global
- Do not reintroduce `src/shared/ui/global.css`.
- Do not create a replacement monolithic UI stylesheet elsewhere.
- Mantine package styles stay imported at the provider root; they are not a substitute for project-owned visual CSS.

## Component folder law

- Every non-trivial React UI owner should live in its own folder.
- Default folder shape:
  - `index.tsx`
  - `styles.module.css` when needed
  - optional `types.ts`
  - optional `presentation.ts`
  - optional internal helpers with specific names
- If two closely related components share one stylesheet, keep them in the same local owner folder.
- The same folder rule applies to route pages and router-owned layouts, not only `shared/ui`.
- Flat sibling files for unrelated UI entities are not allowed as the long-term pattern.
- Flat sibling `Component.tsx` + `Component.module.css` pairs are transitional debt, not a preferred steady state.
- Catch-all names like `helpers.ts`, `common.ts`, and `misc.ts` remain forbidden when a more specific owner name is possible.

## AI execution rule

When an AI agent touches UI:

1. read this document, `docs/engineering/PROJECT_OVERRIDES.md`, and `docs/architecture/mobile-ui-foundation.md`;
2. inspect `src/app/theme/*` before adding CSS;
3. prefer extending existing theme/component owners over introducing parallel styling seams;
4. when repeated styling is found, move it into theme/component ownership before accepting a second local CSS copy;
5. justify any new `*.module.css` by ownership, not convenience;
6. if local CSS is still required, write it with modern CSS patterns that minimize duplication and keep only working properties;
7. if a touched non-trivial owner is still flat, fold it into a local owner folder unless there is a concrete blocker.

## Current rollout baseline

- `src/shared/ui/global.css` is removed and remains forbidden.
- `src/app/theme/*` now owns shared surface and control defaults, including elevated surfaces, filled inputs, pills, checkbox defaults, and shared shell/page tokens.
- `src/app/theme/layout/tokens.ts` is now the canonical source for the mobile viewport foundation:
  - base mobile contract: `360px`
  - dense-content guardrail: `352px`
  - first large-phone enhancement: `428px`
  - theme breakpoints: `em`
  - layout sizing and rhythm: `rem` / `clamp()`
- the canonical visual baseline is now blue/slate first in light mode and slate/graphite first in dark mode, with semantic success/warning/error/info tokens exposed through the theme layer instead of page-local color rules.
- `src/app/styles/base.css` is now restricted to root invariants and browser-level safety rules; shared visual defaults must not move back there.
- `src/shared/ui`, `src/router/layouts`, `src/pages/dashboard`, and `src/pages/stocks` now use owner-folder structure for touched non-trivial UI.
- `src/router/components`, `src/features/navigation/ui/app-overlay-host`, and `src/features/pwa/ui/pwa-status-banner` now also follow owner-folder structure.
- Remaining `*.module.css` files should stay local to geometry, media, shell layout, or advanced selector ownership.
- shell utility actions, bottom navigation chrome, and theme settings surfaces should now consume `theme.components` defaults first; owner CSS should only keep geometry and active-state selectors.
- `src/features/navigation/ui/mobile-shell` now relies on Mantine/AppShell ownership for shell chrome and keeps local CSS mainly for header/main/footer geometry plus scroll-safe spacing.
- `src/features/navigation/ui/mobile-bottom-nav` now expresses base item layout and surface chrome through owner props, while local CSS stays focused on footer geometry plus hover/focus/active-state selectors.
- `src/features/scanner/ui/scanner-modal` now relies on Mantine `Paper`, `Button`, `Tabs`, `Badge`, and `ThemeIcon` for most surface/status/footer chrome; local CSS is now mainly geometry, media positioning, and exceptional state selectors.
- `src/shared/ui/image-crop-editor` and `src/shared/ui/file-dropzone` now also push more scanner-photo chrome into Mantine composition or owner props, while their local CSS stays focused on cropper/dropzone geometry and drag/media state.
- `src/shared/ui/horizontal-slider` remains an intentional exception owner because its split-track/thumb layout is custom geometry, not generic surface chrome.
- `src/pages/dashboard` and `src/pages/stocks` now keep page-local CSS mostly for list/grid/layout rhythm, metric typography, and route-owned hover selectors; repeated surface fill/border/radius/padding rules are expected to live in Mantine composition or `src/app/theme/*`.
