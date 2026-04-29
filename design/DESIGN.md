# CyberInk Design System

## 1. Identity & Atmosphere

CyberInk is a focused, professional writing intelligence platform. The design serves writers who spend hours in the tool — every decision optimizes for sustained concentration and content clarity.

**Light mode** (default) feels like a well-lit writing desk: cool paper surfaces with a single warm exception — the writing canvas gets a paper tint (`#f7f6f1`) to reduce eye strain during long sessions. **Dark mode** feels like a terminal meets a writer's studio: ink-dark surfaces, cool slate neutrals, Cyber Cyan as an active cursor.

Both themes share the same cool undertone, the same typography, the same spatial logic. Only color tokens change.

**Key Characteristics:**

- Cyber Cyan as singular brand accent — never decorative, always functional
- Source Sans 3 for UI chrome, JetBrains Mono for AI-generated content and node labels — the font boundary signals the AI boundary
- Flat semantic token architecture: `--brand-*`, `--surface-*`, `--text-*`, `--color-*` — components reference token names, not hex values
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

### oklch Implementation Guide

Colors are authored in oklch for perceptual uniformity — theme switching only changes the **L (lightness)** channel while **C (chroma)** and **H (hue)** stay constant. Hex values below are the computed fallbacks.

**Base palette (define once in `:root`):**

| Token        | CSS Variable  | C (Chroma) | H (Hue) | Notes                  |
| ------------ | ------------- | ---------- | -------- | ---------------------- |
| Brand Cyan   | `--h-brand`   | 0.155      | 197      | Primary brand identity |
| Success      | `--h-success` | 0.140      | 165      | Positive signals       |
| Warning      | `--h-warning` | 0.150      | 75       | Caution signals        |
| Danger       | `--h-danger`  | 0.180      | 15       | Negative signals       |
| Focus        | `--h-focus`   | 0.160      | 260      | Keyboard navigation    |
| Best Node    | `--h-best`    | 0.140      | 90       | Gold highlight         |
| Neutral      | `--h-neutral` | 0.010      | 280      | Cool slate undertone   |

**Lightness scale (per theme):**

| Role       | Light L | Dark L | Usage                          |
| ---------- | ------- | ------ | ------------------------------ |
| Foreground | 0.48–0.52 | 0.70–0.75 | Solid text/icons on backgrounds |
| Hover      | 0.40–0.44 | 0.62–0.67 | L - 0.08 from foreground       |
| Dim wash   | foreground at 0.08 alpha | foreground at 0.15 alpha | Subtle background tints |

**CSS implementation pattern:**

```css
:root {
  --c-brand: 0.155;
  --h-brand: 197;
}
[data-theme="light"] {
  --brand-accent: oklch(0.48 var(--c-brand) var(--h-brand));
  --brand-accent-hover: oklch(0.40 var(--c-brand) var(--h-brand));
}
[data-theme="dark"] {
  --brand-accent: oklch(0.75 var(--c-brand) var(--h-brand));
  --brand-accent-hover: oklch(0.67 var(--c-brand) var(--h-brand));
}
```

**Compatibility:** oklch requires Safari 15.4+, Chrome 111+. Use `@csstools/postcss-oklab-function` for hex fallback generation at build time.

### 2.1 Brand Accent

| Token      | CSS Variable           | Light | Dark | oklch (L light / L dark, C, H) | Usage |
| ---------- | ---------------------- | ----- | ---- | ------------------------------ | ----- |
| Cyber Cyan | `--brand-accent`       | `#006b85` | `#00d4ff` | L 0.48 / 0.75, C 0.155, H 197 | Primary CTA, active states, brand accent |
| Cyan Hover | `--brand-accent-hover` | `#005a70` | `#00b8e0` | L 0.40 / 0.67, C 0.155, H 197 | Hover/pressed state for cyan elements |
| Cyan Dim   | `--brand-accent-dim`   | `rgba(0,107,133,0.08)` | `rgba(0,212,255,0.15)` | accent at alpha 0.08 / 0.15 | Subtle wash for selected states, highlights |

> **Why darken cyan in light mode?** `#00d4ff` on white yields contrast ratio ~2.8:1 (fails WCAG AA). `#006b85` on white yields ~6.1:1 (passes AA with margin). Brand hue 197° is preserved; only lightness shifts — this is exactly the oklch model in action.

### 2.2 Text

