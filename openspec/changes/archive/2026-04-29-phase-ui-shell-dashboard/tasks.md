# Phase UI Shell & Dashboard: Tasks

- [x] Task 1: Move sidebar to root layout — lift SidebarProvider + ArticleSidebar from `workspace/layout.tsx` to `app/layout.tsx` so dashboard and workspace share the sidebar
- [x] Task 2: Responsive sidebar — add `useMediaQuery` hook, default collapsed <1024px, expanded ≥1024px; user manual toggle overrides
- [x] Task 3: Dashboard page — implement `/` route with page header, stats row, article card grid per Pencil FMisW
- [x] Task 4: Dashboard empty state — when no articles, show centered empty state with icon + "Create your first article" CTA
- [x] Task 5: Article card component — card with canvas preview (surface-canvas, JetBrains Mono snippet), title row, version info, clickable to workspace, delete on hover
- [x] Task 6: Flatten styles to one-file-per-style — move `data/styles/default/active.md` to `data/styles/default.md`, update generate route to read from `meta.styleRef`
- [x] Task 7: Styles placeholder page — `/styles` route listing all styles + profile (read-only, from filesystem)

## Task Details

### Task 1: Move sidebar to root layout

Move `SidebarProvider` (with server-fetched `initialArticles`) and `ArticleSidebar` from `src/app/workspace/layout.tsx` to `src/app/layout.tsx`. The workspace layout becomes a pass-through or is removed. Dashboard page (`src/app/page.tsx`) gets the sidebar automatically.

- `app/layout.tsx`: wrap children with SidebarProvider, render ArticleSidebar
- `workspace/layout.tsx`: remove SidebarProvider wrapper, keep only if needed for workspace-specific logic
- Verify: sidebar renders on both `/` and `/workspace/[slug]`

**Acceptance:** Sidebar visible on dashboard and workspace. Article list, create, theme toggle work on both routes.

### Task 2: Responsive sidebar

Add a `useMediaQuery` hook (or inline `matchMedia` in SidebarProvider) that sets `collapsed = true` when viewport < 1024px on mount.

- Create `src/hooks/use-media-query.ts` or add logic to `sidebar-context.tsx`
- On mount: check `window.matchMedia('(min-width: 1024px)')`, set initial collapsed state
- User manual toggle still overrides
- Optional: listen for resize events to update

**Acceptance:** Sidebar collapsed by default on screens < 1024px. Expanded on ≥1024px. Manual toggle works.

### Task 3: Dashboard page

Replace the placeholder at `src/app/page.tsx` with the full dashboard layout:

1. Content wrapper: `bg-surface-card`, padding `32px 40px`, gap `32px`
2. Page header: "Dashboard" (24px 700 tracking -0.5) + subtitle (14px text-secondary)
3. Stats row: 3 stat cards (140px, padding 16/20, radius 12, border-default + shadow)
   - Total Articles: icon `file-text`, count from articles.length, color text-primary
   - In Progress: icon `pencil`, count 0 (Phase 3), color brand-accent
   - Promoted: icon `circle-check`, count 0 (Phase 3), color success
4. Section header: "Recent Articles" (16px 600 tracking -0.2)
5. Card grid: 3-col layout with gap 16px, responsive (→ 2col → 1col)

Uses `useSidebar()` for articles data + `sidebarWidth` for margin-left.

**Acceptance:** Dashboard shows stats + article cards. Layout matches Pencil FMisW. Responsive grid columns.

### Task 4: Dashboard empty state

When `articles.length === 0`, replace stats + grid with centered empty state:
- Icon (e.g. `FileText` or `LayoutDashboard`, 48px, text-muted)
- "No articles yet" heading (18px 600 text-secondary)
- Description text (13px text-muted)
- "New Article" primary button (calls create API, navigates to workspace)

**Acceptance:** Empty state shown when no articles. Create button works. After creation, dashboard shows the new card.

### Task 5: Article card component

Create `src/components/dashboard/article-card.tsx`:

1. Canvas preview area: `surface-canvas` bg, height 88px, padding 16px, clip overflow
   - Show first ~100 chars of latest node content in JetBrains Mono 11px text-muted, line-height 1.5
2. Info area: padding 20px
   - Title row: title (16px 600 tracking -0.2) + date (11px text-muted), space-between
   - Version line: "N versions · active: vX" (12px text-secondary)
3. Styling: radius 12, border 1px border-default, shadow `0 2px 8px rgba(0,0,0,0.06)`
4. Entire card clickable → `/workspace/[slug]`
5. Delete: trash icon on hover (top-right), with confirmation dialog (reuse sidebar pattern)

**Acceptance:** Cards render with preview snippet, title, date, version info. Click navigates. Delete works with confirmation.

### Task 6: Flatten styles to one-file-per-style

1. Move `data/styles/default/active.md` → `data/styles/default.md`
2. Remove empty `data/styles/default/` directory
3. Update `src/app/api/articles/[slug]/generate/route.ts`: read style from `styles/${meta.styleRef}.md` instead of hardcoded `styles/default/active.md`. Fall back to `styles/default.md` if `styleRef` is null.
4. Update CLAUDE.md data layout to reflect new structure

**Acceptance:** Generate API reads style from article's `styleRef`. `data/styles/default.md` exists. Build passes.

### Task 7: Styles placeholder page

Create `src/app/styles/page.tsx` as a server component. Read profile and active style from filesystem, render read-only.

1. Use `readMarkdown('profiles/default.md')` for profile (frontmatter: name, description; content: profile text)
2. Use `readMarkdown('styles/default/active.md')` for style (frontmatter: name, version, description; content: style rules)
3. Layout: use `useSidebar()` for margin-left (needs "use client" wrapper or pass data as props)
4. Two sections side by side or stacked:
   - **Profile** card: name badge, description, content rendered as markdown or pre-formatted
   - **Active Style** card: name + version badge, description, content rendered as markdown or pre-formatted
5. Styling: surface-card bg cards, border-default, radius 12, padding 20–24px. Content in JetBrains Mono (it's AI-related config). Section headers in Source Sans 3.

Reads from `data/styles/*.md` and `data/profiles/default.md`.

1. Profile section: name, description, content from `profiles/default.md`
2. Styles list: scan `data/styles/` for all `.md` files, render each as a card showing name, description (from frontmatter), and content preview
3. Styling: surface-card cards, border-default, radius 12. Style content in JetBrains Mono.

**Acceptance:** `/styles` route lists all styles and shows profile. Read-only. Sidebar nav "Styles" link works.

## Dependency Graph

```
Task 1 (root layout) → Task 2 (responsive) can be parallel
Task 1 → Task 3 (dashboard needs sidebar context)
Task 3 → Task 4 (empty state is part of dashboard)
Task 3 → Task 5 (card component used by dashboard)
Task 6 (flatten styles) → Task 7 (styles page reads new path)
Task 1 → Task 7 (styles page needs sidebar)
```

Suggested order: Task 1 → Task 6 → Task 5 → Task 3 → Task 4 → Task 7 → Task 2
