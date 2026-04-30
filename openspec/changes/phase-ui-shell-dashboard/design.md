## Context

Phase 2 shipped the workspace with a collapsible sidebar (logo, nav links, article list, New Article, theme toggle), dynamic routing (`/workspace/[slug]`), and article CRUD. The dashboard route (`/`) is a placeholder. Sidebar has no responsive behavior.

**OpenSpec change id:** `phase-ui-shell-dashboard`

Current state:
- Collapsible sidebar (220px/56px) with nav links, article list, create/delete, theme toggle — lives in workspace layout only
- Dashboard placeholder at `/`
- Article CRUD APIs exist (`POST/GET/DELETE /api/articles`, `GET /api/articles/[slug]`)
- Phase 3 (branching, evaluation) not yet implemented — stats that depend on it show 0

## Goals / Non-Goals

**Goals:**
- Dashboard page with stat cards and article card grid (Pencil design FMisW)
- Responsive sidebar: expanded ≥1024px, collapsed <1024px
- Sidebar shared across dashboard and workspace routes
- Workspace sidebar article list retained as quick-switch

**Non-Goals:**
- Mobile overlay drawer (deferred)
- Evaluation scores on dashboard cards (Phase 3 dependency — show 0 for now)
- No new backend APIs

## Decisions

### 1. Sidebar shared via root layout

**Choice:** Move SidebarProvider and ArticleSidebar from workspace layout to root layout, so dashboard and workspace both get the sidebar.

**Why:** Avoids duplicating sidebar in each route. Dashboard needs the same nav + create button. Article list in sidebar is useful everywhere.

### 2. Dashboard article list stays in sidebar

**Choice:** Keep article list in workspace sidebar. Dashboard is a richer overview surface (cards with preview, stats), not the only place to browse articles.

**Why (from explore):** Writing process needs quick article switching without leaving workspace. Sidebar = quick-switch, dashboard = overview/management. Original proposal's "workspace has no article sidebar" is overridden.

### 3. Dashboard layout (per Pencil FMisW)

**Choice:**
```
DashContent (surface-card, padding 32px 40px, gap 32px)
├── Page Header
│   ├── "Dashboard" — 24px 700 tracking -0.5
│   └── subtitle — 14px normal text-secondary
├── Stats Row (gap 16px)
│   ├── Total Articles   (icon: file-text, count color: text-primary)
│   ├── In Progress       (icon: pencil, count color: brand-accent)
│   └── Promoted          (icon: circle-check, count color: success)
│   Each: 140px, padding 16/20, radius 12, border-default, shadow
├── "Recent Articles" — 16px 600 tracking -0.2
└── Card Grid (3-col, gap 16px, responsive → 2 → 1)
    └── Article Card (radius 12, border-default, shadow)
        ├── Preview area (surface-canvas, h 88px, p 16)
        │   └── Content snippet — JetBrains Mono 11px muted
        └── Info area (padding 20px)
            ├── Title 16px 600 + Date 11px muted (space-between)
            └── "N versions · active: vX" — 12px text-secondary
```

Cards are clickable (navigate to workspace). Delete via hover trash icon (consistent with sidebar).

**Stats "In Progress" and "Promoted":** Show 0 until Phase 3 provides evaluation/promotion data. Total Articles is computed from article count.

### 4. Simple responsive sidebar

**Choice:**
- ≥1024px: sidebar expanded by default (220px)
- <1024px: sidebar collapsed by default (56px)
- No mobile overlay drawer (deferred)

**Implementation:** `useMediaQuery` or `window.matchMedia` check on mount, sets initial collapsed state. User can still manually toggle.

### 5. Dashboard empty state

**Choice:** When no articles exist, show centered empty state with icon, heading, description, and prominent "New Article" button (same pattern as workspace empty state).

## Risks / Trade-offs

- **Root layout refactor:** Moving sidebar to root layout changes hydration boundary. SidebarProvider with server-fetched initialArticles must work at root level.
- **Stats accuracy:** "In Progress" and "Promoted" are hardcoded 0 until Phase 3. Users may find this misleading. Mitigation: these are clearly labeled, and the counts update naturally once data exists.
- **Responsive without resize listener:** If using mount-time check only, sidebar won't respond to window resize. Acceptable for now — users rarely resize.

## UX Contract

- Dashboard is an overview/management surface; workspace is the editing surface.
- Sidebar article list is retained in workspace for quick-switch convenience.
- Navigation sidebar is shared across all routes — consistent chrome everywhere.
- Stats cards show real data where available, 0 where Phase 3 data is missing.
