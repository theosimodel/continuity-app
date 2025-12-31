# List Share Experiences — Continuity (v1)

This document defines how **list sharing works end‑to‑end** in Continuity — from creation, to sharing, to viewing — with the explicit goal of making shared lists feel *personal, intentional, and worth reading*.

If implemented as written, list sharing becomes a primary growth vector **without turning Continuity into a social feed**.

---

## 1. What Lists Are

Lists in Continuity are:
- Curated reading paths
- Personal recommendations
- Editorial objects authored by a reader

Lists are **not**:
- Feeds
- Rankings
- Popularity contests
- Collaborative documents (v1)

---

## 2. Creating a List

### Required Fields
- **Title** (e.g. “Best Iron Man Runs”)
- **Short descriptor** (e.g. “A curated reading path”)

### Optional Fields
- Long description (free‑form text)
- Per‑item notes (1–2 lines per comic)

### Creation Rules
- Lists are owned by a single user
- Lists are private by default
- Lists can be made Public or Unlisted

---

## 3. Adding Comics to a List

### Entry Points
- Comic Detail Page → “Add to List”
- List Edit Page

### Rules
- Comics retain their own identity (no duplication)
- List order is intentional and user‑controlled
- No auto‑sorting

---

## 4. Sharing a List

### Share Trigger
- “Share” button on list page

### Share Modal (Required)

The share flow must open a **custom Continuity share modal**, not the OS share sheet.

#### Modal Includes
- Message field (encouraged)
- Visibility selector:
  - Public
  - Unlisted
- Link preview (title, author, first covers)

#### Message Behavior
- User‑written message appears:
  - In OpenGraph previews
  - As default share text

If left blank, fallback copy:
> “A curated reading path created in Continuity.”

---

## 5. Shared List Landing Page (Public)

### Purpose
This page is the destination for all shared list links.

It must work for:
- Logged‑out users
- First‑time visitors
- Logged‑in readers

### Required Sections

1. **Header**
   - List title
   - Descriptor
   - Author block (avatar + name)

2. **List Description**
   - Author‑written context

3. **List Items**
   - Cover
   - Title + issue / volume
   - Year
   - Optional author note
   - CTA: “View details”

4. **Context Footer**
   - “Created with Continuity”
   - CTA: “Start your own Continuity”

### Explicit Exclusions
- No comments
- No likes
- No follower counts
- No rankings

---

## 6. Logged‑In vs Logged‑Out Behavior

### Logged‑Out Users
- View‑only
- Primary CTA: “Start your Continuity”

### Logged‑In Users
- Add items to Long Boxes
- Add items to personal lists
- Mark Read / Want

No interaction modifies the original list.

---

## 7. Visibility Rules

### Public Lists
- Indexable
- Shareable
- Accessible without auth

### Unlisted Lists
- Accessible only via link
- Not indexable
- No discovery surfaces

---

## 8. Design Principles

- Calm
- Editorial
- Intentional
- Author‑forward

Lists should feel like:
> “Someone took the time to recommend this to me.”

---

## 9. Non‑Goals (v1)

- Collaborative editing
- List likes or saves
- Algorithmic surfacing
- Comments
- Notifications

---

## 10. Success Metric

A successful list share results in:
- A bookmark
- A thoughtful click
- A new reader starting Continuity

Not engagement numbers.

---

**list-share-experiences.md — Continuity**

