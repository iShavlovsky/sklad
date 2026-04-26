# CHANGE_TEMPLATE

Этот файл — lightweight planning layer по мотивам OpenSpec (https://github.com/Fission-AI/OpenSpec).

Использовать для:
- ambiguous changes
- cross-cutting changes
- architecture shifts
- large feature slices
- storage/schema changes
- broad refactors

Не использовать для:
- tiny bugfixes
- obvious one-file changes
- copy-only edits

---

## 1. Proposal

### Change name
<short-name>

### Problem
Что не устраивает сейчас.

### Goal
Какое состояние хотим получить.

### Non-goals
Что этот change не пытается решить.

### Why now
Почему change нужен именно сейчас.

---

## 2. Design

### Touched surfaces
- modules
- contracts
- storage/schema
- runtime flows
- docs

### Design decisions
- ...
- ...

### Risks
- ...
- ...

### Rollout / migration notes
- ...
- ...

---

## 3. Tasks

1. ...
2. ...
3. ...

Для каждой задачи:
- expected output
- verification
- docs impact

---

## 4. Spec delta

### New truth
Что станет истинным после change.

### Updated truth
Какие existing assumptions меняются.

### Removed truth
Какие old assumptions больше не должны использоваться.