| Token     | CSS Variable       | Light     | Dark      | oklch (L light / L dark, C, H) | Usage |
| --------- | ------------------ | --------- | --------- | ------------------------------ | ----- |
| Primary   | `--text-primary`   | `#1a1a2e` | `#e8e8f0` | L 0.20 / 0.93, C 0.010, H 280 | Main body text |
| Secondary | `--text-secondary` | `#4a4a5e` | `#a8a8bc` | L 0.40 / 0.73, C 0.010, H 280 | Descriptions, metadata |
| Muted     | `--text-muted`     | `#8b8b9a` | `#6b6b80` | L 0.62 / 0.50, C 0.010, H 280 | Placeholders, disabled labels |
| Accent    | `--text-accent`    | `#006b85` | `#00d4ff` | = `--brand-accent` | Active labels, links, node IDs |

### 2.3 Surface & Border

| Token         | CSS Variable         | Light               | Dark                     | oklch (L light / L dark, C, H) | Usage |
| ------------- | -------------------- | ------------------- | ------------------------ | ------------------------------ | ----- |
| Root          | `--surface-root`     | `#fafafc`           | `#0d0d14`                | L 0.98 / 0.10, C 0.005, H 280 | Page background, nav sidebar |
| Panel         | `--surface-panel`    | `#f5f5f8`           | `#1e1e2e`                | L 0.97 / 0.18, C 0.005, H 280 | Panels, secondary surfaces |
| Card          | `--surface-card`     | `#ffffff`           | `#2a2a3e`                | L 1.00 / 0.24, C 0.005, H 280 | Card backgrounds, node blocks |
| Elevated      | `--surface-elevated` | `#ffffff`           | `#323248`                | L 1.00 / 0.28, C 0.005, H 280 | Hover cards, dropdowns, tooltips |
| Canvas        | `--surface-canvas`   | `#f7f6f1`           | `#1e1e2e`                | L 0.97 / 0.18, C 0.010, H 85 | Writing area (warm paper tint in light) |
| Border        | `--border-default`   | `rgba(0,0,0,0.06)`  | `rgba(255,255,255,0.08)` | Semi-transparent, adapts to background | All borders, dividers, card edges |
| Border Active | `--border-active`    | `#006b85`           | `#00d4ff`                | = `--brand-accent` | Active/selected borders |

**Surface layering model:**

- Light: L 0.98 → 0.97 → 1.00 (whiter = higher), all C 0.005 H 280
- Dark: L 0.10 → 0.18 → 0.24 → 0.28 (lighter = higher), all C 0.005 H 280

### 2.4 Semantic / Functional

| Token     | CSS Variable        | Light     | Dark      | oklch (L light / L dark, C, H) | Usage |
| --------- | ------------------- | --------- | --------- | ------------------------------ | ----- |
| Success   | `--color-success`   | `#007a54` | `#00c896` | L 0.48 / 0.72, C 0.140, H 165 | Score high (>=0.80), promote eligible |
| Warning   | `--color-warning`   | `#9a6800` | `#f0a500` | L 0.52 / 0.72, C 0.150, H 75 | Score mid (0.60–0.79), review suggested |
| Danger    | `--color-danger`    | `#c4203e` | `#ff6685` | L 0.50 / 0.73, C 0.180, H 15 | Score low (<0.60), hallucination risk |
| Focus     | `--color-focus`     | `#3d63cc` | `#4d7cff` | L 0.48 / 0.62, C 0.160, H 260 | Focus rings, keyboard navigation |
| Best Node | `--color-best-node` | `#8a7000` | `#ffd700` | L 0.52 / 0.85, C 0.140, H 90 | bestNode highlight in version tree |

### 2.5 Diff

| Token            | CSS Variable         | Light                  | Dark                    |
| ---------------- | -------------------- | ---------------------- | ----------------------- |
| Diff Add BG      | `--diff-add-bg`      | `rgba(0,122,84,0.10)`  | `rgba(0,200,150,0.15)`  |
| Diff Remove BG   | `--diff-remove-bg`   | `rgba(196,32,62,0.10)` | `rgba(255,102,133,0.15)` |
| Diff Add Text    | `--diff-add-text`    | `#007a54`              | `#00c896`               |
| Diff Remove Text | `--diff-remove-text` | `#c4203e`              | `#ff6685`               |

---

## 3. Typography (Theme-Agnostic)

