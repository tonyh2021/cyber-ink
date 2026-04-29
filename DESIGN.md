# CyberInk Design System

## 1. Identity & Atmosphere

CyberInk is a focused, professional writing intelligence platform. The design serves writers who spend hours in the tool — every decision optimizes for sustained concentration and content clarity.

**Light mode** (default) feels like a well-lit writing desk: cool paper surfaces with a single warm exception — the writing canvas gets a paper tint (`#f7f6f1`) to reduce eye strain during long sessions. **Dark mode** feels like a terminal meets a writer's studio: ink-dark surfaces, cool slate neutrals, Cyber Cyan as an active cursor.

Both themes share the same cool undertone, the same typography, the same spatial logic. Only color tokens change.

**Key Characteristics:**

- Cyber Cyan as singular brand accent — never decorative, always functional
- Inter for UI chrome, JetBrains Mono for AI-generated content and node labels — the font boundary signals the AI boundary
- Three-tier token architecture: `--base-*` (raw values) / `--sema-*` (semantic roles) / `--comp-*` (component-specific)
- Restrained border-radius: 4px–16px, no pills
- Content-first layout — the writing canvas is the primary visual element
- Cool neutrals only — warm tones are forbidden everywhere except the light-mode writing canvas

### Theme Switching

- Controlled via `data-theme="light" | "dark"` on `<html>`; **light is the default**
- Falls back to light if no `prefers-color-scheme` is set; user toggle overrides and persists to `localStorage`
- Implementation: CSS custom properties swap — no component rewrite needed

---

## 2. Color Tokens (Light / Dark)

All color values are listed as **Light | Dark**. Components reference the semantic token name, not hex values.

### 2.1 Brand Accent

| Token      | CSS Variable           | Light                  | Dark                   | Usage                                       |
| ---------- | ---------------------- | ---------------------- | ---------------------- | ------------------------------------------- |
| Cyber Cyan | `--brand-accent`       | `#0088a8`              | `#00d4ff`              | Primary CTA, active states, brand accent    |
| Cyan Hover | `--brand-accent-hover` | `#006d88`              | `#00b8e0`              | Hover/pressed state for cyan elements       |
| Cyan Dim   | `--brand-accent-dim`   | `rgba(0,136,168,0.08)` | `rgba(0,212,255,0.15)` | Subtle wash for selected states, highlights |

> **Why darken cyan in light mode?** `#00d4ff` on white yields contrast ratio ~2.8:1 (fails WCAG AA). `#0088a8` on white yields ~4.6:1 (passes AA). Brand hue 187° is preserved; only lightness shifts.

### 2.2 Text

| Token     | CSS Variable       | Light     | Dark      | Usage                          |
| --------- | ------------------ | --------- | --------- | ------------------------------ |
| Primary   | `--text-primary`   | `#1a1a2e` | `#e8e8f0` | Main body text                 |
| Secondary | `--text-secondary` | `#4a4a5e` | `#a8a8bc` | Descriptions, metadata         |
| Muted     | `--text-muted`     | `#8b8b9a` | `#6b6b80` | Placeholders, disabled labels  |
| Accent    | `--text-accent`    | `#0088a8` | `#00d4ff` | Active labels, links, node IDs |

### 2.3 Surface & Border

| Token         | CSS Variable         | Light               | Dark                     | Usage                                      |
| ------------- | -------------------- | ------------------- | ------------------------ | ------------------------------------------ |
| Root          | `--surface-root`     | `#f5f5f8`           | `#0d0d14`                | Page background canvas                     |
| Panel         | `--surface-panel`    | `#ededf2`           | `#1e1e2e`                | Sidebar, panels, secondary surfaces        |
| Card          | `--surface-card`     | `#ffffff`           | `#2a2a3e`                | Card backgrounds, node blocks              |
| Elevated      | `--surface-elevated` | `#ffffff`           | `#323248`                | Hover cards, dropdowns, tooltips           |
| Canvas        | `--surface-canvas`   | `#f7f6f1`           | `#1e1e2e`                | Writing area (warm paper tint in light)    |
| Border        | `--border-default`   | `#d0d0da`           | `#3a3a52`                | Standard borders, dividers                 |
| Border Active | `--border-active`    | `#0088a8`           | `#00d4ff`                | Active/selected borders                    |
| Border Subtle | `--border-subtle`    | `rgba(0,0,0,0.06)`  | `rgba(255,255,255,0.06)` | Subtle inner borders                       |

