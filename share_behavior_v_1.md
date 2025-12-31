# Share Behavior — Privacy-First Rules (v1)

This document defines **what can and cannot be shared** in Continuity for v1.

Sharing is intentionally limited to protect user trust and preserve Continuity’s core promise: a personal reading record, not a social feed.

---

## 1. Core Principle (Locked)

> **Continuity shares works, not readers.**

By default:
- Artifacts may be shareable
- Personal context is always private

If a share action would expose a user’s taste, history, or behavior, it is not permitted in v1.

---

## 2. What Is Shareable (v1)

### ✅ Comic / Work Detail Pages

The primary and intended share surface.

**Share action produces:**
- A public link to the comic’s detail page

**Included in shared view:**
- Cover image
- Title
- Creator(s)
- Publisher
- Public synopsis

**Explicitly excluded:**
- User rating
- User notes
- Read states
- Continuity status
- Ownership information

The shared page must render identically regardless of who views it.

---

### ✅ Curated Picks (HQ / Featured)

When sharing from curated surfaces:

- The shared link resolves to the **work itself**, not the list
- No attribution to the sharing user
- No language implying recommendation or endorsement

Sharing always points to the artifact, never the curator.

---

### ✅ About Page (Optional)

The About page may be shared freely.

It contains no personal or contextual user data.

---

## 3. What Is Not Shareable (v1)

The following surfaces must **never expose a Share action**:

### ❌ Identity Page
- Represents a personal reader record
- Not a public profile

### ❌ Continuity Timeline
- Temporal and personal
- Private by design

### ❌ Long Boxes
- Reflects ownership and personal canon
- Not designed for external viewing

### ❌ Notes, Ratings, or Annotations
- Always private
- No deep links or previews

---

## 4. Share Control Rules

### Presence = Permission

- Share controls appear **only** on shareable surfaces
- Non-shareable pages show no Share affordance at all
- No disabled buttons
- No explanatory tooltips

If Share is visible, sharing is safe.

---

## 5. Share Interaction (v1)

When Share is activated:

- Trigger native browser or OS share sheet
  **or**
- Copy link to clipboard

No platform targeting. No previews. No social copy.

The URL is the payload.

---

## 6. Copy & Language Guidance

Avoid language such as:
- “Share your thoughts”
- “Show your reading”
- “Let others see”

Preferred mental model:

> *Share this work.*

Sharing is about the comic, not the reader.

---

## 7. Explicit Exclusions

The following are not permitted in v1:

- Public profiles
- Shareable reading stats
- Shareable lists or boxes
- Shareable continuity views
- Attribution of shared links to users

---

## 8. Future Considerations (Not v1)

Possible v2+ extensions (out of scope):

- Explicit public/private toggles
- Shareable curated lists
- User-attributed recommendations

These require explicit consent and design review.

---

## 9. Design Intent Check

Ask before enabling Share:

> *Does this expose the work, or the reader?*

If it exposes the reader, sharing is not allowed.

---

## 10. Summary (Locked)

- Sharing is work-centric
- Personal context is private
- Share controls are opt-in by surface
- Privacy-first defaults apply everywhere

---

**share-behavior-v1.md — Continuity**

