# Global Navigation — Signed-In Identity Indicator (v1)

This document defines how Continuity visually represents a **signed-in user** in the global navigation.

---

## 1. Problem Statement

Currently, when a user is signed in:

- The identity icon (book sigil) is monochrome
- It visually matches inactive navigation icons
- There is no immediate feedback that the user is authenticated

This creates ambiguity and violates a core UX principle:

> Authentication is state. State must be visible.

---

## 2. Final Decision

**Option A — Accent Color Identity Indicator**  
This approach is approved and locked for v1.

---

## 3. Signed-In State Rules

### When the user is **SIGNED IN**

- The identity icon (book sigil) **uses the primary accent color** (teal)
- The icon is visually distinct from:
  - Inactive navigation icons
  - Signed-out state
- No label or badge is required for recognition

**Purpose:**  
Instant, passive confirmation of authentication state.

---

### When the user is **SIGNED OUT**

- Identity icon remains neutral (default nav icon color)
- No accent color
- No hover state indicating identity

---

## 4. Visual Behavior Summary

| State      | Icon Color | Meaning                       |
|------------|------------|-------------------------------|
| Signed Out | Neutral    | No active user session        |
| Signed In  | Teal       | User authenticated and active |

---

## 5. Interaction Notes

- Clicking the accented identity icon navigates to the **Identity** page
- Hover behavior may optionally reveal:
  `Signed in as {username}`  
  (Optional, not required for v1)

---

## 6. Design Constraints

- No additional icons or badges
- No text labels in the nav bar
- No duplicated sign-in indicators elsewhere
- Accent color usage must remain consistent across the app

---

## 7. Rationale

This solution:

- Matches Continuity’s minimalist aesthetic
- Aligns with established UX patterns (GitHub, Letterboxd, Notion)
- Avoids visual clutter
- Makes authentication state immediately clear

---

**global-nav-signed-in-indicator.md — Continuity**