**Surface layering model:**

- Light: `#f5f5f8` → `#ededf2` → `#ffffff` (whiter = higher)
- Dark: `#0d0d14` → `#1e1e2e` → `#2a2a3e` → `#323248` (lighter = higher)

### 2.4 Semantic / Functional

| Token     | CSS Variable        | Light     | Dark      | Usage                                   |
| --------- | ------------------- | --------- | --------- | --------------------------------------- |
| Success   | `--color-success`   | `#008a60` | `#00c896` | Score high (>=0.80), promote eligible   |
| Warning   | `--color-warning`   | `#9a6800` | `#f0a500` | Score mid (0.60–0.79), review suggested |
| Danger    | `--color-danger`    | `#c4203e` | `#ff4566` | Score low (<0.60), hallucination risk   |
| Focus     | `--color-focus`     | `#3d63cc` | `#4d7cff` | Focus rings, keyboard navigation        |
| Best Node | `--color-best-node` | `#8a7000` | `#ffd700` | bestNode highlight in version tree      |

### 2.5 Diff

| Token            | CSS Variable         | Light                  | Dark                    |
| ---------------- | -------------------- | ---------------------- | ----------------------- |
| Diff Add BG      | `--diff-add-bg`      | `rgba(0,138,96,0.10)`  | `rgba(0,200,150,0.15)`  |
| Diff Remove BG   | `--diff-remove-bg`   | `rgba(196,32,62,0.10)` | `rgba(255,69,102,0.15)` |
| Diff Add Text    | `--diff-add-text`    | `#008a60`              | `#00c896`               |
| Diff Remove Text | `--diff-remove-text` | `#c4203e`              | `#ff4566`               |

---

## 3. Typography (Theme-Agnostic)

### Font Family

- **UI:** Inter — fallbacks: -apple-system, system-ui, Segoe UI, Helvetica Neue, Arial
- **Content / Mono:** JetBrains Mono — fallbacks: Fira Code, Cascadia Code, Consolas, monospace

### Type Scale

| Role           | Font           | Size            | Weight  | Line Height | Letter Spacing | Notes             |
| -------------- | -------------- | --------------- | ------- | ----------- | -------------- | ----------------- |
| Display Hero   | Inter          | 48px (3rem)     | 700     | 1.1         | -1.5px         | Brand moments     |
| Page Title     | Inter          | 28px (1.75rem)  | 600     | 1.2         | -0.8px         | Section headers   |
| Card Title     | Inter          | 16px (1rem)     | 600     | 1.4         | -0.2px         | Article titles    |
| Body           | Inter          | 14px (0.875rem) | 400     | 1.6         | normal         | Standard UI text  |
| Caption        | Inter          | 12px (0.75rem)  | 400–500 | 1.5         | normal         | Metadata, tags    |
| Node Label     | JetBrains Mono | 11px (0.688rem) | 500     | normal      | 0.5px          | v1, v2-a labels   |
| Content Output | JetBrains Mono | 14px (0.875rem) | 400     | 1.8         | normal         | Draft rendering   |
| Score Display  | Inter          | 32px (2rem)     | 700     | 1           | -1px           | Evaluation scores |

### Typography Principles

- **Dual-font identity:** Inter = UI chrome, JetBrains Mono = AI output. This boundary is sacred.
- **Negative tracking on titles:** -0.8px to -1.5px for a sharp, editorial feel
- **High line-height for content:** 1.8 on content output ensures comfortable long-form reading
- **Compact range:** 11px–48px; most functional UI lives at 12–16px

---

## 4. Spacing & Layout (Theme-Agnostic)

### Spacing System

- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px

### Border Radius Scale

| Category | Radius | CSS Variable        | Usage                                  |
| -------- | ------ | ------------------- | -------------------------------------- |
| Sharp    | 4px    | `--radius-sharp`    | Tags, badges, small chips              |
| Standard | 8px    | `--radius-standard` | Buttons, inputs, node cards, dropdowns |
| Card     | 12px   | `--radius-card`     | Article cards, writing canvas, panels  |
| Modal    | 16px   | `--radius-modal`    | Dialogs, popovers                      |

### Grid & Container

- **Dashboard:** 3-column article card grid (responsive → 2 → 1)
- **Article Workspace:** Sidebar (240px) + Canvas (flex) + Right Panel (320px)
- **Version Tree:** Horizontal node tree, centered in panel
- **Style Page:** 2-column (config left, preview right)
- **Max content width:** 1440px, centered

### Panel Structure (Article Workspace)

```
+------------+------------------------+--------------+
| Sidebar    | Writing Canvas         | Right Panel  |
| 240px      | flex-grow              | 320px        |
|            |                        |              |
| Material   | Node Content           | Evaluation   |
| Source     | (selected node)        | Scores       |
| Tree Nav   |                        | Diff View    |
+------------+------------------------+--------------+
```

### Whitespace Philosophy

- **Focused density:** information-dense workspace — writers need context at a glance
- **Breathing in canvas:** writing canvas gets generous padding (32px 40px)
- **Compact chrome:** sidebar and panels are compact; the canvas is generous

---

## 5. Depth & Elevation (Light / Dark)

| Level         | Light                            | Dark                            | Use                   |
| ------------- | -------------------------------- | ------------------------------- | --------------------- |
| Flat (0)      | No shadow                        | No shadow                       | Default surfaces      |
| Raised (1)    | `0 1px 3px rgba(0,0,0,0.08)`     | `0 2px 8px rgba(0,0,0,0.4)`     | Cards on hover        |
| Floating (2)  | `0 4px 16px rgba(0,0,0,0.10)`    | `0 8px 24px rgba(0,0,0,0.6)`    | Dropdowns, tooltips   |
| Modal (3)     | `0 8px 32px rgba(0,0,0,0.14)`    | `0 16px 48px rgba(0,0,0,0.8)`   | Modals, dialogs       |
| Glow (Accent) | `0 0 0 2px rgba(0,136,168,0.15)` | `0 0 0 2px rgba(0,212,255,0.2)` | Active/selected nodes |
| Gold Glow     | `0 0 0 2px rgba(138,112,0,0.15)` | `0 0 0 2px rgba(255,215,0,0.2)` | Best node highlight   |

**Depth philosophy:**

- **Light:** depth comes from subtle cool-toned shadows — cards float above the gray root. Shadows stay minimal; never warm.
- **Dark:** depth comes from surface color layering — no heavy shadows needed. Glow effects replace traditional shadows for active states.

---

## 6. Iconography (Theme-Agnostic Structure)

- **Library:** Lucide Icons (consistent with Next.js ecosystem)
- **Sizes:** 16px (inline), 20px (standard), 24px (prominent)
- **Stroke width:** 1.5px — precise, not chunky

| State   | Light                 | Dark                  |
| ------- | --------------------- | --------------------- |
| Default | `#8b8b9a`             | `#6b6b80`             |
| Hover   | `#4a4a5e`             | `#a8a8bc`             |
| Active  | `var(--brand-accent)` | `var(--brand-accent)` |

---

## 7. Components

All components use **semantic token names**. Dimensions (padding, radius, font size) are theme-agnostic. Color values vary by theme — use the CSS variable, not the hex.

### 7.1 Buttons

**Primary**

| Property   | Value                                  |
| ---------- | -------------------------------------- |
| Background | `var(--brand-accent)`                  |
| Text       | Light: `#ffffff` / Dark: `#0d0d14`     |
| Padding    | 8px 20px                               |
| Radius     | 8px                                    |
| Border     | 2px solid transparent                  |
| Hover      | `var(--brand-accent-hover)`            |
| Focus      | 2px solid `var(--color-focus)` outline |

