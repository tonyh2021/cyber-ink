## Why

CyberInk is moving toward an online tool model. Currently the Styles page is read-only and all style data lives on the filesystem — users can't customize their writing profile, instruction, polish prompt, or references without editing files on disk. This blocks the path to a browser-based product where users configure everything in the UI.

## What Changes

- Make the Styles page fully inline-editable: Profile, Instruction, Polish Prompt, and References
- Use localStorage as the source of truth for all style data
- Three-tier seed fallback: localStorage → SSR props (from `/data/` files) → hardcoded defaults
  - Profile default: `"You are a professional content writer."`
  - Instruction default: `"Write in a clear, engaging style. Keep paragraphs short and punchy."`
  - Polish Prompt default: hardcoded copy of current `polish-prompt.md` content
  - References default: `[]` (empty)
  - No dedicated seed API — `layout.tsx` reads `/data/` at SSR time and passes seed data to an app-level `StylesProvider`, ensuring localStorage is populated before any page renders
- Modify generate and polish APIs to accept style data in the request body instead of reading from the filesystem
  - Filesystem fallback is permanently retained for non-browser clients
- Update the workspace frontend to send style data from localStorage when calling generate/polish
- When creating a new article, show a warning if Profile or Instruction is empty in localStorage
- Import/Export: each style item can be exported/imported as a standalone `.md` file in the same format as `/data/` originals (references export one `.md` per article)

## Capabilities

### New Capabilities

- `editable-styles`: Inline editing of all four style items (Profile, Instruction, Polish Prompt, References) on the Styles page, with localStorage persistence and three-tier seed fallback (localStorage → SSR props → hardcoded defaults). Includes per-item Import/Export as `.md` files.

### Modified Capabilities

- `generate`: API accepts `profile`, `instruction`, `references` in the request body; filesystem fallback permanently retained
- `polish`: API accepts `polishPrompt` in the request body; filesystem fallback permanently retained
- `article-creation`: Warning toast when Profile or Instruction is empty in localStorage

## Impact

- **Code**: Styles page rewritten with editable components; generate and polish API routes modified; workspace generate/polish calls updated to include style payload
- **APIs**: `POST /api/articles/[slug]/generate` and `POST /api/articles/[slug]/polish/round` gain new optional request body fields for style data; filesystem fallback permanently retained
- **Dependencies**: No new dependencies
- **Data**: `/data/` files become read-only seed templates; localStorage becomes the runtime source of truth. Per-article `styleRef` is deprecated (field retained as `null`).
- **Risk**: Low — the data model is simple (four text blobs + references array), and localStorage is well-understood. Users clearing browser data lose customizations, mitigated by Import/Export.

## Non-goals

- Style versioning, feedback collection, or style regeneration (those belong to phase4-style-feedback)
- Multi-user or cloud sync for style data
- Writing style data back to the filesystem
