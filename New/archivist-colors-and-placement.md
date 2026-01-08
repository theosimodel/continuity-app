# The Archivist — Color Tokens + Button Styles + Page Placement (v1)

This is the **single source of truth** for:
- The Archivist **accent color**
- Button colors (primary/secondary/ghost)
- How the Archivist page should be laid out (Layout A)

---

## 1) Core Theme Tokens (global)

> Use these across Continuity (HQ / Long Boxes / Continuity / Identity / Search) so Archivist still feels native.

**Background**
- `--bg-0`: `#070A0F` (page background)
- `--bg-1`: `#0B0F14` (main canvas wash)

**Surfaces**
- `--surface-0`: `#0F141C` (cards/panels)
- `--surface-1`: `#121A24` (raised cards, modal bodies)
- `--surface-2`: `#172231` (hovered/active surface)

**Borders / Dividers**
- `--stroke-0`: `rgba(255,255,255,0.08)` (primary border)
- `--stroke-1`: `rgba(255,255,255,0.12)` (focused/active border)
- `--divider`: `rgba(255,255,255,0.06)`

**Text**
- `--text-0`: `rgba(255,255,255,0.92)` (primary)
- `--text-1`: `rgba(255,255,255,0.70)` (secondary)
- `--text-2`: `rgba(255,255,255,0.45)` (muted)
- `--text-3`: `rgba(255,255,255,0.28)` (disabled)

**Global Accent (Continuity teal)**
- `--accent-teal`: `#67D8C6`
- `--accent-teal-strong`: `#53C8B6`
- `--accent-teal-soft`: `rgba(103,216,198,0.16)` (fills/glows)

---

## 2) The Archivist Accent Color (purple)

> Purple should be **accent-only** (icon, small highlights, focus ring, chip outline).  
> Do **not** use purple as giant filled blocks on the right rail.

**Archivist Purple**
- `--archivist`: `#8B5CF6` (primary purple)
- `--archivist-strong`: `#7C3AED` (hover/active)
- `--archivist-soft`: `rgba(139,92,246,0.14)` (subtle fills)
- `--archivist-ring`: `rgba(139,92,246,0.35)` (focus ring)

**Where purple is allowed**
- The Archivist icon (spark/star)
- Small label dots/badges
- Outlined quick-question chips
- Input focus ring on Archivist page
- Tiny stat highlights (optional)

**Where purple is NOT allowed**
- Large filled rectangles that dominate the layout
- Full-height gradients
- Any element that competes with the teal CTAs used elsewhere

---

## 3) Buttons (exact visual rules)

### A) Primary CTA (global teal)
Use for actions like: **Add to My Continuity**, **Save**, **Start your Continuity**, etc.

- Background: `--accent-teal`
- Text: `#061014` (near-black for contrast)
- Border: `rgba(255,255,255,0.08)`
- Hover bg: `--accent-teal-strong`
- Active bg: `--accent-teal-strong` + slight darken
- Shadow/glow (optional, subtle): `0 0 0 4px rgba(103,216,198,0.10)`

### B) Secondary Button (neutral)
Use for: **Share**, **Cancel**, **Discard** (when not destructive), **Back**.

- Background: `rgba(255,255,255,0.06)`
- Text: `--text-0`
- Border: `rgba(255,255,255,0.08)`
- Hover bg: `rgba(255,255,255,0.09)`
- Active bg: `rgba(255,255,255,0.12)`

### C) Ghost Button / Icon Button
Use for: icon-only actions (search, send), or low-emphasis actions.

- Background: `transparent`
- Text/Icon: `--text-1`
- Hover bg: `rgba(255,255,255,0.06)`
- Active bg: `rgba(255,255,255,0.09)`
- Focus ring (Archivist page): `0 0 0 4px var(--archivist-ring)`

### D) Destructive (if needed later)
- Background: `rgba(239,68,68,0.14)`
- Text: `#FCA5A5`
- Border: `rgba(239,68,68,0.22)`

---

## 4) “Quick Questions” Styling (match Layout A)

**Correct (Layout A):**
- Render as **outlined chips** (not big purple blocks)
- Chip background: `rgba(255,255,255,0.04)`
- Chip border: `rgba(139,92,246,0.35)`
- Chip text: `--text-0`
- Hover: background `rgba(139,92,246,0.10)` (soft), border `rgba(139,92,246,0.55)`

**Interaction:**
- Click should **auto-insert** the prompt into the input (or send instantly).
- Microcopy under chips: `Click to insert` (not “copy/paste”).

---

## 5) Input & Focus (Archivist page)

**Input field**
- Background: `rgba(255,255,255,0.04)`
- Border: `--stroke-0`
- Placeholder: `--text-2`

**On focus**
- Border: `rgba(139,92,246,0.55)`
- Ring: `0 0 0 4px var(--archivist-ring)`

**Send button**
- Keep neutral (ghost icon) by default
- When text is present: allow a subtle purple hint (icon color `--archivist`)

---

## 6) Page Placement (Layout A)

### Overall grid
- Max container width: **1100–1200px**
- Gap: **24px**
- Two columns:
  - **Left: Chat panel** (≈ 65–70%)
  - **Right: Sidebar** (≈ 30–35%)

### Left column (Chat)
1. Chat header (small: icon + “The Archivist” + one-line descriptor)
2. Conversation area (scrollable)
3. Input docked at bottom (single location; **no duplicate input**)

### Right column (Sidebar)
1. Quick Questions (chips)
2. Collection Overview (stats)
3. Pro Tips (optional, but keep subtle)

### Key rule
The right column should never feel like a second “hero”.
It’s support, not competition.

---

## 7) The Archivist Title Styling

- Title text: `--text-0`
- Icon color: `--archivist`
- Subtitle text: `--text-1`
- Divider under header: `--divider`

Example subtitle patterns:
- “Your personal comic guide — based on your library.”
- “Ask about creators, runs, reading order, or what to read next.”

---

## 8) Quick sanity checklist

✅ Purple is an accent (not a block).  
✅ Only one input, bottom-left in the chat panel.  
✅ Quick Questions are chips.  
✅ Primary CTAs stay teal (consistent with the rest of the app).  
✅ Archivist focus rings are purple (distinct but subtle).  

---