**Secondary**

| Property   | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| Background | `var(--surface-card)`                                              |
| Text       | `var(--text-primary)`                                              |
| Padding    | 8px 20px                                                           |
| Radius     | 8px                                                                |
| Border     | 1px solid `var(--border-default)`                                  |
| Hover      | background `var(--surface-elevated)`, border `var(--brand-accent)` |

**Ghost**

| Property   | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Background | transparent                                            |
| Text       | `var(--text-secondary)`                                |
| Border     | 1px solid `var(--border-default)`                      |
| Hover      | text `var(--text-primary)`, border `var(--text-muted)` |

**Danger**

| Property   | Light                           | Dark                             |
| ---------- | ------------------------------- | -------------------------------- |
| Background | `rgba(196,32,62,0.08)`          | `rgba(255,69,102,0.12)`          |
| Text       | `var(--color-danger)`           | `var(--color-danger)`            |
| Border     | 1px solid `rgba(196,32,62,0.2)` | 1px solid `rgba(255,69,102,0.3)` |
| Hover BG   | `rgba(196,32,62,0.15)`          | `rgba(255,69,102,0.20)`          |

**Icon Circular**

| Property   | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| Background | `var(--surface-card)`                                            |
| Icon       | `var(--text-secondary)`                                          |
| Radius     | 50%                                                              |
| Size       | 32px × 32px                                                      |
| Hover      | icon `var(--brand-accent)`, background `var(--surface-elevated)` |

### 7.2 Cards & Containers

**Article Card (Dashboard)**

| Property   | Value                                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| Background | Light: `var(--surface-card)` / Dark: `var(--surface-panel)`                            |
| Border     | 1px solid `var(--border-default)`                                                      |
| Radius     | 12px                                                                                   |
| Padding    | 20px                                                                                   |
| Hover      | border `var(--brand-accent)`, Light: shadow Raised(1) / Dark: bg `var(--surface-card)` |
| Layout     | Status badge inline top-right                                                          |

**Node Card (Version Tree)**

| Property   | Value                                               |
| ---------- | --------------------------------------------------- |
| Background | `var(--surface-card)`                               |
| Border     | 1px solid `var(--border-default)`                   |
| Radius     | 8px                                                 |
| Padding    | 12px 16px                                           |
| Selected   | border `var(--border-active)`, Glow (Accent) shadow |
| Best Node  | border `var(--color-best-node)`, Gold Glow shadow   |
| Label      | JetBrains Mono 11px, `var(--text-accent)`           |

**Writing Canvas**

| Property   | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| Background | `var(--surface-canvas)`                                     |
| Border     | 1px solid `var(--border-default)`                           |
| Radius     | 12px                                                        |
| Padding    | 32px 40px                                                   |
| Content    | JetBrains Mono 14px, `var(--text-primary)`, line-height 1.8 |

**Evaluation Score Card**

| Property    | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Background  | Light: `var(--surface-card)` / Dark: `var(--surface-panel)` |
| Border-left | 3px solid (success/warning/danger by score tier)      |
| Radius      | 8px                                                   |
| Score       | Inter 32px weight 700, color by score tier            |

### 7.3 Inputs & Forms

**Text Input**

| Property   | Value                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| Background | Light: `var(--surface-card)` / Dark: `var(--surface-panel)`                  |
| Border     | 1px solid `var(--border-default)`                                            |
| Radius     | 8px                                                                          |
| Padding    | 10px 14px                                                                    |
| Text       | `var(--text-primary)`, placeholder `var(--text-muted)`                       |
| Focus      | border `var(--brand-accent)`, box-shadow `0 0 0 3px var(--brand-accent-dim)` |

**Textarea (Material Input)**

- Same as text input
- Min-height: 160px
- Font: Inter 14px, line-height 1.6
- Resize: vertical only

**Select / Dropdown**