### Font Family

- **UI:** Source Sans 3 — fallbacks: Source Han Sans, -apple-system, system-ui, Segoe UI, Helvetica Neue, Arial
- **UI (CJK):** Source Han Sans (思源黑体) — fallback: Noto Sans SC, PingFang SC, Microsoft YaHei
- **Content / Mono:** JetBrains Mono — fallbacks: Source Han Mono, Fira Code, Cascadia Code, Consolas, monospace
- **Content / Mono (CJK):** Source Han Mono (思源等宽) — fallback: Noto Sans Mono CJK SC

### Type Scale

| Role           | Font           | Size            | Weight  | Line Height | Letter Spacing | Notes             |
| -------------- | -------------- | --------------- | ------- | ----------- | -------------- | ----------------- |
| Display Hero   | Source Sans 3  | 48px (3rem)     | 700     | 1.1         | -1.5px         | Brand moments     |
| Page Title     | Source Sans 3  | 28px (1.75rem)  | 600     | 1.2         | -0.8px         | Section headers   |
| Card Title     | Source Sans 3  | 16px (1rem)     | 600     | 1.4         | -0.2px         | Article titles    |
| Body           | Source Sans 3  | 14px (0.875rem) | 400     | 1.6         | normal         | Standard UI text  |
| Caption        | Source Sans 3  | 12px (0.75rem)  | 400–500 | 1.5         | normal         | Metadata, tags    |
| Node Label     | JetBrains Mono | 11px (0.688rem) | 500     | normal      | 0.5px          | v1, v2-a labels   |
| Content Output | JetBrains Mono | 14px (0.875rem) | 400     | 1.8         | normal         | Draft rendering   |
| Score Display  | Source Sans 3  | 32px (2rem)     | 700     | 1           | -1px           | Evaluation scores |

### Typography Principles

- **Dual-font identity:** Source Sans 3 (+ Source Han Sans) = UI chrome, JetBrains Mono (+ Source Han Mono) = AI output. This boundary is sacred.
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

- **App shell:** Nav sidebar (220px expanded / 56px collapsed) + content area (flex)
- **Dashboard:** 3-column article card grid (responsive → 2 → 1)
- **Article Workspace:** Input panel (440px) + Output panel (flex: node tree + writing canvas + eval bar)
- **Version Tree:** Horizontal node tree, above writing canvas
- **Style Page:** 2-column (config left, preview right)
- **Max content width:** 1440px, centered

### Panel Structure (Article Workspace)

