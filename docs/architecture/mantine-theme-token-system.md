# Mantine Theme Token System

This document defines the canonical SKLAD theme/token structure under `src/app/theme/*`.

## Structure

- `create-app-theme.ts`
  - one app-level Mantine theme composition root
  - builds `createTheme(...)`
  - owns CSS variable resolution for shared shell/control tokens
- `colors/*`
  - raw 10-shade palettes only
  - canonical palettes for `brandBlue`, `neutralSlate`, `success`, `warning`, `error`, and `info`
- `typography/*`
  - canonical font families, heading scale, font sizes, line heights, font weights, and named body/support text roles
- `layout/*`
  - spacing, radius, shadow, motion, shell-size, and border tokens
- `iconography/*`
  - canonical icon pack decision, icon stroke, size guidance, and usage-role tokens
- `tokens/*`
  - theme-mode configs and semantic app-token values for supported modes
- `components/*`
  - Mantine `theme.components` defaults for shared primitives
- `types/*`
  - typed `theme.other` shape and Mantine module augmentation

## Token layers

1. Raw tokens
   - immutable palette tuples and foundational type/layout tokens
   - no product semantics here
   - typography token families include:
     - `fontFamily`
     - `fontFamilyMonospace`
     - `fontSizes`
     - `lineHeights`
     - `fontWeights`
     - heading/body typography token maps
   - layout token families include:
     - spacing scale tokens
     - radius scale tokens
     - shadow scale tokens
     - border/focus primitives
2. Semantic app tokens
   - live in `theme.other`
   - group app meaning by role:
     - `surface`
     - `border`
     - `text`
     - `focus`
     - `intent`
     - `shell`
     - `scanner`
     - `sync`
   - section A canonical roles:
     - `surface.background`, `surface.paper`, `surface.raised`, `surface.subtleSurface`, `surface.glass`, `surface.shell`
     - `border.default`, `border.strong`
     - `text.primary`, `text.secondary`
     - `focus.ring`, `focus.width`, `focus.offset`
     - `intent.primary`, `intent.success`, `intent.warning`, `intent.error`, `intent.info`
3. Component defaults
   - live in `theme.components`
   - own shared visual defaults for Mantine primitives before local CSS is allowed
  - current section D1 focus:
    - `Button`
    - `ActionIcon`
    - `Input`
    - `TextInput`
    - `NumberInput`
    - `PasswordInput`
    - `Textarea`
    - D1 size scale now extends below Mantine `xs` with `xxs` and `xxxs` for dense utility controls
    - proof-surface inputs also demonstrate neutral `success` and `warning` visual tones via shared input selectors
  - current section D2 focus:
    - `Select`
    - `NativeSelect`
    - `Checkbox`
    - `Radio`
    - `Switch`
    - `SegmentedControl`
    - `Tabs`
    - `Badge`
    - `Pill`
    - `PillsInput`
    - `TagsInput`
    - `DatePickerInput`
    - `DateTimePicker`
    - `TimeInput`
    - `Badge` and `Pill` now use a compact size ladder and child-element inheritance for text/icons/remove controls
  - current section D3 focus:
    - `Paper`
    - `Card`
    - `Fieldset`
    - `Accordion`
    - `Menu`
    - `Tooltip`
    - `Popover`
    - `Modal`
    - `Alert`
    - `Notification`
    - `Loader`
    - `Skeleton`
    - `LoadingOverlay`
    - overlay previews on `/ui-kit` now expose size ladders for `Tooltip`, `Popover`, `Modal`, and `Drawer`
  - current section D4 focus:
    - `Burger`
    - `Pagination`
    - `Stepper`
    - `Progress`
    - `RingProgress`
    - `Avatar`
    - `Indicator`
    - `Timeline`
    - `List`
    - `Mark`
    - `Table`
    - `Text`
  - current section F focus:
    - visual state matrix for already-themed primitives
    - semantic status badges for sync/offline/pending/success/error/info
    - selected/active/hover/focus/disabled proof states
    - validation/help/notification state language
    - compact empty/loading reuse examples and dark-preview parity
  - current section G focus:
    - one canonical icon pack and one visual style
    - icon size guidance by usage role
    - action-icon, navigation, and categorized icon examples on `/ui-kit`
  - search input is currently a composition pattern built from Mantine primitives, not a shared wrapper

## Theme modes

- The canonical product truth is exactly two app modes: `light` and `dark`.
- `src/app/theme/*` does not carry preset or legacy compatibility logic.
- When no persisted choice exists, the app may start from the current OS light/dark preference and persist only explicit light/dark user choice.
- Current Mantine defaults for the canonical color system:
  - `primaryColor: brand`
  - `primaryShade.light: 500`
  - `primaryShade.dark: 400`
  - `defaultRadius: md`
