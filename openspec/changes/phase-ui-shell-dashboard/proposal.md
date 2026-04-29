## Why

After Phase 3, the full writing loop exists but the app lacks product-level navigation. There is no app shell, no dashboard for article discovery, and sidebar behavior is minimal. Users need a proper navigation structure and overview surface to manage multiple articles across the complete workflow.

## What Changes

- Implement app shell: top navigation (56px) with logo, primary navigation, and theme toggle; sidebar with responsive collapse
- Add dedicated dashboard route with article overview cards/list and create/delete entry points
- Establish stable shell composition for workspace and dashboard routes
- Ensure workspace-first writing flow from Phase 2 remains intact after shell integration

## Capabilities

### New Capabilities

- `app-shell`: Product-level navigation shell with top nav (logo, navigation, theme toggle), responsive sidebar, and stable composition wrapping workspace and dashboard routes
- `dashboard`: Article discovery and management surface with overview cards/list, create/delete entry points, and clear navigation to workspace

### Modified Capabilities

_(none)_

## Impact

- **Code**: New layout components (shell, top nav, sidebar), dashboard page route, responsive behavior
- **APIs**: No new backend APIs — reuses existing article CRUD endpoints (`POST/GET/DELETE /api/articles`, `GET /api/articles/[slug]`)
- **Dependencies**: No new dependencies
- **Risk**: Low — purely presentational layer over existing APIs; no changes to writing pipeline or data model