```
+------+------------------+----------------------------------+
| Nav  | Input Panel      | Output Panel                     |
| 56px | 440px            | flex-grow                        |
| or   |                  |                                  |
| 220px| Metadata         | Node Tree + Actions              |
|      | Material         | Writing Canvas (surface-canvas)  |
|      | Instruction      | Evaluation Bar                   |
+------+------------------+----------------------------------+
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
| Glow (Accent) | `0 0 0 2px rgba(0,107,133,0.15)` | `0 0 0 2px rgba(0,212,255,0.2)` | Active/selected nodes |
| Gold Glow     | `0 0 0 2px rgba(138,112,0,0.15)` | `0 0 0 2px rgba(255,215,0,0.2)` | Best node highlight   |

**Depth philosophy:**

- **Light:** depth comes from subtle cool-toned shadows — cards float via semi-transparent `border-default` + soft shadow (`0 2px 8px rgba(0,0,0,0.06)`), not hard opaque borders. Nav sidebar uses outer shadow for layering. Shadows stay minimal; never warm.
- **Dark:** depth comes from surface color layering — no heavy shadows needed. Glow effects replace traditional shadows for active states.

---

## 6. Motion & Transitions (Theme-Agnostic)

### Duration Scale

| Token               | Value  | Usage                                          |
| ------------------- | ------ | ---------------------------------------------- |
| `--duration-fast`   | 100ms  | Color shifts, opacity toggles, icon swaps      |
| `--duration-normal` | 200ms  | Button hover, border highlight, card lift       |
| `--duration-slow`   | 350ms  | Panel expand/collapse, drawer slide, modal open |

### Easing Curves

| Token              | Value                        | Usage                              |
| ------------------ | ---------------------------- | ---------------------------------- |
| `--ease-default`   | `cubic-bezier(0.4, 0, 0.2, 1)` | General-purpose (Material standard) |
| `--ease-enter`     | `cubic-bezier(0, 0, 0.2, 1)`   | Elements appearing (decelerate in)  |
| `--ease-exit`      | `cubic-bezier(0.4, 0, 1, 1)`   | Elements leaving (accelerate out)   |

### Common Patterns

| Pattern              | Duration | Easing        | Properties                         |
| -------------------- | -------- | ------------- | ---------------------------------- |
| Button hover         | fast     | default       | `background-color, border-color`   |
| Card hover lift      | normal   | default       | `border-color, box-shadow`         |
| Input focus ring     | fast     | default       | `border-color, box-shadow`         |
| Sidebar toggle       | slow     | enter / exit  | `width, opacity`                   |
| Modal open           | slow     | enter         | `opacity, transform: scale(0.97→1)` |
| Modal close          | normal   | exit          | `opacity, transform: scale(1→0.97)` |
| Dropdown open        | normal   | enter         | `opacity, transform: translateY(-4px→0)` |
| Node selection       | fast     | default       | `border-color, box-shadow`         |
| Streaming cursor     | 1000ms   | `steps(1)`    | `opacity` 0↔1 blink               |

### Principles

- **Snappy chrome, gentle content:** UI controls respond instantly (fast); layout changes ease in (slow)
- **No bounce, no overshoot:** cubic-bezier only — no spring physics. The tool is professional, not playful
- **Reduce motion:** respect `prefers-reduced-motion: reduce` — collapse all transitions to 0ms, disable cursor blink

---

## 7. Iconography (Theme-Agnostic Structure)

- **Library:** Lucide Icons (consistent with Next.js ecosystem)
- **Sizes:** 16px (inline), 20px (standard), 24px (prominent)
- **Stroke width:** 1.5px — precise, not chunky

| State   | Light                 | Dark                  |
| ------- | --------------------- | --------------------- |
| Default | `#8b8b9a`             | `#6b6b80`             |
| Hover   | `#4a4a5e`             | `#a8a8bc`             |
| Active  | `var(--brand-accent)` | `var(--brand-accent)` |

---

## 8. Components

All components use **semantic token names**. Dimensions (padding, radius, font size) are theme-agnostic. Color values vary by theme — use the CSS variable, not the hex.

### 8.1 Buttons

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

### 8.2 Cards & Containers

**Article Card (Dashboard)**

| Property   | Value                                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| Background | `var(--surface-card)`                                                                  |
| Border     | 1px solid `var(--border-default)` (semi-transparent, adapts to background)               |
| Shadow     | `0 2px 8px rgba(0,0,0,0.06)` — cards float via shadow, not hard line frames           |
| Radius     | 12px                                                                                   |
| Padding    | 20px                                                                                   |
| Hover      | border `var(--brand-accent)`, Light: shadow Raised(1) / Dark: bg `var(--surface-card)` |
| Layout     | Canvas preview (top, `var(--surface-canvas)` bg) + badge + title + metadata            |

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

| Property   | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Background | Light: `var(--surface-card)` / Dark: `var(--surface-panel)`  |
| Border     | 1px solid `var(--border-default)`                            |
| Radius     | 8px                                                          |
| Indicator  | 6px circle (top-right of score), fill by score tier color    |
| Score      | Source Sans 3 32px weight 700, color by score tier                   |

### 8.3 Inputs & Forms

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
- Font: Source Sans 3 14px, line-height 1.6
- Resize: vertical only

**Select / Dropdown**

| Property   | Value                             |
| ---------- | --------------------------------- |
| Background | `var(--surface-card)`             |
| Border     | 1px solid `var(--border-default)` |
| Radius     | 8px                               |
| Text       | `var(--text-primary)`             |
| Chevron    | `var(--text-muted)`               |

### 8.4 Navigation

**Nav Sidebar (replaces top nav — all navigation consolidated into sidebar)**

| Property       | Expanded (220px)                                                         | Collapsed (56px)                     |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Background     | `var(--surface-root)`                                                    | `var(--surface-root)`                |
| Depth          | outer shadow `0 3px 16px rgba(0,0,0,0.08)` (z-index above content)      | same                                 |
| Logo           | Source Sans 3 18px weight 700, `var(--brand-accent)`, "CyberInk"         | "CI" abbreviation (click to expand)  |
| Nav links      | icon 16px + Source Sans 3 14px, active: `var(--brand-accent-dim)` bg     | icon-only, 36×36 hit area            |
| Collapse toggle| `panel-left-close` icon in logo row                                      | click "CI" logo to expand            |
| Bottom section | "New Article" full-width primary button + theme toggle with label        | "+" icon button + compact toggle     |

