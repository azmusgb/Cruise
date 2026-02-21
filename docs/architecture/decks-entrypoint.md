# Deck module entrypoint

## Canonical script

`js/modules/decks.js` is the canonical deck runtime and should be the only file referenced by page templates.

## Backward compatibility

`js/decks.js` is now a compatibility shim that dynamically loads `js/modules/decks.js` for legacy bookmarks or outdated embeds.

## Rule for contributors

- New deck behavior changes go in `js/modules/decks.js` only.
- Do not duplicate logic between both files.
- If legacy support is no longer required, delete the shim in one follow-up change.
