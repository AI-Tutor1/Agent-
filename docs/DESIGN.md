# DESIGN.md — Tuitional AI Company Operating System

## 1. Visual Theme & Atmosphere

**Mood**: Premium dark intelligence dashboard. Think Linear meets Bloomberg Terminal.
**Density**: Information-dense but never cluttered. Every pixel earns its space.
**Philosophy**: The UI should feel like a command center, not a website. Dawood should be able to approve a high-confidence analysis in under 10 seconds — header scan (2s), qualitative grid (5s), action button (1s).
**Brand Color**: Tuitional Gold (#D4A849) — the only warm color. Used for brand identity, high-confidence signals, active states, and primary CTAs. Everything else is functional color.

## 2. Color Palette & Roles

### Backgrounds (darkest to lightest)
| Token | Hex | Role |
|-------|-----|------|
| --bg-canvas | #080810 | Page background. The void. |
| --bg-surface-1 | #0F0F1A | Card background. Primary surface. |
| --bg-surface-2 | #141420 | Nested elements, input backgrounds within cards. |
| --bg-surface-3 | #1A1A28 | Modals, elevated surfaces, popovers. |
| --bg-input | #1E1E2E | Form field background. |
| --bg-hover | #20202F | Hover state for interactive elements. |

### Brand
| Token | Hex | Role |
|-------|-----|------|
| --gold-400 | #D4A849 | Primary brand. CTAs, active nav, confidence scores ≥8. |
| --gold-500 | #B8892A | Pressed state for gold buttons. |
| --gold-dim | rgba(212,168,73,0.12) | Gold tinted background (selected chips, active tabs). |
| --gold-glow | rgba(212,168,73,0.25) | Subtle glow on hover for gold elements. |

### Text
| Token | Hex | Role |
|-------|-----|------|
| --text-primary | #EEEEF5 | Headings, names, primary data. |
| --text-secondary | #9090A8 | Body text, descriptions, labels. |
| --text-muted | #52526A | Timestamps, hints, helper text, disabled. |

### Borders
| Token | Value | Role |
|-------|-------|------|
| --border-subtle | rgba(255,255,255,0.06) | Card borders, dividers between sections. |
| --border-default | rgba(255,255,255,0.10) | Input borders, button borders. |
| --border-strong | rgba(255,255,255,0.18) | Hover state borders, focus rings. |

### Status
| Token | Hex | Role |
|-------|-----|------|
| --status-active | #22D3A4 | Online, success, converted, healthy. |
| --status-pending | #FBBF24 | Awaiting, in-progress, warning. |
| --status-error | #F87171 | Failed, rejected, not converted. |
| --status-approved | #34D399 | Approved, verified. |
| --status-escalated | #C084FC | Escalated items (purple). |
| --status-shadow | #60A5FA | Shadow mode indicators (blue). |

### Accountability (used in DemoAnalysisCard)
| Token | Hex | Role |
|-------|-----|------|
| --acc-sales | #60A5FA | Sales accountability. |
| --acc-product | #FBBF24 | Product accountability. |
| --acc-consumer | #34D399 | Consumer accountability. |
| --acc-mixed | #C084FC | Mixed accountability. |

### POUR Severity
| Token | Hex | Role |
|-------|-----|------|
| --pour-high | #F87171 | High severity POUR flag. |
| --pour-medium | #FBBF24 | Medium severity. |
| --pour-low | #60A5FA | Low severity. |

### Conversion
| Token | Hex | Role |
|-------|-----|------|
| --converted | #22D3A4 | Converted status. |
| --not-converted | #F87171 | Not converted. |
| --pending-conv | #FBBF24 | Pending conversion. |

### Forms
| Token | Hex | Role |
|-------|-----|------|
| --form-field-bg | #1E1E2E | Input/textarea background. |
| --form-focus | #D4A849 | Focus border color (gold). |
| --form-error | #F87171 | Error text and error borders. |
| --form-success | #22D3A4 | Success validation. |

## 3. Typography Rules

**Three font families. No exceptions.**

| Font | Import | Role |
|------|--------|------|
| Syne | Google Fonts | Headings, agent names, section titles, CTAs, nav labels. Bold, architectural. |
| DM Sans | Google Fonts | Body text, descriptions, form labels, card content, status labels. Clean, readable. |
| JetBrains Mono | Google Fonts | Data values, timestamps, token counts, confidence scores, IDs. Monospaced precision. |

### Type Scale
| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Page title (h1) | Syne | 700 | 24px / 2xl | --text-primary |
| Section heading (h2) | Syne | 600 | 18px / lg | --text-primary |
| Card title | Syne | 600 | 15px / sm | --text-primary |
| Sub-heading | Syne | 600 | 13px / xs | --text-muted (uppercase, tracking-wider) |
| Body text | DM Sans | 400 | 14px / sm | --text-secondary |
| Small body | DM Sans | 400 | 13px | --text-secondary |
| Helper/hint text | DM Sans | 400 | 11px | --text-muted |
| Data value (large) | Syne | 700 | 30px / 3xl | --text-primary |
| Data value (medium) | JetBrains Mono | 500 | 20px / xl | --text-primary |
| Timestamp | JetBrains Mono | 400 | 11px | --text-muted |
| Badge/tag | DM Sans | 500 | 10-12px | Contextual color |

## 4. Component Stylings

### Cards
```
Background: var(--bg-surface-1)
Border: 1px solid var(--border-subtle)
Border-radius: 12px (rounded-xl)
Padding: 20px (p-5)
Hover: translateY(-2px) + border-color → var(--border-strong)
Transition: all 150ms
```
**Active/highlighted card**: Left border 3px solid in contextual color (gold for high confidence, red for low, purple for escalated).

### Buttons
**Primary (Gold CTA)**:
```
Background: var(--gold-400)
Text: #080810 (dark on gold)
Font: Syne 600 14px
Padding: 8px 16px
Border-radius: 8px (rounded-lg)
Min-height: 44px (touch target)
Hover: brightness(1.1)
Disabled: opacity 0.4, cursor not-allowed
```

**Secondary (Ghost)**:
```
Background: transparent
Border: 1px solid var(--border-default)
Text: var(--text-secondary), DM Sans 400
Hover: bg var(--bg-hover)
```

**Danger**:
```
Text: var(--status-error)
Border: 1px solid var(--status-error) at 30% opacity
Hover: bg var(--status-error) at 10% opacity
```

### Form Inputs
```
Background: var(--form-field-bg)
Border: 1px solid var(--border-default)
Text: var(--text-primary), DM Sans 400 14px
Placeholder: var(--text-muted)
Min-height: 44px
Border-radius: 8px
Focus: border var(--form-focus), ring 1px var(--gold-400) at 30%
Error: border var(--form-error)
```

### Status Badges/Tags
```
Font: DM Sans 500, 10-12px
Padding: 2px 8px
Border-radius: 9999px (full round)
Border: 1px solid [status-color]
Background: color-mix(in srgb, [status-color] 10%, transparent)
Text color: [status-color]
```

### Navigation (Sidebar)
```
Width: 240px expanded, 56px collapsed, 0px mobile
Background: var(--bg-surface-1)
Border-right: 1px solid var(--border-subtle)
Active item: bg var(--bg-surface-2), left bar 3px gold, icon gold
Inactive: text var(--text-secondary)
Hover: bg var(--bg-surface-2) at 50%
```

## 5. Layout Principles

**Spacing scale**: 4px base. Use Tailwind: gap-1(4px), gap-2(8px), gap-3(12px), gap-4(16px), gap-5(20px), gap-6(24px), gap-8(32px).

**Page structure**: Sidebar (fixed left) + Content area (scrollable, p-6 padding).

**Grid**: Department cards in 2-column grid on desktop. KPI strips in 5-column grid. Review queue is single column with analytics sidebar on XL screens.

**Maximum content width**: None enforced globally. Counselor/Sales forms: max-w-[680px] centered. Manager pages: full width with sidebar.

**Whitespace philosophy**: Dense but breathable. Cards have p-5 internal padding. Sections separated by 24px (mb-6). Card-to-card gaps are 16px (gap-4).

## 6. Depth & Elevation

**No box-shadows on cards.** Depth is created through background color layering:
- Canvas (deepest) → Surface-1 (cards) → Surface-2 (nested) → Surface-3 (modals)

**Modals**: Background overlay rgba(0,0,0,0.65) with backdrop-filter: blur(4px). Modal surface: var(--bg-surface-3) with border var(--border-default).

**Special glow**: Product/Counseling department card has animated conic-gradient border (gold) using CSS @property --angle animation.

## 7. Do's and Don'ts

### DO:
- Use CSS custom properties (var(--token)) for ALL colors. Never hardcode hex in components.
- Use Syne for anything a human scans first (names, titles, CTAs).
- Use JetBrains Mono for anything that is data (numbers, timestamps, IDs, scores).
- Use DM Sans for everything else.
- Keep interactive elements at min-height 44px for touch targets.
- Use color-mix() for tinted backgrounds: `color-mix(in srgb, var(--color) 10%, transparent)`.
- Use framer-motion for entry animations: opacity 0→1, y 20→0, stagger 50ms.
- Use Recharts for all charts with colors from CSS variables.

### DON'T:
- Don't use white or light backgrounds anywhere. This is a dark-only UI.
- Don't use box-shadows. Use border and background layering instead.
- Don't use more than 3 font families ever.
- Don't use generic Tailwind colors (blue-500, gray-300). Always use design tokens.
- Don't make charts with inline colors that don't match the design system.
- Don't create light mode. This application is dark mode only.
- Don't use placeholder images or lorem ipsum. Use real Tuitional data or realistic mock data with real teacher/student names.

## 8. Responsive Behavior

| Breakpoint | Sidebar | Layout |
|-----------|---------|--------|
| < 768px (mobile) | Hidden, hamburger menu | Single column, stacked |
| 768-1279px (tablet) | Collapsed (56px icons only) | 2-column grids |
| ≥ 1280px (desktop) | Full 240px with labels | Full layout, side panels |

- Kanban board columns: horizontal scroll on mobile.
- KPI strips: 2 columns on mobile, 3 on tablet, 5 on desktop.
- Review queue + analytics sidebar: stacked on mobile/tablet, side-by-side on XL.
- All forms: single column, max-w-[680px], centered.

## 9. Agent Prompt Guide

**Quick color reference for AI agents building UI:**
```
Background:       #080810 → #0F0F1A → #141420 → #1A1A28
Gold accent:      #D4A849 (buttons, active states, brand)
Success/online:   #22D3A4
Warning/pending:  #FBBF24
Error/danger:     #F87171
Escalated:        #C084FC
Shadow mode:      #60A5FA
Text:             #EEEEF5 → #9090A8 → #52526A
Borders:          6% → 10% → 18% white opacity
```

**When building a new page or component, follow this checklist:**
1. Background is --bg-canvas for the page, --bg-surface-1 for cards.
2. All text uses the three-font system (Syne/DM Sans/JetBrains Mono).
3. All colors reference CSS variables, never hardcoded hex.
4. Interactive elements have hover states with transitions (150ms).
5. Entry animations use framer-motion with stagger.
6. Loading states use skeleton animations (shimmer class from tokens.css).
7. Empty states have icon + heading + subtext, centered.
8. Status indicators use pulse-dot animation for active agents.
