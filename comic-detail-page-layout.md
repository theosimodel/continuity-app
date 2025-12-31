# Comic Detail Page — Layout & Interaction Rules (v1)

This document defines the **approved layout, hierarchy, and interaction rules**
for the Comic Detail Page in Continuity.

Its purpose is to eliminate visual crowding, reduce redundant actions,
and preserve Continuity’s core philosophy: **intentional reading memory,
not engagement noise**.

---

## 1. Core Principle (Locked)

> A comic detail page must answer **one question at a time**.

The page should feel calm, focused, and reflective — never busy.

---

## 2. Single Source of Truth for Continuity State

### Rule

There must be **exactly one place** where a user marks a comic’s state.

### Approved Location

- **Left column only**
  - Read
  - Owned
  - Want
  - Reread

### Disallowed

- Duplicate “Add to Continuity” panels
- Secondary state selectors elsewhere on the page

### Rationale

State selection is a *commitment*, not a form.
Duplicating it creates cognitive noise and breaks hierarchy.

---

## 3. Progressive Disclosure (Required)

### Rule

Secondary inputs must remain **hidden until contextually relevant**.

### Behavior

- Rating stars appear **only after**:
  - Read or Reread is selected
- Note / “Your take” input appears **only after**:
  - Rating interaction OR Reread selection

### Disallowed

- Always-visible rating widgets
- Always-visible text areas

### Rationale

Reflection follows experience.
The UI should respect that sequence.

---

## 4. Metrics Are Context, Not Content

### Rule

Community metrics must never compete with the comic itself.

### Approved Display

- Metrics may appear:
  - As a **single, subtle line** below the Story Brief
  - Or in a **collapsed secondary rail**

Example:
```
12,483 readers · No community rating yet
```

### Disallowed

- Large metric cards
- Prominent right-rail emphasis
- Multiple metric containers

### Rationale

Continuity centers the *reader*, not the crowd.

---

## 5. Action Hierarchy (Strict)

### Primary Actions (Always Visible)

- Share
- Add to List

### Secondary Actions (State-Driven)

- Rating
- Notes
- Reread reflection

### Disallowed

- Multiple primary CTAs
- Equal visual weight across all actions

### Rationale

Too many visible actions flatten importance and overwhelm intent.

---

## 6. Content Order (Locked)

The page must follow this vertical hierarchy:

1. Title
2. Creator credits
3. Story Brief
4. Where to Read (quiet, informational)
5. Reader State (Mark As)
6. Optional Reflection (rating / note)
7. Community Context (metrics)

Any deviation must be explicitly reviewed.

---

## 7. Removed Elements (v1 Cleanup)

The following elements are explicitly removed:

- Bottom “Add to Your Continuity” panel
- Duplicate state selectors
- Always-visible rating cards
- Prominent right-rail metric blocks

---

## 8. Design Outcome

When implemented correctly, the Comic Detail Page should feel:

- Calm
- Intentional
- Reflective
- Focused on memory, not engagement

If the page feels “busy,” it is incorrect.

---

## 9. Summary (Locked)

- One place to mark state
- Progressive disclosure for reflection
- Metrics are secondary
- Actions have hierarchy
- The comic is always the focus

---

**comic-detail-page-layout.md — Continuity**