- Current typography defaults for section B:
  - `fontFamily: Inter`
  - `fontFamilyMonospace: SF Mono / JetBrains Mono fallback stack`
  - headings are driven from canonical `h1`-`h6` tokens
  - body/support roles are driven from canonical `bodyLarge`, `bodyRegular`, `bodySmall`, `caption`, `label`, `helper`, and `numeric` tokens
- Current layout defaults for section C:
  - spacing is owned by canonical `4/8/12/16/20/24/32/40/48` scale tokens plus Mantine aliases
  - `defaultRadius: md` remains the app default, while section/control/shell radii stay typed under `layout/*`
  - shadows are normalized to `xs/sm/md/lg` scale tokens and mapped into shared shell/panel/control roles
  - semantic surface and focus roles live in `theme.other.surface` and `theme.other.focus`
- Current component-size defaults for D1:
  - standard Mantine sizes remain supported
  - `Button`, `ActionIcon`, and `Input` also support `xxs` and `xxxs` through `theme.components.*.vars`
  - these mini grades are for dense secondary or utility controls, not the primary tap-target default
- Current D2 defaults:
  - select-like controls share one filled input + combobox dropdown contract
  - choice controls share one label/focus/border rhythm
  - supported date/time pickers now use the same `md` size/radius/filled-input contract through `theme.components`
- Current D3 defaults:
  - container and feedback surfaces share one elevated paper/card language
  - `Alert` and `Notification` now use tonal state backgrounds and borders instead of icon-only state signaling
  - `Accordion` stays the inline expansion primitive for local details, not the cross-app help default
  - overlays use one dropdown/modal chrome contract based on semantic surface and border tokens
  - `/ui-kit` overlay previews now demonstrate compact and expanded overlay sizes instead of one-size-only samples
  - `/ui-kit` D3 demos are live: menu actions, alert/notification mode, skeleton, and loading overlay can all be toggled on the proof surface
  - loading primitives stay role-specific: `Loader` for busy, `Skeleton` for placeholder, `LoadingOverlay` for local blocking
  - ui-kit-only live-demo motion is allowed for proof surfaces so loaders and pending states remain visibly active even when system reduced-motion settings suppress the default motion path
- Current D4 defaults:
  - navigation and progress primitives use the same blue/slate, compact-radius contract through `theme.components`
  - `/ui-kit` D4 demos are live: burger, pagination, stepper, progress, ring-progress, indicator, and mark samples expose state changes instead of static-only renders
  - `/ui-kit` now also shows Mantine hooks combined directly with primitives: `useDisclosure`, `useHover`, `useFocusWithin`, `useInterval`, and `useReducedMotion`
  - touched D3/D4 interactive primitives now carry explicit transition ownership in `theme.components` for hover, focus, and value-change feedback instead of relying on page-local hacks
  - data-display primitives stay dense and text-led instead of adding product-specific wrappers
- Current section F defaults:
  - `/ui-kit` owns the canonical state matrix proof surface for component states and status language
  - sync/offline/pending/success/error/info examples are built from existing semantic `theme.other` tokens, not page-local ad hoc colors
  - list-row, button, input, tab, and segmented previews stay inside `/ui-kit` as systemic examples instead of becoming product-specific shared wrappers
  - dark-preview parity is demonstrated on the same proof surface so light/dark state language can be compared directly
- Current section G defaults:
  - canonical pack: `@tabler/icons-react`
  - canonical icon style: outline icons with fixed `stroke={1.75}` and inherited parent color
  - icon sizes are role-based through `iconography/tokens.ts`, not chosen ad hoc per owner
  - `/ui-kit` section G demonstrates size guidance, action-icon usage, navigation usage, and a categorized icon grid instead of a blind pack dump

## Usage rules

- `/ui-kit` is the canonical implementation-proof surface and the source of example usage for shared theme-driven primitives, states, and composition patterns.
- Prefer Mantine theme fields first:
  - `theme.colors`
  - typography/spacing/radius/shadow scales
  - `theme.other`
  - `theme.components`
- Use `theme.other` for app semantics, not ad hoc token objects in pages/features.
- Keep `src/app/styles/base.css` invariant-only.
- Add local CSS only for geometry or selector cases Mantine should not own.

## Current direction

- compact operational Apple-compatible feel
- calm blue/slate accent family
- subtle glass/frosted secondary surfaces
- mobile-first sizing and 48px touch targets
- Russian-first UI remains a product rule; the theme layer should support that density, not fight it
