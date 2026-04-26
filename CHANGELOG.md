# Changelog

All notable changes to this project will be documented here.

## [0.1.0-beta.1] — 2026-04-16

### Initial public beta

First public beta release on GitHub Pages.

#### Core flows
- Arrival flow: create, edit, delete with scanner integration (camera / file / manual)
- Departure flow: create, edit, delete with scanner integration and stock validation
- Quantity adjustment flow
- Scanner-assisted fast lookup from the stocks screen

#### Data
- Product catalog with identity tracking (`Product` + `ProductCode`)
- Serial-number and quantity-based tracking
- Stock view with per-product cards and serial registry
- Source of truth: movement journals + adjustments (no mutable stock row)

#### Backup and durability
- JSON backup export
- Merge import with conflict report and dry-run mode
- Manual checkpoints with pre-restore automatic snapshot

#### UI and app shell
- Russian-first release-facing UI
- Dark / light / system theme (persisted)
- Mobile-first shell, installable via PWA
- Settings accessible from the app header
- NotFound catch-all route

#### Infrastructure
- Offline-first: all data in IndexedDB (Dexie)
- PWA: installable, works without network after first load
- GitHub Pages deployment at `/sklad-next/`
- Hash router for static hosting
