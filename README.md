# Sklad Next

Офлайн-first, мобильный учёт склада — без бэкенда, без регистрации.

> **Бета** — функциональное ядро готово; не для продакшн-нагрузки.

**GitHub Pages (бета):** https://iShavlovsky.github.io/sklad/

---

## Что это

Приложение для личного или малого складского учёта, работающее полностью в браузере.
Все данные хранятся локально в IndexedDB — ни аккаунтов, ни облака, ни синхронизации.

---

## Возможности

| Функция | |
|---|---|
| Приход: создать / изменить / удалить | ✓ |
| Расход: создать / изменить / удалить | ✓ |
| Корректировка количества | ✓ |
| Серийный и количественный учёт | ✓ |
| Сканер QR / штрихкода (камера, файл, ввод вручную) | ✓ |
| Быстрый поиск по сканеру из экрана остатков | ✓ |
| Карточки товаров с балансами и историей | ✓ |
| Экспорт JSON-резервной копии | ✓ |
| Импорт с отчётом о конфликтах и dry-run режимом | ✓ |
| Ручные чекпоинты и восстановление снимка | ✓ |
| Тёмная / светлая / системная тема | ✓ |
| PWA — установка на экран, работа офлайн | ✓ |

---

## Быстрый старт

```bash
git clone https://github.com/iShavlovsky/sklad.git
cd sklad
npm ci
npm run dev
```

Dev-сервер слушает LAN по умолчанию (`--host`).
URL для телефона — строка `Network:` в выводе Vite.

### Тестирование на телефоне

```bash
npm run dev:lan
# открыть http://192.168.x.x:4173/ на телефоне в той же Wi-Fi-сети
```

### Сборка и предпросмотр

```bash
npm run build
npm run preview
```

### GitHub Pages

```bash
npm run build:gh-pages   # base path -> /sklad/
npm run deploy           # build:gh-pages + публикация dist/ через gh-pages
```

### Качество кода

```bash
npm run lint             # ESLint + Stylelint
npm run lint:fix         # автофикс
npm run format           # Prettier
```

---

## Стек

| | |
|---|---|
| Фреймворк | React 19 + TypeScript + Vite |
| UI | Mantine 9 + Tabler Icons |
| Хранилище | Dexie (IndexedDB) |
| Сканер | html5-qrcode |
| Роутинг | React Router v7 (hash router) |
| PWA | vite-plugin-pwa |
| Деплой | GitHub Pages (`gh-pages`) |

---

## Лицензия

© 2024–2026 **Igor Shavlovsky**. All rights reserved.

Репозиторий открыт для ознакомления.
Использование, модификация, деплой — только с письменного разрешения автора.

Подробнее: [LICENSE](./LICENSE)

---

**Igor Shavlovsky** — https://github.com/iShavlovsky
