## Context

After Phase 3, the complete writing loop exists (generate → branch → evaluate → promote) but the app has no product-level navigation. Phase 2 deferred the app shell and dashboard to this change so the shell wraps a complete workflow, not a partial one.

**OpenSpec change id:** `phase-ui-shell-dashboard` (canonical name; supersedes any informal "Phase 2.5" wording elsewhere.)

Current state:
- Workspace page works as a standalone article editing surface
- Article list exists only as a workspace sidebar
- No top navigation, no responsive collapse, no dashboard route
- Article CRUD APIs exist from Phase 2 (`POST/GET/DELETE /api/articles`, `GET /api/articles/[slug]`)

**Depends on:** Phase 3 (branching, evaluation, promotion — full writing loop complete)

**Ordering:** Phase 2 defers standalone dashboard and app shell polish here; this change ships **after Phase 3** so the shell wraps a complete generate → branch → evaluate → promote loop.

## Goals / Non-Goals

**Goals:**
- Product-level app shell with top navigation and responsive sidebar
- Dedicated dashboard route for article discovery and management
- Clear navigation between dashboard and workspace
- Workspace-first writing flow from Phase 2 remains intact

**Non-Goals:**
- No branching/evaluation/style-loop logic changes
- No material dehydration model changes
- No export/diff functionality (Phase 5)
- No new backend APIs — purely a frontend layer over existing endpoints

## Decisions

### 1. App shell layout structure

**Choice:**
- Top navigation bar (56px): logo, primary navigation links (Dashboard / Workspace), theme toggle
- Left sidebar: article list with responsive collapse behavior
- Main content area: renders dashboard or workspace route

**Why 56px top nav:** Consistent with common SaaS app patterns. Tall enough for comfortable click targets, short enough to maximize content area.

**Why top nav + sidebar over sidebar-only:** Top navigation provides global context (which app, which section). Sidebar provides article-level context. Separating these concerns avoids an overloaded sidebar.

### 2. Dashboard as discovery surface, not editing surface

**Choice:** Dashboard shows article overview cards/list with:
- Article title, status, creation date
- Evaluation summary (bestNode score if available)
- Create and delete entry points
- Click-through to workspace for editing

Dashboard does NOT inline editing capabilities.

**Why separation:** The workspace is optimized for deep focus (material → write → evaluate). The dashboard is optimized for overview (what exists, what's the status, what to work on next). Mixing them creates a confused UI that does neither well.

### 3. Shared CRUD API contracts

**Choice:** Both sidebar and dashboard rely on the same article CRUD APIs:

```
POST /api/articles          # Create
GET  /api/articles          # List
DELETE /api/articles/[slug]  # Delete
GET  /api/articles/[slug]   # Get details
```

No new backend APIs in this phase.

**Why no duplication:** The sidebar (from Phase 2) and dashboard both need article lists. Using the same API ensures consistency. The dashboard may add client-side sorting/filtering but the data source is shared.

### 4. Responsive sidebar behavior

**Choice:**
- Desktop (≥1024px): sidebar always visible, collapsible via toggle
- Tablet (768–1023px): sidebar collapsed by default, toggleable
- Mobile (<768px): sidebar as overlay drawer

**Why these breakpoints:** Standard responsive breakpoints that match the content density needs. The workspace content area needs substantial width for material + output panels.

## Risks / Trade-offs

- **Shell integration may disrupt workspace layout**: Adding a top nav and sidebar wrapper changes the page structure. → Mitigation: workspace page is already a self-contained component; the shell wraps it without modifying internals.

- **Navigation state management**: Tracking active route, sidebar open/closed, and responsive breakpoints adds client state. → Mitigation: use Next.js App Router layout nesting — shell is a layout component, dashboard and workspace are page components. Sidebar state is local (useState or CSS-only).

- **Dashboard may feel empty initially**: With few articles, the dashboard is sparse. → Mitigation: show an empty state with a prominent "Create Article" CTA. The dashboard gains value as the user creates more articles.

## UX Contract

- Workspace-first writing flow from Phase 2 remains intact after shell integration.
- Dashboard acts as a discovery and management surface; it does not replace workspace editing flow.
- No duplicate article management logic between sidebar and dashboard: both must rely on the same CRUD API contracts.
