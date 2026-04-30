## Why

The app has a working workspace with collapsible sidebar (from Phase 2), but the dashboard route is a placeholder and the sidebar has no responsive behavior. Users need a proper article overview surface and the sidebar should adapt to screen size.

## What Changes

- Implement dashboard page: stat cards (Total / In Progress / Promoted), article card grid with canvas preview, empty state
- Add simple responsive sidebar: expanded ≥1024px, collapsed <1024px
- Share sidebar across dashboard and workspace routes via root layout
- Workspace sidebar article list is retained as quick-switch; dashboard is the richer overview surface

## Capabilities

### New Capabilities

- `dashboard`: Article discovery and management surface with stat cards, article card grid (canvas preview, title, version info, date), create/delete entry points, and click-through to workspace

### Modified Capabilities

- `app-shell`: Add responsive sidebar behavior (≥1024px expanded, <1024px collapsed). Sidebar shared across all routes via root layout.

## Impact

- **Code**: Dashboard page components, responsive sidebar hook, root layout refactor to share sidebar
- **APIs**: No new backend APIs — reuses existing article CRUD endpoints
- **Dependencies**: No new dependencies
- **Risk**: Low — purely presentational layer over existing APIs; root layout refactor may affect workspace hydration