| Property   | Value                             |
| ---------- | --------------------------------- |
| Background | `var(--surface-card)`             |
| Border     | 1px solid `var(--border-default)` |
| Radius     | 8px                               |
| Text       | `var(--text-primary)`             |
| Chevron    | `var(--text-muted)`               |

### 7.4 Navigation

**Top Navigation**

| Property      | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| Background    | `var(--surface-root)`                                              |
| Border-bottom | 1px solid `var(--border-default)`                                  |
| Height        | 56px                                                               |
| Logo          | Inter 18px weight 700, `var(--brand-accent)`                       |
| Nav links     | Inter 14px, `var(--text-secondary)`, active: `var(--text-primary)` |

**Left Sidebar**

| Property       | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Background     | `var(--surface-panel)`                                                    |
| Border-right   | 1px solid `var(--border-default)`                                         |
| Width          | 240px                                                                     |
| Section labels | Inter 11px weight 600, `var(--text-muted)`, uppercase, letter-spacing 1px |

### 7.5 Tags & Badges

**Status Badge**

| Status  | Background                | Text                   | Border                                 |
| ------- | ------------------------- | ---------------------- | -------------------------------------- |
| `draft` | `var(--brand-accent-dim)` | `var(--brand-accent)`  | `var(--brand-accent)` at 0.3/0.2 alpha |
| `final` | success at 0.1/0.08 alpha | `var(--color-success)` | success at 0.3/0.2 alpha               |

Common: radius 4px, padding 2px 8px, Inter 11px weight 500

**Score Badge**

| Tier            | Background                | Text                   |
| --------------- | ------------------------- | ---------------------- |
| High (>=0.80)   | success at 0.1/0.08 alpha | `var(--color-success)` |
| Mid (0.60–0.79) | warning at 0.1/0.08 alpha | `var(--color-warning)` |
| Low (<0.60)     | danger at 0.1/0.08 alpha  | `var(--color-danger)`  |

Common: radius 4px, Inter 12px weight 600

**Node Depth Badge**

- Background: `var(--brand-accent-dim)`
- Text: `var(--brand-accent)`, JetBrains Mono 11px
- Radius: 4px

---

## 8. Special UI Patterns

### Version Tree Visualization

- Horizontal layout, left-to-right
- v1 root on left, v2-x branches on right
- Connector lines: 1px solid `var(--border-default)`, cyan active path `var(--brand-accent)`
- Node cards: JetBrains Mono labels, score badge, status indicator
- Best node: Gold Glow border
- Selected node: Accent Glow border

### Streaming Output Animation

- Cursor blink: `var(--brand-accent)`, 1px wide, animate opacity 0↔1 at 1s interval
- Text appears character by character in JetBrains Mono
- Background: slight accent pulse `var(--brand-accent)` at 0.03 alpha during generation

### Evaluation Bar

- 5 metrics rendered as horizontal bars
- Bar fill: gradient from `var(--surface-card)` to score-tier color
- Labels: Inter 12px `var(--text-secondary)`
- Overall score: Inter 32px centered, color by score tier

### Feedback Mark UI

- Paragraph hover: left border 2px solid `var(--brand-accent)` at 0.25/0.3 alpha (light/dark)
- Selected text: background `var(--brand-accent-dim)`
- Floating action: small card, star icon, cyan Save button

### Diff View

- Container: Light: `var(--surface-card)` / Dark: `var(--surface-panel)`
- Added lines: `var(--diff-add-bg)` background, `var(--diff-add-text)` left bar
- Removed lines: `var(--diff-remove-bg)` background, `var(--diff-remove-text)` left bar
- Font: JetBrains Mono 13px

---

## 9. Do's and Don'ts

### Do

- Reference semantic CSS variables (`var(--brand-accent)`) — never hardcode hex values in components
- Maintain the cool undertone in both themes — all neutrals lean slate, not sand
- Apply Cyber Cyan only for active, interactive, brand moments — never decorative
- Use Inter for all UI chrome, JetBrains Mono for all AI output and node labels
- Apply restrained radius: 8px for inputs/buttons, 12px for cards — precise, not rounded
- Score-color everything evaluation-related: success / warning / danger tiers
- Light: use subtle shadows for depth; Dark: use surface layering for depth
- Light writing canvas `#f7f6f1` is the ONE warm exception — nowhere else

