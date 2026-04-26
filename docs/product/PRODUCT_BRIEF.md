# PRODUCT_BRIEF

## 1. Product
- Name: **SKLAD** (working name only; not yet frozen)
- One-sentence description: Offline-first browser app for fast capture and accounting of incoming and outgoing entities, built around scanner > buffer > form workflows.
- Primary audience: single user, small operator, or owner who needs fast local accounting without backend setup.

## 2. Core problem
- Existing lightweight accounting workflows are too fragmented: people capture values in one place, rewrite them into notes, chats, spreadsheets, or paper, and then lose speed, consistency, and traceability.
- The target user needs one compact workflow that starts with quick capture and ends with a durable record. The app should reduce repeated manual entry and keep operational steps explicit.
- The main product risks are weak ownership boundaries, scanner capture leaking into business logic, unclear durable vs transient state, weak mobile ergonomics, and route surfaces that grow without a stable grammar.

## 3. V1 scope
- Included in V1:
  - fullscreen scanner modal with live and photo modes;
  - shared scanner buffer as a transient workflow layer;
  - no standalone buffer list workflow as a primary V1 surface; buffer is primarily used through contextual apply;
  - arrival create/list/edit flows;
  - departure create/list/edit flows;
  - drafts as a separate durable entity;
  - stocks as a derived read model with one usable milestone;
  - directories (supplier/product/category) as an optional enhancement layer, not mandatory structure;
  - settings in IndexedDB;
  - JSON export/import baseline;
  - mobile-first shell with future room for home/favorites direction.
- Not required for initial V1:
  - favorites/home customization as a finished product layer;
  - full backup history UI;
  - broad automation around external data sources.
- Explicitly out of scope for V1:
  - cloud sync;
  - multi-user collaboration;
  - Google auth / Drive backup;
  - advanced conflict resolution UX;
  - fully automated product lookup as a mandatory capture flow.

## 4. Success criteria
- V1 is successful if:
  - the user can capture a code, keep it in buffer, apply it to arrival/departure forms, save records, reopen drafts, and continue work without backend dependencies.
- "Done enough" for the first practical release means:
  - scanner > buffer works reliably;
  - buffer remains a shared staging area, not a second hidden source of truth;
  - arrival/departure/draft flows work end to end;
  - stocks are derived from durable journals, not entered manually as independent records;
  - the app remains understandable and usable on mobile-shaped layouts.

## 5. Delivery constraints
- Platform:
  - browser app on React + TypeScript + Mantine.
- Offline/online assumptions:
  - core product is local-first and must remain useful without network.
- Performance constraints:
  - scanner and form actions must stay responsive on mobile-shaped devices.
- Device/browser constraints:
  - camera/file flows matter; permission and unsupported-device states must degrade cleanly.
- Deployment/runtime constraints:
  - current direction remains static-friendly and browser-only; `src.zip` is expected to be merged with donor repo root files.

## 6. Notes
- Product invariants:
  - scanner is not a business entity;
  - arrival/departure forms consume buffer values, but do not own scanner runtime;
  - V1 buffer intentionally remains one shared list.
- Implementation assumptions:
  - repo root, scripts, Vite/PWA config, and public assets will be reused from the donor unless intentionally changed later.
