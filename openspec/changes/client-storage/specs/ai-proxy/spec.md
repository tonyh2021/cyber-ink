# AI Proxy Routes

## ADDED Requirements

### PROXY-1: Generate proxy
- `POST /api/generate` receives complete prompt payload: `{ systemPrompt, userMessage, config }` where config contains model provider/model/language
- Proxy constructs AI SDK call with API key from server `.env`
- Stream response back to client as SSE text stream
- No article/slug awareness — client handles all persistence

### PROXY-2: Polish proxy
- `POST /api/polish` receives complete conversation payload: `{ systemPrompt, messages[], config }`
- Proxy constructs AI SDK call, streams response back
- No polish session awareness — client handles round tracking and persistence

### PROXY-3: Config validation
- Proxy receives `config` from client containing `provider` and `model`
- Validate model name against an allowlist of supported models before calling AI SDK
- Reject requests with unknown provider/model combinations with a 400 response

### PROXY-4: Client-side prompt building
- Move prompt assembly to client: `buildSystemPrompt()` and `buildUserMessage()` called in browser
- `src/lib/prompt-builder.ts` already a pure function — import directly in client components
- Client reads styles from localStorage, article data from IndexedDB, assembles full prompt before calling proxy

## REMOVED Requirements

### PROXY-5: Remove filesystem API routes
- Remove all 9 `/api/articles/...` routes
- Remove `src/lib/data.ts` (filesystem utilities)
- Remove `src/lib/polish-data.ts` (polish filesystem operations)
- Remove server-side article data loading from `articles/[slug]/page.tsx`
