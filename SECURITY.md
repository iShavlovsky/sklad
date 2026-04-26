# Security Policy

## Reporting a vulnerability

If you find a security issue in this project, please report it privately — do not open a public issue.

- Open a GitHub issue marked **[SECURITY]**, or
- Contact the author directly: https://github.com/iShavlovsky

## Scope

Sklad Next stores all data locally in the browser (IndexedDB). There is no backend, no user accounts, and no network data transmission beyond loading the app itself.

The primary security surface is:

- the JSON backup/import pipeline (untrusted file input)
- input validation for user-supplied data
- PWA service worker scope and cache behavior
