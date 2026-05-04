# Client Storage Migration

## Problem

CyberInk currently stores article data on the server filesystem (`/data/articles/`), requiring a Node.js backend with persistent disk. This makes deployment complex (need persistent volumes, can't use static hosting) and couples a single-user writing tool to server infrastructure it doesn't need.

Styles were already migrated to localStorage in the `editable-styles` change. Articles remain the last piece tied to the filesystem.

## Proposal

Migrate all article storage from server filesystem to client-side IndexedDB, making CyberInk a pure frontend application. The only server-side code retained is a thin API proxy for AI model calls (to protect API keys).

## Scope

### In Scope

- Migrate article CRUD (create, read, update, delete) from filesystem to IndexedDB
- Migrate version nodes, tree structure, and polish sessions to IndexedDB
- Replace all `/api/articles/...` routes with direct IndexedDB operations
- Retain a thin proxy route for AI generation/polish (API key must stay server-side)
- Migrate config (model provider/model settings) to localStorage or IndexedDB
- Remove `/data/` directory dependency and all `src/lib/data.ts` filesystem utilities
### Out of Scope

- Data export/import for backup and device transfer (separate follow-up change)
- API key management — user-supplied API keys, rate limiting, auth (separate follow-up change; proxy uses server env var for now)
- Multi-user or multi-device sync
- Cloud storage backend
- Offline AI generation (still requires network for model API)
- Migration tool for existing `/data/` filesystem data

## Key Decisions

1. **IndexedDB via `idb` library** — lightweight Promise wrapper (~1KB gzip), avoids raw API complexity
2. **One database, multiple object stores** — `articles` (metadata + source), `nodes` (version content), `polish` (session state), `config`
3. **Styles stay in localStorage** — already working, data is small, no reason to move
4. **AI proxy route stays** — cannot expose API keys to browser; generation and polish routes become thin pass-through proxies that only handle the AI SDK streaming call
5. **SSR seed removed** — no server-side data to seed; app is fully client-rendered for data
6. **Export format** — individual article export as zip (source.md + nodes + meta), bulk export as single zip

## Migration Strategy

Phase approach to keep the app working throughout:

1. **Add IndexedDB layer** — create db schema, `idb` wrapper, React hooks
2. **Migrate article operations** — swap filesystem calls for IndexedDB, one operation at a time
3. **Slim API routes** — remove data routes, keep only AI proxy routes
4. **Clean up** — remove `src/lib/data.ts`, `/data/` dependency, update layout.tsx SSR logic
