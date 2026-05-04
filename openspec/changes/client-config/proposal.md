# Client Config — Provider, Model & API Key Management

## Problem

AI model configuration (provider, model, API key) currently lives in server-side files: `config.json` for provider/model, `.env` for API keys. Users cannot change these without access to the deployment's filesystem or environment variables. When CyberInk is deployed to Vercel/Cloudflare for others to use, each user needs the ability to configure their own provider, model, and API key from the browser.

## Proposal

Move writing model configuration (provider, model, API key) to a client-side Settings UI, stored in localStorage. The server proxy routes accept these values from the request body, falling back to server-side defaults (config.json / env vars) when not provided.

## Scope

### In Scope

- Settings UI for provider selection, model selection, and API key input
- Provider: dropdown with `anthropic` and `openai` options
- Model: dropdown with preset models per provider + custom input option
- API key: password input, stored in localStorage
- Persist settings in localStorage
- Proxy routes (`generate`, `polish/round`) accept `provider`, `model`, `apiKey` from request body
- Fallback chain: client value → server config/env → error

### Out of Scope

- Migrating article storage (covered by `client-storage` change)
- API key validation endpoint (just let the AI call fail naturally)
- Rate limiting or usage tracking
- `analysis` model config (only `writing` model for now)
- Multi-key management (one key per provider is enough)

## Key Decisions

1. **localStorage, not IndexedDB** — config is small structured data, same pattern as styles
2. **Separate storage key from styles** — `cyberink:config` for provider/model/language, `cyberink:apiKeys` for keys (keyed by provider). Prevents accidental key export when sharing styles.
3. **Dropdown + custom input for model** — preset list of common models per provider, with a free-text option for new/custom models
4. **Fallback chain, not override** — client values take priority; server env vars are the fallback. Deployer can set env vars for default access; users can override with their own keys.
5. **Settings as a separate page/section** — not mixed into the Styles page; config is "how the tool runs", styles is "how the writing sounds"

## Fallback Behavior

```
Request arrives at proxy route:

provider = body.provider ?? config.models.writing.provider
model    = body.model    ?? config.models.writing.model
apiKey   = body.apiKey   ?? process.env.ANTHROPIC_API_KEY (or OPENAI_API_KEY based on provider)

All three missing → 400 error with clear message
```
