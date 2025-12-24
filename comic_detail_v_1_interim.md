# Comic Detail Page — Continuity (v1 Interim)

This document defines the **interim Comic / Work Detail page behavior** given current technical constraints. It reflects the agreed compromise between long-term product philosophy and present system capabilities.

This file **temporarily supersedes** `comic-detail-v1-final.md` until automatic Continuity inference (from Read / Reread) is available.

---

## 1. Context & Constraint

At present:
- Continuity **does not auto-populate** from Read / Reread states
- An explicit user action is required to add a work to Continuity

Design must:
- Be honest about system behavior
- Avoid implying automation that does not exist
- Preserve the long-term Continuity model

---

## 2. Core Principle (Unchanged)

> The work is the hero. Actions are contextual, not dominant.

Continuity is still:
- Personal canon
- Intentional
- Calm and reflective

---

## 3. Navigation (Updated)

### Top Navigation

**Remove**
- ❌ Global "Add to Continuity" button

**Rationale**
- Global actions break the place-based navigation model
- Adding to Continuity should only happen in context

---

## 4. Continuity Actions (Interim Model)

### A. State Actions (Signals)

Located in the Cover Column:
```
MARK AS
[ Read ] [ Owned ]
[ Want ] [ Reread ]
```

Rules:
- These represent **status**, not commitment
- They do NOT automatically add the work to Continuity (v1)
- Reread remains the canonical "favorite" signal

---

### B. Add to Your Continuity (Commit Action)

Located in the Content Column, below Story Brief.

#### Purpose
- Explicitly commits a work into the user’s Continuity
- Represents intentional inclusion into personal canon

---

#### Section Header
```
ADD TO YOUR CONTINUITY
```

This remains a **section label**, not a CTA.

---

#### Inline Commit Button (Required in v1)

Add a **small, secondary button** inside this section:

```
[ Add this to my Continuity ]
```

Button rules:
- Secondary styling (not dominant)
- Same width as notes input
- Only visible if the work is not yet in Continuity
- Disappears once the work is added

---

#### Rating (Optional)
```
Your take
[ ☆ ☆ ☆ ☆ ☆ ]
```

Rules:
- Rating is optional
- Rating does not add to Continuity by itself

---

#### Notes Input

**Default State**
- Collapsed (1–2 lines)

**Placeholder**
```
Add a thought (optional)
```

**Behavior**
- Expands on focus or typing
- Autosaves

Notes:
- Notes do not add to Continuity without explicit commit (v1)

---

## 5. Meta Column (No Change)

```
CONTINUITY
12,483 in Continuity

RATING
3.9
```

Rules:
- No Fans
- No Likes
- No engagement language

---

## 6. Explicitly Removed (Still True)

- ❌ Large bottom CTA
- ❌ Like / Favorite button
- ❌ Fans count
- ❌ Log / Record language

---

## 7. Forward Compatibility (Important)

This design is intentionally **transitional**.

When system support is added:
- Read or Reread ⇒ auto-add to Continuity
- Inline commit button is removed
- This document is retired
- `comic-detail-v1-final.md` becomes authoritative

---

## 8. Summary

- Continuity requires explicit commit in v1
- Commit happens **only on the work page**
- No global add actions exist
- UI remains calm, honest, and future-proof

---

**comic-detail-v1-interim.md — Continuity**

