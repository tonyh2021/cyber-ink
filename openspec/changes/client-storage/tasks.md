# Tasks: Client Storage Migration

## 1. IndexedDB Foundation

- [ ] 1.1 Install `idb` package
- [ ] 1.2 Create `src/lib/db.ts` — database open, schema definition (5 object stores), typed access functions for articles, nodes, polishSessions, evaluations, config
- [ ] 1.3 Create `src/hooks/use-articles.ts` — reactive hook for article list (getAllArticles, createArticle, deleteArticle) using useSyncExternalStore pattern from use-styles.ts
- [ ] 1.4 Create `src/hooks/use-article.ts` — reactive hook for single article (getArticle, updateArticle, node operations, polish operations)

## 2. Migrate Article Operations

- [ ] 2.1 Convert `articles/[slug]/page.tsx` from server component to client component — load article data from IndexedDB on mount instead of filesystem
- [ ] 2.2 Convert `workspace.tsx` — replace all `fetch('/api/articles/...')` calls with direct db function calls for CRUD, node read/write, tree updates
- [ ] 2.3 Convert article creation — replace `POST /api/articles` fetch with `db.createArticle()` in dashboard
- [ ] 2.4 Convert article deletion — replace `DELETE /api/articles/[slug]` fetch with `db.deleteArticle()` (cascade nodes, evaluations, polish)
- [ ] 2.5 Convert `article-sidebar.tsx` — load article list from `useArticles()` hook instead of server-provided initialArticles
- [ ] 2.6 Migrate config from `config.json` to IndexedDB config store, update `getConfig` reads in generation/polish flows

## 3. Migrate Generation Flow

- [ ] 3.1 Move prompt building to client — import `prompt-builder.ts` in workspace, assemble system prompt and user message from IndexedDB + localStorage data
- [ ] 3.2 Create `POST /api/generate` thin proxy route — receives `{ systemPrompt, userMessage, config }`, calls AI SDK, streams response (no article/slug awareness)
- [ ] 3.3 Update workspace generation handler — call proxy with assembled prompt, receive stream, persist node and update tree in IndexedDB on completion
- [ ] 3.4 Implement version pruning in client — max 5 main versions logic with cascade delete of nodes and evaluations in IndexedDB
- [ ] 3.5 Add `beforeunload` guard — register handler during active AI streaming (generation and polish), remove on stream completion

## 4. Migrate Polish Flow

- [ ] 4.1 Create `POST /api/polish` thin proxy route — receives `{ systemPrompt, messages, config }`, calls AI SDK, streams response
- [ ] 4.2 Move polish session management to client — start/status/apply/discard operations all via db functions, no API calls
- [ ] 4.3 Update workspace polish handlers — call proxy for AI round, persist rounds and history in IndexedDB polishSessions store
- [ ] 4.4 Handle polish apply — update node content in IndexedDB, delete polish session, update tree polishedAt

## 5. Cleanup

- [ ] 5.1 Remove all `/api/articles/...` routes (9 route files)
- [ ] 5.2 Remove `src/lib/data.ts` and `src/lib/polish-data.ts`
- [ ] 5.3 Remove filesystem seed logic from `layout.tsx` (getSeedStyles can stay for first-run seed, but article loading goes away)
- [ ] 5.4 Remove `SidebarProvider` initialArticles server prop — sidebar reads from useArticles hook
- [ ] 5.5 Update CLAUDE.md to reflect new architecture (no /data/ dependency, IndexedDB storage, proxy-only API routes)