**Nav link states:**

| State    | Icon fill          | Text fill            | Background               |
| -------- | ------------------ | -------------------- | ------------------------ |
| Default  | `var(--text-muted)`| `var(--text-secondary)` | transparent           |
| Active   | `var(--text-accent)` | `var(--text-accent)` | `var(--brand-accent-dim)` |

### 8.5 Tags & Badges

**Status Badge**

| Status  | Background                | Text                   | Border                                 |
| ------- | ------------------------- | ---------------------- | -------------------------------------- |
| `draft` | `var(--brand-accent-dim)` | `var(--brand-accent)`  | `var(--brand-accent)` at 0.3/0.2 alpha |
| `final` | success at 0.1/0.08 alpha | `var(--color-success)` | success at 0.3/0.2 alpha               |

Common: radius 4px, padding 2px 8px, Source Sans 3 11px weight 500

**Score Badge**

| Tier            | Background                | Text                   |
| --------------- | ------------------------- | ---------------------- |
| High (>=0.80)   | success at 0.1/0.08 alpha | `var(--color-success)` |
| Mid (0.60–0.79) | warning at 0.1/0.08 alpha | `var(--color-warning)` |
| Low (<0.60)     | danger at 0.1/0.08 alpha  | `var(--color-danger)`  |

Common: radius 4px, Source Sans 3 12px weight 600

**Node Depth Badge**

- Background: `var(--brand-accent-dim)`
- Text: `var(--brand-accent)`, JetBrains Mono 11px
- Radius: 4px

---

## 9. Special UI Patterns

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
- Labels: Source Sans 3 12px `var(--text-secondary)`
- Overall score: Source Sans 3 32px centered, color by score tier

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

## 10. Do's and Don'ts

### Do

- Reference semantic CSS variables (`var(--brand-accent)`) — never hardcode hex values in components
- Maintain the cool undertone in both themes — all neutrals lean slate, not sand
- Apply Cyber Cyan only for active, interactive, brand moments — never decorative
- Use Source Sans 3 / Source Han Sans for all UI chrome, JetBrains Mono / Source Han Mono for all AI output and node labels
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
- Don't use Source Sans 3 for AI-generated content — the font boundary is sacred
- Don't change spacing, radius, or layout between themes — only color tokens differ

---

## 11. Responsive Behavior

### Breakpoints

| Name          | Width       | Key Changes                                   |
| ------------- | ----------- | --------------------------------------------- |
| Mobile        | <640px      | Single column, no sidebar                     |
| Tablet        | 640–1024px  | Collapsed sidebar (icon only), no right panel |
| Desktop Small | 1024–1280px | Full sidebar, right panel on demand           |
| Desktop       | 1280–1440px | Full 3-panel layout                           |
| Large Desktop | >1440px     | Max-width container, centered                 |

### Collapsing Strategy

- **Nav sidebar:** full (220px) → icon-only (56px) → bottom sheet (mobile)
- **Right panel:** persistent → on-demand drawer → hidden (mobile)
- **Version tree:** horizontal → vertical stack (mobile)
- **Writing canvas:** full padding (32px 40px) → reduced (16px mobile)
- **Dashboard grid:** 3 columns → 2 → 1

---

## 12. Accessibility

### Contrast Requirements

- **Target:** WCAG 2.1 AA minimum across both themes
- **Normal text** (< 18px / < 14px bold): contrast ratio ≥ 4.5:1
- **Large text** (≥ 18px / ≥ 14px bold): contrast ratio ≥ 3:1
- **Non-text UI** (borders, icons, focus rings): contrast ratio ≥ 3:1 against adjacent color
- Brand accent is pre-validated: `#006b85` on `#fafafc` = 5.5:1 (light), `#00d4ff` on `#0d0d14` = 12.1:1 (dark)
- `--text-muted` is exempt from AA minimums — used only for placeholders and disabled labels (WCAG 1.4.3 exempts disabled UI)
- `--border-default` is decorative (visual separation only, not informational) — exempt from 3:1 non-text UI requirement

### Focus Indicators

