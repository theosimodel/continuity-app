# The Archivist — Layout A Spec (No Duplicate Questions) + Color System (v1)

This spec locks the **A layout** for *The Archivist* page and defines the **color scheme** so it stays consistent with Continuity’s dark UI (teal accent) while giving The Archivist a distinct **purple** identity.

---

## 1) Layout A (Final)

### Page Grid
- **Two-column layout**
  - **Left (main):** chat experience
  - **Right (rail):** quick actions + lightweight stats/tips
- Max content width: **~1120–1200px**
- Column gap: **32–40px**
- Rail width: **320–360px**

### Left / Main Column (Chat)
1. **Header**
   - Title: **THE ARCHIVIST**
   - Subtitle: “Get personalized comic recommendations from The Archivist”
2. **Chat Transcript Panel**
   - Scrollable container
   - Message bubbles are optional; keep minimal, “editorial”
3. **Single Chat Input (ONLY input on page)**
   - Lives **at the bottom of the transcript panel**
   - Sticky inside the panel is OK
   - Includes:
     - Placeholder: “Ask The Archivist…”
     - Send icon/button

✅ **Rule:** There is **only ONE** chat input on the page.

### Right / Rail Column
Order (top → bottom):
1. **Quick Questions** (ONE set only)
2. **Collection Overview**
3. **Pro Tips** (optional)

✅ **Rule:** There is **only ONE** Quick Questions block on the page.

---

## 2) Quick Questions (Single Instance)

### Placement
- **Right rail only**
- Do **not** repeat inside the chat transcript or below the input.

### Behavior
Choose one behavior and stay consistent:
- **Option A (recommended):** Click → fills input (does not send)
- **Option B:** Click → sends immediately

### Copy (Suggested)
- Help me get started
- Essential comics to read
- Popular series right now
- Guide to comic publishers

---

## 3) Empty State & First-Time UX

### If chat has no messages yet
Show a single, calm line at the top of the transcript:
> “Ask about creators, runs, reading order, or recommendations.”

### If user has 0 tracked comics
Collection Overview still appears but uses “—” or “0” values with subtle copy:
> “Start with a few issues to personalize suggestions.”

---

## 4) Color System (Correct Scheme)

Continuity’s brand is **dark + teal**. The Archivist gets a **purple accent** inside this page only.

### Global Continuity Colors (Base)
Use these across the app:
- **Background:** `#0B0F14`
- **Surface 1 (cards/panels):** `#111823`
- **Surface 2 (raised):** `#151F2D`
- **Border / divider:** `#223041`
- **Text (primary):** `#EAF0F7`
- **Text (muted):** `#9AA9BA`
- **Text (subtle):** `#6F8196`
- **Teal accent (brand):** `#78E3D6`
- **Teal hover:** `#63D6C9`
- **Focus ring (teal):** `rgba(120, 227, 214, 0.35)`

### Archivist Accent Colors (Module Scoped)
Use **purple only** for Archivist-specific UI (header icon, quick question buttons, send button, small highlights):
- **Purple accent:** `#8B5CF6`
- **Purple hover:** `#7C3AED`
- **Purple focus ring:** `rgba(139, 92, 246, 0.35)`

✅ **Rule:** Teal remains the app’s primary brand accent (nav highlights, global CTAs).  
✅ **Rule:** Purple is limited to *The Archivist* components on this page.

---

## 5) Component Styling Rules

### Chat Transcript Panel
- Background: **Surface 1**
- Border: **Border/divider**
- Subtle shadow: optional, low opacity

### Chat Input
- Background: **Surface 2**
- Border: **Border/divider**
- Focus ring: **teal** (global pattern)
- Send button: **purple** (Archivist-scoped)

### Quick Question Buttons
- Background: **purple accent**
- Text: **primary**
- Hover: **purple hover**
- Do not use teal here (keeps Archivist identity distinct)

### Collection Overview Card
- Standard Continuity card styling (Surface 1)
- Numbers can use teal **or** neutral text
- Avoid purple here (it’s not Archivist interaction)

### Pro Tips Card
- Surface 1
- Title may use subtle purple accent icon/border
- Keep body text muted

---

## 6) CSS Variables (Drop-in)
Use these as a baseline tokens list.

```css
:root {
  /* Continuity base */
  --bg: #0B0F14;
  --surface-1: #111823;
  --surface-2: #151F2D;
  --border: #223041;
  --text: #EAF0F7;
  --text-muted: #9AA9BA;
  --text-subtle: #6F8196;
  --teal: #78E3D6;
  --teal-hover: #63D6C9;
  --ring-teal: rgba(120, 227, 214, 0.35);

  /* Archivist scoped */
  --archivist: #8B5CF6;
  --archivist-hover: #7C3AED;
  --ring-archivist: rgba(139, 92, 246, 0.35);
}
```

---

## 7) Non-Negotiables (Locked)
- Only **one** chat input.
- Only **one** Quick Questions block.
- Teal = global brand accent.
- Purple = Archivist-only accent on this page.

---

**archivist-layout-spec-A.md — Continuity**
