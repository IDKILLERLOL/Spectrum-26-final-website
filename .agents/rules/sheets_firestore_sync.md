---
description: Architectural invariants and guidelines for Firestore to Google Sheets synchronization
globs: ["**/*sheets*", "**/*registration*", "**/*apps-script*"]
---

# Google Sheets & Firestore Synchronization Rules

## 1. Source of Truth
- **Firestore is the ONLY source of truth.**
- Google Sheets is strictly an unmerged, machine-readable, sortable, flat reporting mirror.
- Never rely on Google Sheets as state storage or query it for business logic.

## 2. Flat Rows & No Merged Cells
- **NEVER use `merge()` or `mergeVertically()`.**
- Every person (Leader or Member) must have their own row containing full team context (`Team ID`, `Team Name`, `Fee Status`, `Transaction ID`, `Screenshot`, `Checked In`, `Registered At`).
- This invariant ensures the sheet remains machine-readable, filterable, and sortable.

## 3. Strict `Team ID` Identity
- `Team ID` is the ONLY identifier used for lookup, update, and delete in Sheets.
- Never use leader email, team name, row number, or event + email as identity fallbacks.

## 4. Atomic Team Replacement on Edit
- When a registration/team edit is processed (`edit_registration`), find ALL rows matching that `Team ID`, delete them from bottom to top, and write the complete updated team roster.

## 5. Concurrency & Locking
- All Google Apps Script write operations (`full_sync`, `create_registration`, `edit_registration`, `delete_registration`) must be wrapped in `LockService.getScriptLock()` with a 30-second lock window to prevent race conditions.

## 6. Formatting & Formula Sanitization
- Phone numbers must be formatted with number format `@` (plain text) and leading `+` stripped to prevent formula syntax errors or scientific notation.
- User-provided strings beginning with `=`, `+`, `@`, `-` must be sanitized with a leading `'`.