| Property  | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Style     | `2px solid var(--color-focus)` outline                       |
| Offset    | `2px` (outline-offset, ensures gap from element edge)        |
| Radius    | Follows element's border-radius                              |
| Glow      | `0 0 0 4px var(--brand-accent-dim)` as secondary indicator  |
| Visible   | Always visible on `:focus-visible`; hidden on mouse `:focus` |

### Touch & Click Targets

- **Minimum interactive size:** 44px × 44px (WCAG 2.5.8 Target Size)
- **Minimum spacing between targets:** 8px
- Compact elements (badges, node labels) that are not interactive are exempt
- Icon buttons (32px visual) must have 44px hit area via padding or `min-width`/`min-height`

### Color Independence

Evaluation scores must never rely on color alone:

| Signal          | Color                  | Secondary Indicator          |
| --------------- | ---------------------- | ---------------------------- |
| High (≥ 0.80)   | `var(--color-success)` | Numeric value + "▲" prefix   |
| Mid (0.60–0.79) | `var(--color-warning)` | Numeric value + "●" prefix   |
| Low (< 0.60)    | `var(--color-danger)`  | Numeric value + "▼" prefix   |
| Best Node       | `var(--color-best-node)` | Star icon (★) beside label |

### Keyboard Navigation

- All interactive elements reachable via `Tab` / `Shift+Tab`
- Version tree nodes: arrow keys for spatial navigation (← → ↑ ↓)
- Modal: focus trapped inside; `Escape` closes
- Writing canvas: `Tab` exits to next UI element (not trapped)
- Skip link: hidden "Skip to canvas" link at top, visible on focus

### Motion Accessibility

- Respect `prefers-reduced-motion: reduce` — collapse all transitions to 0ms
- Disable streaming cursor blink animation
- Sidebar and modal transitions become instant

### Semantic Markup

- Use `role="tree"` + `role="treeitem"` for version tree
- Evaluation bars: `role="meter"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="1"`
- Status badges: `aria-label` includes status text (e.g., "Status: Draft")
- Live generation output: `aria-live="polite"` on streaming content container

---

## 13. Quick Reference for Agents

### Color Token Map (Light / Dark)

| Token                  | Light     | Dark      |
| ---------------------- | --------- | --------- |
| `--brand-accent`       | `#006b85` | `#00d4ff` |
| `--brand-accent-hover` | `#005a70` | `#00b8e0` |
| `--surface-root`       | `#fafafc` | `#0d0d14` |
| `--surface-panel`      | `#f5f5f8` | `#1e1e2e` |
| `--surface-card`       | `#ffffff` | `#2a2a3e` |
| `--surface-canvas`     | `#f7f6f1` | `#1e1e2e` |
| `--text-primary`       | `#1a1a2e` | `#e8e8f0` |
| `--text-secondary`     | `#4a4a5e` | `#a8a8bc` |
| `--text-muted`         | `#8b8b9a` | `#6b6b80` |
| `--border-default`     | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` |
| `--color-success`      | `#007a54` | `#00c896` |
| `--color-warning`      | `#9a6800` | `#f0a500` |
| `--color-danger`       | `#c4203e` | `#ff6685` |
| `--color-best-node`    | `#8a7000` | `#ffd700` |

### Example Component Prompts

- "Create a dashboard article card: `var(--surface-card)` background, 1px solid `var(--border-default)` border, shadow `0 2px 8px rgba(0,0,0,0.06)`, 12px radius. Title Source Sans 3 16px weight 600 `var(--text-primary)`. Hover: border `var(--brand-accent)`."
- "Design a node card: `var(--surface-card)` background, 8px radius, JetBrains Mono 11px `var(--text-accent)` label. Selected: Accent Glow shadow."
- "Build a primary button: `var(--brand-accent)` background, 8px radius, 8px 20px padding. Hover: `var(--brand-accent-hover)`."
- "Create writing canvas: `var(--surface-canvas)` background, 12px radius, 32px 40px padding. JetBrains Mono 14px `var(--text-primary)` line-height 1.8."

### Quick Rules

- Cyan for active/interactive only — never decorative
- 8px radius on buttons/inputs, 12px on cards
- Source Sans 3 for UI, JetBrains Mono for output
- Score-color all evaluation UI: success / warning / danger tiers
- Light: subtle shadows for depth; Dark: surface layering for depth
- Light canvas `#f7f6f1` = warm paper; everything else stays cool
