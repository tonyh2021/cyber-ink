# Client Config — Design

## Architecture

### Storage Layout

Two separate localStorage keys:

```
cyberink:config = {
  provider: "anthropic",        // "anthropic" | "openai"
  model: "claude-sonnet-4-5-20250514"
}

cyberink:apiKeys = {
  anthropic: "sk-ant-...",
  openai: "sk-..."
}
```

Separated so that:
- Switching provider preserves both keys
- Styles import/export never touches API keys
- Future config fields don't share a key with secrets

### Hook: `useConfig`

Follows the same `useSyncExternalStore` pattern as `useStyles`:

```
src/hooks/use-config.ts

useConfig() → {
  config: { provider, model }
  apiKey: string | null            // resolved for current provider
  updateProvider(provider)
  updateModel(model)
  updateApiKey(provider, key)
}
```

Defaults come from a `CONFIG_DEFAULTS` constant (anthropic / claude-sonnet-4-5-20250514), not from the server.

### Preset Models

```
src/lib/model-presets.ts

PROVIDER_OPTIONS = ["anthropic", "openai"]

MODEL_PRESETS: Record<string, string[]> = {
  anthropic: [
    "claude-sonnet-4-5-20250514",
    "claude-haiku-4-5-20251001",
  ],
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
  ],
}
```

Dropdown shows presets + a "Custom..." option that reveals a text input.

### Shared `getModel` — `src/lib/model.ts`

Both `generate/route.ts` and `polish/round/route.ts` currently define identical `getModel` functions inline. Extract to a shared module:

```ts
// src/lib/model.ts
function getModel(provider: string, model: string, apiKey: string) {
  if (provider === "anthropic") return createAnthropic({ apiKey })(model);
  if (provider === "openai") return createOpenAI({ apiKey })(model);
  throw new Error(`Unknown provider: ${provider}`);
}
```

### Proxy Route Changes

Both routes accept optional `provider`, `model`, `apiKey` from the request body. Fallback chain with mock filtering:

```ts
const serverProvider = config.models.writing.provider;
const provider = body.provider ?? (serverProvider !== "mock" ? serverProvider : undefined);
const modelId  = body.model    ?? (serverProvider !== "mock" ? config.models.writing.model : undefined);
const apiKey   = req.headers.get("x-api-key") ?? envKeyForProvider(provider);

if (!provider || !modelId) {
  return NextResponse.json(
    { error: "No AI provider configured.", action: { label: "Go to Settings", href: "/settings" } },
    { status: 400 },
  );
}

if (!apiKey) {
  return NextResponse.json(
    { error: `No API key configured for ${provider}.`, action: { label: "Go to Settings", href: "/settings" } },
    { status: 401 },
  );
}

const model = getModel(provider, modelId, apiKey);
```

`"mock"` in server config is treated as "not configured" — it won't leak into the fallback chain.

### Zod Schema Updates

`GenerateInputSchema` and the polish round input schema need optional fields for the new body params:

```ts
provider: z.string().optional(),
model: z.string().optional(),
```

Note: `apiKey` is read from the `X-Api-Key` request header, not from the body — it does not appear in the Zod schema.

### Client-Side Request Changes

Workspace components that call `generate` and `polish/round` currently send style data. They additionally send config. The API key is sent as a custom HTTP header (`X-Api-Key`) rather than in the request body — headers are structurally easier to redact in logging, error reporting, and middleware, reducing the risk of accidental key persistence.

```ts
const { config, apiKey } = useConfig();

fetch(`/api/articles/${slug}/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(apiKey ? { "X-Api-Key": apiKey } : {}),
  },
  body: JSON.stringify({
    instruction,
    source,
    // ... existing style fields ...
    provider: config.provider,
    model: config.model,
  }),
});
```

### Settings UI

New page at `/settings` with route `src/app/settings/page.tsx`.

```
┌─────────────────────────────────────────────────────┐
│  Settings                                           │
│  Configure your AI provider and model               │
│                                                     │
│  ┌─ Provider ─────────────────────────────────────┐ │
│  │  [Anthropic           ▾]                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Model ────────────────────────────────────────┐ │
│  │  [claude-sonnet-4-5-20250514  ▾]              │ │
│  │   ○ claude-sonnet-4-5-20250514                │ │
│  │   ○ claude-haiku-4-5-20251001                 │ │
│  │   ○ Custom...  [________________]              │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ API Key ──────────────────────────────────────┐ │
│  │  [sk-ant-•••••••••••••••••••]     [Show/Hide] │ │
│  │  Optional — falls back to server default       │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  Changes are saved automatically to your browser.   │
│  Your API key is stored in your browser and sent    │
│  through our server only to reach the AI provider.  │
│  It is never logged or persisted on the server.     │
└─────────────────────────────────────────────────────┘
```

Key UX details:
- Auto-save on change (no Save button needed — follows native select/input behavior)
- API key masked by default, toggle to reveal
- "Optional" hint below API key input — communicates the fallback behavior
- Sidebar nav gets a Settings link (gear icon)

### Error Toast with Action Link

The existing `Toast` component (`src/components/ui/toast.tsx`) only renders a plain string message. Extend it to accept an optional action link so config errors can direct the user to Settings:

```ts
interface ToastProps {
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; href: string };  // new
}
```

When `action` is provided, render it as an inline link after the message text:

```
┌──────────────────────────────────────────────────────┐
│  ⚠  No AI provider configured.  Go to Settings →    │
└──────────────────────────────────────────────────────┘
```

The client reads the `action` field from the API error response and passes it through to Toast.

### Navigation

Add a Settings link to the sidebar, below Styles:

```
Sidebar:
  Articles...
  ──────────
  Styles        (existing)
  Settings      (new)
```
