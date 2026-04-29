# UI Phase — App Shell & Dashboard

## Summary

Implement product-level navigation shell and dashboard surfaces after the core writing loop is functional. This phase isolates layout and navigation decisions from the writing pipeline to reduce delivery risk.

## Depends on

- Phase 3 (branching, evaluation, promotion — full writing loop complete)

## Scope

### App Shell

- Top navigation (56px): logo, primary navigation, theme toggle
- Sidebar behavior and responsive collapse refinements
- Stable shell composition for workspace and dashboard routes

### Dashboard

- Dedicated dashboard route with article overview cards/list
- Create/delete entry points aligned with article CRUD APIs
- Clear navigation between dashboard and workspace

### UX Contract

- Workspace-first writing flow from Phase 2 remains intact after shell integration.
- Dashboard acts as a discovery and management surface; it does not replace workspace editing flow.
- No duplicate article management logic between sidebar and dashboard: both must rely on the same CRUD API contracts.

## APIs

No new backend APIs required in this phase. Reuse:

```
POST /api/articles
GET  /api/articles
DELETE /api/articles/[slug]
GET  /api/articles/[slug]
```

## Non-goals

- No branching/evaluation/style-loop logic changes
- No material dehydration model changes
- No export/diff functionality (Phase 5)
