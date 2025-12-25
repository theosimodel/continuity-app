# Library (Search) — Editorial Structure & Empty-State Design (v1)

This document defines the **editorial purpose, hierarchy, and empty-state treatment** for the Library (Search) page in Continuity.

It exists to ensure the Library never feels empty, unfinished, or purely mechanical — even before a search is performed.

---

## 1. Purpose

The Library is the **entry point to the archive**.

It is where readers:
- Look up specific works
- Explore creators or series
- Begin adding items to their Continuity

The Library is **not**:
- A feed
- A storefront
- A recommendation surface

> The Library should feel like an archive desk — quiet, intentional, and ready.

---

## 2. Core Principle

**Search is an act of intent.**

The page must respect that intent by:
- Remaining calm before interaction
- Providing orientation without instruction
- Avoiding default content that competes with the user’s goal

An empty Library is not a failure state.

---

## 3. Page Hierarchy (Locked)

### Order of Elements

1. Page title
2. Descriptor line (editorial framing)
3. Search input
4. Divider
5. Contextual empty-state content
6. Search results (once initiated)

This order must be preserved.

---

## 4. Title & Descriptor

### Title

```
LIBRARY
```

### Descriptor (Required)

A single, calm sentence beneath the title.

Approved options:

- *Search the archive of recorded comics.*
- *Find a comic, creator, or series.*
- *The complete archive of works in Continuity.*

Rules:
- Sentence case
- No calls to action
- No instructional tone

---

## 5. Search Input

### Placeholder Text (Locked)

```
Search the Library…
```

Rules:
- Ellipsis required
- No examples inside the field
- No autocomplete until typing begins

The search field is the primary affordance and should feel stable and deliberate.

---

## 6. Pre-Search Empty State (Critical)

Before the user types, the page must not feel blank.

### Editorial Orientation Copy

Displayed beneath the search field:

```
Search by title, creator, or series.
```

Optional secondary line:

```
Every entry begins somewhere.
```

Rules:
- This is not a CTA
- This copy disappears once typing begins
- Tone must be calm and reassuring

---

## 7. Post-Search States

### While Searching

- Subtle loading indicator only
- No playful or metaphorical copy

### No Results Found

```
No matching works found.
Try a different title or creator.
```

Rules:
- No apology language
- No suggestions beyond refinement

---

## 8. Visual & Layout Rules

- Content column is constrained (matches Long Boxes / Continuity)
- Search field is centered within content column
- Generous vertical spacing
- No cards or grids until results exist

Empty space is intentional and should feel composed.

---

## 9. What the Library Must Never Become

The Library must not include:

- ❌ Trending lists
- ❌ Picks or recommendations
- ❌ Editorial content
- ❌ Promotional banners
- ❌ Store links

Discovery belongs elsewhere.

---

## 10. Design Intent Check

Ask:

> *Does this page feel ready, even before I search?*

If yes, the design is correct.

---

## 11. Summary (Locked)

- The Library is an archive search surface
- Editorial framing prevents emptiness
- Search is the primary action
- Calm orientation replaces instruction
- No default content competes with intent

---

**library-search-editorial-v1.md — Continuity**

