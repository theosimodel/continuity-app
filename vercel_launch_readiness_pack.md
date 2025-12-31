# Continuity — Vercel Launch Readiness Pack (v1)

This document consolidates **all finalized product, sharing, layout, and interaction rules** required to confidently deploy Continuity to Vercel.

If every section in this document is implemented, Continuity is considered **launch-ready**.

---

## 1. Product Philosophy (Locked)

Continuity is **not a social network**.

It is:
- A personal comic reading record
- A place to build a private canon
- A tool for thoughtful recommendation, not engagement

Everything below enforces this.

---

## 2. Global Navigation Rules

### Signed-In Indicator
- Identity / avatar icon **must be accent-colored** when signed in
- Neutral gray when signed out
- This is the primary sign-in confirmation

No banners, toasts, or notifications are used for auth state.

---

## 3. Core Sections (Purpose-Driven)

### HQ
- Discovery surface
- Shows Picks (hand-curated for new users)
- Transitions to personalized picks after user activity

### Long Boxes
- Comics you’ve committed to
- Filters: All / Read / Owned / Want / Reread
- Empty state copy:
  - “Your Long Boxes are empty.”
  - “A collection forms over time.”

### Continuity
- Chronological reading history
- Shows **Read** and **Reread** only
- Empty state copy:
  - “This is the beginning of your reading history.”

### Library (Search)
- Purpose: find comics to add
- Must never be empty-feeling
- Includes:
  - Recent additions
  - Popular titles
  - Staff / Picks surface

### Identity
- Lightweight profile
- Editable fields:
  - Display name
  - Short reading note
  - Symbol-based avatar selection (no image URLs)
- Reader profile copy is descriptive, not gamified

---

## 4. Comic Detail Page Rules

### Layout Simplification
- Primary column: cover + metadata + story brief
- Secondary column: metrics

### Metrics (Option A — Locked)

- **In Continuity**
  - Count of users who marked the comic Read or Reread
- **Rating**
  - Aggregated average from user ratings
  - Hidden until enough data exists

No fans, likes, or popularity labels.

### Actions
- Mark as: Read / Owned / Want / Reread
- Share
- Add to List

No duplicated “Add to Continuity” buttons mid-page.

---

## 5. Lists (Curated Reading Paths)

### What Lists Are
- Editorial recommendations
- Authored by a person
- Intended to be shared

### Creation Rules
- Title (required)
- Descriptor (required)
- Long description (optional)

### Ownership
- Lists belong to creator
- Non-editable by others

---

## 6. List Sharing — Public Landing Page

### Purpose
Shared lists must stand on their own for non-users.

### Required Sections
1. List title + descriptor
2. Author block (name + avatar)
3. Description
4. Comic items
5. Context footer:
   - “Created with Continuity”
   - CTA: “Start your own Continuity”

No metrics. No comments. No feeds.

---

## 7. Share Modal (Critical)

### Why
Sharing must feel intentional, not automatic.

### Required Elements
- User-authored message (textarea)
- Visibility selector (Public / Unlisted)
- Link preview

### Actions
- Copy share link
- Share to X
- Share via Messages

No auto-posting. No engagement tracking.

---

## 8. Landing Page (Pre-Auth)

### Purpose
Explain the problem before showing the product.

### Structure
- Message sequence (fade-in):
  1. “Reading comics is easy.”
  2. “Remembering them isn’t.”
- One CTA only:
  - “Start your Continuity”

### CTA Rule
- Routes to sign-in / onboarding
- No nav links on landing page

---

## 9. Static Pages (Privacy, Terms, About)

### Layout (Shared)
- Minimal nav
- Single readable column
- Editorial footer

### Footer (Locked)
```
Continuity
© 2025

Privacy · Terms · About
```

No CTAs, no icons, no marketing.

---

## 10. Footer (Global)

### Purpose
Trust and completion

### Content
- Brand name
- Copyright
- Legal links

No slogans. No social links.

---

## 11. What Is Explicitly NOT in v1

- Likes
- Followers
- Feeds
- Algorithms
- Notifications
- Public profiles

---

## 12. Vercel Launch Checklist

Before deploying:
- [ ] Landing page wired to auth
- [ ] Share modal implemented
- [ ] List public pages reachable
- [ ] Static pages live
- [ ] Signed-in nav state visible
- [ ] Metrics follow Option A

If all boxes are checked, Continuity is **ready to ship**.

---

**continuity-vercel-launch-pack.md**

