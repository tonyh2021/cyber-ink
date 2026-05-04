# IndexedDB Storage

## ADDED Requirements

### DB-1: Database initialization
- Open database `cyberink` version 1 on app startup via `idb`
- Create object stores: `articles` (keyPath: `slug`), `nodes` (keyPath: `[slug, node]`), `polishSessions` (keyPath: `slug`), `evaluations` (keyPath: `[slug, node]`), `config` (keyPath: `key`)
- Graceful handling if IndexedDB is unavailable (show error message)

### DB-2: Article CRUD
- `createArticle(slug, meta)`: store article record with meta, empty tree, empty source
- `getArticle(slug)`: return full article record (meta + tree + source) or undefined
- `getAllArticles()`: return all articles as summaries (slug, title, createdAt, updatedAt, node counts)
- `updateArticle(slug, partial)`: merge partial update into existing record
- `deleteArticle(slug)`: remove article and cascade delete all related nodes, evaluations, and polish session

### DB-3: Node operations
- `putNode(slug, nodeData)`: store/update a version node (slug, node name, content, frontmatter fields)
- `getNode(slug, node)`: return single node record or undefined
- `getAllNodes(slug)`: return all nodes for an article, queried by slug
- `deleteNode(slug, node)`: remove node and its evaluation

### DB-4: Polish session operations
- `putPolishSession(slug, session)`: store/update polish session (node, original content, history, rounds array)
- `getPolishSession(slug)`: return active session or undefined
- `deletePolishSession(slug)`: remove polish session (on apply or discard)

### DB-5: Evaluation operations
- `putEvaluation(slug, node, scores)`: store evaluation scores for a node
- `getEvaluations(slug)`: return all evaluations for an article

### DB-6: Config operations
- `getConfig(key)`: read config value
- `putConfig(key, value)`: store config value
- Migrate model provider/model settings from `config.json` to IndexedDB config store

### DB-7: Cascade delete integrity
- Deleting an article must remove all its nodes, evaluations, and polish session in a single transaction
- Deleting a node must remove its evaluation in a single transaction
- Pruning old versions (max 5 main versions) must cascade to children nodes and evaluations

### DB-8: React integration
- `useArticles()` hook: reactive list of all articles, with create/delete operations
- `useArticle(slug)` hook: reactive single article data with update operations
- Hooks must trigger re-render when underlying IndexedDB data changes
