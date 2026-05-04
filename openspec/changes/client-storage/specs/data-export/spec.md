# Data Export / Import

## ADDED Requirements

### EXPORT-1: Single article export
- Export one article as JSON file: `{ meta, source, tree, nodes[], evaluations[] }`
- Filename: `{slug}.json`
- Trigger from article context menu or workspace UI

### EXPORT-2: Bulk export
- Export all articles as single JSON file: `{ articles: ArticleExport[] }`
- Filename: `cyberink-backup-{date}.json`
- Trigger from settings or styles page

### EXPORT-3: Import
- Import a JSON file (single or bulk format), auto-detect format
- If slug already exists, prompt user: skip, overwrite, or rename
- Validate JSON structure before importing
- Write to IndexedDB in a single transaction per article

### EXPORT-4: Styles export/import included
- Bulk export includes styles data from localStorage alongside articles
- Import restores styles if present in the export file
