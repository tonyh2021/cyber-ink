## Context

CyberInk stores article data on the server filesystem (`/data/articles/`) via `src/lib/data.ts` utilities. 11 API routes handle CRUD, generation (SSE streaming), and polish sessions. The server page component (`articles/[slug]/page.tsx`) loads data via filesystem reads at request time.

Styles were already migrated to localStorage. This design covers migrating everything else to IndexedDB so the app becomes a pure frontend application with only a thin AI proxy on the server.

### Current Data Shape

| Store | Files | Shape |
|-------|-------|-------|
| Article meta | `meta.json` | `{title, slug, language, status, styleRef, styleVersion, createdAt, updatedAt}` |
| Version tree | `tree.json` | `{rootNode, bestNode, latestNode, nodes: Record<string, TreeNode>}` |
| Nodes | `nodes/v1.md, v2.md...` | Frontmatter (`node, generatedAt, instruction, parentNode?, polishedAt?`) + markdown content |
| Polish session | `.polish/` dir | `target.json` + `original.md` + `history.json` + `rounds/1.md, 2.md...` |
| Evaluations | `evaluation/*.json` | `Record<nodeName, EvaluationScores>` |
| Config | `config.json` | Model provider/model settings |

## Goals / Non-Goals

**Goals:**
- All article data stored in IndexedDB, zero filesystem dependency
- App works on static hosting (Vercel/Cloudflare Pages) with no persistent disk
- AI generation/polish streaming continues to work via thin proxy routes
- Data export/import for backup and device transfer
- No data loss path — existing `/data/` users can import via export files

**Non-Goals:**
- Multi-device sync or cloud storage
- Migration CLI for existing filesystem data
- Changing the UI or user-facing behavior
- Moving styles out of localStorage

## Decisions

### 1. IndexedDB schema — single database, multiple object stores

```
Database: "cyberink" (version 1)

articles        keyPath: "slug"
                → { slug, title, language, status, styleRef, styleVersion,
                    createdAt, updatedAt, source, tree }

nodes           keyPath: [slug, node]
                → { slug, node, generatedAt, instruction, parentNode,
                    polishedAt, content }

polishSessions  keyPath: "slug"
                → { slug, node, original, history, rounds: string[] }

evaluations     keyPath: [slug, node]
                → { slug, node, scores: EvaluationScores }

config          keyPath: "key"
                → { key, value }
```

**Why merge `meta.json` + `tree.json` + `source.md` into one `articles` store?**
They're always read together and small. Fewer store lookups, simpler transactions. Tree is embedded as a nested object.

**Why separate `nodes` store?**
Node content can be large. Keeping them separate avoids loading all version content when we only need metadata. Compound key `[slug, node]` allows querying all nodes for an article.

**Alternative considered:** One giant store with everything per article. Rejected because node content bloat would slow listing operations.

### 2. `idb` library for IndexedDB access

~1KB gzip. Pure Promise wrapper, no ORM overhead. Matches the existing codebase preference for minimal dependencies.

**Alternative considered:** Dexie.js (more features, query builder). Rejected — overkill for simple key-value lookups.

### 3. Data access layer — `src/lib/db.ts`

Single module exporting typed functions that mirror the current filesystem operations:

```ts
// Article operations
getArticle(slug) → Article | undefined
getAllArticles() → ArticleSummary[]
createArticle(slug, meta) → void
deleteArticle(slug) → void  // cascades: nodes, evaluations, polish
updateArticle(slug, partial) → void

// Node operations
getNode(slug, node) → NodeRecord | undefined
getAllNodes(slug) → NodeRecord[]
putNode(slug, node, data) → void
deleteNode(slug, node) → void

// Polish operations
getPolishSession(slug) → PolishSession | undefined
putPolishSession(slug, session) → void
deletePolishSession(slug) → void

// Config
getConfig(key) → value
putConfig(key, value) → void
```

All functions are `async`. Components and hooks call these instead of `fetch('/api/...')`.

