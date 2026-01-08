# List Sharing — UX, Behavior, and Rules (v1)

This document defines how **Lists are shared, saved, and reused** in Continuity.

The goal of list sharing is **knowledge transfer**, not social performance.

Lists are meant to be passed along quietly — like recommendations between friends.

---

## 1. Core Philosophy

Lists are:
- Editorial
- Opinionated
- Durable

They are **not**:
- Social posts
- Ranking systems
- Engagement bait

Sharing a list should feel like saying:
> “I think you’d like this.”

---

## 2. Sharing a List

### Share Action
Label:
**Share list**

Behavior:
- Generates a clean, permanent URL
- No tracking parameters
- No public metrics (views, saves, likes)

---

## 3. Share Page (Public View)

A shared list page must include:

- List title
- Optional description / intent
- Ordered list of comics
- Attribution (subtle)
- Primary action: **Add to My Continuity**

It must NOT include:
- Comments
- Likes
- Ratings
- User activity feeds

---

## 4. Add to My Continuity (Critical Action)

When a user clicks **Add to My Continuity**:

### Logged-out user
- Prompt to sign up or sign in
- After auth, return to the same list

### Logged-in user
- List is saved to their account
- Appears in their Lists section as:
  > From: [Original Curator]

---

## 5. Attribution Rules

Attribution should be visible but quiet.

Examples:
- “Curated by Alex M.”
- “Saved from Todd”

Rules:
- No follower counts
- No badges
- No prominence over the list itself

---

## 6. Ownership & Editing

When a list is added:

- The saved copy becomes independent
- Users may:
  - Reorder comics
  - Remove entries
  - Add notes
- Original attribution remains intact

This avoids arguments and preserves intent.

---

## 7. Privacy & Visibility

Each list supports:

- **Public** — discoverable, shareable
- **Unlisted** — accessible only via link (default)
- **Private** — visible only to the owner

Default:
**Unlisted**

---

## 8. Friends / Following (Light Social Layer)

Continuity uses **following**, not friending.

Users may:
- Follow other users
- View their public lists

No:
- DMs
- Activity feeds
- Notifications by default

---

## 9. Lists from People You Follow

A single section:
**Lists from People You Follow**

Rules:
- No ranking
- No algorithmic sorting
- Chronological or manual order only

---

## 10. What Is Explicitly Excluded (v1)

- Likes on lists
- Comments on lists
- Trending lists
- Popularity metrics
- Algorithmic surfacing

If lists feel competitive, the design has failed.

---

## 11. Success Criteria

The list-sharing feature is successful if:
- Users share lists without explanation
- Recipients understand the list immediately
- Lists feel reusable, not disposable
- No one asks where the comments are

---

**share-list.md — Continuity**
