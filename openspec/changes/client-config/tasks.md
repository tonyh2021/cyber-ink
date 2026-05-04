# Client Config — Tasks

## Tasks

- [ ] 1. Add model presets — create `src/lib/model-presets.ts` with `PROVIDER_OPTIONS` and `MODEL_PRESETS` per provider
- [ ] 2. Add config defaults — create `CONFIG_DEFAULTS` constant (provider, model only — no language)
- [ ] 3. Create `useConfig` hook — `src/hooks/use-config.ts`, `useSyncExternalStore` pattern, two localStorage keys (`cyberink:config` for provider/model, `cyberink:apiKeys` for keys), read/write/subscribe/notify
- [ ] 4. Create Settings page — `src/app/settings/page.tsx` + `src/components/settings/settings-page.tsx`, provider dropdown, model dropdown+custom input, API key masked input, updated security copy
- [ ] 5. Add Settings link to sidebar navigation
- [ ] 6. Extend Toast component — add optional `action` prop (`{ label, href }`) to render an inline link; client error handlers parse `action` from API error responses and pass it through
- [ ] 7. Extract shared `getModel` to `src/lib/model.ts` — accept `apiKey` param, resolve provider/model from body and apiKey from `X-Api-Key` header with fallback to config.json / env vars, filter out `"mock"` from server fallback, return 400/401 with `action` field pointing to `/settings`
- [ ] 8. Update Zod schemas — add optional `provider`, `model` fields to `GenerateInputSchema` and polish round input schema (apiKey is read from header, not body)
- [ ] 9. Update client fetch calls — workspace components send `provider`, `model` in body and `apiKey` as `X-Api-Key` header from `useConfig` in generate and polish requests