### 4. AI proxy routes — keep two, remove the rest

**Keep (thin proxy, no data logic):**
- `POST /api/generate` — receives full prompt payload, streams AI response back
- `POST /api/polish` — receives full conversation payload, streams AI response back

These no longer know about articles or slugs. They receive the complete prompt from the client and proxy it to the AI SDK. API key stays server-side in `.env`.

**Proxy is parameterized by client config.** The client sends `{ systemPrompt, userMessage, config }` where `config` includes `provider` and `model`. The proxy validates the model name against an allowlist of supported models before calling the AI SDK. This prevents arbitrary model strings from reaching the SDK and ensures the server-side API key matches the requested provider.

**Remove:**
- All `/api/articles/...` routes (9 routes)
- `src/lib/data.ts`, `src/lib/polish-data.ts`

### 5. Generation and polish flow change

**Current:** Client sends `{instruction, source}` → server builds prompt, calls AI, persists node, streams content back.

**New:** Client builds prompt (already has all data from IndexedDB), sends complete prompt to proxy → proxy streams AI response → client receives stream, persists to IndexedDB when complete.

This means prompt building moves to the client. `src/lib/prompt-builder.ts` is already a pure function — no changes needed, just import it client-side.

### 6. Article page becomes client component

Current `articles/[slug]/page.tsx` is a server component that reads filesystem. It becomes a client component that reads IndexedDB on mount. Loading state while data is fetched from IndexedDB (typically <10ms).

### 7. Single-tab reactivity model

Hooks use `useSyncExternalStore` with an in-memory cache. `getSnapshot()` returns cached values synchronously; async IndexedDB reads update the cache and call `notify()` to trigger re-renders. No cross-tab sync — single-tab only.

### 8. `beforeunload` guard during streaming

While an AI generation or polish stream is active, register a `beforeunload` handler to warn the user before closing the tab. Content is only persisted to IndexedDB after the stream completes — closing mid-stream loses that generation.

## Risks / Trade-offs

**[Data loss on browser clear]** → Mitigated by future export/import feature (separate change). Could add periodic auto-export reminder.

**[Mid-stream tab close loses generation]** → Acceptable. `beforeunload` dialog warns user. AI tokens are consumed but content is lost. Same behavior as most client-side apps.

**[IndexedDB storage limits]** → Browsers typically allow 50%+ of available disk. For a writing tool with text-only content, unlikely to hit limits. A single article with 5 versions is ~50KB.

**[Prompt builder on client exposes prompt structure]** → Acceptable for a single-user tool. The prompts aren't a secret — users can already see them in the styles page.

**[SSR removed for article pages]** → Slightly slower initial paint (client must read IndexedDB before rendering). Acceptable — this is a tool, not a content site. Styles page already works this way.

**[Two streaming routes still need Next.js server]** → Can't go fully static. But Vercel/Cloudflare edge functions handle this fine with zero persistent storage.

## Migration Plan

### Phase 1: Add IndexedDB layer
- Install `idb`
- Create `src/lib/db.ts` with schema and all access functions
- Create `useArticles` hook (single-tab, in-memory cache + notify pattern from `useStyles`)

### Phase 2: Migrate article operations
- Replace workspace.tsx fetch calls with db functions
- Replace article-sidebar data loading with db queries
- Replace article page server component with client component
- Move prompt building to client side

### Phase 3: Slim API routes
- Create new `/api/generate` and `/api/polish` thin proxy routes
- Remove all `/api/articles/...` routes
- Remove `src/lib/data.ts` and `src/lib/polish-data.ts`

### Phase 4: Clean up
- Remove `getSeedStyles` filesystem reads from layout.tsx (styles already in localStorage)
- Remove `/data/` directory from project
- Update CLAUDE.md documentation

### Rollback
Each phase is independently deployable. If issues arise, revert the phase commit. Phase 1 adds new code without removing old, so it's zero-risk.