### Don't

- Don't use warm neutrals — always cool/slate toned (except light canvas)
- Don't use pure white `#ffffff` as root background in either theme
- Don't use pill-shaped buttons — 8px radius is the max for buttons
- Don't use border-radius > 12px on any container (16px only for modals)
- Don't add heavy drop shadows in either theme
- Don't use `#00d4ff` for text on light backgrounds — it fails WCAG AA contrast
- Don't introduce warm accent colors — cyan + slate is the complete palette
- Don't use Inter for AI-generated content — the font boundary is sacred
- Don't change spacing, radius, or layout between themes — only color tokens differ

---

## 10. Responsive Behavior

### Breakpoints

| Name          | Width       | Key Changes                                   |
| ------------- | ----------- | --------------------------------------------- |
| Mobile        | <640px      | Single column, no sidebar                     |
| Tablet        | 640–1024px  | Collapsed sidebar (icon only), no right panel |
| Desktop Small | 1024–1280px | Full sidebar, right panel on demand           |
| Desktop       | 1280–1440px | Full 3-panel layout                           |
| Large Desktop | >1440px     | Max-width container, centered                 |

### Collapsing Strategy

- **Sidebar:** full (240px) → icon-only (56px) → bottom sheet (mobile)
- **Right panel:** persistent → on-demand drawer → hidden (mobile)
- **Version tree:** horizontal → vertical stack (mobile)
- **Writing canvas:** full padding (32px 40px) → reduced (16px mobile)
- **Dashboard grid:** 3 columns → 2 → 1

---

## 11. Quick Reference for Agents

### Color Token Map (Light / Dark)

| Token                  | Light     | Dark      |
| ---------------------- | --------- | --------- |
| `--brand-accent`       | `#0088a8` | `#00d4ff` |
| `--brand-accent-hover` | `#006d88` | `#00b8e0` |
| `--surface-root`       | `#f5f5f8` | `#0d0d14` |
| `--surface-panel`      | `#ededf2` | `#1e1e2e` |
| `--surface-card`       | `#ffffff` | `#2a2a3e` |
| `--surface-canvas`     | `#f7f6f1` | `#1e1e2e` |
| `--text-primary`       | `#1a1a2e` | `#e8e8f0` |
| `--text-secondary`     | `#4a4a5e` | `#a8a8bc` |
| `--text-muted`         | `#8b8b9a` | `#6b6b80` |
| `--border-default`     | `#d0d0da` | `#3a3a52` |
| `--color-success`      | `#008a60` | `#00c896` |
| `--color-warning`      | `#9a6800` | `#f0a500` |
| `--color-danger`       | `#c4203e` | `#ff4566` |
| `--color-best-node`    | `#8a7000` | `#ffd700` |

### Example Component Prompts

- "Create a dashboard article card: `var(--surface-panel)` background, 1px solid `var(--border-default)` border, 12px radius. Title Inter 16px weight 600 `var(--text-primary)`. Hover: border `var(--brand-accent)`."
- "Design a node card: `var(--surface-card)` background, 8px radius, JetBrains Mono 11px `var(--text-accent)` label. Selected: Accent Glow shadow."
- "Build a primary button: `var(--brand-accent)` background, 8px radius, 8px 20px padding. Hover: `var(--brand-accent-hover)`."
- "Create writing canvas: `var(--surface-canvas)` background, 12px radius, 32px 40px padding. JetBrains Mono 14px `var(--text-primary)` line-height 1.8."

### Quick Rules

- Cyan for active/interactive only — never decorative
- 8px radius on buttons/inputs, 12px on cards
- Inter for UI, JetBrains Mono for output
- Score-color all evaluation UI: success / warning / danger tiers
- Light: subtle shadows for depth; Dark: surface layering for depth
- Light canvas `#f7f6f1` = warm paper; everything else stays cool
