# Landing Page CTA — Routing & Behavior (v1)

This document defines the **single approved behavior** for the landing page call-to-action:

> **“Start your Continuity”**

This CTA is the most important interaction in the product and must be treated as a **guided entry**, not simple navigation.

---

## 1. Core Principle (Locked)

> **The landing page CTA begins identity creation, not exploration.**

The CTA must never drop users into an empty or confusing state.

---

## 2. CTA Visibility

- The landing page displays **one CTA only**
- No secondary buttons
- No navigation alternatives
- No exploratory links

This preserves focus and narrative momentum.

---

## 3. CTA Routing Rules

### Signed-Out Users

When the user is not authenticated:

```
Start your Continuity → Authentication (Sign up / Log in)
```

- May be a dedicated `/signup` route or auth modal
- Must support both sign-up and sign-in

---

### Signed-In Users

When the user is already authenticated:

```
Start your Continuity → First-Action Onboarding
```

Authentication is skipped.

---

## 4. Post-Authentication Destination (Critical)

After successful authentication, users **must not** be routed to:

- HQ
- Continuity (empty state)
- Long Boxes
- Identity

These surfaces are discouraging or abstract for first-time users.

---

## 5. Approved First-Action Destination (Locked)

### ✅ Curated Picks (Recommended)

Users are routed to a curated selection of comics with the prompt:

> *“Choose something you’ve read to start your Continuity.”*

Why this works:
- Concrete action
- Immediate progress
- Aligns with landing page promise
- Creates momentum

---

### ⚠️ Acceptable Fallback

If Curated Picks is unavailable:

- Route to Library
- Automatically focus or scroll to Picks section
- De-emphasize all other content

---

## 6. CTA Intent Summary

The CTA is not saying:
- “Browse comics”
- “Explore the app”

It is saying:

> **Begin remembering what you’ve read.**

---

## 7. Explicit Prohibitions

The CTA must never:

- Link directly to HQ
- Link directly to Continuity
- Link directly to Long Boxes
- Bypass identity creation for new users

---

## 8. Design Intent Check

Before changing CTA behavior, ask:

> *Does this help the user start a record, or just look around?*

If it only enables exploration, it is incorrect.

---

## 9. Summary (Locked)

- Landing page has one CTA
- CTA routes to authentication
- Post-auth routing is guided
- First action is concrete and confidence-building
- Empty states are avoided

---

**landing-page-cta.md — Continuity**

